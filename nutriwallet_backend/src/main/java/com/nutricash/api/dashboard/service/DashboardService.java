package com.nutricash.api.dashboard.service;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.dashboard.dto.DashboardSummaryResponse;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MealRepository mealRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse today(SecurityUser currentUser) {
        LocalDate today = LocalDate.now();
        return summarize(currentUser, today, today);
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse month(SecurityUser currentUser) {
        LocalDate today = LocalDate.now();
        return summarize(currentUser, today.withDayOfMonth(1), today.withDayOfMonth(today.lengthOfMonth()));
    }

    private DashboardSummaryResponse summarize(SecurityUser currentUser, LocalDate startDate, LocalDate endDate) {
        User user = getCurrentUser(currentUser);
        LocalDateTime startTime = startDate.atStartOfDay();
        LocalDateTime endTime = endDate.atTime(LocalTime.MAX);
        List<MealRecord> meals = mealRepository.findAllByUserIdAndMealTimeBetweenOrderByMealTimeDesc(user.getId(), startTime, endTime);
        List<ExpenseRecord> expenses = expenseRepository.findAllByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(user.getId(), startDate, endDate);

        BigDecimal totalCalories = meals.stream().map(MealRecord::getTotalCalories).reduce(BigDecimal.ZERO, this::addNullable);
        BigDecimal totalProtein = meals.stream().map(MealRecord::getProteinGram).reduce(BigDecimal.ZERO, this::addNullable);
        BigDecimal totalCarb = meals.stream().map(MealRecord::getCarbGram).reduce(BigDecimal.ZERO, this::addNullable);
        BigDecimal totalFat = meals.stream().map(MealRecord::getFatGram).reduce(BigDecimal.ZERO, this::addNullable);
        BigDecimal totalExpense = expenses.stream().map(ExpenseRecord::getAmount).reduce(BigDecimal.ZERO, this::addNullable);

        return new DashboardSummaryResponse(
                startDate,
                endDate,
                totalCalories,
                totalProtein,
                totalCarb,
                totalFat,
                totalExpense,
                meals.size(),
                expenses.size()
        );
    }

    private BigDecimal addNullable(BigDecimal total, BigDecimal value) {
        return value == null ? total : total.add(value);
    }

    private User getCurrentUser(SecurityUser currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}