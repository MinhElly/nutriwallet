import api, { createApiError, unwrapApiData } from "./api";

export const PROFILE_BACKUP_SCHEMA_VERSION = 1;

export async function exportProfileBackupData() {
  try {
    return unwrapApiData(await api.get("/api/profile-backups"));
  } catch (error) {
    throw createApiError(error, "Không thể trích xuất dữ liệu hồ sơ.");
  }
}

export async function previewProfileRestore(backup) {
  try {
    return unwrapApiData(await api.post("/api/profile-backups/preview", { backup }));
  } catch (error) {
    throw createApiError(error, "File backup không hợp lệ hoặc không được hỗ trợ.");
  }
}

export async function restoreProfileBackup(backup, selectedFields, expectedProfileVersion) {
  try {
    return unwrapApiData(await api.post("/api/profile-backups/restore", {
      backup, selectedFields, expectedProfileVersion,
    }));
  } catch (error) {
    throw createApiError(error, "Không thể khôi phục dữ liệu hồ sơ.");
  }
}
