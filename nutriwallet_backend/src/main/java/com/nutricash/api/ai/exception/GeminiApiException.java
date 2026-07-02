package com.nutricash.api.ai.exception;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;

public class GeminiApiException extends AppException {
    public GeminiApiException(ErrorCode errorCode) {
        super(errorCode);
    }
}
