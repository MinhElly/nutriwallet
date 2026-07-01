package com.nutricash.api.auth.service;

import com.nutricash.api.auth.dto.SocialProfile;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class SocialAuthService {

    private static final Logger log = LoggerFactory.getLogger(SocialAuthService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    public SocialProfile verifyGoogleToken(String token) {
        String url;
        if (token != null && token.contains(".") && token.split("\\.").length == 3) {
            url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + token;
        } else {
            url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token;
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || response.get("error") != null) {
                log.error("Google token verification failed: {}", response != null ? response.get("error_description") : "Empty response");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            String email = (String) response.get("email");
            String name = (String) response.get("name");
            String sub = (String) response.get("sub");
            // If userinfo endpoint is used, it returns sub, but tokeninfo might also return sub
            if (sub == null) {
                sub = (String) response.get("id"); // fallback
            }
            String picture = (String) response.get("picture");
            if (email == null) {
                log.error("Google token response does not contain email: {}", response);
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            return new SocialProfile(email, name != null ? name : email.split("@")[0], sub, picture);
        } catch (Exception e) {
            log.error("Error verifying Google token", e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    @SuppressWarnings("unchecked")
    public SocialProfile verifyFacebookToken(String accessToken) {
        String url = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=" + accessToken;
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null || response.get("error") != null) {
                log.error("Facebook token verification failed: {}", response != null ? response.get("error") : "Empty response");
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
            String email = (String) response.get("email");
            String name = (String) response.get("name");
            String id = (String) response.get("id");
            if (email == null) {
                email = id + "@facebook.com"; // fallback email if not provided
            }
            
            String avatarUrl = null;
            if (response.containsKey("picture")) {
                Map<String, Object> picture = (Map<String, Object>) response.get("picture");
                if (picture != null && picture.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) picture.get("data");
                    if (data != null) {
                        avatarUrl = (String) data.get("url");
                    }
                }
            }
            
            return new SocialProfile(email, name != null ? name : "Facebook User", id, avatarUrl);
        } catch (Exception e) {
            log.error("Error verifying Facebook token", e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }
}
