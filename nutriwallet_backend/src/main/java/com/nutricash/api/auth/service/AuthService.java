package com.nutricash.api.auth.service;

import com.nutricash.api.auth.dto.AuthResponse;
import com.nutricash.api.auth.dto.GoogleLoginRequest;
import com.nutricash.api.auth.dto.FacebookLoginRequest;
import com.nutricash.api.auth.dto.SocialProfile;
import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.security.JwtService;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.dto.UserResponse;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.mapper.UserMapper;
import com.nutricash.api.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final SocialAuthService socialAuthService;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            UserMapper userMapper,
            SocialAuthService socialAuthService
    ) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.socialAuthService = socialAuthService;
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

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        SocialProfile profile = socialAuthService.verifyGoogleToken(request.idToken());
        return processSocialLogin(profile, AuthProvider.GOOGLE);
    }

    @Transactional
    public AuthResponse loginWithFacebook(FacebookLoginRequest request) {
        SocialProfile profile = socialAuthService.verifyFacebookToken(request.accessToken());
        return processSocialLogin(profile, AuthProvider.FACEBOOK);
    }

    private AuthResponse processSocialLogin(SocialProfile profile, AuthProvider provider) {
        User user = userRepository.findByEmailIgnoreCase(profile.email())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .fullName(profile.name())
                            .email(profile.email().toLowerCase())
                            .avatarUrl(profile.avatarUrl())
                            .role(UserRole.USER)
                            .status(UserStatus.ACTIVE)
                            .provider(provider)
                            .providerId(profile.providerId())
                            .build();
                    return userRepository.save(newUser);
                });

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        if (user.getProvider() == AuthProvider.LOCAL) {
            user.setProvider(provider);
        }

        if (user.getProviderId() == null) {
            user.setProviderId(profile.providerId());
        }
        
        if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(profile.avatarUrl());
        }

        SecurityUser securityUser = new SecurityUser(user);
        String jwtToken = jwtService.generateToken(securityUser);
        user.setSessionTokenHash(jwtService.tokenHash(jwtToken));
        userRepository.save(user);

        return AuthResponse.bearer(jwtToken, userMapper.toResponse(user));
    }
}


