package com.nutricash.api.ai.dto;
import java.util.List;
public record AiHealthWarning(String severity, String ruleId, String message,
        List<String> evidence, String disclaimer) {}
