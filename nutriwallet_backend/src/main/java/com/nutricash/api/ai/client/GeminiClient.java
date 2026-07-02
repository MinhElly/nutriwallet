package com.nutricash.api.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.ai.exception.*;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Base64;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Component
public class GeminiClient implements LlmClient {
    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private final RestClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String key;
    private final String primaryModel;
    private final String fallbackModel;
    private final int maxOutputTokens;
    private final int maxAttempts;
    private final long initialDelayMs;
    private final double retryMultiplier;
    private final long maxDelayMs;

    private final ThreadLocal<String> lastModelUsed = ThreadLocal.withInitial(() -> "gemini-2.5-flash");

    public GeminiClient(RestClient.Builder builder,
            @Value("${app.ai.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
            @Value("${gemini.api-key:}") String key,
            @Value("${gemini.model:gemini-2.5-flash}") String model,
            @Value("${gemini.fallback-model:gemini-2.5-flash-lite}") String fallbackModel,
            @Value("${gemini.max-output-tokens:512}") int maxOutputTokens,
            @Value("${gemini.retry.max-attempts:3}") int maxAttempts,
            @Value("${gemini.retry.initial-delay-ms:2000}") long initialDelayMs,
            @Value("${gemini.retry.multiplier:2}") double multiplier,
            @Value("${gemini.retry.max-delay-ms:8000}") long maxDelayMs) {
        this.http = builder.baseUrl(baseUrl).build();
        this.key = key;
        this.primaryModel = model;
        this.fallbackModel = fallbackModel;
        this.maxOutputTokens = maxOutputTokens;
        this.maxAttempts = maxAttempts;
        this.initialDelayMs = initialDelayMs;
        this.retryMultiplier = multiplier;
        this.maxDelayMs = maxDelayMs;
    }

    @Override
    public String provider() {
        return "GEMINI";
    }

    @Override
    public String model() {
        return lastModelUsed.get();
    }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        if (key == null || key.isBlank()) {
            throw new AppException(ErrorCode.AI_NOT_CONFIGURED);
        }

        byte[] imageBytes = null;
        String mimeType = "image/jpeg";
        if (userPrompt.contains("Image URL: ")) {
            int urlIdx = userPrompt.indexOf("Image URL: ");
            String imageUrl = userPrompt.substring(urlIdx + 11).trim();
            if (!imageUrl.equalsIgnoreCase("null") && !imageUrl.isBlank()) {
                try {
                    imageBytes = RestClient.create().get().uri(imageUrl).retrieve().body(byte[].class);
                    if (imageUrl.toLowerCase().endsWith(".png")) {
                        mimeType = "image/png";
                    } else if (imageUrl.toLowerCase().endsWith(".webp")) {
                        mimeType = "image/webp";
                    } else if (imageUrl.toLowerCase().endsWith(".gif")) {
                        mimeType = "image/gif";
                    }
                } catch (Exception e) {
                    log.warn("Failed to download image from URL: " + imageUrl, e);
                }
            }
        }

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("text", userPrompt));
        if (imageBytes != null) {
            String base64Data = Base64.getEncoder().encodeToString(imageBytes);
            parts.add(Map.of("inline_data", Map.of(
                    "mime_type", mimeType,
                    "data", base64Data
            )));
        }

