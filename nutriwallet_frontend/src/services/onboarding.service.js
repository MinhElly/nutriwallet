import api, { unwrapApiData } from "./api";

/**
 * Gửi dữ liệu onboarding lên backend
 * @param {Object} data Dữ liệu từ form onboarding
 * @returns {Promise<Object>} Thông tin user/profile mới nhất
 */
export async function saveOnboarding(data) {
  // Thay thế bằng API thật khi Backend sẵn sàng:
  // return unwrapApiData(await api.post("/api/onboarding", data));
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Lưu thông tin thành công",
        // Trả về data mô phỏng
        user: {
          ...data,
          tdee: data.tdee || 2000,
          onboardingCompleted: true,
        }
      });
    }, 1500); // Mô phỏng delay mạng
  });
}
