package com.nutricash.api.messenger.entity;

import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.common.enums.ChatbotPlatform;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.user.entity.User;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
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
@Table(name = "chatbot_profiles")
public class ChatbotProfile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, unique = true, length = 191)
    private String psid;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChatbotPlatform platform = ChatbotPlatform.MESSENGER;

    @Column(name = "linked_at")
    private Instant linkedAt;

    @Column(name = "guest_session_code", unique = true, length = 64)
    private String guestSessionCode;

    @Builder.Default
    @OneToMany(mappedBy = "chatbotProfile", fetch = FetchType.LAZY)
    private List<MealRecord> mealRecords = new ArrayList<>();
}

