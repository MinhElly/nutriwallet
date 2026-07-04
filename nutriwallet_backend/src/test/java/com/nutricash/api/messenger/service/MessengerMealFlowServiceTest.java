package com.nutricash.api.messenger.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.ai.service.MealHealthWarningService;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.messenger.entity.*;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import com.nutricash.api.user.entity.User;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class MessengerMealFlowServiceTest {
 @Mock AiAnalysisLogRepository logs;
 @Mock ChatbotPendingActionRepository actions;
 @Mock ConfirmedMealApplicationService confirmed;
 @Mock MealHealthWarningService warnings;
 @Mock MessengerReplyService replies;
 @InjectMocks MessengerMealFlowService service;

 @Test void normalizesDecimalStringConfidenceBeforeChoosingFlow() throws Exception {
  ReflectionTestUtils.setField(service,"threshold",BigDecimal.valueOf(75));
  User user=User.builder().id(1L).fullName("User").email("u@test.com").build();
  ChatbotProfile profile=ChatbotProfile.builder().id(2L).psid("psid").user(user).build();
  when(logs.saveAndFlush(any())).thenAnswer(i->{AiAnalysisLog value=i.getArgument(0);value.setId(9L);return value;});
  when(actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(eq(2L),anyCollection())).thenReturn(Optional.empty());
  when(actions.save(any())).thenAnswer(i->i.getArgument(0));
  when(warnings.evaluate(any(),anyString(),anyList(),anyList(),any(),any(),any(),any())).thenReturn(List.of());
  var json=new ObjectMapper().readTree("{\"foodName\":\"Phở\",\"confidence\":\"0.87\",\"estimatedPriceVnd\":45000,\"calories\":400,\"proteinGram\":20,\"carbGram\":50,\"fatGram\":10,\"candidateFoods\":[{\"foodName\":\"Phở bò\",\"confidence\":\"60%\"}]}");
  service.begin(profile,user,"https://image",json,json.toString(),"gemini");
  verify(logs).saveAndFlush(argThat(a->a.getConfidence().compareTo(BigDecimal.valueOf(87))==0));
  verify(actions).save(argThat(a->a.getType()==ChatbotActionType.MEAL_CONFIRMATION));
  verify(replies).sendQuickReplies(eq(profile),argThat(text->text.contains("87%")&&text.contains("45.000 VND")),
    argThat(values->values.stream().anyMatch(v->v.payload().equals("MEAL_EDIT_PRICE"))));
  verifyNoInteractions(confirmed);
 }

 @Test void rejectsZeroConfidenceInsteadOfStartingClarification() throws Exception {
  ReflectionTestUtils.setField(service,"threshold",BigDecimal.valueOf(75));
  User user=User.builder().id(1L).fullName("User").email("u@test.com").build();
  ChatbotProfile profile=ChatbotProfile.builder().id(2L).psid("psid").user(user).build();
  when(logs.saveAndFlush(any())).thenAnswer(i->{AiAnalysisLog value=i.getArgument(0);value.setId(9L);return value;});
  var json=new ObjectMapper().readTree("{\"foodName\":\"Món ăn chưa xác định\",\"confidence\":0,\"calories\":0,\"proteinGram\":0,\"carbGram\":0,\"fatGram\":0,\"candidateFoods\":[]}");

  service.begin(profile,user,"https://image",json,json.toString(),"gemini");

  verify(replies).send(eq(profile),contains("Không nhận diện được món ăn"));
  verifyNoInteractions(actions,warnings,confirmed);
  verify(replies,never()).sendQuickReplies(any(),anyString(),anyList());
 }

 @Test void allowsUserToCorrectEstimatedPriceBeforeConfirming() throws Exception {
  User user=User.builder().id(1L).fullName("User").email("u@test.com").build();
  ChatbotProfile profile=ChatbotProfile.builder().id(2L).psid("psid").user(user).build();
  var mapper=new ObjectMapper();
  var state=new MessengerMealFlowService.State(9L,List.of(),BigDecimal.valueOf(45000),false);
  ChatbotPendingAction action=ChatbotPendingAction.builder().chatbotProfile(profile).type(ChatbotActionType.MEAL_CONFIRMATION)
    .status(ChatbotActionStatus.AWAITING_CONFIRMATION).payloadJson(mapper.writeValueAsString(state)).expiresAt(java.time.Instant.now().plusSeconds(100)).build();
  when(actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(eq(2L),anyCollection())).thenReturn(Optional.of(action));
  when(actions.save(any())).thenAnswer(i->i.getArgument(0));

  service.handle(profile,new com.nutricash.api.messenger.dto.MessengerMessage("m2","Sửa giá",List.of(),
    new com.nutricash.api.messenger.dto.MessengerQuickReply("MEAL_EDIT_PRICE","text","Sửa giá")));
  service.handle(profile,new com.nutricash.api.messenger.dto.MessengerMessage("m3","50k",List.of(),null));
  when(confirmed.confirm(isNull(),any())).thenReturn(com.nutricash.api.meal.entity.MealRecord.builder().mealName("Phở").build());
  service.handle(profile,new com.nutricash.api.messenger.dto.MessengerMessage("m4","Xác nhận",List.of(),
    new com.nutricash.api.messenger.dto.MessengerQuickReply("MEAL_CONFIRM","text","Xác nhận")));

  org.assertj.core.api.Assertions.assertThat(action.getPayloadJson()).contains("50000").contains("\"awaitingPrice\":false");
  verify(replies).sendQuickReplies(eq(profile),contains("50.000 VND"),anyList());
  verify(confirmed).confirm(isNull(),argThat(command->command.priceVnd().compareTo(BigDecimal.valueOf(50000))==0&&command.createExpense()));
 }
}
