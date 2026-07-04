package com.nutricash.api.health.repository;
import com.nutricash.api.health.entity.HealthClassification;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface HealthClassificationRepository extends JpaRepository<HealthClassification, Long> {
    Optional<HealthClassification> findByHealthProfileId(Long profileId);
}
