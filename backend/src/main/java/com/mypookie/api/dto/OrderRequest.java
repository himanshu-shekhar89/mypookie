package com.mypookie.api.dto;

import jakarta.validation.constraints.NotBlank;

public record OrderRequest(@NotBlank String giftId,String couponCode) {}
