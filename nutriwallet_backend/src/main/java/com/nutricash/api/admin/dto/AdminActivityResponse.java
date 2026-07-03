package com.nutricash.api.admin.dto;

import java.time.Instant;

public record AdminActivityResponse(
        Long id,
        Long actorUserId,
        String actorEmail,
        Long targetUserId,
        String targetEmail,
        String action,
        String details,
        Instant createdAt
) {}