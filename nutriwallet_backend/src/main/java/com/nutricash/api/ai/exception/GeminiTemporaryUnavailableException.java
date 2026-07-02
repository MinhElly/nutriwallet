package com.nutricash.api.ai.exception;

import com.nutricash.api.common.exception.ErrorCode;
import java.time.Duration;

public class GeminiTemporaryUnavailableException extends GeminiApiException {
    private final Duration retryAfter;

    public GeminiTemporaryUnavailableException(Duration retryAfter) {
        super(ErrorCode.AI_PROVIDER_UNAVAILABLE);
        this.retryAfter = retryAfter;
    }

    public Duration getRetryAfter() {
        return retryAfter;
    }
}
