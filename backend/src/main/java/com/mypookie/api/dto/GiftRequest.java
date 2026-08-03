package com.mypookie.api.dto;
import jakarta.validation.constraints.*; import java.time.Instant;
public record GiftRequest(
 @NotBlank String title, @NotBlank @Size(max=80) String senderName, @NotBlank String recipientName, @NotBlank String recipientType,
 @NotBlank String occasion, @NotBlank String theme, @NotBlank String ambience,
 @NotBlank String blocksJson, Instant scheduledAt, @Pattern(regexp="^\\d{4,6}$") String compatibilityPin,
 @Pattern(regexp="^\\d{4,8}$") String accessPin, @Min(0) @Max(100) int maxOpenCount
){}
