package com.nutricash.api.ai.exception;

import com.nutricash.api.common.exception.ErrorCode;

public class GeminiAuthException extends GeminiApiException {
    public GeminiAuthException() {
        super(ErrorCode.AI_AUTH_FAILED);
    }
}
