package com.nutricash.api.auth.service;

import com.nutricash.api.auth.dto.AuthResponse;
import com.nutricash.api.auth.dto.LoginRequest;
import com.nutricash.api.auth.dto.RegisterRequest;
import com.nutricash.api.auth.entity.EmailVerificationToken;
import com.nutricash.api.auth.repository.EmailVerificationTokenRepository;
import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.mail.service.MailService;
import com.nutricash.api.security.JwtService;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.dto.UserResponse;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.mapper.UserMapper;
import com.nutricash.api.user.repository.UserRepository;
import java.security.SecureRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Base64.Encoder TOKEN_ENCODER = Base64.getUrlEncoder().withoutPadding();

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;
    private final UserMapper userMapper;

    public AuthService(
            UserRepository userRepository,
            EmailVerificationTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MailService mailService,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.userMapper = userMapper;
    }

    @Transactional
    public void register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .status(UserStatus.PENDING_VERIFICATION)
                .provider(AuthProvider.LOCAL)
                .build();
        userRepository.save(user);

        String token = generateVerificationToken();
        tokenRepository.save(EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                .build());

        try {
            mailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception exception) {
            log.error("Registration succeeded, but verification email failed for userId={} email={}",
                    user.getId(), user.getEmail(), exception);
        }
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));

        if (verificationToken.getVerifiedAt() != null) {
            throw new AppException(ErrorCode.TOKEN_ALREADY_USED);
        }
        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            throw new AppException(ErrorCode.TOKEN_EXPIRED);
        }

        User user = verificationToken.getUser();
        user.setStatus(UserStatus.ACTIVE);
        verificationToken.setVerifiedAt(Instant.now());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        SecurityUser securityUser = new SecurityUser(user);
        String token = jwtService.generateToken(securityUser);
        user.setSessionTokenHash(jwtService.tokenHash(token));
        return AuthResponse.bearer(token, userMapper.toResponse(user));
    }

    @Transactional
    public void logout(SecurityUser currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        User user = userRepository.findById(currentUser.getId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setSessionTokenHash(null);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(SecurityUser currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return userMapper.toResponse(user);
    }
    private String generateVerificationToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return TOKEN_ENCODER.encodeToString(bytes);
    }
}


