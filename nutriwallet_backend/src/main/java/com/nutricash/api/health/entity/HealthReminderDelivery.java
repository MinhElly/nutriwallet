package com.nutricash.api.health.entity;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.health.enums.AssessmentType;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;
@Entity @Table(name="health_reminder_deliveries",uniqueConstraints=@UniqueConstraint(name="uk_health_reminder_period",columnNames={"user_id","assessment_type","period_key"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class HealthReminderDelivery extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="chatbot_profile_id",nullable=false) private ChatbotProfile chatbotProfile;
 @Enumerated(EnumType.STRING) @Column(name="assessment_type",nullable=false,length=20) private AssessmentType assessmentType;
 @Column(name="period_key",nullable=false,length=20) private String periodKey;
 @Column(nullable=false,length=20) private String status;
 @Column(name="attempt_count",nullable=false) private int attemptCount;
 @Column(name="next_attempt_at") private Instant nextAttemptAt;
 @Column(name="sent_at") private Instant sentAt;
}
