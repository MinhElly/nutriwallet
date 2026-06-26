package com.nutricash.api.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DashboardSummaryResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalCalories,
        BigDecimal totalProteinGram,
        BigDecimal totalCarbGram,
        BigDecimal totalFatGram,
        BigDecimal totalExpense,
        long mealCount,
        long expenseCount
) {
}