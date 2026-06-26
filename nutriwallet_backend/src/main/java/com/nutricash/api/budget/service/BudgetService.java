package com.nutricash.api.budget.service;

import com.nutricash.api.budget.dto.BudgetResponse;
import com.nutricash.api.budget.dto.CreateBudgetRequest;
import com.nutricash.api.budget.dto.UpdateBudgetRequest;
import com.nutricash.api.budget.entity.Budget;
import com.nutricash.api.budget.mapper.BudgetMapper;
import com.nutricash.api.budget.repository.BudgetRepository;
import com.nutricash.api.common.enums.BudgetPeriodType;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    @Transactional
    public BudgetResponse create(SecurityUser currentUser, CreateBudgetRequest request) {
        User user = getCurrentUser(currentUser);
        LocalDate start = request.startDate() == null ? defaultStart(request.period()) : request.startDate();
        LocalDate end = request.endDate() == null ? defaultEnd(request.period(), start) : request.endDate();
        Budget budget = Budget.builder()
                .user(user)
                .amount(request.amount())
                .period(request.period())
                .startDate(start)
                .endDate(end)
                .warningThresholdPercent(request.warningThresholdPercent() == null ? 80 : request.warningThresholdPercent())
                .active(true)
                .build();
        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    @Transactional(readOnly = true)
    public BudgetResponse current(SecurityUser currentUser) {
        User user = getCurrentUser(currentUser);
        LocalDate today = LocalDate.now();
        return budgetRepository
                .findFirstByUserIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAsc(
                        user.getId(), today, today)
                .map(budgetMapper::toResponse)
                .orElse(null);
    }

    @Transactional
    public BudgetResponse update(SecurityUser currentUser, Long id, UpdateBudgetRequest request) {
        User user = getCurrentUser(currentUser);
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (request.amount() != null) budget.setAmount(request.amount());
        if (request.period() != null) budget.setPeriod(request.period());
        if (request.startDate() != null) budget.setStartDate(request.startDate());
        if (request.endDate() != null) budget.setEndDate(request.endDate());
        if (request.warningThresholdPercent() != null) budget.setWarningThresholdPercent(request.warningThresholdPercent());
        if (request.active() != null) budget.setActive(request.active());
        return budgetMapper.toResponse(budgetRepository.save(budget));
    }

    private LocalDate defaultStart(BudgetPeriodType period) {
        LocalDate today = LocalDate.now();
        return switch (period) {
            case DAILY -> today;
            case WEEKLY -> today.with(DayOfWeek.MONDAY);
            case MONTHLY -> today.withDayOfMonth(1);
        };
    }

    private LocalDate defaultEnd(BudgetPeriodType period, LocalDate start) {
        return switch (period) {
            case DAILY -> start;
            case WEEKLY -> start.plusDays(6);
            case MONTHLY -> start.withDayOfMonth(start.lengthOfMonth());
        };
    }

    private User getCurrentUser(SecurityUser currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}