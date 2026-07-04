package com.nutricash.api.backup.controller;

import com.nutricash.api.backup.dto.*;
import com.nutricash.api.backup.service.ProfileBackupService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile-backups")
@RequiredArgsConstructor
public class ProfileBackupController {
    private final ProfileBackupService service;
    @GetMapping
    public ApiResponse<ProfileBackupPayload> export(@AuthenticationPrincipal SecurityUser user) {
        return ApiResponse.success(service.export(user));
    }
    @PostMapping("/preview")
    public ApiResponse<BackupPreviewResponse> preview(@AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody BackupPreviewRequest request) {
        return ApiResponse.success(service.preview(user, request.backup()));
    }
    @PostMapping("/restore")
    public ApiResponse<BackupRestoreResponse> restore(@AuthenticationPrincipal SecurityUser user,
            @Valid @RequestBody BackupRestoreRequest request) {
        return ApiResponse.success(service.restore(user, request));
    }
}
