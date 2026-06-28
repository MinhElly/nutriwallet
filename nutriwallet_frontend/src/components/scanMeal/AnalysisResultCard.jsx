import { useEffect, useState } from "react";
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

  useEffect(() => {
    setDraftResult(result);
    setIsEditing(false);
  }, [result]);

  if (!result) {
    return (
      <section className="flex min-h-[560px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm shadow-slate-200/50">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Sparkles size={30} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-950">
            Chua co ket qua phan tich
          </h2>

          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Sau khi tai anh len, backend se tra ve ket qua AI va phan nay se
            hien thi thong tin mon an.
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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/50">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Sparkles className="text-emerald-600" size={22} />
          <h2 className="text-lg font-semibold text-slate-950">
            Ket qua phan tich AI
          </h2>
        </div>

        <span className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
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
          <label className="text-sm font-medium text-slate-600">Ten mon an</label>
          <input
            value={draftResult.foodName}
            onChange={(event) => updateFoodName(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      ) : (
        <h3 className="mt-5 text-2xl font-bold text-slate-950">
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
            label="Gia uoc tinh"
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
              color="text-emerald-600"
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
            label="Gia uoc tinh"
            value={displayResult.estimatedPrice.toLocaleString("vi-VN")}
            unit={displayResult.currency}
            color="text-emerald-600"
          />
        </div>
      )}

      <div className="mt-7">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-950">
          <Leaf size={18} className="text-emerald-600" />
          Chi tiet phan tich AI
        </h4>

        <div className="divide-y divide-slate-100 text-sm">
          <DetailRow label="Model" value={displayResult.ai.model} />
          <DetailRow label="Loai dau vao" value={displayResult.ai.inputType} />

          <div className="flex justify-between py-3">
            <span className="text-slate-500">Trang thai</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {displayResult.ai.status}
            </span>
          </div>

          <DetailRow
            label="Do tin cay"
            value={`${displayResult.ai.confidence}%`}
          />

          <DetailRow
            label="Gia uoc tinh"
            value={`${displayResult.estimatedPrice.toLocaleString("vi-VN")} ${
              displayResult.currency
            }`}
          />

          <DetailRow label="Thoi gian tao" value={displayResult.ai.createdAt} />
        </div>
      </div>

      {isEditing ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
          >
            <X size={18} />
            Huy
          </button>

          <button
            type="button"
            onClick={handleSaveEdit}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Save size={18} />
            Luu chinh sua
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Save size={18} />
            Luu bua an
          </button>

          <button
            type="button"
            onClick={handleStartEdit}
            className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 active:scale-[0.98]"
          >
            <Pencil size={18} />
            Chinh sua ket qua
          </button>
        </div>
      )}
    </section>
  );
}

function EditNumberField({ label, unit, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-slate-600">{label}</label>
      <div className="mt-2 flex h-12 items-center rounded-xl border border-slate-200 bg-white px-3 transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none"
        />
        <span className="text-xs font-semibold text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
