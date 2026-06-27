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

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI", description = "APIs for AI-assisted food analysis")
@SecurityRequirement(name = "bearerAuth")
public class AiAnalysisController {

    private final AiAnalysisService aiAnalysisService;

    @Operation(summary = "Analyze meal", description = "Accept text and/or image URL of a meal, stores an AI analysis log, and returns estimated calories and macros.")
    @PostMapping("/analyze-meal")
    public ApiResponse<AiAnalyzeMealResponse> analyzeMeal(
            @AuthenticationPrincipal SecurityUser currentUser,
            @RequestBody AiAnalyzeMealRequest request
    ) {
        return ApiResponse.success(aiAnalysisService.analyzeMeal(currentUser, request));
    }
}