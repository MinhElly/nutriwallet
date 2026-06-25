package com.nutricash.api.common.exception;

public enum ErrorCode {
    VALIDATION_ERROR("VALIDATION_ERROR","validation error"),
    UNAUTHORIZED("UNAUTHORIZED","unauthorized"),
    FORBIDDEN("FORBIDDEN","forbidden"),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND","resource not found"),
    CONFLICT("CONFLICT", "conflict"),
    INTERNAL_ERROR("INTERNAL_ERROR", "Internet can not load"),

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

