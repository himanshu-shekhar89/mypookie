package com.mypookie.api.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record ExperienceResponseRequest(
 @NotBlank @Size(max=64) String blockId,
 @NotBlank @Size(max=40) String responseType,
 @NotBlank @Size(max=80) String contributorName,
 @NotBlank @Size(max=4000) String responseText,
 @Size(max=3) List<@Size(max=900000) String> photoUrls
) {}
