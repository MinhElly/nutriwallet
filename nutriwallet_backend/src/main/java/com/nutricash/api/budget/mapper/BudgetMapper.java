package com.nutricash.api.budget.mapper;

import com.nutricash.api.budget.dto.BudgetResponse;
import com.nutricash.api.budget.entity.Budget;
import org.springframework.stereotype.Component;

@Component
public class BudgetMapper {
    public BudgetResponse toResponse(Budget budget) {
        return new BudgetResponse(
                budget.getId(),
                budget.getAmount(),
                budget.getPeriod(),
                budget.getStartDate(),
                budget.getEndDate(),
                budget.getWarningThresholdPercent(),
                budget.isActive()
        );
    }
}