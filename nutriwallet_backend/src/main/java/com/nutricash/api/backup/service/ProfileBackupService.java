package com.nutricash.api.backup.service;

import com.nutricash.api.backup.dto.*;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.entity.HealthProfile;
import com.nutricash.api.health.service.HealthProfileService;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.setting.dto.UpdateUserSettingRequest;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.setting.service.UserSettingService;
import com.nutricash.api.user.dto.*;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import com.nutricash.api.user.service.UserService;
import java.time.Instant;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileBackupService {
    public static final int SCHEMA_VERSION = 1;
    private static final Set<String> ALLOWED_FIELDS = Set.of(
            "user.fullName", "user.avatarUrl",
            "settings.gender", "settings.weight", "settings.height", "settings.goal", "settings.age",
            "settings.diet", "settings.activityLevel", "settings.monthlyBudget", "settings.language",
            "settings.emailAnalysisReady", "settings.budgetWarningPush", "settings.autoCreateExpense",
            "settings.aiRecommendationsEnabled", "settings.theme",
            "healthProfile.consentGiven", "healthProfile.conditions", "healthProfile.allergies",
            "healthProfile.foodRestrictions");
    private final UserRepository users;
    private final UserService userService;
    private final UserSettingService settingsService;
    private final HealthProfileService healthProfiles;

    @Transactional
    public ProfileBackupPayload export(SecurityUser principal) {
        User user = user(principal);
        UserSetting settings = settingsService.getOrCreateUserSetting(user);
        HealthProfileResponse health = healthProfiles.toResponse(healthProfiles.getOrCreate(user));
        return payload(user, settings, health);
    }

    @Transactional
    public BackupPreviewResponse preview(SecurityUser principal, ProfileBackupPayload incoming) {
        validateVersion(incoming);
        ProfileBackupPayload current = export(principal);
        Map<String, Object> before = flatten(current);
        Map<String, Object> after = flatten(incoming);
        List<BackupPreviewResponse.Change> changes = new ArrayList<>();
        for (String field : ALLOWED_FIELDS.stream().sorted().toList()) {
            Object oldValue = before.get(field);
            Object newValue = after.get(field);
            if (!Objects.equals(oldValue, newValue)) {
                String type = oldValue == null ? "ADDED" : newValue == null ? "REMOVED" : "CHANGED";
                changes.add(new BackupPreviewResponse.Change(field, oldValue, newValue, type));
            }
        }
        long version = healthProfiles.get(principal).profileVersion();
        return new BackupPreviewResponse(SCHEMA_VERSION, version, changes,
                List.of("Dữ liệu sức khỏe là thông tin người dùng tự khai và không thay thế chẩn đoán y khoa."));
    }

    @Transactional
    public BackupRestoreResponse restore(SecurityUser principal, BackupRestoreRequest request) {
        validateVersion(request.backup());
        Set<String> selected = new HashSet<>(request.selectedFields());
        if (!ALLOWED_FIELDS.containsAll(selected))
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Backup contains unsupported restore fields");
        User user = user(principal);
        ProfileBackupPayload incoming = request.backup();
        ProfileBackupPayload current = export(principal);

        String fullName = choose(selected, "user.fullName", incoming.user().fullName(), current.user().fullName());
        String avatar = choose(selected, "user.avatarUrl", incoming.user().avatarUrl(), current.user().avatarUrl());
        if (fullName == null || fullName.isBlank())
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Full name cannot be blank");
        UserResponse userResponse = userService.updateMe(principal, new UpdateUserRequest(fullName.trim(), avatar));

        ProfileBackupPayload.Settings i = incoming.settings();
        ProfileBackupPayload.Settings c = current.settings();
        UpdateUserSettingRequest settingsRequest = new UpdateUserSettingRequest(
                choose(selected, "settings.gender", i.gender(), c.gender()),
                choose(selected, "settings.weight", i.weight(), c.weight()),
                choose(selected, "settings.height", i.height(), c.height()),
                choose(selected, "settings.goal", i.goal(), c.goal()),
                choose(selected, "settings.age", i.age(), c.age()),
                choose(selected, "settings.diet", i.diet(), c.diet()),
                choose(selected, "settings.activityLevel", i.activityLevel(), c.activityLevel()),
                choose(selected, "settings.monthlyBudget", i.monthlyBudget(), c.monthlyBudget()),
                choose(selected, "settings.language", i.language(), c.language()),
                choose(selected, "settings.emailAnalysisReady", i.emailAnalysisReady(), c.emailAnalysisReady()),
                choose(selected, "settings.budgetWarningPush", i.budgetWarningPush(), c.budgetWarningPush()),
                choose(selected, "settings.autoCreateExpense", i.autoCreateExpense(), c.autoCreateExpense()),
                choose(selected, "settings.aiRecommendationsEnabled", i.aiRecommendationsEnabled(), c.aiRecommendationsEnabled()),
                choose(selected, "settings.theme", i.theme(), c.theme()));
        UserSetting savedSettings = settingsService.restoreProfileFields(user, settingsRequest);

        ProfileBackupPayload.Health ih = incoming.healthProfile();
        ProfileBackupPayload.Health ch = current.healthProfile();
        UpdateHealthProfileRequest healthRequest = new UpdateHealthProfileRequest(
                choose(selected, "healthProfile.consentGiven", ih.consentGiven(), ch.consentGiven()),
                choose(selected, "healthProfile.conditions", ih.conditions(), ch.conditions()),
                choose(selected, "healthProfile.allergies", ih.allergies(), ch.allergies()),
                choose(selected, "healthProfile.foodRestrictions", ih.foodRestrictions(), ch.foodRestrictions()),
                request.expectedProfileVersion());
        HealthProfileResponse health = healthProfiles.update(user, healthRequest, false);
        return new BackupRestoreResponse(userResponse, settingsService.toResponse(savedSettings), health);
    }

    private ProfileBackupPayload payload(User user, UserSetting s, HealthProfileResponse h) {
        return new ProfileBackupPayload(SCHEMA_VERSION, Instant.now(),
                new ProfileBackupPayload.PublicUser(user.getFullName(), user.getAvatarUrl()),
                new ProfileBackupPayload.Settings(s.getGender(), s.getWeight(), s.getHeight(), s.getGoal(),
                        s.getAge(), s.getDiet(), s.getActivityLevel(), s.getMonthlyBudget(), s.getLanguage(),
                        s.isEmailAnalysisReady(), s.isBudgetWarningPush(), s.isAutoCreateExpense(),
                        s.isAiRecommendationsEnabled(), s.getTheme()),
                new ProfileBackupPayload.Health(h.consentGiven(), h.conditions(), h.allergies(), h.foodRestrictions()));
    }
    private Map<String, Object> flatten(ProfileBackupPayload p) {
        Map<String, Object> values = new HashMap<>();
        values.put("user.fullName", p.user().fullName()); values.put("user.avatarUrl", p.user().avatarUrl());
        ProfileBackupPayload.Settings s = p.settings();
        values.put("settings.gender", s.gender()); values.put("settings.weight", s.weight());
        values.put("settings.height", s.height()); values.put("settings.goal", s.goal());
        values.put("settings.age", s.age()); values.put("settings.diet", s.diet());
        values.put("settings.activityLevel", s.activityLevel()); values.put("settings.monthlyBudget", s.monthlyBudget());
        values.put("settings.language", s.language()); values.put("settings.emailAnalysisReady", s.emailAnalysisReady());
        values.put("settings.budgetWarningPush", s.budgetWarningPush()); values.put("settings.autoCreateExpense", s.autoCreateExpense());
        values.put("settings.aiRecommendationsEnabled", s.aiRecommendationsEnabled()); values.put("settings.theme", s.theme());
        ProfileBackupPayload.Health h = p.healthProfile();
        values.put("healthProfile.consentGiven", h.consentGiven()); values.put("healthProfile.conditions", h.conditions());
        values.put("healthProfile.allergies", h.allergies()); values.put("healthProfile.foodRestrictions", h.foodRestrictions());
        return values;
    }
    private void validateVersion(ProfileBackupPayload payload) {
        if (payload == null || payload.schemaVersion() != SCHEMA_VERSION)
            throw new AppException(ErrorCode.BACKUP_VERSION_UNSUPPORTED);
        if (payload.user() == null || payload.settings() == null || payload.healthProfile() == null)
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Backup is missing required sections");
    }
    private User user(SecurityUser principal) {
        if (principal == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return users.findByIdAndDeletedAtIsNull(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    private <T> T choose(Set<String> selected, String field, T incoming, T current) {
        return selected.contains(field) ? incoming : current;
    }
}
