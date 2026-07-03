package com.nutricash.api.budget.repository;
import com.nutricash.api.budget.entity.BudgetAlert;
import com.nutricash.api.common.enums.BudgetAlertType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface BudgetAlertRepository extends JpaRepository<BudgetAlert,Long> {
 Optional<BudgetAlert> findByBudgetIdAndAlertType(Long budgetId,BudgetAlertType alertType);
 void deleteByBudgetIdAndAlertType(Long budgetId,BudgetAlertType alertType);
}