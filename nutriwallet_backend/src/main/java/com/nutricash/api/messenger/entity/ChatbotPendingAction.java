package com.nutricash.api.messenger.entity;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.common.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor @Entity
@Table(name="chatbot_pending_actions", indexes=@Index(name="idx_action_profile_status",columnList="chatbot_profile_id,status,created_at"))
public class ChatbotPendingAction extends BaseEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="chatbot_profile_id",nullable=false) private ChatbotProfile chatbotProfile;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private ChatbotActionType type;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private ChatbotActionStatus status;
 @Column(name="message_id",unique=true,length=255) private String messageId;
 @Lob @Column(name="payload_json",columnDefinition="LONGTEXT") private String payloadJson;
 @Column(name="expires_at") private Instant expiresAt;
}
