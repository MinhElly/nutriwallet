package com.nutricash.api.health.dto;
import com.nutricash.api.health.enums.*;
import java.time.Instant;
import java.util.Map;
public record AssessmentResponse(Long id, AssessmentChannel channel, AssessmentType type, String currentStep,
        Map<String, Object> answers, AssessmentStatus status, long version, Instant expiresAt, Instant completedAt) {}
