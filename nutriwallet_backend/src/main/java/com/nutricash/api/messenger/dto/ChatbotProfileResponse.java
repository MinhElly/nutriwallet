package com.nutricash.api.messenger.dto;

import com.nutricash.api.common.enums.ChatbotPlatform;
import java.time.Instant;

public record ChatbotProfileResponse(
    Long id,
    String psid,
    ChatbotPlatform platform,
    Instant linkedAt,
    String guestSessionCode
) {}
