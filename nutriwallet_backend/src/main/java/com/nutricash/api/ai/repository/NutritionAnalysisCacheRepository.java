package com.nutricash.api.ai.repository;

import com.nutricash.api.ai.entity.NutritionAnalysisCache;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NutritionAnalysisCacheRepository extends JpaRepository<NutritionAnalysisCache, Long> {
    Optional<NutritionAnalysisCache> findByCacheKeyAndUpdatedAtAfter(String cacheKey, Instant cutoff);
}
