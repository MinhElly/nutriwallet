package com.nutricash.api.auth.dto;

import com.nutricash.api.user.dto.UserResponse;

public record AuthResponse(String accessToken, String tokenType, UserResponse user) {

    public static AuthResponse bearer(String accessToken, UserResponse user) {
        return new AuthResponse(accessToken, "Bearer", user);
    }
}
