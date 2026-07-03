package com.nutricash.api.ai.dto;

import com.nutricash.api.common.enums.AiLogEvaluationStatus;
import jakarta.validation.constraints.NotNull;

public record AiLogEvaluationRequest(
        @NotNull(message = "Trạng thái đánh giá không được để trống")
        AiLogEvaluationStatus evaluationStatus
) {
}
