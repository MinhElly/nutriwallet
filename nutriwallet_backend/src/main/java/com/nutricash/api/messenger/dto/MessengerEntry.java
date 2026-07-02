package com.nutricash.api.messenger.dto;

import java.util.List;

public record MessengerEntry(
    String id,
    long time,
    List<MessengerMessaging> messaging
) {}
