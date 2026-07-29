package com.mypookie.api.dto;

public record PaymentOrderResponse(
 String localOrderId,
 String providerOrderId,
 int amountPaise,
 String currency,
 String keyId,
 boolean demoMode
) {}
