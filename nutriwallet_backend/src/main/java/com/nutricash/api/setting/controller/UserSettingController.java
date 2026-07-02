package com.nutricash.api.setting.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.setting.dto.UpdateUserSettingRequest;
import com.nutricash.api.setting.dto.UserSettingResponse;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.service.UserSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/user")
@RequiredArgsConstructor
@Tag(name = "User Settings", description = "APIs for managing user settings and health/finance profile")
@SecurityRequirement(name = "bearerAuth")
public class UserSettingController {

    private final UserSettingService userSettingService;

    @Operation(summary = "Get user settings", description = "Retrieve current logged-in user settings, lazily creating them if not present.")
    @GetMapping
    public ApiResponse<UserSettingResponse> getUserSetting(@AuthenticationPrincipal SecurityUser currentUser) {
        UserSetting setting = userSettingService.getOrCreateUserSetting(currentUser.getUser());
        return ApiResponse.success(mapToResponse(setting));
    }

    @Operation(summary = "Update user settings", description = "Update user settings and profile details.")
    @PatchMapping
    public ApiResponse<UserSettingResponse> updateUserSetting(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody UpdateUserSettingRequest request) {
        UserSetting setting = userSettingService.updateUserSetting(currentUser.getUser(), request);
        return ApiResponse.success(mapToResponse(setting));
    }

    private UserSettingResponse mapToResponse(UserSetting setting) {
        return new UserSettingResponse(
                setting.getId(),
                setting.getGender(),
                setting.getWeight(),
                setting.getHeight(),
                setting.getGoal(),
                setting.getAge(),
                setting.getDiet(),
                setting.getActivityLevel(),
                setting.getMonthlyBudget(),
                setting.getLanguage(),
                setting.isEmailAnalysisReady(),
                setting.isBudgetWarningPush(),
                setting.isAutoCreateExpense(),
                setting.getTheme()
        );
    }
}
