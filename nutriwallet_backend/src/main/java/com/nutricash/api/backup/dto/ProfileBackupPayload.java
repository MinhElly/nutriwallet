package com.nutricash.api.backup.dto;

import com.nutricash.api.health.dto.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record ProfileBackupPayload(
        int schemaVersion,
        Instant exportedAt,
        PublicUser user,
        Settings settings,
        Health healthProfile) {
    public record PublicUser(String fullName, String avatarUrl) {}
    public record Settings(String gender, Double weight, Double height, String goal, Integer age,
            String diet, String activityLevel, BigDecimal monthlyBudget, String language,
            Boolean emailAnalysisReady, Boolean budgetWarningPush, Boolean autoCreateExpense,
            Boolean aiRecommendationsEnabled, String theme) {}
    public record Health(Boolean consentGiven, List<HealthConditionInput> conditions,
            List<HealthAllergyInput> allergies, List<String> foodRestrictions) {}
}
