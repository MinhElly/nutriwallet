package com.nutricash.api.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.auth.dto.FacebookDeletionResponse;
import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FacebookDataDeletionServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FacebookDataDeletionService service;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String appSecret = "my-test-app-secret";
    private final String backendUrl = "http://localhost:8081";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(service, "appSecret", appSecret);
        ReflectionTestUtils.setField(service, "backendUrl", backendUrl);
    }

    @Test
    void processDataDeletion_invalidFormat_throwsBadRequest() {
        AppException exception = assertThrows(AppException.class, () ->
                service.processDataDeletion("invalidRequestNoDot"));
        assertEquals(ErrorCode.INVALID_TOKEN, exception.getErrorCode());
    }

    @Test
    void processDataDeletion_wrongSignature_throwsBadRequest() throws Exception {
        Map<String, Object> payloadMap = Map.of(
                "algorithm", "HMAC-SHA256",
                "user_id", "fb123"
        );
        String jsonPayload = objectMapper.writeValueAsString(payloadMap);
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
        
        // Use a wrong key for signature
        byte[] invalidSignature = computeHmacSha256(encodedPayload.getBytes(StandardCharsets.US_ASCII), "wrong-key".getBytes(StandardCharsets.UTF_8));
        String encodedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(invalidSignature);

        String signedRequest = encodedSignature + "." + encodedPayload;

        AppException exception = assertThrows(AppException.class, () ->
                service.processDataDeletion(signedRequest));
        assertEquals(ErrorCode.INVALID_TOKEN, exception.getErrorCode());
    }

    @Test
    void processDataDeletion_validSignature_userNotFound_returnsResponse() throws Exception {
        Map<String, Object> payloadMap = Map.of(
                "algorithm", "HMAC-SHA256",
                "user_id", "fb123"
        );
        String jsonPayload = objectMapper.writeValueAsString(payloadMap);
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
        
        byte[] signature = computeHmacSha256(encodedPayload.getBytes(StandardCharsets.US_ASCII), appSecret.getBytes(StandardCharsets.UTF_8));
        String encodedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(signature);

        String signedRequest = encodedSignature + "." + encodedPayload;

        when(userRepository.findByProviderAndProviderId(AuthProvider.FACEBOOK, "fb123"))
                .thenReturn(Optional.empty());

        FacebookDeletionResponse response = service.processDataDeletion(signedRequest);

        assertNotNull(response);
        assertNotNull(response.confirmationCode());
        assertTrue(response.url().contains(response.confirmationCode()));
        verify(userRepository, never()).save(any());
    }

    @Test
    void processDataDeletion_validSignature_userFound_anonymizesAndSoftDeletesUser() throws Exception {
        Map<String, Object> payloadMap = Map.of(
                "algorithm", "HMAC-SHA256",
                "user_id", "fb123456"
        );
        String jsonPayload = objectMapper.writeValueAsString(payloadMap);
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(jsonPayload.getBytes(StandardCharsets.UTF_8));
        
        byte[] signature = computeHmacSha256(encodedPayload.getBytes(StandardCharsets.US_ASCII), appSecret.getBytes(StandardCharsets.UTF_8));
        String encodedSignature = Base64.getUrlEncoder().withoutPadding().encodeToString(signature);

        String signedRequest = encodedSignature + "." + encodedPayload;

        User user = User.builder()
                .id(1L)
                .fullName("Original FB User")
                .email("original@fb.com")
                .provider(AuthProvider.FACEBOOK)
                .providerId("fb123456")
                .avatarUrl("http://avatar.com/fb.jpg")
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findByProviderAndProviderId(AuthProvider.FACEBOOK, "fb123456"))
                .thenReturn(Optional.of(user));

        FacebookDeletionResponse response = service.processDataDeletion(signedRequest);

        assertNotNull(response);
        assertNotNull(response.confirmationCode());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("Deleted Facebook User", savedUser.getFullName());
        assertEquals("deleted_fb_fb123456@deleted.local", savedUser.getEmail());
        assertNull(savedUser.getProviderId());
        assertNull(savedUser.getAvatarUrl());
        assertEquals(UserStatus.DELETED, savedUser.getStatus());
        assertNotNull(savedUser.getDeletedAt());
        assertNull(savedUser.getSessionTokenHash());
    }

    private byte[] computeHmacSha256(byte[] data, byte[] key) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key, "HmacSHA256");
        mac.init(secretKey);
        return mac.doFinal(data);
    }
}
