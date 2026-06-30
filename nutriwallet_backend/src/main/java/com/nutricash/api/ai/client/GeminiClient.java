package com.nutricash.api.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import java.util.List;
import java.util.Map;
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
    private final String model;

    public GeminiClient(RestClient.Builder builder,
            @Value("${app.ai.base-url:https://generativelanguage.googleapis.com}") String baseUrl,
            @Value("${app.ai.api-key:}") String key,
            @Value("${app.ai.model:gemini-3.5-flash}") String model) {
        this.http = builder.baseUrl(baseUrl).build();
        this.key = key;
        this.model = model;
    }

    @Override public String provider() { return "GEMINI"; }
    @Override public String model() { return model; }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        if (key == null || key.isBlank()) throw new AppException(ErrorCode.AI_NOT_CONFIGURED);
        Map<String, Object> body = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))),
                "generationConfig", Map.of("temperature", 0.25));
        try {
            String raw = http.post().uri("/v1beta/models/{model}:generateContent?key={key}", model, key)
                    .body(body).retrieve().body(String.class);
            JsonNode result = mapper.readTree(raw);
            JsonNode text = result.at("/candidates/0/content/parts/0/text");
            if (text.isMissingNode() || text.asText().isBlank()) throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
            return text.asText();
        } catch (AppException exception) {
            throw exception;
        } catch (RestClientResponseException exception) {
            log.warn("Gemini HTTP error: status={} body={}", exception.getStatusCode().value(), exception.getResponseBodyAsString());
            throw mapProviderError(exception);
        } catch (ResourceAccessException exception) {
            log.warn("Gemini connection error", exception);
            throw new AppException(ErrorCode.AI_PROVIDER_UNAVAILABLE);
        } catch (RestClientException exception) {
            log.warn("Gemini client error", exception);
            throw new AppException(ErrorCode.AI_PROVIDER_UNAVAILABLE);
        } catch (Exception exception) {
            log.warn("Gemini response parsing error", exception);
            throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
        }
    }

    private AppException mapProviderError(RestClientResponseException exception) {
        HttpStatusCode status = exception.getStatusCode();
        if (status.value() == 401 || status.value() == 403) return new AppException(ErrorCode.AI_AUTH_FAILED);
        if (status.value() == 429) return new AiProviderException(ErrorCode.AI_RATE_LIMITED, retryAfter(exception));
        if (status.is4xxClientError()) return new AppException(ErrorCode.AI_BAD_REQUEST);
        return new AiProviderException(ErrorCode.AI_PROVIDER_UNAVAILABLE, retryAfter(exception));
    }
    private Duration retryAfter(RestClientResponseException e) {
        String value=e.getResponseHeaders()==null?null:e.getResponseHeaders().getFirst("Retry-After");
        if(value==null)return null;try{return Duration.ofSeconds(Long.parseLong(value.trim()));}catch(Exception ignored){return null;}
    }
}
