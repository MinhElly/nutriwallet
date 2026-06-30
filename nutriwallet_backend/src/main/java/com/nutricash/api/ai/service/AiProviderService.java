package com.nutricash.api.ai.service;

import com.nutricash.api.ai.client.LlmClient;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiProviderService {
    private final LlmClient client;

    public AiProviderService(List<LlmClient> cs, @Value("${app.ai.provider:GEMINI}") String p) {
        client = cs.stream().filter(c -> c.provider().equalsIgnoreCase(p)).findFirst().orElseThrow();
    }

    public String generate(String s, String p) {
        return client.generate(s, p);
    }

    public String model() {
        return client.model();
    }
}
