package com.nutricash.api.ai.controller;

import com.nutricash.api.ai.dto.AiAnalyzeMealRequest;
import com.nutricash.api.ai.dto.AiAnalyzeMealResponse;
import com.nutricash.api.ai.service.AiAnalysisService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import com.nutricash.api.ai.dto.AiAnalysisErrorResponse;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "APIs for AI-assisted food analysis")
@SecurityRequirement(name = "bearerAuth")
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    @Operation(summary = "Analyze meal", description = "Accept text and/or image URL of a meal, stores an AI analysis log, and returns estimated calories and macros.")
    @PostMapping("/analyze-meal")
    public ResponseEntity<ApiResponse<AiAnalyzeMealResponse>> analyzeMeal(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody AiAnalyzeMealRequest request) {
        AiAnalyzeMealResponse result = aiAnalysisService.analyzeMeal(currentUser, request);
        return ResponseEntity.status(202).body(ApiResponse.success(result.message(), result));
    }

    @GetMapping("/analyses/{id}")
    public ApiResponse<AiAnalyzeMealResponse> getAnalysis(@AuthenticationPrincipal SecurityUser currentUser,
            @PathVariable Long id) {
        return ApiResponse.success(aiAnalysisService.getAnalysis(currentUser, id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/logs/errors")
    public ApiResponse<List<AiAnalysisErrorResponse>> getFailedLogs() {
        return ApiResponse.success(aiAnalysisService.findFailedLogs());
    }
}
