package com.nutricash.api.expense.dto;

import com.nutricash.api.common.enums.ExpenseCategory;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        Long mealRecordId,
        BigDecimal amount,
        String currency,
        ExpenseCategory category,
        LocalDate expenseDate,
        String note
) {
}