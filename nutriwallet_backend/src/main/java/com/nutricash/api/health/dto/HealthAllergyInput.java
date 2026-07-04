package com.nutricash.api.health.dto;
import com.nutricash.api.health.enums.HealthAllergenType;
import jakarta.validation.constraints.NotNull;
public record HealthAllergyInput(@NotNull HealthAllergenType type, String customValue) {}
