package com.nutricash.api.health.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
public record UpdateAssessmentRequest(@NotBlank String currentStep, @NotNull Map<String, Object> answers, long expectedVersion) {}
