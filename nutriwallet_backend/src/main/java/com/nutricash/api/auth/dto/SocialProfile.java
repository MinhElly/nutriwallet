package com.nutricash.api.auth.dto;

public record SocialProfile(
    String email,
    String name,
    String providerId,
    String avatarUrl
) {}
