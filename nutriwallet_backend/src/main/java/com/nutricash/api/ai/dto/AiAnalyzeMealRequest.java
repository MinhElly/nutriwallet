package com.nutricash.api.ai.dto;

import java.math.BigDecimal;

public record AiAnalyzeMealRequest(
        String text,
        String imageUrl,
        BigDecimal estimatedCalories,
        BigDecimal estimatedProteinGram,
        BigDecimal estimatedCarbGram,
        BigDecimal estimatedFatGram
) {
}