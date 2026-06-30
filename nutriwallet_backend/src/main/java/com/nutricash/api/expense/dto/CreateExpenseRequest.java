package com.nutricash.api.expense.dto;

import com.nutricash.api.common.enums.ExpenseCategory;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateExpenseRequest(
        Long mealRecordId,
        @NotNull BigDecimal amount,
        String currency,
        @NotNull ExpenseCategory category,
        LocalDate expenseDate,
        String note
) {
}