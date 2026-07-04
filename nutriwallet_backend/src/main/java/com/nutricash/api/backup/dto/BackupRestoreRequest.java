package com.nutricash.api.backup.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record BackupRestoreRequest(@NotNull @Valid ProfileBackupPayload backup,
        @NotEmpty List<String> selectedFields, long expectedProfileVersion) {}
