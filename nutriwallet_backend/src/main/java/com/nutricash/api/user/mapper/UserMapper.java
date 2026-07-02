package com.nutricash.api.user.mapper;

import com.nutricash.api.messenger.dto.ChatbotProfileResponse;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.user.dto.UserResponse;
import com.nutricash.api.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        ChatbotProfileResponse chatbotProfileResponse = null;
        if (user.getChatbotProfiles() != null && !user.getChatbotProfiles().isEmpty()) {
            ChatbotProfile profile = user.getChatbotProfiles().get(0);
            chatbotProfileResponse = new ChatbotProfileResponse(
                    profile.getId(),
                    profile.getPsid(),
                    profile.getPlatform(),
                    profile.getLinkedAt(),
                    profile.getGuestSessionCode()
            );
        }

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),
                chatbotProfileResponse
        );
    }
}