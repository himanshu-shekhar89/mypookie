package com.mypookie.api.dto;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerificationRequest(
 @NotBlank String razorpayOrderId,
 @NotBlank String razorpayPaymentId,
 @NotBlank String razorpaySignature
) {}
