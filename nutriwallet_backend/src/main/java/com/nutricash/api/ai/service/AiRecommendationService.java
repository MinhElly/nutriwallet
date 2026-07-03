package com.nutricash.api.ai.service;

import com.nutricash.api.ai.entity.AiRecommendation;
import com.nutricash.api.ai.repository.AiRecommendationRepository;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.service.UserSettingService;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final AiRecommendationRepository aiRecommendationRepository;
    private final UserSettingService userSettingService;
    private final ExpenseRepository expenseRepository;
    private final AiRecommendationGenerator aiRecommendationGenerator;

    @Transactional
    public List<AiRecommendation> getRecommendations(User user) {
        UserSetting setting = userSettingService.getOrCreateUserSetting(user);
        if (!setting.isAiRecommendationsEnabled()) {
            aiRecommendationRepository.deleteByUserId(user.getId());
            return List.of();
        }

        RecommendationBudgetSnapshot budgetSnapshot = resolveBudgetSnapshot(user, setting);
        List<AiRecommendationDraft> generated = aiRecommendationGenerator.generate(
                user,
                setting,
                budgetSnapshot.spentAmount(),
                budgetSnapshot.budgetLimit());

        List<AiRecommendation> existing = aiRecommendationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (matches(existing, generated)) {
            return existing;
        }

        aiRecommendationRepository.deleteByUserId(user.getId());
        if (generated.isEmpty()) {
            return List.of();
        }

        List<AiRecommendation> saved = generated.stream()
                .map(draft -> AiRecommendation.builder()
                        .user(user)
                        .content(draft.content())
                        .type(draft.type())
                        .tone(draft.tone())
                        .build())
                .toList();
        return aiRecommendationRepository.saveAll(saved);
    }

    private boolean matches(List<AiRecommendation> existing, List<AiRecommendationDraft> generated) {
        if (existing.size() != generated.size()) {
            return false;
        }

        List<String> normalizedExisting = existing.stream()
                .map(this::signature)
                .sorted()
                .toList();
        List<String> normalizedGenerated = generated.stream()
                .map(this::signature)
                .sorted()
                .toList();

        return normalizedExisting.equals(normalizedGenerated);
    }

    private String signature(AiRecommendation recommendation) {
        return signature(recommendation.getContent(), recommendation.getType(), recommendation.getTone());
    }

    private String signature(AiRecommendationDraft draft) {
        return signature(draft.content(), draft.type(), draft.tone());
    }

    private String signature(String content, String type, String tone) {
        return String.join("|", Objects.toString(content, ""), Objects.toString(type, ""), Objects.toString(tone, ""));
    }

    private RecommendationBudgetSnapshot resolveBudgetSnapshot(User user, UserSetting setting) {
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (setting.getCurrentBudget() != null
                && setting.getCurrentBudget().isActive()
                && !today.isBefore(setting.getCurrentBudget().getStartDate())
                && !today.isAfter(setting.getCurrentBudget().getEndDate())) {
            BigDecimal spent = expenseRepository.sumByUserIdAndExpenseDateBetween(
                    user.getId(),
                    setting.getCurrentBudget().getStartDate(),
                    setting.getCurrentBudget().getEndDate());
            return new RecommendationBudgetSnapshot(spent, setting.getCurrentBudget().getAmount());
        }

        if (setting.getMonthlyBudget() != null && setting.getMonthlyBudget().signum() > 0) {
            LocalDate start = today.withDayOfMonth(1);
            LocalDate end = today.withDayOfMonth(today.lengthOfMonth());
            BigDecimal spent = expenseRepository.sumByUserIdAndExpenseDateBetween(user.getId(), start, end);
            return new RecommendationBudgetSnapshot(spent, setting.getMonthlyBudget());
        }

        return new RecommendationBudgetSnapshot(BigDecimal.ZERO, BigDecimal.ZERO);
    }

    private record RecommendationBudgetSnapshot(BigDecimal spentAmount, BigDecimal budgetLimit) {
    }
}
