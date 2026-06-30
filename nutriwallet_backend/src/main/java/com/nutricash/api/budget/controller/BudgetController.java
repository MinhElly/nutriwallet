package com.nutricash.api.budget.controller;

import com.nutricash.api.budget.dto.BudgetResponse;
import com.nutricash.api.budget.dto.CreateBudgetRequest;
import com.nutricash.api.budget.dto.UpdateBudgetRequest;
import com.nutricash.api.budget.service.BudgetService;
import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.security.SecurityUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@Tag(name = "Budgets", description = "APIs for setting food expense budgets")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    @Operation(summary = "Create budget", description = "Create a daily, weekly or monthly food budget for the current user.")
    @PostMapping
    public ApiResponse<BudgetResponse> create(@AuthenticationPrincipal SecurityUser currentUser, @Valid @RequestBody CreateBudgetRequest request) {
        return ApiResponse.success("Budget created", budgetService.create(currentUser, request));
    }

    @Operation(summary = "Get current budget", description = "Return the active budget whose date range contains today.")
    @GetMapping("/current")
    public ApiResponse<BudgetResponse> current(@AuthenticationPrincipal SecurityUser currentUser) {
        return ApiResponse.success(budgetService.current(currentUser));
    }

    @Operation(summary = "Update budget", description = "Partially update a budget owned by the current user.")
    @PatchMapping("/{id}")
    public ApiResponse<BudgetResponse> update(@AuthenticationPrincipal SecurityUser currentUser, @PathVariable Long id, @RequestBody UpdateBudgetRequest request) {
        return ApiResponse.success("Budget updated", budgetService.update(currentUser, id, request));
    }
}