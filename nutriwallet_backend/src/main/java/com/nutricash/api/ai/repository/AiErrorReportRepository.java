package com.nutricash.api.ai.repository;

import com.nutricash.api.ai.entity.AiErrorReport;
import com.nutricash.api.common.enums.AiErrorReportStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiErrorReportRepository extends JpaRepository<AiErrorReport, Long> {

    List<AiErrorReport> findAllByOrderByCreatedAtDesc();

    List<AiErrorReport> findAllByStatusOrderByCreatedAtDesc(AiErrorReportStatus status);

    List<AiErrorReport> findAllByMealRecordIdOrderByCreatedAtDesc(Long mealRecordId);
}

