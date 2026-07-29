package com.mypookie.api.dto;
import jakarta.validation.constraints.*; import java.time.Instant;
public record GiftRequest(
 @NotBlank String title, @NotBlank String recipientName, @NotBlank String recipientType,
 @NotBlank String occasion, @NotBlank String theme, @NotBlank String ambience,
 @NotBlank String blocksJson, Instant scheduledAt
){}
