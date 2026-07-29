package com.mypookie.api.controller;

import com.mypookie.api.dto.OrderRequest;
import com.mypookie.api.model.*;
import com.mypookie.api.repository.*;
import com.mypookie.api.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
 private final GiftRepository gifts;
 private final GiftOrderRepository orders;
 private final UserService users;

 @PostMapping
 public GiftOrder create(@AuthenticationPrincipal FirebaseAuthenticationFilter.UserPrincipal principal,@Valid @RequestBody OrderRequest request){
  var user=users.resolve(principal);
  var gift=gifts.findById(request.giftId()).orElseThrow();
  if(!gift.getSenderId().equals(user.getId()))throw new SecurityException("Not your gift");
  var coupon=Optional.ofNullable(request.couponCode()).orElse("").trim().toUpperCase();
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
  order.setStatus("PAID_DEMO");
  order.setProviderOrderId(coupon.isBlank()?"NO_COUPON":"COUPON_"+coupon);
  return orders.save(order);
 }
}
