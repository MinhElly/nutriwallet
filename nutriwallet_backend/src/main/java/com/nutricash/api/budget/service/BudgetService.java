package com.nutricash.api.budget.service;

import com.nutricash.api.budget.dto.*;
import com.nutricash.api.budget.entity.Budget;
import com.nutricash.api.budget.mapper.BudgetMapper;
import com.nutricash.api.budget.repository.BudgetRepository;
import com.nutricash.api.common.enums.BudgetPeriodType;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.setting.repository.UserSettingRepository;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.math.*;
import java.time.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final UserSettingRepository userSettingRepository;
    private final BudgetMapper budgetMapper;
    private final BudgetAlertService budgetAlertService;

    @Transactional
    public BudgetResponse create(SecurityUser currentUser, CreateBudgetRequest request) {
        User user = getCurrentUser(currentUser);
        Budget budget = createVersion(user, request.amount(), request.period(), request.startDate(),
                request.endDate(), request.warningThresholdPercent());
        budgetAlertService.recalculate(user.getId());
        return budgetMapper.toResponse(budget);
    }

    @Transactional
    public BudgetResponse replaceMonthlyBudget(User user, BigDecimal monthlyAmount) {
        if (monthlyAmount == null || monthlyAmount.signum() <= 0) return null;
        LocalDate start = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).withDayOfMonth(1);
        Budget budget = createVersion(user, monthlyAmount, BudgetPeriodType.MONTHLY,
                start, start.withDayOfMonth(start.lengthOfMonth()), 80);
        budgetAlertService.recalculate(user.getId());
        return budgetMapper.toResponse(budget);
    }

    @Transactional
    public BudgetResponse replaceForUser(User user, BigDecimal amount, BudgetPeriodType period) {
        Budget budget = createVersion(user, amount, period, null, null, 80);
        budgetAlertService.recalculate(user.getId());
        return budgetMapper.toResponse(budget);
    }

    @Transactional
    public BudgetResponse current(SecurityUser currentUser) {
        User user = getCurrentUser(currentUser);
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        Budget linked = userSettingRepository.findByUserId(user.getId())
                .map(setting -> setting.getCurrentBudget()).orElse(null);
        if (linked != null && linked.isActive() && !today.isBefore(linked.getStartDate())
                && !today.isAfter(linked.getEndDate())) return budgetMapper.toResponse(linked);
        if (linked != null && linked.isActive() && today.isAfter(linked.getEndDate())) {
            BigDecimal nextAmount = amountForPeriod(linked.getDailyAmount(), linked.getPeriod(), today);
            Budget rolled = createVersion(user, nextAmount, linked.getPeriod(), null, null,
                    linked.getWarningThresholdPercent());
            budgetAlertService.recalculate(user.getId());
            return budgetMapper.toResponse(rolled);
        }
        Budget current = budgetRepository
                .findFirstByUserIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAsc(
                        user.getId(), today, today).orElse(null);
        if (current != null) linkCurrent(user.getId(), current);
        return current == null ? null : budgetMapper.toResponse(current);
    }

    @Transactional
    public BudgetResponse update(SecurityUser currentUser, Long id, UpdateBudgetRequest request) {
        User user = getCurrentUser(currentUser);
        Budget previous = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (Boolean.FALSE.equals(request.active())) {
            previous.setActive(false);
            unlinkIfCurrent(user.getId(), previous.getId());
            return budgetMapper.toResponse(budgetRepository.save(previous));
        }
        BigDecimal amount = request.amount() == null ? previous.getAmount() : request.amount();
        BudgetPeriodType period = request.period() == null ? previous.getPeriod() : request.period();
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        LocalDate start = request.startDate() == null || request.startDate().isBefore(today)
                ? today : request.startDate();
        Budget budget = createVersion(user, amount, period, start, request.endDate(),
                request.warningThresholdPercent() == null ? previous.getWarningThresholdPercent()
                        : request.warningThresholdPercent());
        budgetAlertService.recalculate(user.getId());
        return budgetMapper.toResponse(budget);
    }

    private Budget createVersion(User user, BigDecimal amount, BudgetPeriodType period, LocalDate requestedStart,
            LocalDate requestedEnd, Integer threshold) {
        if (amount == null || amount.signum() <= 0 || period == null) throw new AppException(ErrorCode.VALIDATION_ERROR);
        LocalDate start = requestedStart == null ? defaultStart(period) : requestedStart;
        LocalDate end = requestedEnd == null ? defaultEnd(period, start) : requestedEnd;
        if (end.isBefore(start)) throw new AppException(ErrorCode.VALIDATION_ERROR);
        List<Budget> active = budgetRepository.findAllByUserIdAndActiveTrue(user.getId());
        active.forEach(b -> b.setActive(false));
        budgetRepository.saveAll(active);
        Budget budget = budgetRepository.save(Budget.builder().user(user).amount(amount)
                .dailyAmount(toDaily(amount, period, start)).period(period).startDate(start).endDate(end)
                .warningThresholdPercent(threshold == null ? 80 : threshold).active(true).build());
        linkCurrent(user.getId(), budget);
        return budget;
    }

    private BigDecimal toDaily(BigDecimal amount, BudgetPeriodType period, LocalDate start) {
        int divisor = switch (period) {
            case DAILY -> 1;
            case WEEKLY -> 7;
            case MONTHLY -> start.lengthOfMonth();
        };
        return amount.divide(BigDecimal.valueOf(divisor), 4, RoundingMode.HALF_UP);
    }

    private BigDecimal amountForPeriod(BigDecimal dailyAmount, BudgetPeriodType period, LocalDate date) {
        int days = switch (period) {
            case DAILY -> 1;
            case WEEKLY -> 7;
            case MONTHLY -> date.lengthOfMonth();
        };
        return dailyAmount.multiply(BigDecimal.valueOf(days)).setScale(2, RoundingMode.HALF_UP);
    }

    private void linkCurrent(Long userId, Budget budget) {
        userSettingRepository.findByUserId(userId).ifPresent(setting -> {
            setting.setCurrentBudget(budget);
            setting.setMonthlyBudget(budget.getDailyAmount().multiply(
                    BigDecimal.valueOf(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).lengthOfMonth()))
                    .setScale(2, RoundingMode.HALF_UP));
            userSettingRepository.save(setting);
        });
    }

    private void unlinkIfCurrent(Long userId, Long budgetId) {
        userSettingRepository.findByUserId(userId).ifPresent(setting -> {
            if (setting.getCurrentBudget() != null && setting.getCurrentBudget().getId().equals(budgetId)) {
                setting.setCurrentBudget(null);
                userSettingRepository.save(setting);
            }
        });
    }

    private LocalDate defaultStart(BudgetPeriodType period) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
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
