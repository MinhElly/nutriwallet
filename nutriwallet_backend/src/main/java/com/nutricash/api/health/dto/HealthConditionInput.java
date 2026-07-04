package com.nutricash.api.health.dto;
import com.nutricash.api.health.enums.HealthConditionType;
import jakarta.validation.constraints.NotNull;
public record HealthConditionInput(@NotNull HealthConditionType type, String customValue) {}
