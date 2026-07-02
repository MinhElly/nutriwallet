package com.nutricash.api.ai.repository;

import com.nutricash.api.ai.entity.AiRecommendation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiRecommendationRepository extends JpaRepository<AiRecommendation, Long> {
    List<AiRecommendation> findByUserIdOrderByCreatedAtDesc(Long userId);
}
