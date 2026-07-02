package com.nutricash.api.ai.dto;

public record AiRecommendationResponse(
    Long id,
    String content,
    String type,
    String tone
) {}
