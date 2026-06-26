package com.nutricash.api.expense.dto;

import com.nutricash.api.common.enums.ExpenseCategory;
import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateExpenseRequest(
        Long mealRecordId,
        BigDecimal amount,
        String currency,
        ExpenseCategory category,
        LocalDate expenseDate,
        String note
) {
}