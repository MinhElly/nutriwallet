package com.nutricash.api.admin.service;

import com.nutricash.api.admin.entity.AdminAuditLog;
import com.nutricash.api.admin.repository.AdminAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuditLogService {
    private final AdminAuditLogRepository repository;

    public void record(Long actorUserId, Long targetUserId, String action, String details) {
        repository.save(AdminAuditLog.builder()
                .actorUserId(actorUserId)
                .targetUserId(targetUserId)
                .action(action)
                .details(details)
                .build());
    }
}