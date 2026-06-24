package com.nutricash.api.meal.entity;

import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.common.entity.BaseEntity;
import com.nutricash.api.expense.entity.ExpenseRecord;
import com.nutricash.api.messenger.entity.ChatbotProfile;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
@Table(name = "meal_records")
public class MealRecord extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chatbot_profile_id")
    private ChatbotProfile chatbotProfile;

    @Column(name = "meal_name", nullable = false, length = 255)
    private String mealName;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 1024)
    private String imageUrl;

    @Column(name = "meal_time", nullable = false)
    private LocalDateTime mealTime;

    @Column(name = "total_calories", precision = 10, scale = 2)
    private BigDecimal totalCalories;

    @Column(name = "protein_gram", precision = 10, scale = 2)
    private BigDecimal proteinGram;

    @Column(name = "carb_gram", precision = 10, scale = 2)
    private BigDecimal carbGram;

    @Column(name = "fat_gram", precision = 10, scale = 2)
    private BigDecimal fatGram;

    @Builder.Default
    @Column(name = "ai_estimated", nullable = false)
    private boolean aiEstimated = false;

    @Builder.Default
    @Column(name = "confirmed_by_user", nullable = false)
    private boolean confirmedByUser = false;

    @OneToOne(mappedBy = "mealRecord", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private ExpenseRecord expenseRecord;

    @Builder.Default
    @OneToMany(mappedBy = "mealRecord", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiAnalysisLog> aiAnalysisLogs = new ArrayList<>();
}