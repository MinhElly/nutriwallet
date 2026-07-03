package com.nutricash.api.admin.dto;

import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String avatarUrl,
        UserRole role,
        UserStatus status,
        AuthProvider provider,
        Instant createdAt,
        Instant updatedAt,
        boolean messengerLinked,
        String messengerPlatform,
        Instant messengerLinkedAt
) {}