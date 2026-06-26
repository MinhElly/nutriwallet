package com.nutricash.api.user.service;

import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.dto.CreateUserRequest;
import com.nutricash.api.user.dto.UpdateUserRequest;
import com.nutricash.api.user.dto.UserResponse;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.mapper.UserMapper;
import com.nutricash.api.user.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .provider(AuthProvider.LOCAL)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponse me(SecurityUser currentUser) {
        return userMapper.toResponse(getCurrentUser(currentUser));
    }

    @Transactional
    public UserResponse updateMe(SecurityUser currentUser, UpdateUserRequest request) {
        User user = getCurrentUser(currentUser);
        user.setFullName(request.fullName());
        user.setAvatarUrl(request.avatarUrl());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAllByDeletedAtIsNull()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getNotDeletedEntity(id));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = getNotDeletedEntity(id);
        user.setFullName(request.fullName());
        user.setAvatarUrl(request.avatarUrl());
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void delete(Long id) {
        User user = getNotDeletedEntity(id);
        user.setDeletedAt(Instant.now());
        userRepository.save(user);
    }

    private User getCurrentUser(SecurityUser currentUser) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private User getNotDeletedEntity(Long id) {
        return userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}