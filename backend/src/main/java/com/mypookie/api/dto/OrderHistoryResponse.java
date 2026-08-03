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
 String shareToken,
 Instant openedAt,
 Instant completedAt,
 String recipientMessage,
 String progressStatus,
 int currentStep,
 int totalSteps,
 int openCount,
 int maxOpenCount,
 Integer ratingStars,
 String ratingComment
) {}
