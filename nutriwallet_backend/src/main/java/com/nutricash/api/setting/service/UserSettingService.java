package com.nutricash.api.setting.service;

import com.nutricash.api.setting.dto.UpdateUserSettingRequest;
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
                            .theme("light")
                            .monthlyBudget(BigDecimal.ZERO)
                            .build();
                    return userSettingRepository.save(defaultSetting);
                });
    }

    @Transactional
    public UserSetting updateUserSetting(User user, UpdateUserSettingRequest request) {
        UserSetting setting = getOrCreateUserSetting(user);

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
        if (request.theme() != null) setting.setTheme(request.theme());

        return userSettingRepository.save(setting);
    }
}
