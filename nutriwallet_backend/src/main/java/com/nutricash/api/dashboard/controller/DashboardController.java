package com.nutricash.api.dashboard.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.dashboard.dto.DashboardSummaryResponse;
import com.nutricash.api.dashboard.service.DashboardService;
import com.nutricash.api.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for nutrition and expense summaries")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Today summary", description = "Return today's total calories, nutrition values, expenses and meal count.")
    @GetMapping("/today")
    public ApiResponse<DashboardSummaryResponse> today(@AuthenticationPrincipal SecurityUser currentUser) {
        return ApiResponse.success(dashboardService.today(currentUser));
    }

    @Operation(summary = "Month summary", description = "Return current month's total calories, nutrition values, expenses and meal count.")
    @GetMapping("/month")
    public ApiResponse<DashboardSummaryResponse> month(@AuthenticationPrincipal SecurityUser currentUser) {
        return ApiResponse.success(dashboardService.month(currentUser));
    }
}