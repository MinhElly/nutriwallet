package com.nutricash.api.backup.dto;
import java.util.List;
public record BackupPreviewResponse(int schemaVersion, long currentProfileVersion,
        List<Change> changes, List<String> warnings) {
    public record Change(String field, Object currentValue, Object incomingValue, String changeType) {}
}
