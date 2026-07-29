package com.mypookie.api.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record ContributionSubmitRequest(
 @NotBlank String claimToken,
 @NotBlank @Size(max=80) String contributorName,
 @NotBlank @Size(max=500) String responseText,
 @Size(max=3) List<@Size(max=900000) String> photoUrls
) {}
