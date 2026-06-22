package com.nutricash.api.meal.repository;

import com.nutricash.api.meal.entity.MealRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealRepository extends JpaRepository<MealRecord, Long> {

    List<MealRecord> findAllByUserIdOrderByMealTimeDesc(Long userId);

    List<MealRecord> findAllByChatbotProfileIdOrderByMealTimeDesc(Long chatbotProfileId);
}

