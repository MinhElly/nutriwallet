package com.nutricash.api.meal.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdateMealRequest(
        String mealName,
        String description,
        String imageUrl,
        LocalDateTime mealTime,
        BigDecimal totalCalories,
        BigDecimal proteinGram,
        BigDecimal carbGram,
        BigDecimal fatGram,
        Boolean aiEstimated,
        Boolean confirmedByUser
) {
}