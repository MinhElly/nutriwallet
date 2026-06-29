/**
 * Tiện ích dùng chung cho tầng service khi dùng mock data.
 *
 * Sau này khi chuyển sang API thật, file này có thể xóa hoặc
 * chỉ giữ lại các helper không liên quan đến mock.
 */

/**
 * Giả lập độ trễ mạng.
 * Hiện tại delay = 0 để không ảnh hưởng trải nghiệm người dùng.
 * Sau này có thể dùng để test loading state trong development.
 *
 * @param {number} ms - Số millisecond cần chờ (mặc định 0)
 * @returns {Promise<void>}
 */
export function simulateDelay(ms = 0) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => setTimeout(resolve, ms));
}
