package com.nutricash.api.user.dto;

import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;

/**
 * Skeleton type for the user module.
 */
public record UserResponse(Long id,
    String fullName,
    String email,
    String avatarUrl,
    UserRole role,
    UserStatus status) {
 
        
}

