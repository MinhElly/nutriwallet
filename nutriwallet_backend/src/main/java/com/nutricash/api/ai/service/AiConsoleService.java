package com.nutricash.api.ai.service;

import com.nutricash.api.ai.dto.*;
import com.nutricash.api.ai.entity.AiAnalysisLog;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.common.enums.AiAnalysisStatus;
import com.nutricash.api.common.enums.AiLogEvaluationStatus;
import com.nutricash.api.common.exception.AppException;
import com.nutricash.api.common.exception.ErrorCode;
import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiConsoleService {

    private final AiAnalysisLogRepository logsRepository;

    @Transactional(readOnly = true)
    public AiConsoleStatsResponse getStats() {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        Instant startOfToday = now.truncatedTo(ChronoUnit.DAYS).toInstant();

        long totalRequestsToday = logsRepository.countByCreatedAtAfter(startOfToday);
        long failedRequestsToday = logsRepository.countByStatusAndCreatedAtAfter(AiAnalysisStatus.FAILED, startOfToday);
        long successRequestsToday = logsRepository.countByStatusAndCreatedAtAfter(AiAnalysisStatus.SUCCESS, startOfToday);

        double successRate = 100.0;
        long totalCompletedToday = successRequestsToday + failedRequestsToday;
        if (totalCompletedToday > 0) {
            successRate = ((double) successRequestsToday / totalCompletedToday) * 100.0;
        }

        double avgResponseTime = logsRepository.getAverageResponseTimeSecondsSince(startOfToday);

        return new AiConsoleStatsResponse(
                totalRequestsToday,
                successRate,
                avgResponseTime,
                failedRequestsToday
        );
    }

    @Transactional(readOnly = true)
    public List<AiConsolePerformanceItem> getPerformanceChart() {
        List<AiConsolePerformanceItem> items = new ArrayList<>();
        ZoneId zone = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime today = ZonedDateTime.now(zone).truncatedTo(ChronoUnit.DAYS);

        for (int i = 6; i >= 0; i--) {
            ZonedDateTime dayStart = today.minusDays(i);
            ZonedDateTime dayEnd = dayStart.plusDays(1);
            Instant start = dayStart.toInstant();
            Instant end = dayEnd.toInstant();

            long totalVolume = logsRepository.countByCreatedAtAfterAndCreatedAtBefore(start, end);
            long success = logsRepository.countByStatusAndCreatedAtAfterAndCreatedAtBefore(AiAnalysisStatus.SUCCESS, start, end);
            long failed = logsRepository.countByStatusAndCreatedAtAfterAndCreatedAtBefore(AiAnalysisStatus.FAILED, start, end);

            double accuracy = 100.0;
            long completed = success + failed;
            if (completed > 0) {
                accuracy = ((double) success / completed) * 100.0;
            }

            DayOfWeek dow = dayStart.getDayOfWeek();
            String name = switch (dow) {
                case MONDAY -> "T2";
                case TUESDAY -> "T3";
                case WEDNESDAY -> "T4";
                case THURSDAY -> "T5";
                case FRIDAY -> "T6";
                case SATURDAY -> "T7";
                case SUNDAY -> "CN";
            };

            items.add(new AiConsolePerformanceItem(name, totalVolume, accuracy));
        }

        return items;
    }

    @Transactional(readOnly = true)
    public List<AiConsoleLogResponse> getLogsForReview() {
        return logsRepository.findTop100ByStatusOrderByCreatedAtDesc(AiAnalysisStatus.SUCCESS)
                .stream()
                .map(log -> new AiConsoleLogResponse(
                        log.getId(),
                        log.getFoodName() != null ? log.getFoodName() : log.getInputText(),
                        log.getConfidence() != null ? log.getConfidence().setScale(1, java.math.RoundingMode.HALF_UP).toString() + "%" : "0.0%",
                        log.getEvaluationStatus(),
                        log.getInputText(),
                        log.getInputImageUrl(),
                        log.getModelName(),
                        log.getCreatedAt(),
                        log.getUser() != null ? log.getUser().getEmail() : "Anonymous"
                ))
                .toList();
    }

    @Transactional
    public void evaluateLog(Long id, AiLogEvaluationStatus status) {
        AiAnalysisLog log = logsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy log AI với ID này."));
        log.setEvaluationStatus(status);
        logsRepository.save(log);
    }

    @Transactional
    public void retrainModel() {
        List<AiAnalysisLog> retrainLogs = logsRepository.findAllByEvaluationStatus(AiLogEvaluationStatus.RETRAIN);
        for (AiAnalysisLog log : retrainLogs) {
            log.setEvaluationStatus(AiLogEvaluationStatus.CORRECT);
        }
        logsRepository.saveAll(retrainLogs);
    }
}
