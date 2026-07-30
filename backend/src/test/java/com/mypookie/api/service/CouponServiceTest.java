package com.mypookie.api.service;

import com.mypookie.api.model.Coupon;
import com.mypookie.api.repository.CouponRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {
 @Mock CouponRepository coupons;
 @InjectMocks CouponService service;

 @Test
 void atomicallyRedeemsAValidatedFullDiscountCoupon(){
  var coupon=fullDiscountCoupon();
  when(coupons.findByCodeIgnoreCaseForUpdate("FREE100")).thenReturn(Optional.of(coupon));

  var quote=service.redeemValidated("free100",4900,4900);

  assertThat(quote.code()).isEqualTo("FREE100");
  assertThat(quote.discountPaise()).isEqualTo(4900);
  assertThat(coupon.getUsedCount()).isEqualTo(1);
 }

 @Test
 void refusesCheckoutWhenTheStoredDiscountNoLongerMatches(){
  var coupon=fullDiscountCoupon();
  coupon.setDiscountValue(50);
  when(coupons.findByCodeIgnoreCaseForUpdate("FREE100")).thenReturn(Optional.of(coupon));

  assertThatThrownBy(()->service.redeemValidated("FREE100",4900,4900))
   .isInstanceOf(ResponseStatusException.class)
   .hasMessageContaining("checkout total has changed");
  assertThat(coupon.getUsedCount()).isZero();
 }

 @Test
 void refusesAnExhaustedCouponBeforePublishing(){
  var coupon=fullDiscountCoupon();
  coupon.setUsageLimit(1);
  coupon.setUsedCount(1);
  when(coupons.findByCodeIgnoreCaseForUpdate("FREE100")).thenReturn(Optional.of(coupon));

  assertThatThrownBy(()->service.redeemValidated("FREE100",4900,4900))
   .isInstanceOf(ResponseStatusException.class)
   .hasMessageContaining("not active");
  assertThat(coupon.getUsedCount()).isEqualTo(1);
 }

 private Coupon fullDiscountCoupon(){
  var coupon=new Coupon();
  coupon.setCode("FREE100");
  coupon.setDiscountType("PERCENT");
  coupon.setDiscountValue(100);
  coupon.setMinOrderPaise(0);
  coupon.setUsedCount(0);
  coupon.setActive(true);
  return coupon;
 }
}
