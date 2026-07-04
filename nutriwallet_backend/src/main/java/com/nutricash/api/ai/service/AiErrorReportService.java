package com.nutricash.api.ai.service;

import com.nutricash.api.ai.dto.*;
import com.nutricash.api.ai.entity.*;
import com.nutricash.api.ai.repository.*;
import com.nutricash.api.common.enums.AiErrorReportStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import com.nutricash.api.meal.entity.MealRecord;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import com.nutricash.api.security.SecurityUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiErrorReportService {

    private final AiErrorReportRepository errorReports;
    private final MealRepository mealRepository;
    private final AiAnalysisLogRepository aiAnalysisLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public AiErrorReportResponse createReport(SecurityUser currentUser, CreateAiErrorReportRequest request) {
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findByIdAndDeletedAtIsNull(currentUser.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));

        MealRecord meal = mealRepository.findById(request.mealRecordId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (meal.getUser() == null || !currentUser.getId().equals(meal.getUser().getId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        AiAnalysisLog analysisLog = null;
        if (request.aiAnalysisLogId() != null) {
            analysisLog = aiAnalysisLogRepository.findById(request.aiAnalysisLogId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
            if (analysisLog.getUser() == null || !currentUser.getId().equals(analysisLog.getUser().getId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }

        log.info("Creating AI error report: userId={}, mealRecordId={}, aiAnalysisLogId={}",
                user.getId(), meal.getId(), analysisLog != null ? analysisLog.getId() : null);

        AiErrorReport report = AiErrorReport.builder()
                .user(user)
                .mealRecord(meal)
                .aiAnalysisLog(analysisLog)
                .reason(request.reason())
                .description(request.description())
                .status(AiErrorReportStatus.PENDING)
                .build();

        report = errorReports.saveAndFlush(report);
        log.info("Successfully created AI error report with ID: {}", report.getId());
        return mapToResponse(report);
    }
    @Transactional(readOnly = true)
    public List<AiErrorReportResponse> findAllReports() {
        return errorReports.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public AiErrorReportResponse updateStatus(Long id, AiErrorReportStatus status) {
        AiErrorReport report = errorReports.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        report.setStatus(status);
        report = errorReports.saveAndFlush(report);
        AiErrorReportService.log.info("Successfully updated AI error report ID {} status to: {}", id, status);
        return mapToResponse(report);
    }

    private AiErrorReportResponse mapToResponse(AiErrorReport report) {
        return new AiErrorReportResponse(
                report.getId(),
                report.getUser() != null ? report.getUser().getEmail() : "Anonymous",
                report.getMealRecord() != null ? report.getMealRecord().getId() : null,
                report.getAiAnalysisLog() != null ? report.getAiAnalysisLog().getId() : null,
                report.getReason(),
                report.getDescription(),
                report.getStatus(),
                report.getCreatedAt()
        );
    }
}
