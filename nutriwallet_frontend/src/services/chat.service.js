import api, { createApiError, unwrapApiData } from "./api";

export async function sendChatMessage(message) {
  try {
    return unwrapApiData(
      await api.post("/api/chat", {
        message,
      }),
    );
  } catch (error) {
    throw createApiError(error, "Không thể gửi tin nhắn tới AI.");
  }
}
