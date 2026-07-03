package com.nutricash.api.admin.service;

import com.nutricash.api.admin.dto.AdminActivityResponse;
import com.nutricash.api.admin.dto.AdminDashboardResponse;
import com.nutricash.api.admin.entity.AdminAuditLog;
import com.nutricash.api.admin.repository.AdminAuditLogRepository;
import com.nutricash.api.ai.repository.AiAnalysisLogRepository;
import com.nutricash.api.ai.repository.AiErrorReportRepository;
import com.nutricash.api.common.dto.PageResponse;
import com.nutricash.api.common.enums.AiAnalysisStatus;
import com.nutricash.api.common.enums.AiErrorReportStatus;
import com.nutricash.api.common.enums.UserStatus;
import com.nutricash.api.meal.repository.MealRepository;
import com.nutricash.api.user.entity.User;
import com.nutricash.api.user.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final MealRepository mealRepository;
    private final AiAnalysisLogRepository aiAnalysisLogRepository;
    private final AiErrorReportRepository aiErrorReportRepository;
    private final AdminAuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getOverview() {
        Instant startToday = LocalDate.now(APP_ZONE).atStartOfDay(APP_ZONE).toInstant();
        Instant now = Instant.now();
        long aiToday = aiAnalysisLogRepository.countByCreatedAtAfter(startToday);
        long aiFailedToday = aiAnalysisLogRepository.countByStatusAndCreatedAtAfter(
                AiAnalysisStatus.FAILED, startToday);
        double errorRate = aiToday == 0 ? 0 : Math.round(aiFailedToday * 10000.0 / aiToday) / 100.0;

        List<AdminDashboardResponse.TrendItem> trend = new ArrayList<>();
        for (int offset = 6; offset >= 0; offset--) {
            LocalDate date = LocalDate.now(APP_ZONE).minusDays(offset);
            Instant start = date.atStartOfDay(APP_ZONE).toInstant();
            Instant end = date.plusDays(1).atStartOfDay(APP_ZONE).toInstant();
            trend.add(new AdminDashboardResponse.TrendItem(
                    date,
                    userRepository.countByCreatedAtBetweenAndDeletedAtIsNull(start, end),
                    mealRepository.countByCreatedAtBetween(start, end),
                    aiAnalysisLogRepository.countByCreatedAtAfterAndCreatedAtBefore(start, end)));
        }

        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.ACTIVE),
                mealRepository.count(),
                aiAnalysisLogRepository.count(),
                aiToday,
                errorRate,
                aiErrorReportRepository.countByStatus(AiErrorReportStatus.PENDING),
                trend);
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminActivityResponse> getActivities(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Page<AdminAuditLog> result = auditLogRepository.findAll(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")));

        List<Long> userIds = result.getContent().stream()
                .flatMap(log -> java.util.stream.Stream.of(log.getActorUserId(), log.getTargetUserId()))
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, User> users = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<AdminActivityResponse> content = result.getContent().stream()
                .map(log -> toActivity(log, users))
                .toList();
        return new PageResponse<>(content, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    private AdminActivityResponse toActivity(AdminAuditLog log, Map<Long, User> users) {
        User actor = users.get(log.getActorUserId());
        User target = users.get(log.getTargetUserId());
        return new AdminActivityResponse(
                log.getId(),
                log.getActorUserId(),
                actor == null ? null : actor.getEmail(),
                log.getTargetUserId(),
                target == null ? null : target.getEmail(),
                log.getAction(),
                log.getDetails(),
                log.getCreatedAt());
    }
}