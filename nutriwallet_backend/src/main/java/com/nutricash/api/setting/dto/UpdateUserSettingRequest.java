package com.nutricash.api.setting.dto;

import java.math.BigDecimal;

public record UpdateUserSettingRequest(
    String gender,
    Double weight,
    Double height,
    String goal,
    Integer age,
    String diet,
    String activityLevel,
    BigDecimal monthlyBudget,
    String language,
    Boolean emailAnalysisReady,
    Boolean budgetWarningPush,
    Boolean autoCreateExpense,
    String theme
) {}
