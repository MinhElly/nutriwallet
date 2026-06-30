package com.nutricash.api.ai.repository;

import com.nutricash.api.ai.entity.AiAnalysisLog;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiAnalysisLogRepository extends JpaRepository<AiAnalysisLog, Long> {

    List<AiAnalysisLog> findAllByMealRecordIdOrderByCreatedAtDesc(Long mealRecordId);

    List<AiAnalysisLog> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<AiAnalysisLog> findByIdAndUserId(Long id, Long userId);
}
