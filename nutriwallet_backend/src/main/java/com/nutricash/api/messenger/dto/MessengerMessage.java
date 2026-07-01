package com.nutricash.api.messenger.dto;

import java.util.List;

public record MessengerMessage(
    String mid,
    String text,
    List<MessengerAttachment> attachments
) {}
