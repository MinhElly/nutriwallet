package com.nutricash.api.ai.repository;

import com.nutricash.api.common.enums.AiAnalysisStatus;
import com.nutricash.api.common.enums.AiLogEvaluationStatus;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiAnalysisLogRepository extends JpaRepository<AiAnalysisLog, Long> {

    List<AiAnalysisLog> findAllByStatusOrderByCreatedAtDesc(AiAnalysisStatus status);

    List<AiAnalysisLog> findAllByMealRecordIdOrderByCreatedAtDesc(Long mealRecordId);

    List<AiAnalysisLog> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<AiAnalysisLog> findByIdAndUserId(Long id, Long userId);

    List<AiAnalysisLog> findAllByCreatedAtAfterOrderByCreatedAtDesc(Instant since);

    List<AiAnalysisLog> findTop100ByStatusOrderByCreatedAtDesc(AiAnalysisStatus status);

    List<AiAnalysisLog> findAllByEvaluationStatus(AiLogEvaluationStatus evaluationStatus);

    long countByStatusAndCreatedAtAfter(AiAnalysisStatus status, Instant since);

    long countByCreatedAtAfter(Instant since);

    long countByStatusAndCreatedAtAfterAndCreatedAtBefore(AiAnalysisStatus status, Instant start, Instant end);

    long countByCreatedAtAfterAndCreatedAtBefore(Instant start, Instant end);

    @Query(value = "SELECT COALESCE(AVG(TIMESTAMPDIFF(MICROSECOND, started_at, completed_at)) / 1000000.0, 0.0) FROM ai_analysis_logs WHERE status = 'SUCCESS' AND started_at IS NOT NULL AND completed_at IS NOT NULL AND created_at >= :since", nativeQuery = true)
    double getAverageResponseTimeSecondsSince(@Param("since") Instant since);
}
