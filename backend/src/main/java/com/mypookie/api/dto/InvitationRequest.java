package com.mypookie.api.dto;
import jakarta.validation.constraints.*;
public record InvitationRequest(
 @NotBlank @Size(max=160) String title,
 @NotBlank @Size(max=40) String tradition,
 @NotBlank @Size(max=100000) String detailsJson
){}
