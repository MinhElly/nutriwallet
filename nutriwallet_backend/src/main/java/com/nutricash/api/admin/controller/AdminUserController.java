package com.nutricash.api.admin.controller;

import com.nutricash.api.admin.dto.AdminUserResponse;
import com.nutricash.api.admin.dto.UpdateAdminUserStatusRequest;
import com.nutricash.api.admin.service.AdminUserService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.common.dto.PageResponse;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> findUsers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminUserService.findUsers(query, status, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminUserResponse> findById(@PathVariable Long id) {
        return ApiResponse.success(adminUserService.findById(id));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AdminUserResponse> updateStatus(
            @AuthenticationPrincipal SecurityUser actor,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminUserStatusRequest request) {
        return ApiResponse.success("User status updated",
                adminUserService.updateStatus(actor, id, request.status()));
    }
}