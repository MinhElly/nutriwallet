package com.nutricash.api.budget.repository;

import com.nutricash.api.budget.entity.Budget;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findAllByUserIdAndActiveTrue(Long userId);

    List<Budget> findAllByUserIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long userId,
            LocalDate periodEnd,
            LocalDate periodStart
    );
}

