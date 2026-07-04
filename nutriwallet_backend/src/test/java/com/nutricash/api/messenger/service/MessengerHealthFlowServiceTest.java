package com.nutricash.api.messenger.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.health.dto.AssessmentResponse;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.service.*;
import com.nutricash.api.messenger.dto.*;
import com.nutricash.api.messenger.entity.*;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import com.nutricash.api.user.entity.User;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MessengerHealthFlowServiceTest {
 @Mock ChatbotPendingActionRepository actions;
 @Mock HealthAssessmentService assessments;
 @Mock HealthProfileService profiles;
 @Mock MessengerReplyService replies;
 @InjectMocks MessengerHealthFlowService service;

 @Test void startsInitialAssessmentFromQuickReply(){
  User user=User.builder().id(1L).fullName("User").email("u@test.com").role(UserRole.USER).status(UserStatus.ACTIVE).build();
  ChatbotProfile profile=ChatbotProfile.builder().id(2L).psid("psid").user(user).build();
  when(actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(eq(2L),anyCollection())).thenReturn(Optional.empty());
  when(assessments.start(eq(user),any())).thenReturn(new AssessmentResponse(3L,AssessmentChannel.MESSENGER,
    AssessmentType.INITIAL,"CONSENT",Map.of(),AssessmentStatus.IN_PROGRESS,0L,Instant.now().plusSeconds(100),null));
  when(actions.save(any())).thenAnswer(i->i.getArgument(0));
  MessengerMessage message=new MessengerMessage("m1","Bắt đầu",List.of(),new MessengerQuickReply("HEALTH_START_INITIAL","text","Bắt đầu"));
  org.assertj.core.api.Assertions.assertThat(service.handle(profile,message)).isTrue();
  verify(actions).save(argThat(a->a.getType()==ChatbotActionType.HEALTH_ASSESSMENT&&a.getStatus()==ChatbotActionStatus.AWAITING_CONFIRMATION));
  verify(replies).sendQuickReplies(eq(profile),contains("không thay thế"),anyList());
 }
}
