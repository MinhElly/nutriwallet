package com.nutricash.api.health.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.service.*;
import com.nutricash.api.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health-profile")
@RequiredArgsConstructor
public class HealthProfileController {
    private final HealthProfileService profiles;
    private final HealthAssessmentService assessments;

    @GetMapping
    public ApiResponse<HealthProfileResponse> get(@AuthenticationPrincipal SecurityUser user) {
        return ApiResponse.success(profiles.get(user));
    }
    @PutMapping
    public ApiResponse<HealthProfileResponse> update(@AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody UpdateHealthProfileRequest request) {
        return ApiResponse.success(profiles.update(user, request));
    }
    @PostMapping("/assessments")
    public ApiResponse<AssessmentResponse> start(@AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody StartAssessmentRequest request) {
        return ApiResponse.success(assessments.start(user, request));
    }
    @PatchMapping("/assessments/{id}")
    public ApiResponse<AssessmentResponse> updateAssessment(@AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id, @Valid @RequestBody UpdateAssessmentRequest request) {
        return ApiResponse.success(assessments.update(user, id, request));
    }
    @PostMapping("/assessments/{id}/complete")
    public ApiResponse<HealthProfileResponse> complete(@AuthenticationPrincipal SecurityUser user,
            @PathVariable Long id, @Valid @RequestBody CompleteAssessmentRequest request) {
        return ApiResponse.success(assessments.complete(user, id, request));
    }
}
