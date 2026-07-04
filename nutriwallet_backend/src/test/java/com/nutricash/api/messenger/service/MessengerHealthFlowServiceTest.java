package com.nutricash.api.messenger.service;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import com.nutricash.api.common.enums.*;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.health.dto.*;
import com.nutricash.api.health.entity.HealthProfile;
import com.nutricash.api.setting.entity.UserSetting;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.service.*;
import com.nutricash.api.messenger.dto.*;
import com.nutricash.api.messenger.entity.*;
import com.nutricash.api.messenger.repository.ChatbotPendingActionRepository;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import com.nutricash.api.setting.service.UserSettingService;
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
 @Mock UserSettingService settings;
 @Mock UserRepository users;
 @Mock MessengerReplyService replies;
 @InjectMocks MessengerHealthFlowService service;

 @Test void startsInitialAssessmentFromQuickReply(){
  User user=User.builder().id(1L).fullName("User").email("u@test.com").role(UserRole.USER).status(UserStatus.ACTIVE).build();
  ChatbotProfile profile=ChatbotProfile.builder().id(2L).psid("psid").user(user).build();
  when(actions.findFirstByChatbotProfileIdAndStatusInOrderByCreatedAtDesc(eq(2L),anyCollection())).thenReturn(Optional.empty());
  when(profiles.getOrCreate(user)).thenReturn(mock(HealthProfile.class));
  when(profiles.toResponse(any())).thenReturn(new HealthProfileResponse(null,false,List.of(),List.of(),List.of(),null,null,null,null,0L,null));
  when(settings.getOrCreateUserSetting(user)).thenReturn(UserSetting.builder().user(user).build());
  when(assessments.start(eq(user),any())).thenReturn(new AssessmentResponse(3L,AssessmentChannel.MESSENGER,
    AssessmentType.INITIAL,"CONSENT",Map.of(),AssessmentStatus.IN_PROGRESS,0L,Instant.now().plusSeconds(100),null));
  when(actions.save(any())).thenAnswer(i->i.getArgument(0));
  MessengerMessage message=new MessengerMessage("m1","BÃ¡ÂºÂ¯t Ã„â€˜Ã¡ÂºÂ§u",List.of(),new MessengerQuickReply("HEALTH_START_INITIAL","text","BÃ¡ÂºÂ¯t Ã„â€˜Ã¡ÂºÂ§u"));
  org.assertj.core.api.Assertions.assertThat(service.handle(profile,message)).isTrue();
  verify(actions).save(argThat(a->a.getType()==ChatbotActionType.HEALTH_ASSESSMENT&&a.getStatus()==ChatbotActionStatus.AWAITING_CONFIRMATION));
  verify(replies).sendQuickReplies(eq(profile),contains("y khoa"),anyList());
 }
}
