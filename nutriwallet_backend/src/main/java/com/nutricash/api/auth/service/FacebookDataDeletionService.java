package com.nutricash.api.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.auth.dto.FacebookDeletionResponse;
import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FacebookDataDeletionService {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${facebook.app-secret}")
    private String appSecret;

    @Value("${app.backend-url:http://localhost:8080}")
    private String backendUrl;

    @Transactional
    public FacebookDeletionResponse processDataDeletion(String signedRequest) {
        if (signedRequest == null || !signedRequest.contains(".")) {
            log.error("Invalid signed_request format");
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String[] parts = signedRequest.split("\\.");
        if (parts.length != 2) {
            log.error("Invalid signed_request split size");
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        String rawSignature = parts[0];
        String rawPayload = parts[1];

        byte[] decodedSignature;
        String decodedPayloadJson;

        try {
            decodedSignature = Base64.getUrlDecoder().decode(rawSignature);
            decodedPayloadJson = new String(Base64.getUrlDecoder().decode(rawPayload), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to base64url decode signed_request parts", e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(decodedPayloadJson, Map.class);
            
            // Check signature algorithm
            String algorithm = (String) payload.get("algorithm");
            if (algorithm == null || !algorithm.equalsIgnoreCase("HMAC-SHA256")) {
                log.error("Unsupported signature algorithm: {}", algorithm);
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            // Verify HMAC signature
            byte[] expectedSignature = computeHmacSha256(rawPayload.getBytes(StandardCharsets.US_ASCII), appSecret.getBytes(StandardCharsets.UTF_8));
            if (!MessageDigest.isEqual(decodedSignature, expectedSignature)) {
                log.error("Signature verification failed");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            String userId = (String) payload.get("user_id");
            if (userId == null) {
                log.error("Facebook user_id not found in signed_request payload");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            log.info("Processing Facebook data deletion for user_id: {}", userId);

            // Find user by provider and providerId
            userRepository.findByProviderAndProviderId(AuthProvider.FACEBOOK, userId)
                    .ifPresent(user -> {
                        log.info("Soft deleting and anonymizing user ID: {}", user.getId());
                        user.setFullName("Deleted Facebook User");
                        user.setEmail("deleted_fb_" + userId + "@deleted.local");
                        user.setProviderId(null);
                        user.setAvatarUrl(null);
                        user.setStatus(UserStatus.DELETED);
                        user.setDeletedAt(Instant.now());
                        user.setSessionTokenHash(null);
                        userRepository.save(user);
                    });

            String confirmationCode = UUID.randomUUID().toString().replace("-", "");
            String statusUrl = backendUrl + "/api/auth/facebook/data-deletion/status/" + confirmationCode;

            return new FacebookDeletionResponse(statusUrl, confirmationCode);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error processing Facebook data deletion", e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private byte[] computeHmacSha256(byte[] data, byte[] key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key, "HmacSHA256");
        mac.init(secretKey);
        return mac.doFinal(data);
    }
}
