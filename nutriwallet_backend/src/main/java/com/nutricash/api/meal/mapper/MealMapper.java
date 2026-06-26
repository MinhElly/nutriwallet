package com.nutricash.api.meal.mapper;

import com.nutricash.api.meal.dto.MealResponse;
import com.nutricash.api.meal.entity.MealRecord;
import org.springframework.stereotype.Component;

@Component
public class MealMapper {
    public MealResponse toResponse(MealRecord meal) {
        return new MealResponse(
                meal.getId(),
                meal.getMealName(),
                meal.getDescription(),
                meal.getImageUrl(),
                meal.getMealTime(),
                meal.getTotalCalories(),
                meal.getProteinGram(),
                meal.getCarbGram(),
                meal.getFatGram(),
                meal.isAiEstimated(),
                meal.isConfirmedByUser()
        );
    }
}