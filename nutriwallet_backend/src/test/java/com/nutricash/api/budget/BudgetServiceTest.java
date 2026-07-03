package com.nutricash.api.budget;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.nutricash.api.budget.entity.Budget;
import com.nutricash.api.budget.mapper.BudgetMapper;
import com.nutricash.api.budget.repository.BudgetRepository;
import com.nutricash.api.budget.service.BudgetAlertService;
import com.nutricash.api.budget.service.BudgetService;
import com.nutricash.api.common.enums.BudgetPeriodType;
import com.nutricash.api.setting.repository.UserSettingRepository;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BudgetServiceTest {
    private BudgetRepository budgets;
    private BudgetService service;
    private User user;

    @BeforeEach
    void setUp() {
        budgets = mock(BudgetRepository.class);
        UserSettingRepository settings = mock(UserSettingRepository.class);
        when(budgets.findAllByUserIdAndActiveTrue(any())).thenReturn(List.of());
        when(budgets.save(any(Budget.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(settings.findByUserId(any())).thenReturn(Optional.empty());
        service = new BudgetService(budgets, mock(UserRepository.class), settings,
                new BudgetMapper(), mock(BudgetAlertService.class));
        user = User.builder().id(1L).fullName("Test").email("test@example.com").build();
    }

    @Test
    void normalizesWeeklyAmountToDailyAmount() {
        var response = service.replaceForUser(user, BigDecimal.valueOf(700_000), BudgetPeriodType.WEEKLY);
        assertEquals(new BigDecimal("100000.0000"), response.dailyAmount());
    }

    @Test
    void normalizesMonthlyAmountUsingActualMonthLength() {
        int days = LocalDate.now().lengthOfMonth();
        BigDecimal monthly = BigDecimal.valueOf(100_000L * days);
        var response = service.replaceForUser(user, monthly, BudgetPeriodType.MONTHLY);
        assertEquals(new BigDecimal("100000.0000"), response.dailyAmount());
    }
}
