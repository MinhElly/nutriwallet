package com.nutricash.api.messenger.dto;

import java.util.List;

public record MessengerWebhookRequest(
    String object,
    List<MessengerEntry> entry
) {}
