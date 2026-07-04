package com.nutricash.api.messenger.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.expense.repository.ExpenseRepository;
import com.nutricash.api.health.dto.HealthProfileResponse;
import com.nutricash.api.health.entity.HealthProfile;
import com.nutricash.api.health.service.HealthProfileService;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MessengerInsightServiceTest {
 @Mock MealRepository meals;
 @Mock ExpenseRepository expenses;
 @Mock HealthProfileService healthProfiles;
 @Mock MessengerReplyService replies;
 @InjectMocks MessengerInsightService service;
 User user;
 ChatbotProfile profile;

 @BeforeEach void setup(){
  user=User.builder().id(1L).fullName("User").email("u@test.com").build();
  profile=ChatbotProfile.builder().id(2L).psid("p").user(user).build();
 }
 @Test void healthIntentReturnsProfileNutritionSpendingAndFormButton(){
  MealRecord meal=MealRecord.builder().mealName("Phở").totalCalories(BigDecimal.valueOf(450))
    .proteinGram(BigDecimal.valueOf(25)).carbGram(BigDecimal.valueOf(55)).fatGram(BigDecimal.valueOf(12)).build();
  ExpenseRecord expense=ExpenseRecord.builder().amount(BigDecimal.valueOf(50000)).build();
  when(meals.findAllByUserIdAndMealTimeBetweenOrderByMealTimeDesc(eq(1L),any(),any())).thenReturn(List.of(meal));
  when(expenses.findAllByUserIdAndExpenseDateBetweenOrderByExpenseDateDesc(eq(1L),any(),any())).thenReturn(List.of(expense));
  HealthProfile entity=HealthProfile.builder().id(3L).user(user).build();
  when(healthProfiles.getOrCreate(user)).thenReturn(entity);
  when(healthProfiles.toResponse(entity)).thenReturn(new HealthProfileResponse(3L,false,List.of(),List.of(),List.of(),null,null,null,null,0,null));

  org.assertj.core.api.Assertions.assertThat(service.handle(profile,"Tình hình sức khỏe hôm nay")).isTrue();

  verify(replies).sendQuickReplies(eq(profile),argThat(v->v.contains("450 kcal")&&v.contains("50.000 VND")&&v.contains("chưa thiết lập")),anyList());
 }
 @Test void unrelatedTextFallsThrough(){
  org.assertj.core.api.Assertions.assertThat(service.handle(profile,"xin chào")).isFalse();
  verifyNoInteractions(meals,expenses,healthProfiles,replies);
 }
}
