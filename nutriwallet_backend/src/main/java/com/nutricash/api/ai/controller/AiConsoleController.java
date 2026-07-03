package com.nutricash.api.ai.controller;

import com.nutricash.api.ai.dto.*;
import com.nutricash.api.ai.service.AiConsoleService;
import com.nutricash.api.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/console")
@RequiredArgsConstructor
@Tag(name = "AI Console", description = "Admin APIs for managing and monitoring the AI food recognition system")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AiConsoleController {

    private final AiConsoleService aiConsoleService;

    @Operation(summary = "Get AI Console Statistics", description = "Retrieve metrics including total requests, success rate, response times, and failure counts.")
    @GetMapping("/stats")
    public ApiResponse<AiConsoleStatsResponse> getStats() {
        return ApiResponse.success(aiConsoleService.getStats());
    }

    @Operation(summary = "Get AI Performance Chart Data", description = "Retrieve requests volume and accuracy trend for the last 7 days.")
    @GetMapping("/performance")
    public ApiResponse<List<AiConsolePerformanceItem>> getPerformanceChart() {
        return ApiResponse.success(aiConsoleService.getPerformanceChart());
    }

    @Operation(summary = "Get AI Logs for Review", description = "Retrieve a list of successful AI analysis logs to evaluate correctness.")
    @GetMapping("/logs")
    public ApiResponse<List<AiConsoleLogResponse>> getLogsForReview() {
        return ApiResponse.success(aiConsoleService.getLogsForReview());
    }

    @Operation(summary = "Evaluate AI Log", description = "Update the evaluation status of a successful AI log (CORRECT, INCORRECT, RETRAIN).")
    @PatchMapping("/logs/{id}/evaluation")
    public ApiResponse<Void> evaluateLog(
            @PathVariable Long id,
            @Valid @RequestBody AiLogEvaluationRequest request) {
        aiConsoleService.evaluateLog(id, request.evaluationStatus());
        return ApiResponse.success("Đã ghi nhận đánh giá thành công", null);
    }

    @Operation(summary = "Retrain AI Model", description = "Trigger a mock retraining process that resolves and clears logs marked for retraining.")
    @PostMapping("/retrain")
    public ApiResponse<Void> retrainModel() {
        aiConsoleService.retrainModel();
        return ApiResponse.success("Huấn luyện thành công! Phiên bản Model mới đang trực tuyến.", null);
    }
}
