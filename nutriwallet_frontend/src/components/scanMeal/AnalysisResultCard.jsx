import { useState } from "react";
import {
  Beef,
  Droplet,
  Flame,
  Leaf,
  Pencil,
  Save,
  Sparkles,
  Wallet,
  Wheat,
  X,
} from "lucide-react";
import NutritionCard from "./NutritionCard";

export default function AnalysisResultCard({ result, onUpdateResult }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftResult, setDraftResult] = useState(result);

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
        className="h-48 w-full rounded-2xl object-cover"
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
        <h3 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
          {displayResult.foodName}
        </h3>
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
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <NutritionCard
              icon={Flame}
              label="Calories"
              value={displayResult.nutrition.calories}
              unit="kcal"
              color="text-orange-500"
              compact
            />

            <NutritionCard
              icon={Beef}
              label="Protein"
              value={displayResult.nutrition.protein}
              unit="g"
              color="text-emerald-600 dark:text-emerald-400"
              compact
            />

            <NutritionCard
              icon={Wheat}
              label="Carbs"
              value={displayResult.nutrition.carbs}
              unit="g"
              color="text-amber-500"
              compact
            />

            <NutritionCard
              icon={Droplet}
              label="Fat"
              value={displayResult.nutrition.fat}
              unit="g"
              color="text-red-500"
              compact
            />
          </div>

          <NutritionCard
            icon={Wallet}
            label="Giá ước tính"
            value={displayResult.estimatedPrice.toLocaleString("vi-VN")}
            unit={displayResult.currency}
            color="text-emerald-600 dark:text-emerald-400"
          />
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
            value={`${displayResult.ai.confidence}%`}
          />

          <DetailRow
            label="Giá ước tính"
            value={`${displayResult.estimatedPrice.toLocaleString("vi-VN")} ${
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
