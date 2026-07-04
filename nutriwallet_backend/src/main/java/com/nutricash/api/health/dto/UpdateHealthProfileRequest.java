package com.nutricash.api.health.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record UpdateHealthProfileRequest(@NotNull Boolean consentGiven,
        @Valid List<HealthConditionInput> conditions, @Valid List<HealthAllergyInput> allergies,
        List<String> foodRestrictions, Long expectedProfileVersion) {}
