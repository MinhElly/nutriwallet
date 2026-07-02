package com.nutricash.api.messenger.dto;

public record MessengerAttachment(
    String type,
    MessengerPayload payload
) {}
