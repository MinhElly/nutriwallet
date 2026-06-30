package com.nutricash.api.meal.service;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.meal.dto.CreateMealRequest;
import com.nutricash.api.meal.dto.MealResponse;
import com.nutricash.api.meal.dto.UpdateMealRequest;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.mapper.MealMapper;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;
    private final UserRepository userRepository;
    private final MealMapper mealMapper;

    @Transactional
    public MealResponse create(SecurityUser currentUser, CreateMealRequest request) {
        User user = getCurrentUser(currentUser);
        MealRecord meal = MealRecord.builder()
                .user(user)
                .mealName(request.mealName().trim())
                .description(request.description())
                .imageUrl(request.imageUrl())
                .mealTime(request.mealTime() == null ? LocalDateTime.now() : request.mealTime())
                .totalCalories(request.totalCalories())
                .proteinGram(request.proteinGram())
                .carbGram(request.carbGram())
                .fatGram(request.fatGram())
                .aiEstimated(Boolean.TRUE.equals(request.aiEstimated()))
                .confirmedByUser(Boolean.TRUE.equals(request.confirmedByUser()))
                .build();
        return mealMapper.toResponse(mealRepository.save(meal));
    }

    @Transactional(readOnly = true)
    public List<MealResponse> findAll(SecurityUser currentUser) {
        User user = getCurrentUser(currentUser);
        return mealRepository.findAllByUserIdOrderByMealTimeDesc(user.getId())
                .stream()
                .map(mealMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MealResponse findById(SecurityUser currentUser, Long id) {
        User user = getCurrentUser(currentUser);
        return mealMapper.toResponse(getOwnedMeal(id, user.getId()));
    }

    @Transactional
    public MealResponse update(SecurityUser currentUser, Long id, UpdateMealRequest request) {
        User user = getCurrentUser(currentUser);
        MealRecord meal = getOwnedMeal(id, user.getId());
        if (request.mealName() != null && !request.mealName().isBlank()) meal.setMealName(request.mealName().trim());
        if (request.description() != null) meal.setDescription(request.description());
        if (request.imageUrl() != null) meal.setImageUrl(request.imageUrl());
        if (request.mealTime() != null) meal.setMealTime(request.mealTime());
        if (request.totalCalories() != null) meal.setTotalCalories(request.totalCalories());
        if (request.proteinGram() != null) meal.setProteinGram(request.proteinGram());
        if (request.carbGram() != null) meal.setCarbGram(request.carbGram());
        if (request.fatGram() != null) meal.setFatGram(request.fatGram());
        if (request.aiEstimated() != null) meal.setAiEstimated(request.aiEstimated());
        if (request.confirmedByUser() != null) meal.setConfirmedByUser(request.confirmedByUser());
        return mealMapper.toResponse(mealRepository.save(meal));
    }

    @Transactional
    public void delete(SecurityUser currentUser, Long id) {
        User user = getCurrentUser(currentUser);
        mealRepository.delete(getOwnedMeal(id, user.getId()));
    }

    private MealRecord getOwnedMeal(Long id, Long userId) {
        return mealRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private User getCurrentUser(SecurityUser currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}