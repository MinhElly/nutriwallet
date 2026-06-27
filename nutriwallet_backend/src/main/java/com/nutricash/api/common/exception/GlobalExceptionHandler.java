package com.nutricash.api.common.exception;

import com.nutricash.api.common.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException exception) {
        log.warn("Application error: {}", exception.getErrorCode().name(), exception);
        ErrorResponse response = new ErrorResponse(
                exception.getErrorCode().name(),
                exception.getMessage(),
                Instant.now()
        );
        return ResponseEntity.status(statusFor(exception.getErrorCode())).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));

        ErrorResponse response = new ErrorResponse(
                ErrorCode.VALIDATION_ERROR.name(),
                message,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpectedException(Exception exception) {
        log.error("Unexpected error", exception);
        ErrorResponse response = new ErrorResponse(
                ErrorCode.INTERNAL_ERROR.name(),
                "An unexpected error occurred",
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private HttpStatus statusFor(ErrorCode errorCode) {
        return switch (errorCode) {
            case VALIDATION_ERROR -> HttpStatus.BAD_REQUEST;
            case UNAUTHORIZED, INVALID_CREDENTIALS, EMAIL_NOT_VERIFIED -> HttpStatus.UNAUTHORIZED;
            case FORBIDDEN -> HttpStatus.FORBIDDEN;
            case RESOURCE_NOT_FOUND, USER_NOT_FOUND -> HttpStatus.NOT_FOUND;
            case CONFLICT, EMAIL_ALREADY_EXISTS, TOKEN_ALREADY_USED -> HttpStatus.CONFLICT;
            case INVALID_TOKEN, TOKEN_EXPIRED -> HttpStatus.BAD_REQUEST;
            case EMAIL_SEND_FAILED -> HttpStatus.BAD_GATEWAY;
            case INTERNAL_ERROR -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
