package com.nutricash.api.auth.service;

import com.nutricash.api.auth.entity.RevokedToken;
import com.nutricash.api.auth.repository.RevokedTokenRepository;
import com.nutricash.api.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RevokedTokenService {
    private final RevokedTokenRepository repository;
    private final JwtService jwtService;

    @Transactional
    public void revoke(String token) {
        String hash = hash(token);
        if (!repository.existsByTokenHash(hash))
            repository.save(
                    RevokedToken.builder().tokenHash(hash).expiresAt(jwtService.extractExpiration(token)).build());
    }

    @Transactional(readOnly = true)
    public boolean isRevoked(String token) {
        return repository.existsByTokenHash(hash(token));
    }

    private String hash(String token) {
        try {
            return HexFormat.of()
                    .formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash token", e);
        }
    }
}
