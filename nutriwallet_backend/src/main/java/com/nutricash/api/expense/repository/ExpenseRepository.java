package com.nutricash.api.expense.repository;

import com.nutricash.api.expense.entity.ExpenseRecord;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface ExpenseRepository extends JpaRepository<ExpenseRecord, Long> {

        List<ExpenseRecord> findAllByUserIdOrderByExpenseDateDesc(Long userId);

        List<ExpenseRecord> findAllByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(
                        Long userId,
                        LocalDate startDate,
                        LocalDate endDate);

        Optional<ExpenseRecord> findByIdAndUserId(Long id, Long userId);

        Optional<ExpenseRecord> findByMealRecordId(Long mealRecordId);

        @Query("select coalesce(sum(e.amount), 0) from ExpenseRecord e where e.user.id = :userId and e.expenseDate between :start and :end")
        BigDecimal sumByUserIdAndExpenseDateBetween(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}