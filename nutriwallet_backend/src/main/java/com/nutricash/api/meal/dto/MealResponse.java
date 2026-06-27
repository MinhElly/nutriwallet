package com.nutricash.api.meal.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MealResponse(
        Long id,
        String mealName,
        String description,
        String imageUrl,
        LocalDateTime mealTime,
        BigDecimal totalCalories,
        BigDecimal proteinGram,
        BigDecimal carbGram,
        BigDecimal fatGram,
        boolean aiEstimated,
        boolean confirmedByUser
) {
}