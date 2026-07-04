package com.nutricash.api.backup.dto;
import com.nutricash.api.health.dto.HealthProfileResponse;
import com.nutricash.api.setting.dto.UserSettingResponse;
import com.nutricash.api.user.dto.UserResponse;
public record BackupRestoreResponse(UserResponse user, UserSettingResponse settings, HealthProfileResponse healthProfile) {}
