package com.nutricash.api.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Skeleton type for the user module.
 */
public record UpdateUserRequest(@NotBlank String fullName, String avatarUrl) {
}

