package com.nutricash.api.admin.service;

import com.nutricash.api.admin.dto.AdminUserResponse;
import com.nutricash.api.common.dto.PageResponse;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final UserRepository userRepository;
    private final AdminAuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> findUsers(String query, UserStatus status, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Specification<User> specification = (root, ignored, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(builder.isNull(root.get("deletedAt")));
            if (status != null) predicates.add(builder.equal(root.get("status"), status));
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(builder.or(
                        builder.like(builder.lower(root.get("fullName")), pattern),
                        builder.like(builder.lower(root.get("email")), pattern)));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };

        Page<User> result = userRepository.findAll(specification,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public AdminUserResponse findById(Long id) {
        return toResponse(getUser(id));
    }

    @Transactional
    public AdminUserResponse updateStatus(SecurityUser actor, Long targetId, UserStatus status) {
        validateActor(actor);
        if (actor.getId().equals(targetId)) {
            throw new AppException(ErrorCode.CONFLICT, "Admin cannot change their own account status");
        }
        if (status != UserStatus.ACTIVE && status != UserStatus.BLOCKED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Status must be ACTIVE or BLOCKED");
        }

        User user = getUser(targetId);
        UserStatus previous = user.getStatus();
        user.setStatus(status);
        User saved = userRepository.save(user);
        auditLogService.record(actor.getId(), targetId, "USER_STATUS_CHANGED", previous + " -> " + status);
        return toResponse(saved);
    }

    private void validateActor(SecurityUser actor) {
        if (actor == null) throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    private User getUser(Long id) {
        return userRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    private AdminUserResponse toResponse(User user) {
        ChatbotProfile messengerProfile = user.getChatbotProfiles().stream().findFirst().orElse(null);
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus(),
                user.getProvider(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                messengerProfile != null,
                messengerProfile == null ? null : messengerProfile.getPlatform().name(),
                messengerProfile == null ? null : messengerProfile.getLinkedAt());
    }
}