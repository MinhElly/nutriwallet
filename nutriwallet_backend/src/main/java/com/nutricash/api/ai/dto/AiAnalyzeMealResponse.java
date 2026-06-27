package com.nutricash.api.ai.dto;

import java.math.BigDecimal;

public record AiAnalyzeMealResponse(
        Long analysisLogId,
        BigDecimal calories,
        BigDecimal proteinGram,
        BigDecimal carbGram,
        BigDecimal fatGram,
        String modelName,
        String rawResponse
) {
}