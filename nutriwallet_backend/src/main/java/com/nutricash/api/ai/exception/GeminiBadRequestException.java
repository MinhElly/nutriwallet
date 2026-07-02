package com.nutricash.api.ai.exception;

import com.nutricash.api.common.exception.ErrorCode;

public class GeminiBadRequestException extends GeminiApiException {
    public GeminiBadRequestException() {
        super(ErrorCode.AI_BAD_REQUEST);
    }
}
