package com.nutricash.api.meal.repository;

import com.nutricash.api.meal.entity.MealRecord;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealRepository extends JpaRepository<MealRecord, Long> {

    List<MealRecord> findAllByUserIdOrderByMealTimeDesc(Long userId);

    List<MealRecord> findAllByUserIdAndMealTimeBetweenOrderByMealTimeDesc(
            Long userId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );

    Optional<MealRecord> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndMealTimeBetween(Long userId, LocalDateTime startTime, LocalDateTime endTime);

    List<MealRecord> findAllByChatbotProfileIdOrderByMealTimeDesc(Long chatbotProfileId);
}