package com.nutricash.api.ai.controller;

import com.nutricash.api.ai.dto.AiErrorReportResponse;
import com.nutricash.api.ai.dto.CreateAiErrorReportRequest;
import com.nutricash.api.ai.dto.UpdateAiErrorReportStatusRequest;
import com.nutricash.api.ai.service.AiErrorReportService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai/error-reports")
@RequiredArgsConstructor
@Tag(name = "AI Error Reports", description = "APIs for user and system error reporting and management")
@SecurityRequirement(name = "bearerAuth")
public class AiErrorReportController {

    private final AiErrorReportService aiErrorReportService;

    @Operation(summary = "Submit AI Error Report", description = "Allow authenticated users to submit error reports regarding incorrect AI outputs.")
    @PostMapping
    public ApiResponse<AiErrorReportResponse> createReport(
            @AuthenticationPrincipal SecurityUser currentUser,
            @Valid @RequestBody CreateAiErrorReportRequest request) {
        return ApiResponse.success("Đã ghi nhận báo lỗi thành công", aiErrorReportService.createReport(currentUser, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List All AI Error Reports", description = "Allow admin to retrieve all reported AI errors (user reported and system failures).")
    @GetMapping
    public ApiResponse<List<AiErrorReportResponse>> getAllReports() {
        return ApiResponse.success(aiErrorReportService.findAllReports());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update AI Error Report Status", description = "Allow admin to change status of error reports (PENDING, REVIEWED, RESOLVED).")
    @PatchMapping("/{id}/status")
    public ApiResponse<AiErrorReportResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAiErrorReportStatusRequest request) {
        return ApiResponse.success("Cập nhật trạng thái thành công", aiErrorReportService.updateStatus(id, request.status()));
    }
}
