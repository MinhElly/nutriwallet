package com.nutricash.api.admin.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminDashboardResponse(
        long totalUsers,
        long activeUsers,
        long totalMeals,
        long totalAiAnalyses,
        long aiRequestsToday,
        double aiErrorRateToday,
        long pendingAiReports,
        List<TrendItem> sevenDayTrend
) {
    public record TrendItem(
            LocalDate date,
            long newUsers,
            long meals,
            long aiRequests
    ) {}
}