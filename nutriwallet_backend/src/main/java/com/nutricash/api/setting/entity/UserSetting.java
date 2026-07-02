package com.nutricash.api.setting.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
@Table(name = "user_settings")
public class UserSetting extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(length = 20)
    private String gender;

    private Double weight;

    private Double height;

    @Column(length = 255)
    private String goal;

    private Integer age;

    @Column(length = 100)
    private String diet;

    @Column(name = "activity_level", length = 50)
    private String activityLevel;

    @Column(name = "monthly_budget", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal monthlyBudget = BigDecimal.ZERO;

    @Column(length = 10)
    @Builder.Default
    private String language = "vi";

    @Column(name = "email_analysis_ready")
    @Builder.Default
    private boolean emailAnalysisReady = true;

    @Column(name = "budget_warning_push")
    @Builder.Default
    private boolean budgetWarningPush = true;

    @Column(name = "auto_create_expense")
    @Builder.Default
    private boolean autoCreateExpense = false;

    @Column(length = 20)
    @Builder.Default
    private String theme = "light";
}
