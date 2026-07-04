package com.nutricash.api.setting.service;

import com.nutricash.api.budget.service.BudgetService;
import com.nutricash.api.setting.dto.UpdateUserSettingRequest;
import com.nutricash.api.setting.dto.UserSettingResponse;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.repository.UserSettingRepository;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSettingService {

    private final UserSettingRepository userSettingRepository;
    private final BudgetService budgetService;

    @Transactional
    public UserSetting getOrCreateUserSetting(User user) {
        return userSettingRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserSetting defaultSetting = UserSetting.builder()
                            .user(user)
                            .language("vi")
                            .emailAnalysisReady(true)
                            .budgetWarningPush(true)
                            .autoCreateExpense(false)
                            .aiRecommendationsEnabled(true)
                            .theme("light")
                            .monthlyBudget(BigDecimal.ZERO)
                            .build();
                    return userSettingRepository.save(defaultSetting);
                });
    }

    @Transactional
    public UserSetting updateUserSetting(User user, UpdateUserSettingRequest request) {
        UserSetting setting = getOrCreateUserSetting(user);
        boolean budgetChanged = request.monthlyBudget() != null
                && request.monthlyBudget().compareTo(setting.getMonthlyBudget()) != 0;

        if (request.gender() != null) setting.setGender(request.gender());
        if (request.weight() != null) setting.setWeight(request.weight());
        if (request.height() != null) setting.setHeight(request.height());
        if (request.goal() != null) setting.setGoal(request.goal());
        if (request.age() != null) setting.setAge(request.age());
        if (request.diet() != null) setting.setDiet(request.diet());
        if (request.activityLevel() != null) setting.setActivityLevel(request.activityLevel());
        if (request.monthlyBudget() != null) setting.setMonthlyBudget(request.monthlyBudget());
        if (request.language() != null) setting.setLanguage(request.language());
        if (request.emailAnalysisReady() != null) setting.setEmailAnalysisReady(request.emailAnalysisReady());
        if (request.budgetWarningPush() != null) setting.setBudgetWarningPush(request.budgetWarningPush());
        if (request.autoCreateExpense() != null) setting.setAutoCreateExpense(request.autoCreateExpense());
        if (request.aiRecommendationsEnabled() != null) setting.setAiRecommendationsEnabled(request.aiRecommendationsEnabled());
        if (request.theme() != null) setting.setTheme(request.theme());

        UserSetting saved = userSettingRepository.save(setting);
        if (budgetChanged && request.monthlyBudget().signum() > 0) {
            budgetService.replaceMonthlyBudget(user, request.monthlyBudget());
        }
        return saved;
    }

    @Transactional
    public UserSetting restoreProfileFields(User user, UpdateUserSettingRequest request) {
        UserSetting setting = getOrCreateUserSetting(user);
        setting.setGender(request.gender());
        setting.setWeight(request.weight());
        setting.setHeight(request.height());
        setting.setGoal(request.goal());
        setting.setAge(request.age());
        setting.setDiet(request.diet());
        setting.setActivityLevel(request.activityLevel());
        setting.setMonthlyBudget(request.monthlyBudget() == null ? BigDecimal.ZERO : request.monthlyBudget());
        setting.setLanguage(request.language() == null ? "vi" : request.language());
        setting.setEmailAnalysisReady(Boolean.TRUE.equals(request.emailAnalysisReady()));
        setting.setBudgetWarningPush(Boolean.TRUE.equals(request.budgetWarningPush()));
        setting.setAutoCreateExpense(Boolean.TRUE.equals(request.autoCreateExpense()));
        setting.setAiRecommendationsEnabled(request.aiRecommendationsEnabled() == null
                ? Boolean.TRUE : request.aiRecommendationsEnabled());
        setting.setTheme(request.theme() == null ? "light" : request.theme());
        return userSettingRepository.save(setting);
    }

    public UserSettingResponse toResponse(UserSetting setting) {
        return new UserSettingResponse(setting.getId(), setting.getGender(), setting.getWeight(),
                setting.getHeight(), setting.getGoal(), setting.getAge(), setting.getDiet(),
                setting.getActivityLevel(), setting.getMonthlyBudget(), setting.getLanguage(),
                setting.isEmailAnalysisReady(), setting.isBudgetWarningPush(), setting.isAutoCreateExpense(),
                setting.isAiRecommendationsEnabled(), setting.getTheme());
    }
}
