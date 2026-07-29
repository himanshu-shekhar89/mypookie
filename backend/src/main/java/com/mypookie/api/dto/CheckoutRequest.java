package com.mypookie.api.dto;
import jakarta.validation.constraints.NotBlank;
public record CheckoutRequest(@NotBlank String giftId){}
