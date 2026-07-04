package com.nutricash.api.health.dto;
import com.nutricash.api.health.enums.*;
import jakarta.validation.constraints.NotNull;
public record StartAssessmentRequest(@NotNull AssessmentChannel channel, @NotNull AssessmentType type) {}
