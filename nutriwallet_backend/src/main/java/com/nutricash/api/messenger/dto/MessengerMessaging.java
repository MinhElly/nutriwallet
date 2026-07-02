package com.nutricash.api.messenger.dto;

public record MessengerMessaging(
    MessengerSender sender,
    MessengerRecipient recipient,
    long timestamp,
    MessengerMessage message
) {}
