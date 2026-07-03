package com.nutricash.api.ai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nutricash.api.ai.entity.AiRecommendation;
import com.nutricash.api.ai.repository.AiRecommendationRepository;
import com.nutricash.api.budget.entity.Budget;
import com.nutricash.api.common.enums.BudgetPeriodType;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.service.UserSettingService;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AiRecommendationServiceTest {

    private AiRecommendationRepository repository;
    private UserSettingService userSettingService;
    private ExpenseRepository expenseRepository;
    private AiRecommendationGenerator generator;
    private AiRecommendationService service;

    @BeforeEach
    void setUp() {
        repository = mock(AiRecommendationRepository.class);
        userSettingService = mock(UserSettingService.class);
        expenseRepository = mock(ExpenseRepository.class);
        generator = new ProfileBasedAiRecommendationGenerator();
        service = new AiRecommendationService(repository, userSettingService, expenseRepository, generator);
    }

    @Test
    void returnsEmptyWhenRecommendationIsDisabled() {
        User user = User.builder().id(1L).build();
        UserSetting setting = UserSetting.builder().user(user).aiRecommendationsEnabled(false).build();
        when(userSettingService.getOrCreateUserSetting(user)).thenReturn(setting);

        List<AiRecommendation> result = service.getRecommendations(user);

        assertTrue(result.isEmpty());
        verify(repository).deleteByUserId(user.getId());
        verify(repository, never()).saveAll(any());
    }

    @Test
    void generatesProfileDrivenRecommendationsWhenEnabled() {
        User user = User.builder().id(2L).build();
        LocalDate today = LocalDate.now();
        Budget currentBudget = Budget.builder()
                .id(10L)
                .amount(BigDecimal.valueOf(1_000_000))
                .period(BudgetPeriodType.MONTHLY)
                .startDate(today.withDayOfMonth(1))
                .endDate(today.withDayOfMonth(today.lengthOfMonth()))
                .active(true)
                .build();
        UserSetting setting = UserSetting.builder()
                .user(user)
                .aiRecommendationsEnabled(true)
                .weight(80.0)
                .height(170.0)
                .goal("giảm cân")
                .diet("cân bằng")
                .activityLevel("SEDENTARY")
                .monthlyBudget(BigDecimal.valueOf(1_000_000))
                .currentBudget(currentBudget)
                .build();

        when(userSettingService.getOrCreateUserSetting(user)).thenReturn(setting);
        when(expenseRepository.sumByUserIdAndExpenseDateBetween(any(), any(), any())).thenReturn(BigDecimal.valueOf(600_000));
        when(repository.findByUserIdOrderByCreatedAtDesc(user.getId())).thenReturn(List.of());
        when(repository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<AiRecommendation> result = service.getRecommendations(user);

        assertFalse(result.isEmpty());
        ArgumentCaptor<List<AiRecommendation>> captor = ArgumentCaptor.forClass(List.class);
        verify(repository).saveAll(captor.capture());
        List<AiRecommendation> saved = captor.getValue();
        assertTrue(saved.stream().anyMatch(item -> "budget".equals(item.getType())));
        assertTrue(saved.stream().anyMatch(item -> "nutrition".equals(item.getType())));
        assertTrue(saved.stream().anyMatch(item -> item.getContent().contains("BMI")));
        assertEquals(saved.size(), result.size());
    }
}