package com.nutricash.api.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.ai.entity.AiErrorReport;
import com.nutricash.api.budget.entity.Budget;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.common.enums.AuthProvider;
import com.nutricash.api.common.enums.UserRole;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
@Table(name = "users")
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 191)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @JsonIgnore
    @Column(name = "session_token_hash", length = 64)
    private String sessionTokenHash;

    @Column(name = "avatar_url", length = 1024)
    private String avatarUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserRole role = UserRole.USER;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id", length = 255)
    private String providerId;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MealRecord> mealRecords = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseRecord> expenseRecords = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Budget> budgets = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatbotProfile> chatbotProfiles = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiAnalysisLog> aiAnalysisLogs = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiErrorReport> aiErrorReports = new ArrayList<>();
}
