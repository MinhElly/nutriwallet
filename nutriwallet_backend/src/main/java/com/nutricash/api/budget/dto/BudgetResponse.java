package com.nutricash.api.budget.dto;

import com.nutricash.api.common.enums.BudgetPeriodType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetResponse(
        Long id,
        BigDecimal amount,
        BudgetPeriodType period,
        LocalDate startDate,
        LocalDate endDate,
        Integer warningThresholdPercent,
        boolean active
) {
}