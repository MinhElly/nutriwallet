package com.nutricash.api.health.dto;
import com.nutricash.api.health.enums.*;
import java.time.Instant;
import java.util.List;
public record HealthClassificationResponse(HealthUserType primaryType, List<HealthRiskFlag> riskFlags,
        List<Explanation> explanations, int ruleVersion, Instant evaluatedAt) {
    public record Explanation(String ruleId, String inputType, String message) {}
}
