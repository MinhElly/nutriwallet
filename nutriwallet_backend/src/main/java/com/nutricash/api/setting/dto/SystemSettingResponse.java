package com.nutricash.api.setting.dto;

import java.time.Instant;

public record SystemSettingResponse(
    Long id,
    String settingKey,
    String settingValue,
    String description,
    Instant updatedAt
) {}
