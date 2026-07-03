package com.nutricash.api.ai.dto;

public record AiConsoleStatsResponse(
        long totalRequestsToday,
        double successRate,
        double avgResponseTime,
        long failedRequestsToday
) {
}
