import { useState } from "react";
import {
  Beef,
  Coffee,
  Droplet,
  Flame,
  Leaf,
  Moon,
  Pencil,
  Save,
  Sparkles,
  Sun,
  Sunset,
  Wallet,
  Wheat,
  X,
  AlertTriangle,
} from "lucide-react";
import NutritionCard from "./NutritionCard";
import toast from "react-hot-toast";
import { submitAiErrorReport } from "../../services/aiLog.service";

const MEAL_TYPE_META = {
  BREAKFAST: { label: "Bữa sáng", icon: Sun, className: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400" },
  LUNCH:     { label: "Bữa trưa", icon: Sunset, className: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400" },
  DINNER:    { label: "Bữa tối", icon: Moon, className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400" },
  SNACK:     { label: "Bữa phụ", icon: Coffee, className: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400" },
};

const MEAL_TYPE_OPTIONS = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

function formatRangeValue(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  const numVal = Number(value);
  if (numVal <= 0) return "0";
  const min = Math.max(0, Math.round(numVal * 0.9));
  const max = Math.round(numVal * 1.1);
  if (min === max) return `${min}`;
  return `${min} - ${max}`;
}

export default function AnalysisResultCard({ result, onUpdateResult, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftResult, setDraftResult] = useState(result);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("WRONG_FOOD_NAME");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleSubmitReport = async () => {
    setIsSubmittingReport(true);
    const toastId = toast.loading("Đang gửi báo cáo lỗi...");
    try {
      await submitAiErrorReport({
        mealRecordId: result.savedMealId || null,
        aiAnalysisLogId: result.analysisLogId || null,
        reason: reportReason,
        description: reportDescription,
      });
      toast.success("Báo cáo lỗi nhận diện AI thành công. Cảm ơn phản hồi từ bạn!", { id: toastId });
      setShowReportModal(false);
      setReportDescription("");
    } catch (error) {
      toast.error(error.message || "Gửi báo cáo thất bại.", { id: toastId });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!result) {
    return (
      <section className="flex min-h-[560px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-400">
            <Sparkles size={30} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
            Chưa có kết quả phân tích
          </h2>

          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Sau khi tải ảnh lên, AI sẽ phân tích và hiển thị thông tin dinh dưỡng tại đây.
          </p>
        </div>
      </section>
    );
  }

  const handleStartEdit = () => {
    setDraftResult(result);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftResult(result);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    onUpdateResult?.(draftResult);
    setIsEditing(false);
  };

  const updateFoodName = (value) => {
    setDraftResult((prev) => ({
      ...prev,
      foodName: value,
    }));
  };

  const updateMealType = (value) => {
    setDraftResult((prev) => ({
      ...prev,
      mealType: value || null,
    }));
  };

  const updateEstimatedPrice = (value) => {
    setDraftResult((prev) => ({
      ...prev,
      estimatedPrice: Number(value),
    }));
  };

  const updateNutrition = (field, value) => {
    setDraftResult((prev) => ({
      ...prev,
      nutrition: {
        ...prev.nutrition,
        [field]: Number(value),
      },
    }));
  };

  const displayResult = isEditing ? draftResult : result;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="text-emerald-600 dark:text-emerald-400" size={22} />
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Kết quả phân tích AI
          </h2>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
          {displayResult.ai.status}
        </span>
      </div>

      <img
        src={displayResult.imageUrl}
        alt={displayResult.foodName}
        className="h-72 w-full rounded-2xl object-cover shadow-sm"
      />

      {isEditing ? (
        <div className="mt-5">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Tên món ăn</label>
          <input
            value={draftResult.foodName}
            onChange={(event) => updateFoodName(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          />
        </div>
      ) : (
        <>
          <h3 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
            {displayResult.foodName}
          </h3>
          {displayResult.mealType && (() => {
            const meta = MEAL_TYPE_META[displayResult.mealType];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                <Icon size={13} />
                {meta.label}
              </span>
            );
          })()}
        </>
      )}

      {isEditing ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <EditNumberField
            label="Calories"
            unit="kcal"
            value={draftResult.nutrition.calories}
            onChange={(value) => updateNutrition("calories", value)}
          />

          <EditNumberField
            label="Protein"
            unit="g"
            value={draftResult.nutrition.protein}
            onChange={(value) => updateNutrition("protein", value)}
          />

          <EditNumberField
            label="Carbs"
            unit="g"
            value={draftResult.nutrition.carbs}
            onChange={(value) => updateNutrition("carbs", value)}
          />

          <EditNumberField
            label="Fat"
            unit="g"
            value={draftResult.nutrition.fat}
            onChange={(value) => updateNutrition("fat", value)}
          />

          <EditNumberField
            label="Giá ước tính"
            unit={draftResult.currency}
            value={draftResult.estimatedPrice}
            onChange={updateEstimatedPrice}
            className="col-span-2"
          />

          <div className="col-span-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Loại bữa ăn</label>
            <select
              value={draftResult.mealType || ""}
              onChange={(e) => updateMealType(e.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Không xác định</option>
              {MEAL_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>{MEAL_TYPE_META[type]?.label ?? type}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <NutritionCard
              icon={Flame}
              label="Calories"
              value={formatRangeValue(displayResult.nutrition.calories)}
              unit="kcal"
              color="text-orange-500"
              compact
            />

            <NutritionCard
              icon={Beef}
              label="Protein"
              value={formatRangeValue(displayResult.nutrition.protein)}
              unit="g"
              color="text-emerald-600 dark:text-emerald-400"
              compact
            />

            <NutritionCard
              icon={Wheat}
              label="Carbs"
              value={formatRangeValue(displayResult.nutrition.carbs)}
              unit="g"
              color="text-amber-500"
              compact
            />

            <NutritionCard
              icon={Droplet}
              label="Fat"
              value={formatRangeValue(displayResult.nutrition.fat)}
              unit="g"
              color="text-red-500"
              compact
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NutritionCard
              icon={Wallet}
              label="Giá ước tính"
              value={(displayResult.estimatedPrice ?? 0).toLocaleString("vi-VN")}
              unit={displayResult.currency}
              color="text-emerald-600 dark:text-emerald-400"
            />

            <NutritionCard
              icon={MEAL_TYPE_META[displayResult.mealType]?.icon || Coffee}
              label="Loại bữa ăn"
              value={MEAL_TYPE_META[displayResult.mealType]?.label || "Chưa xác định"}
              unit=""
              color="text-sky-600 dark:text-sky-400"
            />
          </div>

        </div>
      )}

      <div className="mt-7">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-950 dark:text-white">
          <Leaf size={18} className="text-emerald-600 dark:text-emerald-400" />
          Chi tiết phân tích AI
        </h4>

        <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <DetailRow label="Model" value={displayResult.ai.model} />
          <DetailRow label="Loại đầu vào" value={displayResult.ai.inputType} />

          <div className="flex justify-between py-3">
            <span className="text-slate-500 dark:text-slate-400">Trạng thái</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              {displayResult.ai.status}
            </span>
          </div>

          <DetailRow
            label="Độ tin cậy"
            value={`${displayResult.ai.confidence ?? 0}%`}
          />

          <DetailRow
            label="Loại bữa ăn"
            value={MEAL_TYPE_META[displayResult.mealType]?.label || "Chưa xác định"}
          />

          <DetailRow
            label="Giá ước tính"
            value={`${(displayResult.estimatedPrice ?? 0).toLocaleString("vi-VN")} ${
              displayResult.currency
            }`}
          />

          <DetailRow label="Thời gian tạo" value={displayResult.ai.createdAt} />
        </div>
      </div>

      {isEditing ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <X size={18} />
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSaveEdit}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Save size={18} />
            Lưu chỉnh sửa
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onSave}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Save size={18} />
            Lưu bữa ăn
          </button>

          <button
            type="button"
            onClick={handleStartEdit}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 active:scale-[0.98] dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-emerald-950/40"
          >
            <Pencil size={18} />
            Chỉnh sửa kết quả
          </button>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white text-sm font-semibold text-rose-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50 active:scale-[0.98] dark:border-rose-950/30 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/20"
          >
            <AlertTriangle size={18} />
            Báo lỗi nhận diện AI
          </button>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl space-y-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                Báo cáo lỗi nhận diện AI
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-rose-500 text-slate-500 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors dark:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Lý do lỗi
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white cursor-pointer"
                >
                  <option value="WRONG_FOOD_NAME">Sai tên món ăn</option>
                  <option value="WRONG_NUTRITION">Sai lượng calo/dinh dưỡng</option>
                  <option value="WRONG_PRICE">Sai giá tiền ước lượng</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Mô tả chi tiết lỗi
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Vui lòng nhập chi tiết phản hồi của bạn để giúp chúng tôi hoàn thiện hơn..."
                  className="mt-2 w-full min-h-[100px] rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitReport}
                disabled={isSubmittingReport}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmittingReport ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function EditNumberField({ label, unit, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
      <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-emerald-500 dark:border-slate-800 dark:bg-slate-800">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none dark:text-white"
        />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right font-semibold text-slate-900 dark:text-slate-200">{value}</span>
    </div>
  );
}
