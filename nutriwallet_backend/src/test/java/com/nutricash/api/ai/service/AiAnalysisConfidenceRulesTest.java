package com.nutricash.api.ai.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.nutricash.api.ai.dto.AiHealthWarning;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.ai.repository.NutritionAnalysisCacheRepository;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AiAnalysisConfidenceRulesTest {
    @Mock AiAnalysisLogRepository logs;
    @Mock NutritionAnalysisCacheRepository caches;
    @Mock UserRepository users;
    @Mock AiProviderService provider;
    @Mock AiPromptBuilder prompts;
    @Mock AiJobPublisher publisher;
    @Mock AiWorkerRateLimiter limiter;
    @Mock SystemAiErrorReportService systemErrorReports;
    @Mock MealHealthWarningService healthWarnings;
    @InjectMocks AiAnalysisService service;

    @Test
    void missingConfidenceDefaultsToFifty() {
        AiAnalysisLog log = AiAnalysisLog.builder().id(1L).status(AiAnalysisStatus.PENDING).build();
        when(logs.findById(1L)).thenReturn(Optional.of(log));
        when(prompts.meal()).thenReturn("Return JSON");
        when(provider.generate(anyString(), anyString())).thenReturn("""
                {"foodName":"Phở","calories":400,"proteinGram":20,"carbGram":50,"fatGram":10,
                 "sugarGram":3,"sodiumMg":500,"estimatedPriceVnd":45000,"candidateFoods":[],
                 "ingredients":[],"allergens":[]}
                """);
        when(provider.model()).thenReturn("gemini-test");

        service.processJob(1L);

        org.assertj.core.api.Assertions.assertThat(log.getStatus()).isEqualTo(AiAnalysisStatus.SUCCESS);
        org.assertj.core.api.Assertions.assertThat(log.getConfidence()).isEqualByComparingTo("50");
    }

    @Test
    void closeCandidateScoresRequireClarification() {
        User user = user();
        AiAnalysisLog log = successfulLog(user,
                "{\"candidateFoods\":[{\"foodName\":\"Phở bò\",\"confidence\":88},{\"foodName\":\"Bún bò\",\"confidence\":80}],\"ingredients\":[],\"allergens\":[]}");
        when(logs.findByIdAndUserId(1L, user.getId())).thenReturn(Optional.of(log));
        when(healthWarnings.evaluate(eq(user), eq("Phở bò"), anyList(), anyList(), any(), any(), any(), any())).thenReturn(List.of());

        var response = service.getAnalysis(new SecurityUser(user), 1L);

        org.assertj.core.api.Assertions.assertThat(response.requiresClarification()).isTrue();
    }

    @Test
    void highHealthWarningDoesNotPretendFoodRecognitionIsUncertain() {
        User user = user();
        AiAnalysisLog log = successfulLog(user,
                "{\"candidateFoods\":[{\"foodName\":\"Phở bò\",\"confidence\":96},{\"foodName\":\"Bún bò\",\"confidence\":70}],\"ingredients\":[],\"allergens\":[]}");
        when(logs.findByIdAndUserId(1L, user.getId())).thenReturn(Optional.of(log));
        when(healthWarnings.evaluate(eq(user), eq("Phở bò"), anyList(), anyList(), any(), any(), any(), any())).thenReturn(List.of(
                new AiHealthWarning("HIGH", "ALLERGY", "Cảnh báo dị ứng", List.of(), "Tham khảo")));

        var response = service.getAnalysis(new SecurityUser(user), 1L);

        org.assertj.core.api.Assertions.assertThat(response.requiresClarification()).isFalse();
        org.assertj.core.api.Assertions.assertThat(response.healthWarnings()).hasSize(1);
    }

    private User user() {
        return User.builder().id(7L).fullName("User").email("u@test.com")
                .role(UserRole.USER).status(UserStatus.ACTIVE).build();
    }

    private AiAnalysisLog successfulLog(User user, String enrichment) {
        return AiAnalysisLog.builder().id(1L).user(user).status(AiAnalysisStatus.SUCCESS)
                .foodName("Phở bò").confidence(BigDecimal.valueOf(95)).enrichmentJson(enrichment)
                .parsedCalories(BigDecimal.valueOf(400)).parsedProteinGram(BigDecimal.valueOf(20))
                .parsedCarbGram(BigDecimal.valueOf(50)).parsedFatGram(BigDecimal.valueOf(10)).build();
    }
}