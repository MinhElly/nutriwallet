package com.nutricash.api.ai.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nutrition_analysis_cache")
public class NutritionAnalysisCache {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "cache_key", nullable = false, unique = true, length = 64)
    private String cacheKey;
    @Column(name = "normalized_food_name", length = 255)
    private String normalizedFoodName;
    @Column(name = "food_name", length = 255)
    private String foodName;
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal calories;
    @Column(name = "protein_gram", nullable = false, precision = 10, scale = 2)
    private BigDecimal proteinGram;
    @Column(name = "carb_gram", nullable = false, precision = 10, scale = 2)
    private BigDecimal carbGram;
    @Column(name = "fat_gram", nullable = false, precision = 10, scale = 2)
    private BigDecimal fatGram;
    @Column(name = "model_name", length = 100)
    private String modelName;
    @Column(name = "use_count", nullable = false)
    @Builder.Default
    private long useCount = 0;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void create() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void update() {
        updatedAt = Instant.now();
    }
}
