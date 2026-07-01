package com.nutricash.api.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record FacebookLoginRequest(
    @NotBlank(message = "Facebook Access Token is required")
    String accessToken
) {}
