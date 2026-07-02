package com.nutricash.api.ai.exception;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;

public class GeminiApiException extends AppException {
    public GeminiApiException(ErrorCode errorCode) {
        super(errorCode);
    }

    public GeminiApiException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public GeminiApiException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(errorCode, customMessage, cause);
    }
}
