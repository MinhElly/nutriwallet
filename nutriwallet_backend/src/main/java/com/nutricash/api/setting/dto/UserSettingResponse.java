package com.nutricash.api.setting.dto;

import java.math.BigDecimal;

public record UserSettingResponse(
    Long id,
    String gender,
    Double weight,
    Double height,
    String goal,
    Integer age,
    String diet,
    String activityLevel,
    BigDecimal monthlyBudget,
    String language,
    boolean emailAnalysisReady,
    boolean budgetWarningPush,
    boolean autoCreateExpense,
    String theme
) {}
