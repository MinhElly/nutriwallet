package com.nutricash.api.health.service;
import com.nutricash.api.health.entity.*;
import com.nutricash.api.health.enums.*;
import com.nutricash.api.health.repository.*;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.messenger.repository.ChatbotProfileRepository;
import com.nutricash.api.messenger.service.MessengerReplyService;
import java.time.*;
import java.time.temporal.IsoFields;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor @ConditionalOnProperty(name="app.health.reminders.enabled",havingValue="true")
public class HealthReminderScheduler {
 private final HealthProfileRepository profiles; private final HealthReminderDeliveryRepository deliveries;
 private final HealthAssessmentSessionRepository sessions; private final ChatbotProfileRepository chatbots; private final MessengerReplyService replies;
 @Scheduled(cron="0 0 9 * * *",zone="Asia/Ho_Chi_Minh") @Transactional
 public void deliverDueReminders(){
  Instant now=Instant.now();
  for(HealthProfile profile:profiles.findAll()){
   if(!profile.isConsentGiven()||sessions.existsByUserIdAndStatus(profile.getUser().getId(),AssessmentStatus.IN_PROGRESS)) continue;
   AssessmentType type=dueType(profile,now); if(type==null) continue;
   chatbots.findAllByUserId(profile.getUser().getId()).stream().filter(p->p.getLinkedAt()!=null).findFirst().ifPresent(p->deliver(profile,p,type,now));
  }
 }
 private AssessmentType dueType(HealthProfile p,Instant now){ if(p.getNextAnnualReviewAt()!=null&&!p.getNextAnnualReviewAt().isAfter(now))return AssessmentType.ANNUAL; if(p.getNextQuarterlyReviewAt()!=null&&!p.getNextQuarterlyReviewAt().isAfter(now))return AssessmentType.QUARTERLY; return null; }
 private void deliver(HealthProfile profile,ChatbotProfile chatbot,AssessmentType type,Instant now){
  ZonedDateTime local=now.atZone(ZoneId.of("Asia/Ho_Chi_Minh")); String period=type==AssessmentType.ANNUAL?String.valueOf(local.getYear()):local.getYear()+"-Q"+local.get(IsoFields.QUARTER_OF_YEAR);
  HealthReminderDelivery d=deliveries.findByUserIdAndAssessmentTypeAndPeriodKey(profile.getUser().getId(),type,period).orElseGet(()->HealthReminderDelivery.builder().user(profile.getUser()).chatbotProfile(chatbot).assessmentType(type).periodKey(period).status("PENDING").build());
  if("SENT".equals(d.getStatus())||d.getAttemptCount()>=3||(d.getNextAttemptAt()!=null&&d.getNextAttemptAt().isAfter(now)))return;
  d.setAttemptCount(d.getAttemptCount()+1);
  boolean sent=replies.sendQuickReplies(chatbot,type==AssessmentType.ANNUAL?"Đã đến kỳ rà soát hồ sơ sức khỏe hàng năm.":"Hồ sơ sức khỏe của bạn đã đến kỳ rà soát quý. Có thay đổi không?",java.util.List.of(new MessengerReplyService.QuickReply("Bắt đầu","HEALTH_START_"+type),new MessengerReplyService.QuickReply("Không thay đổi","HEALTH_NO_CHANGE_"+type)));
  d.setStatus(sent?"SENT":d.getAttemptCount()>=3?"FAILED":"RETRY"); if(sent)d.setSentAt(now);else d.setNextAttemptAt(now.plus(Duration.ofHours(1L<<Math.min(2,d.getAttemptCount()-1)))); deliveries.save(d);
 }
}
