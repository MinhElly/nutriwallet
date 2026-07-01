/**
 * Tính toán TDEE dựa trên công thức Mifflin-St Jeor.
 * @param {string} gender "Nam" | "Nữ"
 * @param {number|string} age Tuổi
 * @param {number|string} height Chiều cao (cm)
 * @param {number|string} weight Cân nặng (kg)
 * @param {number} activityFactor Hệ số vận động
 * @returns {number} TDEE tính toán (làm tròn)
 */
export function calculateTDEE(gender, age, height, weight, activityFactor = 1.2) {
  if (!weight || !height || !age) {
    return 2000; // Giá trị mặc định nếu thiếu thông tin
  }

  const w = Number(weight);
  const h = Number(height);
  const a = Number(age);

  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += gender === "Nam" ? 5 : -161;

  return Math.round(bmr * activityFactor);
}
