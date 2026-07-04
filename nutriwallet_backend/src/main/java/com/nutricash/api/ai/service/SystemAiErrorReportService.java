package com.nutricash.api.ai.service;

import com.nutricash.api.ai.entity.AiErrorReport;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.ai.repository.AiErrorReportRepository;
import com.nutricash.api.common.enums.AiErrorReportStatus;
import com.nutricash.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemAiErrorReportService {
    private static final String SYSTEM_ERROR = "SYSTEM_ERROR";

    private final AiErrorReportRepository errorReports;
    private final AiAnalysisLogRepository analysisLogs;
    private final UserRepository users;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createIfAbsent(Long userId, Long analysisLogId, String description) {
        if (errorReports.existsByAiAnalysisLogIdAndReason(analysisLogId, SYSTEM_ERROR)) {
            return;
        }

        AiErrorReport report = AiErrorReport.builder()
                .user(userId == null ? null : users.getReferenceById(userId))
                .aiAnalysisLog(analysisLogs.getReferenceById(analysisLogId))
                .reason(SYSTEM_ERROR)
                .description(description)
                .status(AiErrorReportStatus.PENDING)
                .build();
        errorReports.saveAndFlush(report);
    }
}