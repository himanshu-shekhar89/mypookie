package com.mypookie.api.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public record CouponRequest(
 @NotBlank @Pattern(regexp="[A-Za-z0-9_-]{3,40}") String code,
 @NotBlank @Pattern(regexp="PERCENT|FIXED") String discountType,
 @Positive int discountValue,
 @PositiveOrZero Integer maxDiscountPaise,
 @PositiveOrZero int minOrderPaise,
 @Positive Integer usageLimit,
 @Pattern(regexp="STANDARD|INFLUENCER") String couponType,
 @PositiveOrZero Integer commissionPaisePerUse,
 Instant validFrom,
 Instant expiresAt,
 boolean active
) {}
