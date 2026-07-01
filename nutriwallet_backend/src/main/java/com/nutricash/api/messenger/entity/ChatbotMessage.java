package com.nutricash.api.messenger.entity;

import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.common.enums.ChatbotMessageType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "chatbot_messages")
public class ChatbotMessage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatbot_profile_id", nullable = false)
    private ChatbotProfile chatbotProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChatbotMessageType type;

    @Column(name = "message_text", columnDefinition = "TEXT")
    private String messageText;

    @Column(name = "attachment_url", length = 1000)
    private String attachmentUrl;

    @Column(name = "is_from_user", nullable = false)
    private boolean isFromUser;
}
