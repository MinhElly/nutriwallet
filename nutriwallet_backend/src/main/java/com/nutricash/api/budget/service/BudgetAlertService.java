package com.nutricash.api.budget.service;
import com.nutricash.api.budget.entity.*;
import com.nutricash.api.budget.repository.*;
import com.nutricash.api.common.enums.BudgetAlertType;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.messenger.repository.ChatbotProfileRepository;
import com.nutricash.api.messenger.service.MessengerReplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import java.math.*;
import java.time.*;
@Service @RequiredArgsConstructor
public class BudgetAlertService {
 private final BudgetRepository budgets; private final BudgetAlertRepository alerts; private final ExpenseRepository expenses;
 private final ChatbotProfileRepository profiles; private final MessengerReplyService replies;
 @Transactional
 public void recalculate(Long userId){
  LocalDate today=LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
  budgets.findFirstByUserIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByEndDateAsc(userId,today,today).ifPresent(b->{
   BigDecimal spent=expenses.sumByUserIdAndExpenseDateBetween(userId,b.getStartDate(),b.getEndDate());
   BigDecimal percent=b.getAmount().signum()==0?BigDecimal.ZERO:spent.multiply(BigDecimal.valueOf(100)).divide(b.getAmount(),1,RoundingMode.HALF_UP);
   sync(b,BudgetAlertType.WARNING,percent.compareTo(BigDecimal.valueOf(b.getWarningThresholdPercent()))>=0,spent,percent);
   sync(b,BudgetAlertType.EXCEEDED,percent.compareTo(BigDecimal.valueOf(100))>0,spent,percent);
  });
 }
 private void sync(Budget b,BudgetAlertType type,boolean reached,BigDecimal spent,BigDecimal percent){
  var existing=alerts.findByBudgetIdAndAlertType(b.getId(),type);
  if(!reached){ existing.ifPresent(alerts::delete); return; }
  if(existing.isPresent()) return;
  alerts.saveAndFlush(BudgetAlert.builder().budget(b).alertType(type).sentAt(Instant.now()).build());
  BigDecimal delta=b.getAmount().subtract(spent);
  String detail=delta.signum()>=0?"Con lai "+delta+" VND":"Vuot "+delta.abs()+" VND";
  String text=(type==BudgetAlertType.WARNING?"Canh bao ngan sach":"Da vuot ngan sach")+": da chi "+spent+" / "+b.getAmount()+" VND ("+percent+"%). "+detail+".";
  profiles.findAllByUserId(b.getUser().getId()).forEach(p->replies.send(p,text));
 }
}