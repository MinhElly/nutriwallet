package com.nutricash.api.messenger.controller;

import com.nutricash.api.messenger.dto.MessengerWebhookRequest;
import com.nutricash.api.messenger.service.MessengerWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/messenger/webhook")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Messenger Webhook", description = "Endpoints for Meta Messenger Chatbot Integration")
public class MessengerWebhookController {

    private final MessengerWebhookService webhookService;

    @GetMapping
    @Operation(summary = "Verify Facebook Webhook", description = "Used by Facebook to verify the webhook URL challenge.")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {
        log.info("Received verification request. Mode: {}, Token: {}", mode, token);
        if (webhookService.verifyToken(mode, token)) {
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification token mismatch");
    }

    @PostMapping
    @Operation(summary = "Handle Messenger Webhook Event", description = "Receives messaging events from Facebook Messenger.")
    public ResponseEntity<Void> handleWebhookEvent(@RequestBody MessengerWebhookRequest payload) {
        log.info("Received webhook event payload");
        CompletableFuture.runAsync(() -> {
            try {
                webhookService.processWebhookRequest(payload);
            } catch (Exception e) {
                log.error("Error processing webhook request in background", e);
            }
        });
        return ResponseEntity.ok().build();
    }
}
