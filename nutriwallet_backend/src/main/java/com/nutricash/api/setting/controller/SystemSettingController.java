package com.nutricash.api.setting.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.setting.dto.SystemSettingResponse;
import com.nutricash.api.setting.dto.UpdateSystemSettingRequest;
import com.nutricash.api.setting.entity.SystemSetting;
import com.nutricash.api.setting.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/system")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "APIs for managing global system settings")
@SecurityRequirement(name = "bearerAuth")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @Operation(summary = "Get all system settings", description = "Retrieve list of all system settings (Available for all authenticated users).")
    @GetMapping
    public ApiResponse<List<SystemSettingResponse>> getAllSettings() {
        List<SystemSettingResponse> list = systemSettingService.getAllSettings().stream()
                .map(this::mapToResponse)
                .toList();
        return ApiResponse.success(list);
    }

    @Operation(summary = "Update system setting by key", description = "Update value of a system setting key (Admin role required).")
    @PatchMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemSettingResponse> updateSetting(
            @PathVariable String key,
            @RequestBody UpdateSystemSettingRequest request) {
        SystemSetting updated = systemSettingService.updateSetting(key, request.settingValue());
        return ApiResponse.success(mapToResponse(updated));
    }

    private SystemSettingResponse mapToResponse(SystemSetting setting) {
        return new SystemSettingResponse(
                setting.getId(),
                setting.getSettingKey(),
                setting.getSettingValue(),
                setting.getDescription(),
                setting.getUpdatedAt()
        );
    }
}
