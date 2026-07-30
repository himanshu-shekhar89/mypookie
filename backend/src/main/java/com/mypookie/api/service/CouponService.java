package com.mypookie.api.service;

import com.mypookie.api.model.Coupon;
import com.mypookie.api.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class CouponService {
 private final CouponRepository coupons;

 public Quote quote(String rawCode,int totalPaise){
  var code=rawCode==null?"":rawCode.trim().toUpperCase();
  if(code.isBlank())return new Quote("",0);
  var coupon=coupons.findByCodeIgnoreCase(code).orElseThrow(()->bad("This coupon is not active."));
  return calculate(coupon,totalPaise);
 }

 @Transactional
 public Quote redeemValidated(String rawCode,int totalPaise,int expectedDiscountPaise){
  var code=rawCode==null?"":rawCode.trim().toUpperCase();
  if(code.isBlank()){
   if(expectedDiscountPaise!=0)throw bad("The checkout discount is no longer valid.");
   return new Quote("",0);
  }
  var coupon=coupons.findByCodeIgnoreCaseForUpdate(code).orElseThrow(()->bad("This coupon is not active."));
  var quote=calculate(coupon,totalPaise);
  if(quote.discountPaise()!=expectedDiscountPaise)throw bad("The checkout total has changed. Please apply the coupon again.");
  coupon.setUsedCount(coupon.getUsedCount()+1);
  coupon.setUpdatedAt(Instant.now());
  return quote;
 }

 private Quote calculate(Coupon coupon,int totalPaise){
  var now=Instant.now();
  if(!coupon.isActive()||(coupon.getValidFrom()!=null&&coupon.getValidFrom().isAfter(now))||(coupon.getExpiresAt()!=null&&coupon.getExpiresAt().isBefore(now))||(coupon.getUsageLimit()!=null&&coupon.getUsedCount()>=coupon.getUsageLimit()))throw bad("This coupon is not active.");
  if(totalPaise<coupon.getMinOrderPaise())throw bad("This order does not meet the coupon minimum.");
  int discount="PERCENT".equals(coupon.getDiscountType())?totalPaise*coupon.getDiscountValue()/100:coupon.getDiscountValue();
  if(coupon.getMaxDiscountPaise()!=null)discount=Math.min(discount,coupon.getMaxDiscountPaise());
  return new Quote(coupon.getCode(),Math.min(discount,totalPaise));
 }

 @Transactional
 public void redeem(String code){
  if(code==null||code.isBlank())return;
  coupons.findByCodeIgnoreCase(code).ifPresent(coupon->{coupon.setUsedCount(coupon.getUsedCount()+1);coupon.setUpdatedAt(Instant.now());});
 }

 private ResponseStatusException bad(String message){return new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
 public record Quote(String code,int discountPaise){}
}
