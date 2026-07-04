package com.nutricash.api.ai.dto;

import java.math.BigDecimal;
import com.nutricash.api.common.enums.AiAnalysisSource;
import com.nutricash.api.common.enums.AiAnalysisStatus;
import java.util.List;

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
        BigDecimal estimatedPriceVnd,
        List<AiFoodCandidate> candidateFoods,
        List<String> ingredients,
        List<String> allergens,
        BigDecimal sugarGram,
        BigDecimal sodiumMg,
        boolean requiresClarification,
        List<AiHealthWarning> healthWarnings
) {
}
