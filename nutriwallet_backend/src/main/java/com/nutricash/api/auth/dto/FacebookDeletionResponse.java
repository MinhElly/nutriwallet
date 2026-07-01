package com.nutricash.api.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FacebookDeletionResponse(
    String url,
    @JsonProperty("confirmation_code")
    String confirmationCode
) {}
