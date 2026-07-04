package com.nutricash.api.health.dto;
import java.time.Instant;
import java.util.List;
public record HealthProfileResponse(Long id, boolean consentGiven,
        List<HealthConditionInput> conditions, List<HealthAllergyInput> allergies, List<String> foodRestrictions,
        Instant firstCompletedAt, Instant lastReviewedAt, Instant nextQuarterlyReviewAt,
        Instant nextAnnualReviewAt, long profileVersion, HealthClassificationResponse classification) {}
