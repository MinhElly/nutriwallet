package com.nutricash.api.user.dto;

import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.messenger.dto.ChatbotProfileResponse;
import java.time.Instant;

public record UserResponse(
    Long id,
    String fullName,
    String email,
    String avatarUrl,
    UserRole role,
    UserStatus status,
    Instant createdAt,
    ChatbotProfileResponse chatbotProfile
) {}
