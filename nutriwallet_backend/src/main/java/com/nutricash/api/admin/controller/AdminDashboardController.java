package com.nutricash.api.admin.controller;

import com.nutricash.api.admin.dto.AdminActivityResponse;
import com.nutricash.api.admin.dto.AdminDashboardResponse;
import com.nutricash.api.admin.service.AdminDashboardService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.common.dto.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {
    private final AdminDashboardService service;

    @GetMapping("/overview")
    public ApiResponse<AdminDashboardResponse> overview() {
        return ApiResponse.success(service.getOverview());
    }

    @GetMapping("/activities")
    public ApiResponse<PageResponse<AdminActivityResponse>> activities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(service.getActivities(page, size));
    }
}