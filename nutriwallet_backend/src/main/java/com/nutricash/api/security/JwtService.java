package com.nutricash.api.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final byte[] secret;
    private final long expirationMinutes;

    public JwtService(
            @Value("${app.security.jwt-secret:${JWT_SECRET:replace_with_a_secure_random_secret_of_at_least_32_characters}}") String secret,
            @Value("${app.security.jwt-expiration-minutes:${JWT_EXPIRATION_MINUTES:1440}}") long expirationMinutes
    ) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(SecurityUser user) {
        try {
            Instant now = Instant.now();
            Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sub", user.getUsername());
            payload.put("uid", user.getId());
            payload.put("role", user.getUser().getRole().name());
            payload.put("iat", now.getEpochSecond());
            payload.put("exp", now.plusSeconds(expirationMinutes * 60).getEpochSecond());

            String headerPart = encodeJson(header);
            String payloadPart = encodeJson(payload);
            String signaturePart = sign(headerPart + "." + payloadPart);
            return headerPart + "." + payloadPart + "." + signaturePart;
        } catch (Exception exception) {
            throw new IllegalStateException("Could not generate JWT", exception);
        }
    }

    public String extractEmail(String token) {
        return parsePayload(token).get("sub").toString();
    }

    public String tokenHash(String token) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception e) { throw new IllegalStateException("Could not hash token", e); }
    }

    public Instant extractExpiration(String token) {
        return Instant.ofEpochSecond(((Number) parsePayload(token).get("exp")).longValue());
    }

    public boolean isTokenValid(String token, SecurityUser user) {
        try {
            Map<String, Object> payload = parsePayload(token);
            long expiresAt = ((Number) payload.get("exp")).longValue();
            return user.getUsername().equals(payload.get("sub"))
                    && Instant.now().getEpochSecond() < expiresAt
                    && isSignatureValid(token);
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private String encodeJson(Map<String, Object> value) throws Exception {
        return URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
    }

    private Map<String, Object> parsePayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3 || !isSignatureValid(token)) {
                throw new IllegalArgumentException("Invalid JWT");
            }
            byte[] payload = URL_DECODER.decode(parts[1]);
            return objectMapper.readValue(payload, new TypeReference<>() {});
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid JWT", exception);
        }
    }

    private boolean isSignatureValid(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }
        String expected = sign(parts[0] + "." + parts[1]);
        return MessageDigestUtil.constantTimeEquals(expected, parts[2]);
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return URL_ENCODER.encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign JWT", exception);
        }
    }

    private static final class MessageDigestUtil {
        private static boolean constantTimeEquals(String left, String right) {
            byte[] a = left.getBytes(StandardCharsets.UTF_8);
            byte[] b = right.getBytes(StandardCharsets.UTF_8);
            if (a.length != b.length) {
                return false;
            }
            int result = 0;
            for (int i = 0; i < a.length; i++) {
                result |= a[i] ^ b[i];
            }
            return result == 0;
        }
    }
}



