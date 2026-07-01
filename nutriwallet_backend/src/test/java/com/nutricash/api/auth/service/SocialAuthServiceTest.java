package com.nutricash.api.auth.service;

import com.nutricash.api.auth.dto.SocialProfile;
import com.nutricash.api.common.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class SocialAuthServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private SocialAuthService socialAuthService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(socialAuthService, "restTemplate", restTemplate);
    }

    @Test
    void verifyGoogleToken_Success_IdToken() {
        String token = "header.payload.signature";
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("email", "google@test.com");
        mockResponse.put("name", "Google User");
        mockResponse.put("sub", "12345");
        mockResponse.put("picture", "http://google.com/avatar.jpg");

        when(restTemplate.getForObject(eq("https://oauth2.googleapis.com/tokeninfo?id_token=" + token), eq(Map.class)))
                .thenReturn(mockResponse);

        SocialProfile profile = socialAuthService.verifyGoogleToken(token);

        assertNotNull(profile);
        assertEquals("google@test.com", profile.email());
        assertEquals("Google User", profile.name());
        assertEquals("12345", profile.providerId());
        assertEquals("http://google.com/avatar.jpg", profile.avatarUrl());
    }

    @Test
    void verifyGoogleToken_Success_AccessToken() {
        String token = "ya29.accessToken123";
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("email", "google@test.com");
        mockResponse.put("name", "Google User");
        mockResponse.put("id", "12345");
        mockResponse.put("picture", "http://google.com/avatar.jpg");

        when(restTemplate.getForObject(eq("https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token), eq(Map.class)))
                .thenReturn(mockResponse);

        SocialProfile profile = socialAuthService.verifyGoogleToken(token);

        assertNotNull(profile);
        assertEquals("google@test.com", profile.email());
        assertEquals("Google User", profile.name());
        assertEquals("12345", profile.providerId());
        assertEquals("http://google.com/avatar.jpg", profile.avatarUrl());
    }

    @Test
    void verifyGoogleToken_Failure_InvalidToken() {
        String token = "invalidToken";
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("Bad Request"));

        assertThrows(AppException.class, () -> socialAuthService.verifyGoogleToken(token));
    }

    @Test
    void verifyFacebookToken_Success() {
        String token = "facebookAccessToken";
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("email", "fb@test.com");
        mockResponse.put("name", "FB User");
        mockResponse.put("id", "fb123");

        Map<String, Object> pictureData = new HashMap<>();
        pictureData.put("url", "http://fb.com/avatar.jpg");
        Map<String, Object> pictureMap = new HashMap<>();
        pictureMap.put("data", pictureData);
        mockResponse.put("picture", pictureMap);

        when(restTemplate.getForObject(eq("https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=" + token), eq(Map.class)))
                .thenReturn(mockResponse);

        SocialProfile profile = socialAuthService.verifyFacebookToken(token);

        assertNotNull(profile);
        assertEquals("fb@test.com", profile.email());
        assertEquals("FB User", profile.name());
        assertEquals("fb123", profile.providerId());
        assertEquals("http://fb.com/avatar.jpg", profile.avatarUrl());
    }

    @Test
    void verifyFacebookToken_Failure() {
        String token = "invalidToken";
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("Unauthorized"));

        assertThrows(AppException.class, () -> socialAuthService.verifyFacebookToken(token));
    }
}
