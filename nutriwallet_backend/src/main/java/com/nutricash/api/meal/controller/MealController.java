package com.nutricash.api.meal.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.meal.dto.CreateMealRequest;
import com.nutricash.api.meal.dto.MealResponse;
import com.nutricash.api.meal.dto.UpdateMealRequest;
import com.nutricash.api.meal.service.MealService;
import com.nutricash.api.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meals")
@RequiredArgsConstructor
@Tag(name = "Meals", description = "APIs for tracking meals and nutrition values")
@SecurityRequirement(name = "bearerAuth")
public class MealController {

    private final MealService mealService;

    @Operation(summary = "Create meal", description = "Save a meal with calories, protein, carbs, fat and optional image URL.")
    @PostMapping
    public ApiResponse<MealResponse> create(@AuthenticationPrincipal SecurityUser currentUser, @Valid @RequestBody CreateMealRequest request) {
        return ApiResponse.success("Meal created", mealService.create(currentUser, request));
    }

    @Operation(summary = "List meals", description = "Return all meals of the current authenticated user, newest first.")
    @GetMapping
    public ApiResponse<List<MealResponse>> findAll(@AuthenticationPrincipal SecurityUser currentUser) {
        return ApiResponse.success(mealService.findAll(currentUser));
    }

    @Operation(summary = "Get meal detail", description = "Return one meal by id if it belongs to the current user.")
    @GetMapping("/{id}")
    public ApiResponse<MealResponse> findById(@AuthenticationPrincipal SecurityUser currentUser, @PathVariable Long id) {
        return ApiResponse.success(mealService.findById(currentUser, id));
    }

    @Operation(summary = "Update meal", description = "Partially update a meal owned by the current user.")
    @PatchMapping("/{id}")
    public ApiResponse<MealResponse> update(@AuthenticationPrincipal SecurityUser currentUser, @PathVariable Long id, @RequestBody UpdateMealRequest request) {
        return ApiResponse.success("Meal updated", mealService.update(currentUser, id, request));
    }

    @Operation(summary = "Delete meal", description = "Delete a meal owned by the current user.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal SecurityUser currentUser, @PathVariable Long id) {
        mealService.delete(currentUser, id);
        return ApiResponse.success("Meal deleted", null);
    }
}