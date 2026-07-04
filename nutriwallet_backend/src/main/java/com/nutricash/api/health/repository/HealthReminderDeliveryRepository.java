package com.nutricash.api.health.repository;
import com.nutricash.api.health.entity.HealthReminderDelivery;
import com.nutricash.api.health.enums.AssessmentType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface HealthReminderDeliveryRepository extends JpaRepository<HealthReminderDelivery,Long> {
 Optional<HealthReminderDelivery> findByUserIdAndAssessmentTypeAndPeriodKey(Long userId,AssessmentType type,String periodKey);
}
