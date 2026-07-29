package com.mypookie.api.controller;

import com.mypookie.api.dto.*;
import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import com.mypookie.api.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
 private final GiftRepository gifts;
 private final GiftOrderRepository orders;
 private final UserService users;
 private final GiftService giftService;
 private final RazorpayService razorpay;

 @PostMapping
 public PaymentOrderResponse create(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@Valid @RequestBody OrderRequest request){
  var user=users.resolve(principal);
  var gift=gifts.findById(request.giftId()).orElseThrow();
  if(!gift.getSenderId().equals(user.getId()))throw new SecurityException("Not your gift");
  var coupon=Optional.ofNullable(request.couponCode()).orElse("").trim().toUpperCase();
  if(!coupon.isBlank()&&!Set.of("POOKIE10","FIRSTGIFT","LOVE50").contains(coupon))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"This coupon is not active.");
  int total=gift.getTotalPaise();
  int discount=switch(coupon){
   case "POOKIE10" -> total/10;
   case "FIRSTGIFT" -> Math.min(total*15/100,15000);
   case "LOVE50" -> Math.min(5000,total);
   default -> 0;
  };
  var order=new GiftOrder();
  order.setId(UUID.randomUUID().toString());
  order.setGiftId(gift.getId());
  order.setSenderId(user.getId());
  order.setAmountPaise(Math.max(0,total-discount));
  order.setCurrency("INR");
  if(order.getAmountPaise()==0){
   order.setProviderOrderId("FREE_"+order.getId());
   order.setStatus("AWAITING_FREE_CHECKOUT");
  }else if(razorpay.configured()){
   order.setProviderOrderId(razorpay.createOrder(order.getAmountPaise(),order.getCurrency(),"mp_"+order.getId().replace("-","")));
   order.setStatus("CREATED");
  }else{
   order.setProviderOrderId("DEMO_"+order.getId());
   order.setStatus("AWAITING_DEMO_PAYMENT");
  }
  orders.save(order);
  return new PaymentOrderResponse(order.getId(),order.getProviderOrderId(),order.getAmountPaise(),order.getCurrency(),order.getAmountPaise()==0?"":razorpay.keyId(),order.getAmountPaise()==0||!razorpay.configured());
 }

 @PostMapping("/{orderId}/verify")
 public Map<String,String> verify(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@PathVariable String orderId,@Valid @RequestBody PaymentVerificationRequest request){
  var user=users.resolve(principal);
  var order=orders.findById(orderId).orElseThrow();
  if(!order.getSenderId().equals(user.getId()))throw new SecurityException("Not your order");
  if(!Objects.equals(order.getProviderOrderId(),request.razorpayOrderId())||!razorpay.verify(order.getProviderOrderId(),request.razorpayPaymentId(),request.razorpaySignature()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment verification failed.");
  order.setProviderPaymentId(request.razorpayPaymentId());
  order.setStatus("PAID");
  orders.save(order);
  var gift=giftService.publish(user.getId(),order.getGiftId());
  return Map.of("shareToken",gift.getShareToken(),"status","PAID");
 }

 @PostMapping("/{orderId}/demo-complete")
 public Map<String,String> demoComplete(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@PathVariable String orderId){
  var order=orders.findById(orderId).orElseThrow();
  if(razorpay.configured()&&order.getAmountPaise()>0)throw new ResponseStatusException(HttpStatus.NOT_FOUND);
  var user=users.resolve(principal);
  if(!order.getSenderId().equals(user.getId()))throw new SecurityException("Not your order");
  order.setStatus("PAID_DEMO");
  order.setProviderPaymentId("DEMO_PAYMENT_"+UUID.randomUUID());
  orders.save(order);
  var gift=giftService.publish(user.getId(),order.getGiftId());
  return Map.of("shareToken",gift.getShareToken(),"status","PAID_DEMO");
 }
}
