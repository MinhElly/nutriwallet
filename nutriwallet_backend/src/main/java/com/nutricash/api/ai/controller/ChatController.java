package com.nutricash.api.ai.controller;

import com.nutricash.api.ai.dto.*;
import com.nutricash.api.ai.service.ChatService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService service;

    @PostMapping
    public ApiResponse<ChatResponse> chat(@AuthenticationPrincipal SecurityUser u, @Valid @RequestBody ChatRequest r) {
        return ApiResponse.success(service.chat(u, r));
    }
}
