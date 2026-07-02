package com.nutricash.api.ai.exception;

import com.nutricash.api.common.exception.ErrorCode;
import java.time.Duration;

public class GeminiRateLimitException extends GeminiApiException {
    private final Duration retryAfter;

    public GeminiRateLimitException(Duration retryAfter) {
        super(ErrorCode.AI_RATE_LIMITED);
        this.retryAfter = retryAfter;
    }

    public Duration getRetryAfter() {
        return retryAfter;
    }
}
