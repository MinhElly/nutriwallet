package com.nutricash.api.expense.controller;

import com.nutricash.api.common.dto.ApiResponse;
import com.nutricash.api.expense.dto.CreateExpenseRequest;
import com.nutricash.api.expense.dto.ExpenseResponse;
import com.nutricash.api.expense.dto.UpdateExpenseRequest;
import com.nutricash.api.expense.service.ExpenseService;
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
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expenses", description = "APIs for tracking food and drink expenses")
@SecurityRequirement(name = "bearerAuth")
public class ExpenseController {

    private final ExpenseService expenseService;

    @Operation(summary = "Create expense", description = "Save a food or drink expense, optionally linked to a meal record.")
    @PostMapping
    public ApiResponse<ExpenseResponse> create(@AuthenticationPrincipal SecurityUser currentUser, @Valid @RequestBody CreateExpenseRequest request) {
        return ApiResponse.success("Expense created", expenseService.create(currentUser, request));
    }

    @Operation(summary = "List expenses", description = "Return all expenses of the current authenticated user, newest first.")
    @GetMapping
    public ApiResponse<List<ExpenseResponse>> findAll(@AuthenticationPrincipal SecurityUser currentUser) {
        return ApiResponse.success(expenseService.findAll(currentUser));
    }

    @Operation(summary = "Update expense", description = "Partially update an expense owned by the current user.")
    @PatchMapping("/{id}")
    public ApiResponse<ExpenseResponse> update(@AuthenticationPrincipal SecurityUser currentUser, @PathVariable Long id, @RequestBody UpdateExpenseRequest request) {
        return ApiResponse.success("Expense updated", expenseService.update(currentUser, id, request));
    }

    @Operation(summary = "Delete expense", description = "Delete an expense owned by the current user.")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal SecurityUser currentUser, @PathVariable Long id) {
        expenseService.delete(currentUser, id);
        return ApiResponse.success("Expense deleted", null);
    }
}