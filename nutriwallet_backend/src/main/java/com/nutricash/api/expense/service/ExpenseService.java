package com.nutricash.api.expense.service;

import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.expense.dto.CreateExpenseRequest;
import com.nutricash.api.expense.dto.ExpenseResponse;
import com.nutricash.api.expense.dto.UpdateExpenseRequest;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.expense.mapper.ExpenseMapper;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.security.SecurityUser;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final MealRepository mealRepository;
    private final UserRepository userRepository;
    private final ExpenseMapper expenseMapper;

    @Transactional
    public ExpenseResponse create(SecurityUser currentUser, CreateExpenseRequest request) {
        User user = getCurrentUser(currentUser);
        ExpenseRecord expense = ExpenseRecord.builder()
                .user(user)
                .mealRecord(resolveMeal(user.getId(), request.mealRecordId()))
                .amount(request.amount())
                .currency(normalizeCurrency(request.currency()))
                .category(request.category())
                .expenseDate(request.expenseDate() == null ? LocalDate.now() : request.expenseDate())
                .note(request.note())
                .build();
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> findAll(SecurityUser currentUser) {
        User user = getCurrentUser(currentUser);
        return expenseRepository.findAllByUserIdOrderByExpenseDateDesc(user.getId())
                .stream()
                .map(expenseMapper::toResponse)
                .toList();
    }

    @Transactional
    public ExpenseResponse update(SecurityUser currentUser, Long id, UpdateExpenseRequest request) {
        User user = getCurrentUser(currentUser);
        ExpenseRecord expense = getOwnedExpense(id, user.getId());
        if (request.mealRecordId() != null) expense.setMealRecord(resolveMeal(user.getId(), request.mealRecordId()));
        if (request.amount() != null) expense.setAmount(request.amount());
        if (request.currency() != null) expense.setCurrency(normalizeCurrency(request.currency()));
        if (request.category() != null) expense.setCategory(request.category());
        if (request.expenseDate() != null) expense.setExpenseDate(request.expenseDate());
        if (request.note() != null) expense.setNote(request.note());
        return expenseMapper.toResponse(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(SecurityUser currentUser, Long id) {
        User user = getCurrentUser(currentUser);
        expenseRepository.delete(getOwnedExpense(id, user.getId()));
    }

    private MealRecord resolveMeal(Long userId, Long mealRecordId) {
        if (mealRecordId == null) return null;
        return mealRepository.findByIdAndUserId(mealRecordId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private ExpenseRecord getOwnedExpense(Long id, Long userId) {
        return expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private String normalizeCurrency(String currency) {
        return currency == null || currency.isBlank() ? "VND" : currency.trim().toUpperCase();
    }

    private User getCurrentUser(SecurityUser currentUser) {
        if (currentUser == null) throw new AppException(ErrorCode.UNAUTHORIZED);
        return userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
}