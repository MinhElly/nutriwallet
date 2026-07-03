package com.nutricash.api.ai.dto;

import com.nutricash.api.common.enums.AiLogEvaluationStatus;
import java.time.Instant;

public record AiConsoleLogResponse(
        Long id,
        String foodName,
        String confidence,
        AiLogEvaluationStatus evaluationStatus,
        String inputText,
        String inputImageUrl,
        String modelName,
        Instant createdAt,
        String userEmail
) {
}
