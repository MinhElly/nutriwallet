package com.nutricash.api.messenger.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public record MessengerMessage(
    String mid,
    String text,
    List<MessengerAttachment> attachments,
    @JsonProperty("quick_reply") MessengerQuickReply quickReply
) {
    public MessengerMessage(String mid, String text, List<MessengerAttachment> attachments) {
        this(mid, text, attachments, null);
    }
}
