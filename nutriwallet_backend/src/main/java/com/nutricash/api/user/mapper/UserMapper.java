package com.nutricash.api.user.mapper;

import com.nutricash.api.user.dto.UserResponse;
import com.nutricash.api.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus()
        );
    }
}