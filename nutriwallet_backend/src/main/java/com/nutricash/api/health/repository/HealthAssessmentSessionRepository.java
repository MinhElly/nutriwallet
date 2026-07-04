package com.nutricash.api.health.repository;
import com.nutricash.api.health.entity.HealthAssessmentSession;
import com.nutricash.api.health.enums.*;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface HealthAssessmentSessionRepository extends JpaRepository<HealthAssessmentSession, Long> {
    Optional<HealthAssessmentSession> findByIdAndUserId(Long id, Long userId);
    Optional<HealthAssessmentSession> findFirstByUserIdAndAssessmentTypeAndStatusOrderByCreatedAtDesc(
            Long userId, AssessmentType type, AssessmentStatus status);
    boolean existsByUserIdAndStatus(Long userId, AssessmentStatus status);
}
