package com.nutricash.api.ai.entity;

import com.nutricash.api.common.enums.AiAnalysisStatus;
import com.nutricash.api.common.enums.AiInputType;
import com.nutricash.api.common.enums.AiAnalysisSource;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.user.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
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
@Table(name = "ai_analysis_logs")
public class AiAnalysisLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_record_id")
    private MealRecord mealRecord;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_type", nullable = false, length = 30)
    private AiInputType inputType;

    @Column(name = "input_image_url", length = 1024)
    private String inputImageUrl;

    @Lob
    @Column(name = "input_text", columnDefinition = "TEXT")
    private String inputText;

    @Lob
    @Column(name = "raw_ai_response", columnDefinition = "LONGTEXT")
    private String rawAiResponse;

    @Column(name = "parsed_calories", precision = 10, scale = 2)
    private BigDecimal parsedCalories;

    @Column(name = "parsed_protein_gram", precision = 10, scale = 2)
    private BigDecimal parsedProteinGram;

    @Column(name = "parsed_carb_gram", precision = 10, scale = 2)
    private BigDecimal parsedCarbGram;

    @Column(name = "parsed_fat_gram", precision = 10, scale = 2)
    private BigDecimal parsedFatGram;

    @Column(name = "confidence", precision = 5, scale = 2)
    private BigDecimal confidence;

    @Column(name = "meal_type", length = 20)
    private String mealType;

    @Column(name = "estimated_price_vnd", precision = 12, scale = 0)
    private BigDecimal estimatedPriceVnd;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "food_name", length = 255)
    private String foodName;

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private int retryCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 20)
    private AiAnalysisSource source;

    @Column(name = "cache_key", length = 64)
    private String cacheKey;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiAnalysisStatus status;

    @Lob
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "aiAnalysisLog", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiErrorReport> errorReports = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
