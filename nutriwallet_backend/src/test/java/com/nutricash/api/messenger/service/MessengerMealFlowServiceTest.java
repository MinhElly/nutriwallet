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
  var json=new ObjectMapper().readTree("{\"foodName\":\"Phở\",\"confidence\":\"0.87\",\"calories\":400,\"proteinGram\":20,\"carbGram\":50,\"fatGram\":10,\"candidateFoods\":[{\"foodName\":\"Phở bò\",\"confidence\":\"60%\"}]}");
  service.begin(profile,user,"https://image",json,json.toString(),"gemini");
  verify(logs).saveAndFlush(argThat(a->a.getConfidence().compareTo(BigDecimal.valueOf(87))==0));
  verify(actions).save(argThat(a->a.getType()==ChatbotActionType.MEAL_CONFIRMATION));
  verify(replies).sendQuickReplies(eq(profile),contains("87%"),anyList());
  verifyNoInteractions(confirmed);
 }
}
