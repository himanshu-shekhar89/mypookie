package com.mypookie.api.dto;

import java.time.Instant;

public record OrderHistoryResponse(
 String id,
 String giftId,
 String title,
 String recipientName,
 int amountPaise,
 String currency,
 String couponCode,
 String status,
 Instant createdAt,
 String shareToken
) {}
