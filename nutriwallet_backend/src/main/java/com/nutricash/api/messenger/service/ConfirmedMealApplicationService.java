package com.nutricash.api.messenger.service;
import com.nutricash.api.ai.entity.*;
import com.nutricash.api.ai.repository.*;
import com.nutricash.api.budget.service.BudgetAlertService;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.common.exception.*;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.messenger.entity.ChatbotPendingAction;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import com.nutricash.api.setting.repository.UserSettingRepository;
import java.math.BigDecimal;
import java.time.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class ConfirmedMealApplicationService {
 private final ChatbotPendingActionRepository actions; private final AiAnalysisLogRepository logs;
 private final MealRepository meals; private final ExpenseRepository expenses; private final UserSettingRepository settings;
 private final BudgetAlertService budgetAlerts; private final AiAnalysisCorrectionRepository corrections;
 @Transactional
 public MealRecord confirm(Long actionId, Confirmation command) {
  ChatbotPendingAction action=actions.findByIdForUpdate(actionId).orElseThrow(()->new AppException(ErrorCode.RESOURCE_NOT_FOUND));
  AiAnalysisLog analysis=logs.findById(command.analysisId()).orElseThrow(()->new AppException(ErrorCode.RESOURCE_NOT_FOUND));
  if(action.getStatus()==ChatbotActionStatus.COMPLETED && analysis.getMealRecord()!=null) return analysis.getMealRecord();
  if(action.getType()!=ChatbotActionType.MEAL_CONFIRMATION || action.getStatus()!=ChatbotActionStatus.AWAITING_CONFIRMATION) throw new AppException(ErrorCode.CONFLICT,"Meal confirmation is not active");
  if(action.getExpiresAt()!=null && !action.getExpiresAt().isAfter(Instant.now())) throw new AppException(ErrorCode.CONFLICT,"Meal confirmation expired");
  if(action.getChatbotProfile().getUser()==null || analysis.getUser()==null || !action.getChatbotProfile().getUser().getId().equals(analysis.getUser().getId())) throw new AppException(ErrorCode.FORBIDDEN);
  String food=clean(command.foodName())==null?analysis.getFoodName():clean(command.foodName());
  if(food==null) throw new AppException(ErrorCode.VALIDATION_ERROR,"Food name is required");
  MealRecord meal=meals.saveAndFlush(MealRecord.builder().user(analysis.getUser()).chatbotProfile(action.getChatbotProfile())
    .mealName(food).description(description(command)).imageUrl(analysis.getInputImageUrl()).mealTime(LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")))
    .totalCalories(analysis.getParsedCalories()).proteinGram(analysis.getParsedProteinGram()).carbGram(analysis.getParsedCarbGram())
    .fatGram(analysis.getParsedFatGram()).aiEstimated(true).confirmedByUser(true).build());
  analysis.setMealRecord(meal); logs.save(analysis);
  BigDecimal price=command.priceVnd()==null?analysis.getEstimatedPriceVnd():command.priceVnd();
  boolean auto=settings.findByUserId(analysis.getUser().getId()).map(v->v.isAutoCreateExpense()).orElse(false);
  if(price!=null && price.signum()>0 && (auto||command.createExpense())) expenses.saveAndFlush(ExpenseRecord.builder().user(analysis.getUser()).mealRecord(meal).amount(price).currency("VND").category(ExpenseCategory.OTHER).expenseDate(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))).note("Messenger: "+food).build());
  action.setStatus(ChatbotActionStatus.COMPLETED); actions.save(action);
  budgetAlerts.recalculate(analysis.getUser().getId());
  return meal;
 }
 @Transactional
 public void correct(Long analysisId, Long userId, String food, String portion, String toppings, String reason) {
  AiAnalysisLog analysis=logs.findByIdAndUserId(analysisId,userId).orElseThrow(()->new AppException(ErrorCode.RESOURCE_NOT_FOUND));
  corrections.save(AiAnalysisCorrection.builder().analysisLog(analysis).user(analysis.getUser()).originalOutput(analysis.getRawAiResponse())
    .correctedFood(clean(food)).correctedPortion(clean(portion)).correctedToppings(clean(toppings)).reason(clean(reason)).correctedAt(Instant.now()).build());
 }
 private String description(Confirmation c){ return "Khẩu phần: "+(clean(c.portion())==null?"không rõ":clean(c.portion()))+"; topping: "+(clean(c.toppings())==null?"không có":clean(c.toppings())); }
 private String clean(String value){ return value==null||value.isBlank()?null:value.trim(); }
 public record Confirmation(Long analysisId,String foodName,String portion,String toppings,BigDecimal priceVnd,boolean createExpense) {}
}
