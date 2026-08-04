package com.mypookie.api.dto;

import jakarta.validation.constraints.Min;

public record CouponQuoteRequest(
 String couponCode,
 @Min(0) int subtotalPaise
) {}
