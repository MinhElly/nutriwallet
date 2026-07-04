package com.nutricash.api.health.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.HealthProfileRepository;
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
public class HealthProfileService {
    private final HealthProfileRepository profiles;
    private final UserRepository users;
    private final HealthClassificationService classifications;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public HealthProfileResponse get(SecurityUser principal) {
        HealthProfile profile = getOrCreate(user(principal));
        if (profile.getClassification() == null) classifications.classify(profile);
        return toResponse(profile);
    }

    @Transactional
    public HealthProfileResponse update(SecurityUser principal, UpdateHealthProfileRequest request) {
        return update(user(principal), request, true);
    }

    @Transactional
    public HealthProfileResponse update(User user, UpdateHealthProfileRequest request, boolean markReviewed) {
        HealthProfile profile = getOrCreate(user);
        if (request.expectedProfileVersion() != null
                && request.expectedProfileVersion() != profile.getProfileVersion()) {
            throw new AppException(ErrorCode.PROFILE_VERSION_CONFLICT);
        }
        validate(request);
        boolean consentGiven = Boolean.TRUE.equals(request.consentGiven());
        profile.setConsentGiven(consentGiven);
        profile.setFoodRestrictions(write(consentGiven ? cleanStrings(request.foodRestrictions()) : List.of()));
        profile.getConditions().clear();
        for (HealthConditionInput input : consentGiven ? safe(request.conditions()) : List.<HealthConditionInput>of()) {
            profile.getConditions().add(HealthProfileCondition.builder().healthProfile(profile)
                    .conditionType(input.type()).customValue(clean(input.customValue())).build());
        }
        profile.getAllergies().clear();
        for (HealthAllergyInput input : consentGiven ? safe(request.allergies()) : List.<HealthAllergyInput>of()) {
            profile.getAllergies().add(HealthProfileAllergy.builder().healthProfile(profile)
                    .allergenType(input.type()).customValue(clean(input.customValue())).build());
        }
        if (markReviewed) {
            Instant now = Instant.now();
            profile.setLastReviewedAt(now);
            if (profile.getFirstCompletedAt() == null) profile.setFirstCompletedAt(now);
            profile.setNextQuarterlyReviewAt(now.plus(90, ChronoUnit.DAYS));
            if (profile.getNextAnnualReviewAt() == null) profile.setNextAnnualReviewAt(now.plus(365, ChronoUnit.DAYS));
        }
        profile = profiles.saveAndFlush(profile);
        classifications.classify(profile);
        return toResponse(profile);
    }

    @Transactional
    public HealthProfile getOrCreate(User user) {
        return profiles.findByUserId(user.getId()).orElseGet(() -> {
            HealthProfile value = HealthProfile.builder().user(user).consentGiven(false)
                    .foodRestrictions("[]").build();
            value = profiles.saveAndFlush(value);
            classifications.classify(value);
            return value;
        });
    }

    @Transactional
    public HealthProfileResponse markAssessmentCompleted(User user, AssessmentType type) {
        HealthProfile profile = getOrCreate(user);
        Instant now = Instant.now();
        profile.setLastReviewedAt(now);
        if (profile.getFirstCompletedAt() == null) profile.setFirstCompletedAt(now);
        profile.setNextQuarterlyReviewAt(now.plus(90, ChronoUnit.DAYS));
        if (type == AssessmentType.INITIAL || type == AssessmentType.ANNUAL
                || profile.getNextAnnualReviewAt() == null) {
            profile.setNextAnnualReviewAt(now.plus(365, ChronoUnit.DAYS));
        }
        profiles.saveAndFlush(profile);
        return toResponse(profile);
    }

    public HealthProfileResponse toResponse(HealthProfile p) {
        List<HealthConditionInput> conditions = p.getConditions().stream()
                .map(v -> new HealthConditionInput(v.getConditionType(), v.getCustomValue())).toList();
        List<HealthAllergyInput> allergies = p.getAllergies().stream()
                .map(v -> new HealthAllergyInput(v.getAllergenType(), v.getCustomValue())).toList();
        return new HealthProfileResponse(p.getId(), p.isConsentGiven(), conditions, allergies,
                readStrings(p.getFoodRestrictions()), p.getFirstCompletedAt(), p.getLastReviewedAt(),
                p.getNextQuarterlyReviewAt(), p.getNextAnnualReviewAt(), p.getProfileVersion(),
                classifications.toResponse(p.getClassification()));
    }

    private User user(SecurityUser principal) {
        if (principal == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return users.findByIdAndDeletedAtIsNull(principal.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    private void validate(UpdateHealthProfileRequest request) {
        Set<HealthConditionType> conditions = new HashSet<>();
        for (HealthConditionInput item : safe(request.conditions())) {
            if (!conditions.add(item.type())) throw validation("Bệnh nền bị trùng lặp.");
            if (item.type() == HealthConditionType.OTHER && clean(item.customValue()) == null)
                throw validation("Bệnh nền OTHER cần mô tả.");
        }
        Set<HealthAllergenType> allergies = new HashSet<>();
        for (HealthAllergyInput item : safe(request.allergies())) {
            if (!allergies.add(item.type())) throw validation("Dị ứng bị trùng lặp.");
            if (item.type() == HealthAllergenType.OTHER && clean(item.customValue()) == null)
                throw validation("Dị ứng OTHER cần mô tả.");
        }
    }
    private AppException validation(String message) { return new AppException(ErrorCode.VALIDATION_ERROR, message); }
    private <T> List<T> safe(List<T> values) { return values == null ? List.of() : values; }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private List<String> cleanStrings(List<String> values) {
        if (values == null) return List.of();
        return values.stream().map(this::clean).filter(Objects::nonNull).distinct().limit(50).toList();
    }
    private String write(Object value) {
        try { return objectMapper.writeValueAsString(value); }
        catch (Exception e) { throw new AppException(ErrorCode.INTERNAL_ERROR, e); }
    }
    private List<String> readStrings(String value) {
        if (value == null || value.isBlank()) return List.of();
        try { return objectMapper.readValue(value, new TypeReference<List<String>>() {}); }
        catch (Exception e) { return List.of(); }
    }
}