        boolean isJson = systemPrompt.toLowerCase().contains("json");
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.25);
        generationConfig.put("maxOutputTokens", maxOutputTokens);
        if (isJson) {
            generationConfig.put("responseMimeType", "application/json");
        }

        Map<String, Object> body = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("role", "user", "parts", parts)),
                "generationConfig", generationConfig);

        try {
            return generateWithModelAndRetry(primaryModel, body, true);
        } catch (GeminiTemporaryUnavailableException | GeminiRateLimitException e) {
            log.warn("Primary model {} failed with temporary error. Attempting fallback model {}", primaryModel, fallbackModel);
            return generateWithModelAndRetry(fallbackModel, body, false);
        }
    }

    private String generateWithModelAndRetry(String modelName, Map<String, Object> body, boolean isPrimary) {
        int attempt = 0;
        long delay = initialDelayMs;

        while (true) {
            attempt++;
            long startTime = System.currentTimeMillis();
            log.info("Calling Gemini API: model={}, attempt={}, isPrimary={}", modelName, attempt, isPrimary);
            try {
                String raw = http.post().uri("/v1beta/models/{model}:generateContent?key={key}", modelName, key)
                        .body(body).retrieve().body(String.class);
                JsonNode result = mapper.readTree(raw);
                JsonNode text = result.at("/candidates/0/content/parts/0/text");
                if (text.isMissingNode() || text.asText().isBlank()) {
                    throw new GeminiApiException(ErrorCode.AI_INVALID_RESPONSE);
                }
                lastModelUsed.set(modelName);
                long duration = System.currentTimeMillis() - startTime;
                log.info("Gemini API call succeeded: model={}, duration={}ms", modelName, duration);
                return text.asText();
            } catch (RestClientResponseException e) {
                long duration = System.currentTimeMillis() - startTime;
                AppException mapped = mapProviderError(e);
                log.warn("Gemini API call failed: model={}, status={}, duration={}ms", modelName, e.getStatusCode().value(), duration);
                if (shouldRetry(mapped) && attempt < maxAttempts) {
                    delay = sleepWithBackoffAndJitter(delay, attempt, mapped);
                    continue;
                }
                throw mapped;
            } catch (ResourceAccessException e) {
                long duration = System.currentTimeMillis() - startTime;
                log.warn("Gemini connection error: model={}, duration={}ms", modelName, duration, e);
                GeminiTemporaryUnavailableException mapped = new GeminiTemporaryUnavailableException(null);
                if (attempt < maxAttempts) {
                    delay = sleepWithBackoffAndJitter(delay, attempt, mapped);
                    continue;
                }
                throw mapped;
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                log.error("Gemini unexpected/parsing error: model={}, duration={}ms", modelName, duration, e);
                if (e instanceof GeminiApiException) {
                    throw (GeminiApiException) e;
                }
                throw new GeminiApiException(ErrorCode.AI_INVALID_RESPONSE);
            }
        }
    }

    private boolean shouldRetry(AppException exception) {
        return exception instanceof GeminiTemporaryUnavailableException || exception instanceof GeminiRateLimitException;
    }

    private long sleepWithBackoffAndJitter(long currentDelay, int attempt, AppException exception) {
        long delay = currentDelay;
        if (exception instanceof GeminiRateLimitException && ((GeminiRateLimitException) exception).getRetryAfter() != null) {
            delay = Math.max(delay, ((GeminiRateLimitException) exception).getRetryAfter().toMillis());
        } else if (exception instanceof GeminiTemporaryUnavailableException && ((GeminiTemporaryUnavailableException) exception).getRetryAfter() != null) {
            delay = Math.max(delay, ((GeminiTemporaryUnavailableException) exception).getRetryAfter().toMillis());
        }

        double jitter = java.util.concurrent.ThreadLocalRandom.current().nextDouble(0.8, 1.2);
        long finalDelay = (long) (delay * jitter);
        finalDelay = Math.min(finalDelay, maxDelayMs);

        log.info("Sleeping for {}ms before attempt {} (backoff + jitter)...", finalDelay, attempt + 1);
        try {
            Thread.sleep(finalDelay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GeminiTemporaryUnavailableException(null);
        }

        return Math.min((long) (delay * retryMultiplier), maxDelayMs);
    }

    private AppException mapProviderError(RestClientResponseException exception) {
        HttpStatusCode status = exception.getStatusCode();
        String responseBody = exception.getResponseBodyAsString();
        log.warn("Gemini HTTP error: status={} body={}", status.value(), responseBody);

        if (status.value() == 400) {
            return new GeminiBadRequestException();
        }
        if (status.value() == 401 || status.value() == 403) {
            return new GeminiAuthException();
        }
        if (status.value() == 429) {
            return new GeminiRateLimitException(retryAfter(exception));
        }
        if (status.value() == 500 || status.value() == 503 || status.value() == 504) {
            return new GeminiTemporaryUnavailableException(retryAfter(exception));
        }
        return new GeminiApiException(ErrorCode.AI_PROVIDER_UNAVAILABLE);
    }

    private Duration retryAfter(RestClientResponseException e) {
        String value = e.getResponseHeaders() == null ? null : e.getResponseHeaders().getFirst("Retry-After");
        if (value == null) {
            return null;
        }
        try {
            return Duration.ofSeconds(Long.parseLong(value.trim()));
        } catch (Exception ignored) {
            return null;
        }
    }
}
