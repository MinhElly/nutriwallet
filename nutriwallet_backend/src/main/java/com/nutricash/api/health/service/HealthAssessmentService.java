package com.nutricash.api.health.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.entity.HealthAssessmentSession;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.HealthAssessmentSessionRepository;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HealthAssessmentService {
    private final HealthAssessmentSessionRepository sessions;
    private final UserRepository users;
    private final HealthProfileService profiles;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public AssessmentResponse start(SecurityUser principal, StartAssessmentRequest request) {
        User user = user(principal);
        Optional<HealthAssessmentSession> active = sessions
                .findFirstByUserIdAndAssessmentTypeAndStatusOrderByCreatedAtDesc(
                        user.getId(), request.type(), AssessmentStatus.IN_PROGRESS);
        if (active.isPresent() && active.get().getExpiresAt().isAfter(Instant.now())) return response(active.get());
        active.ifPresent(value -> { value.setStatus(AssessmentStatus.EXPIRED); sessions.save(value); });
        HealthAssessmentSession session = HealthAssessmentSession.builder().user(user).channel(request.channel())
                .assessmentType(request.type()).currentStep("CONSENT").draftJson("{}")
                .status(AssessmentStatus.IN_PROGRESS).expiresAt(Instant.now().plus(7, ChronoUnit.DAYS)).build();
        return response(sessions.save(session));
    }

    @Transactional
    public AssessmentResponse update(SecurityUser principal, Long id, UpdateAssessmentRequest request) {
        HealthAssessmentSession session = owned(principal, id);
        ensureActive(session);
        if (session.getVersion() != request.expectedVersion()) throw new AppException(ErrorCode.PROFILE_VERSION_CONFLICT);
        session.setCurrentStep(request.currentStep().trim());
        session.setDraftJson(write(request.answers()));
        return response(sessions.saveAndFlush(session));
    }

    @Transactional
    public HealthProfileResponse complete(SecurityUser principal, Long id, CompleteAssessmentRequest request) {
        User user = user(principal);
        HealthAssessmentSession session = sessions.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        ensureActive(session);
        if (session.getVersion() != request.expectedSessionVersion())
            throw new AppException(ErrorCode.PROFILE_VERSION_CONFLICT);
        profiles.update(user, request.profile(), false);
        session.setStatus(AssessmentStatus.COMPLETED);
        session.setCompletedAt(Instant.now());
        session.setCurrentStep("COMPLETED");
        sessions.saveAndFlush(session);
        return profiles.markAssessmentCompleted(user, session.getAssessmentType());
    }

    private void ensureActive(HealthAssessmentSession value) {
        if (value.getStatus() != AssessmentStatus.IN_PROGRESS)
            throw new AppException(ErrorCode.CONFLICT, "Assessment is not active");
        if (!value.getExpiresAt().isAfter(Instant.now())) {
            value.setStatus(AssessmentStatus.EXPIRED);
            sessions.save(value);
            throw new AppException(ErrorCode.ASSESSMENT_EXPIRED);
        }
    }
    private HealthAssessmentSession owned(SecurityUser principal, Long id) {
        return sessions.findByIdAndUserId(id, user(principal).getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
    private User user(SecurityUser principal) {
        if (principal == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return users.findByIdAndDeletedAtIsNull(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    private AssessmentResponse response(HealthAssessmentSession value) {
        return new AssessmentResponse(value.getId(), value.getChannel(), value.getAssessmentType(),
                value.getCurrentStep(), read(value.getDraftJson()), value.getStatus(), value.getVersion(),
                value.getExpiresAt(), value.getCompletedAt());
    }
    private String write(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception e) { throw new AppException(ErrorCode.VALIDATION_ERROR, "Invalid assessment answers"); }
    }
    private Map<String, Object> read(String value) {
        try { return objectMapper.readValue(value, new TypeReference<Map<String, Object>>() {}); }
        catch (Exception e) { return Map.of(); }
    }
}
