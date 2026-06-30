package com.nutricash.api.common.exception;

public enum ErrorCode {
    VALIDATION_ERROR("VALIDATION_ERROR","validation error"),
    UNAUTHORIZED("UNAUTHORIZED","unauthorized"),
    FORBIDDEN("FORBIDDEN","forbidden"),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND","resource not found"),
    CONFLICT("CONFLICT", "conflict"),
    INTERNAL_ERROR("INTERNAL_ERROR", "Internet can not load"),
    AI_NOT_CONFIGURED("AI_NOT_CONFIGURED", "AI provider is not configured"),
    AI_AUTH_FAILED("AI_AUTH_FAILED", "AI API key is invalid or unauthorized"),
    AI_RATE_LIMITED("AI_RATE_LIMITED", "AI quota or rate limit exceeded"),
    AI_BAD_REQUEST("AI_BAD_REQUEST", "AI model or request is invalid"),
    AI_PROVIDER_UNAVAILABLE("AI_PROVIDER_UNAVAILABLE", "AI provider is temporarily unavailable"),
    AI_INVALID_RESPONSE("AI_INVALID_RESPONSE", "AI provider returned an invalid response"),

    FILE_EMPTY("FILE_EMPTY", "File is empty"),
    FILE_TOO_LARGE("FILE_TOO_LARGE", "File exceeds the 10 MB limit"),
    FILE_TYPE_NOT_ALLOWED("FILE_TYPE_NOT_ALLOWED", "Only JPEG, PNG, WebP and HEIC images are allowed"),
    FILE_UPLOAD_FAILED("FILE_UPLOAD_FAILED", "Could not upload image"),
    FILE_DELETE_FAILED("FILE_DELETE_FAILED", "Could not delete image"),

    USER_NOT_FOUND("USER_NOT_FOUND", "User not found"),
    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email already exists"),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Invalid email or password"),
    EMAIL_NOT_VERIFIED("EMAIL_NOT_VERIFIED", "Email has not been verified"),
    INVALID_TOKEN("INVALID_TOKEN", "Invalid token"),
    TOKEN_EXPIRED("TOKEN_EXPIRED", "Token has expired"),
    TOKEN_ALREADY_USED("TOKEN_ALREADY_USED", "Token has already been used"),
    EMAIL_SEND_FAILED("EMAIL_SEND_FAILED", "Could not send verification email");

    private final String code;
    private final String message;

    ErrorCode(String code, String message){
        this.code = code;
        this.message = message;
    }

    public String code(){
        return code;
    }

    public String message(){
        return message;
    }
}


