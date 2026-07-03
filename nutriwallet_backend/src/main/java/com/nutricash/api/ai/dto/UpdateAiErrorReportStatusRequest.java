package com.nutricash.api.ai.dto;

import com.nutricash.api.common.enums.AiErrorReportStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAiErrorReportStatusRequest(
    @NotNull(message = "Trạng thái không được để trống")
    AiErrorReportStatus status
) {}
