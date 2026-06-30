package com.nutricash.api.ai.client;

/**
 * Skeleton type for the ai module.
 */
public interface LlmClient {
    String provider();

    String model();

    String generate(String systemPrompt, String userPrompt);
}
