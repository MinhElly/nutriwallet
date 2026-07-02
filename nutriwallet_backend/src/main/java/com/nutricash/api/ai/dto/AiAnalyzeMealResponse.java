package com.nutricash.api.ai.dto;

import java.math.BigDecimal;
import com.nutricash.api.common.enums.AiAnalysisSource;
import com.nutricash.api.common.enums.AiAnalysisStatus;

public record AiAnalyzeMealResponse(
        Long analysisLogId,
        AiAnalysisStatus status,
        String message,
        BigDecimal calories,
        BigDecimal proteinGram,
        BigDecimal carbGram,
        BigDecimal fatGram,
        String modelName,
        String foodName,
        AiAnalysisSource source,
        BigDecimal confidence,
        String mealType,
        BigDecimal estimatedPriceVnd
) {
}
