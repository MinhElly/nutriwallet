package com.nutricash.api.expense.repository;

import com.nutricash.api.expense.entity.ExpenseRecord;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<ExpenseRecord, Long> {

    List<ExpenseRecord> findAllByUserIdOrderByExpenseDateDesc(Long userId);

    List<ExpenseRecord> findAllByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );

    Optional<ExpenseRecord> findByIdAndUserId(Long id, Long userId);

    Optional<ExpenseRecord> findByMealRecordId(Long mealRecordId);
}