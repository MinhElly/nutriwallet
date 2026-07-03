package com.nutricash.api.admin.dto;

import com.nutricash.api.common.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAdminUserStatusRequest(@NotNull UserStatus status) {}