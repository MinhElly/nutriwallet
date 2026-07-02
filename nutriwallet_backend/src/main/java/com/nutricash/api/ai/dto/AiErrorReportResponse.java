package com.nutricash.api.ai.dto;

import com.nutricash.api.common.enums.AiErrorReportStatus;
import java.time.Instant;

public record AiErrorReportResponse(
    Long id,
    String userEmail,
    Long mealRecordId,
    Long aiAnalysisLogId,
    String reason,
    String description,
    AiErrorReportStatus status,
    Instant createdAt
) {}
