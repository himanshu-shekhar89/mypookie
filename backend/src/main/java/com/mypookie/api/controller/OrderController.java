package com.mypookie.api.controller;

import com.mypookie.api.dto.*;
import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import com.mypookie.api.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
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
 private final CouponService couponService;
 private final ExperienceResponseRepository responses;
 private final GiftRatingRepository ratings;

 @GetMapping
 public List<OrderHistoryResponse> mine(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal){
  var user=users.resolve(principal);
  return orders.findBySenderIdOrderByCreatedAtDesc(user.getId()).stream().map(order->{
   var gift=gifts.findById(order.getGiftId()).orElse(null);
   var rating=gift==null?null:ratings.findByGiftId(gift.getId()).orElse(null);
   String progress=gift==null||gift.getOpenedAt()==null?"NOT_OPENED":gift.getCompletedAt()!=null?"COMPLETED":"PARTIALLY_OPENED";
   return new OrderHistoryResponse(
    order.getId(),
    order.getGiftId(),
    gift==null?"Interactive gift":gift.getTitle(),
    gift==null?"Someone special":gift.getRecipientName(),
    order.getAmountPaise(),
    order.getCurrency(),
    order.getCouponCode(),
    order.getStatus(),
    order.getCreatedAt(),
    gift==null?null:gift.getShareToken(),
    gift==null?null:gift.getOpenedAt(),
    gift==null?null:gift.getCompletedAt(),
    gift==null?null:responses.findByGiftIdAndBlockIdOrderByCreatedAtAsc(gift.getId(),"final-message").stream().reduce((first,last)->last).map(ExperienceResponse::getResponseText).orElse(null),
    progress,
    gift==null?0:gift.getCurrentStep(),
    gift==null?0:gift.getTotalSteps(),
    gift==null?0:gift.getOpenCount(),
    gift==null?0:gift.getMaxOpenCount(),
    rating==null?null:rating.getStars(),
    rating==null?null:rating.getComment()
   );
  }).toList();
 }

 @PostMapping("/quote")
 public Map<String,Object> quote(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@Valid @RequestBody OrderRequest request){
  var user=users.resolve(principal);
  var gift=gifts.findById(request.giftId()).orElseThrow();
  if(!gift.getSenderId().equals(user.getId()))throw new SecurityException("Not your gift");
  var quote=couponService.quote(request.couponCode(),gift.getTotalPaise());
  return Map.of("couponCode",quote.code(),"subtotalPaise",gift.getTotalPaise(),"discountPaise",quote.discountPaise(),"totalPaise",Math.max(0,gift.getTotalPaise()-quote.discountPaise()));
 }

 @PostMapping
 public PaymentOrderResponse create(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@Valid @RequestBody OrderRequest request){
  var user=users.resolve(principal);
  var gift=gifts.findById(request.giftId()).orElseThrow();
  if(!gift.getSenderId().equals(user.getId()))throw new SecurityException("Not your gift");
  int total=gift.getTotalPaise();
  var quote=couponService.quote(request.couponCode(),total);
  var order=new GiftOrder();
  order.setId(UUID.randomUUID().toString());
  order.setGiftId(gift.getId());
  order.setSenderId(user.getId());
  order.setAmountPaise(Math.max(0,total-quote.discountPaise()));
  order.setCouponCode(quote.code());
  order.setDiscountPaise(quote.discountPaise());
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
  if(Set.of("PAID","PAID_DEMO","PAID_FREE").contains(order.getStatus())){var paidGift=gifts.findById(order.getGiftId()).orElseThrow();return Map.of("shareToken",paidGift.getShareToken(),"status",order.getStatus());}
  if(order.getAmountPaise()<=0||!"CREATED".equals(order.getStatus()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"This order is not awaiting Razorpay payment.");
  if(!Objects.equals(order.getProviderOrderId(),request.razorpayOrderId())||!razorpay.verify(order.getProviderOrderId(),request.razorpayPaymentId(),request.razorpaySignature()))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Payment verification failed.");
  order.setProviderPaymentId(request.razorpayPaymentId());
  order.setStatus("PAID");
  orders.save(order);
  couponService.redeem(order.getCouponCode());
  var gift=giftService.publish(user.getId(),order.getGiftId());
  return Map.of("shareToken",gift.getShareToken(),"status","PAID");
 }

 @Transactional
 @PostMapping("/{orderId}/free-complete")
 public Map<String,String> freeComplete(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@PathVariable String orderId){
  var user=users.resolve(principal);
  var order=orders.findByIdForUpdate(orderId).orElseThrow();
  if(!order.getSenderId().equals(user.getId()))throw new SecurityException("Not your order");
  if(Set.of("PAID","PAID_DEMO","PAID_FREE").contains(order.getStatus())){
   var publishedGift=gifts.findById(order.getGiftId()).orElseThrow();
   return Map.of("shareToken",publishedGift.getShareToken(),"status",order.getStatus());
  }
  if(order.getAmountPaise()!=0||!"AWAITING_FREE_CHECKOUT".equals(order.getStatus()))
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"This order requires payment.");
  var gift=gifts.findById(order.getGiftId()).orElseThrow();
  if(!gift.getSenderId().equals(user.getId()))throw new SecurityException("Not your gift");
  var confirmedCoupon=couponService.redeemValidated(order.getCouponCode(),gift.getTotalPaise(),order.getDiscountPaise());
  if(Math.max(0,gift.getTotalPaise()-confirmedCoupon.discountPaise())!=0)
   throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"The checkout total is no longer free. Please review it again.");
  order.setStatus("PAID_FREE");
  order.setProviderPaymentId("FREE_CHECKOUT_"+UUID.randomUUID());
  orders.save(order);
  var publishedGift=giftService.publish(user.getId(),order.getGiftId());
  return Map.of("shareToken",publishedGift.getShareToken(),"status","PAID_FREE");
 }

 @PostMapping("/{orderId}/demo-complete")
 public Map<String,String> demoComplete(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@PathVariable String orderId){
  var order=orders.findById(orderId).orElseThrow();
  var user=users.resolve(principal);
  if(!order.getSenderId().equals(user.getId()))throw new SecurityException("Not your order");
  if(Set.of("PAID","PAID_DEMO","PAID_FREE").contains(order.getStatus())){var paidGift=gifts.findById(order.getGiftId()).orElseThrow();return Map.of("shareToken",paidGift.getShareToken(),"status",order.getStatus());}
  if(razorpay.configured()||order.getAmountPaise()<=0||!"AWAITING_DEMO_PAYMENT".equals(order.getStatus()))throw new ResponseStatusException(HttpStatus.NOT_FOUND);
  order.setStatus("PAID_DEMO");
  order.setProviderPaymentId("DEMO_PAYMENT_"+UUID.randomUUID());
  orders.save(order);
  couponService.redeem(order.getCouponCode());
  var gift=giftService.publish(user.getId(),order.getGiftId());
  return Map.of("shareToken",gift.getShareToken(),"status","PAID_DEMO");
 }
}
