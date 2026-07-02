package com.nutricash.api.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateAiErrorReportRequest(
    Long mealRecordId,
    Long aiAnalysisLogId,
    @NotBlank(message = "Lý do báo cáo không được trống")
    String reason,
    String description
) {}
