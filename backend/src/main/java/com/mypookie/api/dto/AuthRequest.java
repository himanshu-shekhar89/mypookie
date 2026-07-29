package com.mypookie.api.dto;
import jakarta.validation.constraints.*;
public record AuthRequest(@NotBlank String firebaseUid,@Email @NotBlank String email,String displayName){}
