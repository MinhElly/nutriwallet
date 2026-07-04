package com.nutricash.api.backup.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
public record BackupPreviewRequest(@NotNull @Valid ProfileBackupPayload backup) {}
