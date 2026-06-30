package com.nutricash.api.ai.client;

import com.nutricash.api.common.exception.*;
import java.time.Duration;

public class AiProviderException extends AppException {
    private final Duration retryAfter;

    public AiProviderException(ErrorCode code, Duration retryAfter) {
        super(code);
        this.retryAfter = retryAfter;
    }

    public Duration getRetryAfter() {
        return retryAfter;
    }
}
