package com.nutricash.api.ai.service;

import com.fasterxml.jackson.databind.*;
import com.nutricash.api.ai.dto.*;
import com.nutricash.api.ai.client.AiProviderException;
import com.nutricash.api.ai.entity.*;
import com.nutricash.api.ai.repository.*;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.*;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {
    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);

    private final AiAnalysisLogRepository logs;
    private final NutritionAnalysisCacheRepository caches;
    private final UserRepository users;
    private final AiProviderService provider;
    private final AiPromptBuilder prompts;
    private final AiJobPublisher publisher;
    private final AiWorkerRateLimiter limiter;
    private final ObjectMapper mapper = new ObjectMapper();
    @Value("${app.ai.cache.ttl-days:30}")
    private long ttl;
    @Value("${app.ai.retry.max-attempts:3}")
    private int maxRetries;

    @Transactional
    public AiAnalyzeMealResponse getAnalysis(SecurityUser p, Long id) {
        if (p == null)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        return response(
                logs.findByIdAndUserId(id, p.getId()).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND)),
                null);
    }

    @Transactional
    public AiAnalyzeMealResponse analyzeMeal(SecurityUser p, AiAnalyzeMealRequest r) {
        User u = user(p);
        validate(r);
        String k = key(r);
        AiAnalysisLog l = newLog(u, r, k);
        var h = caches.findByCacheKeyAndUpdatedAtAfter(k, Instant.now().minus(Duration.ofDays(ttl)));
        if (h.isPresent())
            return cacheHit(l, h.get());
        AiAnalysisLog s = logs.save(l);
        afterCommit(s.getId());
        return response(s, "Analysis queued");
    }

    @Transactional
    public void processJob(Long id) {
        AiAnalysisLog l = logs.findById(id).orElse(null);
        if (l == null || l.getStatus() == AiAnalysisStatus.SUCCESS || l.getStatus() == AiAnalysisStatus.FAILED)
            return;
        l.setStatus(AiAnalysisStatus.PROCESSING);
        if (l.getStartedAt() == null)
            l.setStartedAt(Instant.now());
        logs.saveAndFlush(l);
        try {
            limiter.acquire();
            String raw = provider.generate(prompts.meal(),
                    "Meal: " + l.getInputText() + " Image URL: " + l.getInputImageUrl());
            JsonNode j = parse(raw);
            
            // Output Validation & Sanitization
            l.setParsedCalories(validateAndGetNumber(j, "calories"));
            l.setParsedProteinGram(validateAndGetNumber(j, "proteinGram"));
            l.setParsedCarbGram(validateAndGetNumber(j, "carbGram"));
            l.setParsedFatGram(validateAndGetNumber(j, "fatGram"));
            l.setConfidence(validateAndGetConfidence(j));
            l.setMealType(txtOpt(j, "mealType"));
            
            BigDecimal price = validateAndGetNumber(j, "estimatedPriceVnd");
            l.setEstimatedPriceVnd(price.setScale(0, java.math.RoundingMode.HALF_UP));
            
            l.setFoodName(txt(j, "foodName", l.getInputText()));
            l.setRawAiResponse(raw);
            l.setModelName(provider.model());
            l.setSource(AiAnalysisSource.AI);
            l.setStatus(AiAnalysisStatus.SUCCESS);
            l.setCompletedAt(Instant.now());
            saveCache(l);
            logs.save(l);
        } catch (Exception e) {
            fail(l, e);
        }
    }

    @Transactional
    public void handleJobProcessingFailure(Long id, Throwable t) {
        log.error("Handling fatal job processing failure for analysis log: id={}", id, t);
        AiAnalysisLog l = logs.findById(id).orElse(null);
        if (l == null) return;
        l.setStatus(AiAnalysisStatus.FAILED);
        l.setErrorMessage("AI_TEMPORARILY_UNAVAILABLE");
        l.setCompletedAt(Instant.now());
        logs.save(l);
    }

    private void fail(AiAnalysisLog l, Exception e) {
        ErrorCode c = e instanceof AppException a ? a.getErrorCode() : ErrorCode.AI_INVALID_RESPONSE;
        log.warn("Job execution failed: logId={}, errorCode={}", l.getId(), c.name(), e);
        
        // If temporary unavailability or rate limiting happens, fail immediately with AI_TEMPORARILY_UNAVAILABLE
        if (c == ErrorCode.AI_PROVIDER_UNAVAILABLE || c == ErrorCode.AI_RATE_LIMITED) {
            l.setStatus(AiAnalysisStatus.FAILED);
            l.setErrorMessage("AI_TEMPORARILY_UNAVAILABLE");
            l.setCompletedAt(Instant.now());
            logs.save(l);
            publisher.deadLetter(l.getId());
            return;
        }

        // For standard/permanent failures
        l.setStatus(AiAnalysisStatus.FAILED);
        l.setErrorMessage(c.code());
        l.setCompletedAt(Instant.now());
        logs.save(l);
        publisher.deadLetter(l.getId());
    }

    private AiAnalysisLog newLog(User u, AiAnalyzeMealRequest r, String k) {
        return AiAnalysisLog.builder().user(u).inputType(type(r)).inputText(clean(r.text()))
                .inputImageUrl(clean(r.imageUrl())).cacheKey(k).status(AiAnalysisStatus.PENDING).build();
    }

    private AiAnalyzeMealResponse cacheHit(AiAnalysisLog l, NutritionAnalysisCache c) {
        c.setUseCount(c.getUseCount() + 1);
        copy(l, c);
        l.setStatus(AiAnalysisStatus.SUCCESS);
        l.setSource(AiAnalysisSource.CACHE);
        l.setCompletedAt(Instant.now());
        return response(logs.save(l), "Cache hit");
    }

    private void afterCommit(Long id) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            public void afterCommit() {
                publisher.publish(id);
            }
        });
    }

    private void saveCache(AiAnalysisLog l) {
        caches.save(NutritionAnalysisCache.builder().cacheKey(l.getCacheKey()).foodName(l.getFoodName())
                .normalizedFoodName(norm(l.getFoodName())).calories(l.getParsedCalories())
                .proteinGram(l.getParsedProteinGram()).carbGram(l.getParsedCarbGram()).fatGram(l.getParsedFatGram())
                .mealType(l.getMealType()).estimatedPriceVnd(l.getEstimatedPriceVnd()).modelName(l.getModelName())
                .useCount(1).build());
    }

    private void copy(AiAnalysisLog l, NutritionAnalysisCache c) {
        l.setFoodName(c.getFoodName());
        l.setParsedCalories(c.getCalories());
        l.setParsedProteinGram(c.getProteinGram());
        l.setParsedCarbGram(c.getCarbGram());
        l.setParsedFatGram(c.getFatGram());
        l.setMealType(c.getMealType());
        l.setEstimatedPriceVnd(c.getEstimatedPriceVnd());
        l.setModelName(c.getModelName());
        l.setConfidence(BigDecimal.valueOf(95.0));
    }

    private AiAnalyzeMealResponse response(AiAnalysisLog l, String m) {
        if (m == null) {
            if (l.getStatus() == AiAnalysisStatus.FAILED) {
                if ("AI_TEMPORARILY_UNAVAILABLE".equals(l.getErrorMessage())) {
                    m = "AI đang quá tải, vui lòng thử lại sau ít phút.";
                } else {
                    m = "Phân tích thất bại: " + l.getErrorMessage();
                }
            } else if (l.getStatus() == AiAnalysisStatus.SUCCESS) {
                m = "Analysis complete";
            } else {
                m = "Analysis pending";
            }
        }
        return new AiAnalyzeMealResponse(l.getId(), l.getStatus(), m, l.getParsedCalories(), l.getParsedProteinGram(),
                l.getParsedCarbGram(), l.getParsedFatGram(), l.getModelName(), l.getFoodName(), l.getSource(),
                l.getConfidence(), l.getMealType(), l.getEstimatedPriceVnd());
    }

    private void validate(AiAnalyzeMealRequest r) {
        if (r == null || (clean(r.text()) == null && clean(r.imageUrl()) == null))
            throw new AppException(ErrorCode.VALIDATION_ERROR);
    }

    private AiInputType type(AiAnalyzeMealRequest r) {
        boolean t = clean(r.text()) != null, i = clean(r.imageUrl()) != null;
        return t && i ? AiInputType.IMAGE_AND_TEXT : i ? AiInputType.IMAGE : AiInputType.TEXT;
    }

    private String key(AiAnalyzeMealRequest r) {
        String v = clean(r.imageUrl()) != null ? "image:" + normUrl(r.imageUrl()) : "text:" + norm(r.text());
        try {
            return HexFormat.of()
                    .formatHex(MessageDigest.getInstance("SHA-256").digest(v.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private String normUrl(String value) {
        try {
            URI u = URI.create(value.trim()).normalize();
            return new URI(u.getScheme() == null ? null : u.getScheme().toLowerCase(Locale.ROOT), u.getUserInfo(),
                    u.getHost() == null ? null : u.getHost().toLowerCase(Locale.ROOT), u.getPort(), u.getPath(),
                    u.getQuery(), null).toString();
        } catch (Exception e) {
            return value.trim();
        }
    }

    private String norm(String v) {
        return v == null ? null
                : v.toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N}\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    private JsonNode parse(String v) {
        try {
            return mapper.readTree(v.replace("```json", "").replace("```", "").trim());
        } catch (Exception e) {
            throw new AppException(ErrorCode.AI_INVALID_RESPONSE);
        }
    }

    private BigDecimal validateAndGetNumber(JsonNode j, String field) {
        JsonNode node = j.get(field);
        if (node == null || !node.isNumber()) {
            log.warn("Missing or invalid number field '{}', defaulting to 0", field);
            return BigDecimal.ZERO;
        }
        BigDecimal val = node.decimalValue();
        if (val.signum() < 0) {
            log.warn("Negative number field '{}'={}, defaulting to 0", field, val);
            return BigDecimal.ZERO;
        }
        return val;
    }

    private BigDecimal validateAndGetConfidence(JsonNode j) {
        JsonNode node = j.get("confidence");
        if (node == null || !node.isNumber()) {
            return BigDecimal.valueOf(85.0);
        }
        BigDecimal val = node.decimalValue();
        if (val.compareTo(BigDecimal.ONE) <= 0 && val.signum() >= 0) {
            val = val.multiply(BigDecimal.valueOf(100.0));
        }
        if (val.compareTo(BigDecimal.valueOf(100.0)) > 0) {
            val = BigDecimal.valueOf(100.0);
        }
        if (val.signum() < 0) {
            val = BigDecimal.ZERO;
        }
        return val;
    }

    private String txt(JsonNode j, String f, String d) {
        JsonNode v = j.get(f);
        return v != null && !v.asText().isBlank() ? v.asText() : d;
    }

    private String txtOpt(JsonNode j, String f) {
        JsonNode v = j.get(f);
        return v != null && !v.asText().isBlank() ? v.asText() : null;
    }

    private String clean(String v) {
        return v == null || v.isBlank() ? null : v.trim();
    }

    private User user(SecurityUser p) {
        if (p == null)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        return users.findByIdAndDeletedAtIsNull(p.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}
