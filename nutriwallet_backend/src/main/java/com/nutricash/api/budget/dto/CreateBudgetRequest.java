package com.nutricash.api.budget.dto;

import com.nutricash.api.common.enums.BudgetPeriodType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBudgetRequest(
        @NotNull BigDecimal amount,
        @NotNull BudgetPeriodType period,
        LocalDate startDate,
        LocalDate endDate,
        Integer warningThresholdPercent
) {
}