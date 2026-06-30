package com.nutricash.api.ai.service;

import com.nutricash.api.ai.dto.*;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final AiProviderService provider;
    private final AiPromptBuilder prompts;

    public ChatResponse chat(SecurityUser u, ChatRequest r) {
        if (u == null)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        return new ChatResponse(provider.generate(prompts.chat(), r.message()), provider.model());
    }
}
