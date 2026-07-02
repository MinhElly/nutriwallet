package com.nutricash.api.messenger.dto;

import jakarta.validation.constraints.NotBlank;

public record LinkAccountRequest(
    @NotBlank(message = "Linking code cannot be blank")
    String code
) {}
