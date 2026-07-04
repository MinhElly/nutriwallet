package com.nutricash.api.ai.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nutricash.api.ai.dto.CreateAiErrorReportRequest;
import com.nutricash.api.ai.entity.AiErrorReport;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.ai.repository.AiErrorReportRepository;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiErrorReportServiceTest {
    @Mock AiErrorReportRepository errorReports;
    @Mock MealRepository meals;
    @Mock AiAnalysisLogRepository analysisLogs;
    @Mock UserRepository users;

    private AiErrorReportService service;
    private User user;
    private SecurityUser principal;

    @BeforeEach
    void setUp() {
        service = new AiErrorReportService(errorReports, meals, analysisLogs, users);
        user = User.builder().id(1L).email("user@example.com").fullName("User").build();
        principal = new SecurityUser(user);
    }

    @Test
    void rejectsMissingAuthentication() {
        assertAppError(() -> service.createReport(null, request(10L)), ErrorCode.UNAUTHORIZED);
    }

    @Test
    void validatesRequiredMealRecordId() {
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        var violations = validator.validate(new CreateAiErrorReportRequest(null, null, "WRONG_FOOD_NAME", null));
        assertThat(violations).extracting(v -> v.getPropertyPath().toString()).contains("mealRecordId");
    }

    @Test
    void returnsNotFoundWhenMealDoesNotExist() {
        when(users.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(meals.findById(10L)).thenReturn(Optional.empty());
        assertAppError(() -> service.createReport(principal, request(10L)), ErrorCode.RESOURCE_NOT_FOUND);
    }

    @Test
    void forbidsReportingAnotherUsersMeal() {
        User owner = User.builder().id(2L).email("owner@example.com").fullName("Owner").build();
        MealRecord meal = MealRecord.builder().id(10L).user(owner).mealName("Meal").build();
        when(users.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(meals.findById(10L)).thenReturn(Optional.of(meal));
        assertAppError(() -> service.createReport(principal, request(10L)), ErrorCode.FORBIDDEN);
    }

    @Test
    void savesAuthenticatedReportWithOwnedMeal() {
        MealRecord meal = MealRecord.builder().id(10L).user(user).mealName("Meal").build();
        when(users.findByIdAndDeletedAtIsNull(1L)).thenReturn(Optional.of(user));
        when(meals.findById(10L)).thenReturn(Optional.of(meal));
        when(errorReports.saveAndFlush(any(AiErrorReport.class))).thenAnswer(invocation -> {
            AiErrorReport report = invocation.getArgument(0);
            report.setId(99L);
            return report;
        });

        var response = service.createReport(principal, request(10L));

        ArgumentCaptor<AiErrorReport> captor = ArgumentCaptor.forClass(AiErrorReport.class);
        verify(errorReports).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getUser().getId()).isEqualTo(1L);
        assertThat(captor.getValue().getMealRecord().getId()).isEqualTo(10L);
        assertThat(response.id()).isEqualTo(99L);
    }

    private CreateAiErrorReportRequest request(Long mealId) {
        return new CreateAiErrorReportRequest(mealId, null, "WRONG_FOOD_NAME", "Wrong result");
    }

    private void assertAppError(org.assertj.core.api.ThrowableAssert.ThrowingCallable callable, ErrorCode expected) {
        assertThatThrownBy(callable)
                .isInstanceOf(AppException.class)
                .satisfies(error -> assertThat(((AppException) error).getErrorCode()).isEqualTo(expected));
    }
}