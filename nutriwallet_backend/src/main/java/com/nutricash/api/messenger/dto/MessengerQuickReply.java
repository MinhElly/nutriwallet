package com.nutricash.api.messenger.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
public record MessengerQuickReply(String payload, @JsonProperty("content_type") String contentType, String title) {}
