package com.nutricash.api.auth.controller;

import com.nutricash.api.auth.dto.FacebookDeletionResponse;
import com.nutricash.api.auth.service.FacebookDataDeletionService;
import com.nutricash.api.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth/facebook/data-deletion")
@RequiredArgsConstructor
@Tag(name = "Facebook Data Deletion", description = "Facebook User Data Deletion Callback URL endpoints")
public class FacebookDataDeletionController {

    private final FacebookDataDeletionService facebookDataDeletionService;

    @Operation(summary = "Facebook Data Deletion Callback", description = "Endpoint called by Meta when a user requests data deletion.")
    @PostMapping(consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<FacebookDeletionResponse> handleDataDeletion(
            @RequestParam("signed_request") String signedRequest) {
        log.info("Received Facebook user data deletion callback request");
        FacebookDeletionResponse response = facebookDataDeletionService.processDataDeletion(signedRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Facebook Data Deletion Status", description = "Endpoint to check status of a data deletion request.")
    @GetMapping("/status/{confirmationCode}")
    public ResponseEntity<Map<String, String>> getDeletionStatus(
            @PathVariable("confirmationCode") String confirmationCode) {
        log.info("Checking Facebook data deletion status for code: {}", confirmationCode);
        Map<String, String> response = Map.of(
                "status", "completed",
                "confirmation_code", confirmationCode,
                "message", "Facebook user data deletion request has been processed."
        );
        return ResponseEntity.ok(response);
    }
}
