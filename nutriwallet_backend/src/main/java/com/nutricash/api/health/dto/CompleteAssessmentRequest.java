package com.nutricash.api.health.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
public record CompleteAssessmentRequest(@NotNull @Valid UpdateHealthProfileRequest profile, long expectedSessionVersion) {}
