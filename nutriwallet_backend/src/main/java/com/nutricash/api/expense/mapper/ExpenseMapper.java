package com.nutricash.api.expense.mapper;

import com.nutricash.api.expense.dto.ExpenseResponse;
import com.nutricash.api.expense.entity.ExpenseRecord;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {
    public ExpenseResponse toResponse(ExpenseRecord expense) {
        Long mealRecordId = expense.getMealRecord() == null ? null : expense.getMealRecord().getId();
        return new ExpenseResponse(
                expense.getId(),
                mealRecordId,
                expense.getAmount(),
                expense.getCurrency(),
                expense.getCategory(),
                expense.getExpenseDate(),
                expense.getNote()
        );
    }
}