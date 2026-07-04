package com.nutricash.api.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAiErrorReportRequest(
    Long mealRecordId,
    Long aiAnalysisLogId,
    @NotBlank(message = "Lý do báo cáo không được trống")
    @Size(max = 255, message = "Lý do báo cáo không được vượt quá 255 ký tự")
    String reason,
    String description
) {}