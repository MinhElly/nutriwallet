package com.nutricash.api.ai.dto;

import java.time.Instant;

public record AiAnalysisErrorResponse(
    Long id,
    String userEmail,
    String inputType,
    String inputText,
    String inputImageUrl,
    String errorMessage,
    String modelName,
    Instant createdAt
) {}
