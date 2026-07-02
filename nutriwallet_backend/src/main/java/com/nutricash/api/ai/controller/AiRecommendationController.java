package com.nutricash.api.ai.controller;

import com.nutricash.api.ai.dto.AiRecommendationResponse;
import com.nutricash.api.ai.service.AiRecommendationService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/recommendations")
@RequiredArgsConstructor
@Tag(name = "AI Recommendations", description = "APIs for dynamic AI health and finance recommendations")
@SecurityRequirement(name = "bearerAuth")
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    @Operation(summary = "Get AI recommendations", description = "Retrieve list of dynamic health and budget recommendations from AI.")
    @GetMapping
    public ApiResponse<List<AiRecommendationResponse>> getRecommendations(@AuthenticationPrincipal SecurityUser currentUser) {
        List<AiRecommendationResponse> list = aiRecommendationService.getRecommendations(currentUser.getUser()).stream()
                .map(rec -> new AiRecommendationResponse(rec.getId(), rec.getContent(), rec.getType(), rec.getTone()))
                .toList();
        return ApiResponse.success(list);
    }
}
