import { Pencil, Wallet, X, Heart, Sparkles, Save, ShieldCheck, Calendar, AlertTriangle, CheckCircle2, Plus, Info, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "motion/react";
import AppShell from "../../components/layout/AppShell";
import { useProfileData } from "../../hooks/useProfileData";
import { useAuth } from "../../hooks/useAuth";
import { useBudgetData } from "../../hooks/useBudgetData";
import { useSettingsData } from "../../hooks/useSettingsData";
import { useHealthProfile } from "../../hooks/useHealthProfile";
import {
  MEDICAL_CONDITIONS,
  COMMON_ALLERGIES,
  USER_CLASSIFICATIONS,
  EVALUATION_SCHEDULES,
  calcNextEvaluationDate,
  getEvaluationStatus,
} from "../../services/health.service";

const PROFILE_META_STORAGE_KEY = "nw_profile_meta";
const defaultProfileMeta = { headline: "Người dùng sức khỏe" };

function readProfileMeta() {
  if (typeof window === "undefined") return { ...defaultProfileMeta };
  try {
    const rawValue = window.localStorage.getItem(PROFILE_META_STORAGE_KEY);
    if (!rawValue) return { ...defaultProfileMeta };
    const parsedValue = JSON.parse(rawValue);
    return { headline: parsedValue?.headline?.trim() || defaultProfileMeta.headline };
  } catch { return { ...defaultProfileMeta }; }
}

function persistProfileMeta(profileMeta) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_META_STORAGE_KEY, JSON.stringify(profileMeta));
}

function createProfileForm(user, profileMeta) {
  return {
    fullName: user.fullName ?? "",
    email: user.email ?? "",
    avatarUrl: user.avatarUrl ?? "",
    avatarFile: null,
    headline: profileMeta.headline,
  };
}

function normalizeProfileMeta(profileForm) {
  return { headline: profileForm.headline.trim() || defaultProfileMeta.headline };
}

function formatMoney(value) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatJoinedDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const onboardingGoalMap = {
  lose_weight: "Giảm cân", gain_muscle: "Tăng cơ bắp", maintain: "Duy trì cân nặng",
  healthy: "Ăn uống lành mạnh", save_money: "Tiết kiệm chi phí", track_all: "Theo dõi tổng thể",
};

// ─── MultiSelectChip ─────────────────────────────────────────────────────────

function MultiSelectChip({ item, selected, onToggle, colorClass }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onToggle(item.id)}
      aria-pressed={selected}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs cursor-pointer transition-all duration-150 ${
        selected
          ? `${colorClass} text-slate-900 font-medium`
          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
      }`}
    >
      <span aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
      {selected && <CheckCircle2 size={12} className="text-emerald-600 fill-emerald-100 ml-0.5" aria-hidden="true" />}
    </motion.button>
  );
}

// ─── TagInput ─────────────────────────────────────────────────────────────────

function TagInput({ tags, onAdd, onRemove, placeholder, ariaLabel, colorClass = "bg-orange-100 border-orange-200 text-orange-800" }) {
  const [inputVal, setInputVal] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault();
      const val = inputVal.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) onAdd(val);
      setInputVal("");
    }
  };

  const handleBlur = () => {
    if (inputVal.trim()) {
      const val = inputVal.trim();
      if (!tags.includes(val)) onAdd(val);
      setInputVal("");
    }
  };

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${colorClass}`}>
              {tag}
              <button type="button" onClick={() => onRemove(tag)} className="hover:opacity-70 cursor-pointer" aria-label={`Xoá ${tag}`}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={handleBlur}
          placeholder={placeholder} aria-label={ariaLabel}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-sm transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button type="button" onClick={() => { if (inputVal.trim() && !tags.includes(inputVal.trim())) { onAdd(inputVal.trim()); setInputVal(""); } }}
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-medium cursor-pointer hover:bg-emerald-700 transition-colors flex items-center gap-1">
          <Plus size={12} /> Thêm
        </button>
      </div>
    </div>
  );
}

// ─── HealthProfileSection ─────────────────────────────────────────────────────

function HealthProfileSection({ healthProfile, saveHealthProfile, isSaving }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const conditionLabels = (healthProfile.medicalConditions || []).map((id) => {
    const c = MEDICAL_CONDITIONS.find((m) => m.id === id);
    return c ? `${c.icon} ${c.label}` : id;
  });

  const allergyLabels = (healthProfile.allergies || []).map((id) => {
    const a = COMMON_ALLERGIES.find((x) => x.id === id);
    return a ? `${a.icon} ${a.label}` : id;
  });

  const classificationInfo = USER_CLASSIFICATIONS.find((c) => c.id === healthProfile.userClassification);
  const scheduleInfo = EVALUATION_SCHEDULES.find((s) => s.id === healthProfile.evaluationScheduleId);
  const evalStatus = getEvaluationStatus(healthProfile.nextEvaluationDate);

  const isComplete = healthProfile.healthConsentGiven && healthProfile.userClassification;

  return (
    <>
      <div className="scroll-mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30">
              <ShieldCheck size={20} className="text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Thông tin Sức khoẻ & An toàn</h2>
              {!isComplete && (
                <p className="text-xs text-slate-400 mt-0.5">Chưa thiết lập — AI chưa thể cảnh báo sức khỏe</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 cursor-pointer transition-colors hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-400"
          >
            <Pencil size={15} />
            Chỉnh sửa
          </button>
        </div>

        {/* Evaluation reminder */}
        {evalStatus === "overdue" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30"
            role="alert"
          >
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Đã đến lịch đánh giá sức khoẻ</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Hồ sơ của bạn chưa được cập nhật từ {formatDate(healthProfile.nextEvaluationDate)}. Nhấn "Chỉnh sửa" để cập nhật.
              </p>
            </div>
          </motion.div>
        )}
        {evalStatus === "due_soon" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/50 dark:bg-sky-950/30"
          >
            <Info size={16} className="text-sky-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-sky-700 dark:text-sky-400">
              Lịch đánh giá sức khoẻ sẽ đến vào <strong>{formatDate(healthProfile.nextEvaluationDate)}</strong>. Hãy chuẩn bị cập nhật thông số.
            </p>
          </motion.div>
        )}

        {/* Content */}
        {!isComplete ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <ShieldCheck size={24} className="text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Chưa có hồ sơ sức khoẻ</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Thiết lập để nhận cảnh báo thực phẩm cá nhân hoá từ AI</p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white cursor-pointer hover:bg-rose-700 transition-colors"
            >
              Thiết lập ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Classification + Schedule */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {classificationInfo && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Phân loại</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">{classificationInfo.icon}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${classificationInfo.badge}`}>{classificationInfo.label}</span>
                  </div>
                </div>
              )}
              {scheduleInfo && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Đánh giá tiếp theo</p>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-teal-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(healthProfile.nextEvaluationDate)}</span>
                    <span className="text-xs text-slate-400">(mỗi {scheduleInfo.label})</span>
                  </div>
                </div>
              )}
            </div>

            {/* Conditions */}
            {conditionLabels.length > 0 && (
              <HealthTagGroup label="Bệnh nền" tags={conditionLabels} tagClass="bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-300" />
            )}

            {/* Allergies */}
            {allergyLabels.length > 0 && (
              <HealthTagGroup label="Dị ứng" tags={allergyLabels} tagClass="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300" />
            )}

            {/* Restricted Foods */}
            {(healthProfile.restrictedFoods || []).length > 0 && (
              <HealthTagGroup label="Thực phẩm hạn chế" tags={healthProfile.restrictedFoods} tagClass="bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-300" />
            )}

            {/* Consent Status */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              {healthProfile.healthConsentGiven ? (
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
              ) : (
                <X size={16} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
              )}
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {healthProfile.healthConsentGiven
                  ? `Đã đồng ý chia sẻ dữ liệu sức khoẻ • ${formatDate(healthProfile.healthConsentDate)}`
                  : "Chưa đồng ý chia sẻ dữ liệu sức khoẻ"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Health Profile Modal */}
      {isModalOpen && (
        <HealthProfileModal
          healthProfile={healthProfile}
          onClose={() => setIsModalOpen(false)}
          onSave={async (updates) => {
            const result = await saveHealthProfile(updates);
            if (result.success) setIsModalOpen(false);
          }}
          isSaving={isSaving}
        />
      )}
    </>
  );
}

// ─── HealthTagGroup ───────────────────────────────────────────────────────────

function HealthTagGroup({ label, tags, tagClass }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${tagClass}`}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

// ─── HealthProfileModal ───────────────────────────────────────────────────────

function HealthProfileModal({ healthProfile, onClose, onSave, isSaving }) {
  const [draft, setDraft] = useState({
    medicalConditions: healthProfile.medicalConditions || [],
    customCondition: healthProfile.customCondition || "",
    allergies: healthProfile.allergies || [],
    restrictedFoods: [...(healthProfile.restrictedFoods || [])],
    healthConsentGiven: healthProfile.healthConsentGiven || false,
    userClassification: healthProfile.userClassification || null,
    evaluationScheduleId: healthProfile.evaluationScheduleId || "3_months",
  });

  const [errors, setErrors] = useState({});

  const updateDraft = (field, value) => setDraft((p) => ({ ...p, [field]: value }));

  const toggleCondition = (id) =>
    updateDraft("medicalConditions", draft.medicalConditions.includes(id)
      ? draft.medicalConditions.filter((c) => c !== id)
      : [...draft.medicalConditions, id]);

  const toggleAllergy = (id) =>
    updateDraft("allergies", draft.allergies.includes(id)
      ? draft.allergies.filter((a) => a !== id)
      : [...draft.allergies, id]);

  const addRestrictedFood = (food) => updateDraft("restrictedFoods", [...draft.restrictedFoods, food]);
  const removeRestrictedFood = (food) => updateDraft("restrictedFoods", draft.restrictedFoods.filter((f) => f !== food));

  const validate = () => {
    const e = {};
    if (!draft.healthConsentGiven) e.consent = "Bạn cần đồng ý để lưu hồ sơ sức khoẻ";
    if (!draft.userClassification) e.classification = "Vui lòng chọn phân loại";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setErrors({});
    await onSave({
      ...draft,
      nextEvaluationDate: calcNextEvaluationDate(draft.evaluationScheduleId),
      healthConsentDate: draft.healthConsentGiven && !healthProfile.healthConsentGiven
        ? new Date().toISOString()
        : healthProfile.healthConsentDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-0 backdrop-blur-[2px] dark:bg-slate-950/65 sm:items-center sm:justify-center sm:p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
        className="relative z-10 w-full rounded-t-[28px] bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-w-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <ShieldCheck size={18} className="text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chỉnh sửa Hồ sơ Sức khoẻ</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {/* Bệnh nền */}
          <section>
            <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1" id="modal-conditions">Bệnh nền</label>
            <p className="text-xs text-slate-400 mb-3">Chọn các bệnh lý bạn đang mắc phải</p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="modal-conditions">
              {MEDICAL_CONDITIONS.map((c) => (
                <MultiSelectChip key={c.id} item={c} selected={draft.medicalConditions.includes(c.id)} onToggle={toggleCondition} colorClass="border-rose-400 bg-rose-50/60 ring-1 ring-rose-400" />
              ))}
            </div>
            {draft.medicalConditions.includes("other") && (
              <div className="mt-3">
                <input type="text" value={draft.customCondition} onChange={(e) => updateDraft("customCondition", e.target.value)} placeholder="Mô tả bệnh nền khác..." aria-label="Bệnh nền khác"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" />
              </div>
            )}
          </section>

          {/* Dị ứng */}
          <section>
            <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1" id="modal-allergies">Dị ứng thực phẩm</label>
            <p className="text-xs text-slate-400 mb-3">AI cảnh báo khi phát hiện thực phẩm bạn dị ứng</p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="modal-allergies">
              {COMMON_ALLERGIES.map((a) => (
                <MultiSelectChip key={a.id} item={a} selected={draft.allergies.includes(a.id)} onToggle={toggleAllergy} colorClass="border-amber-400 bg-amber-50/60 ring-1 ring-amber-400" />
              ))}
            </div>
          </section>

          {/* Thực phẩm hạn chế */}
          <section>
            <label className="block text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Thực phẩm hạn chế</label>
            <p className="text-xs text-slate-400 mb-3">Thực phẩm muốn tránh theo sở thích hoặc chỉ định y tế</p>
            <TagInput
              tags={draft.restrictedFoods}
              onAdd={addRestrictedFood}
              onRemove={removeRestrictedFood}
              placeholder="Ví dụ: thịt đỏ, rượu bia, cà phê..."
              ariaLabel="Thêm thực phẩm hạn chế"
            />
          </section>

          {/* Phân loại */}
          <section>
            <label className="block text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-1" id="modal-classification">Phân loại người dùng <span className="text-rose-500">*</span></label>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="group" aria-labelledby="modal-classification">
              {USER_CLASSIFICATIONS.map((cls) => {
                const isSelected = draft.userClassification === cls.id;
                return (
                  <motion.button key={cls.id} type="button" whileTap={{ scale: 0.99 }}
                    onClick={() => { updateDraft("userClassification", cls.id); setErrors((e) => ({ ...e, classification: undefined })); }}
                    aria-pressed={isSelected}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer text-left transition-all ${isSelected ? `${cls.color} shadow-sm` : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                    <span className="text-2xl flex-shrink-0" aria-hidden="true">{cls.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{cls.label}</div>
                      <div className="text-xs text-slate-500">{cls.desc}</div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100 flex-shrink-0" aria-hidden="true" />}
                  </motion.button>
                );
              })}
            </div>
            {errors.classification && <p className="mt-1 text-xs text-red-600 font-medium" role="alert">{errors.classification}</p>}
          </section>

          {/* Lịch đánh giá */}
          <section>
            <label className="block text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-3" id="modal-schedule">Lịch đánh giá định kỳ</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" role="group" aria-labelledby="modal-schedule">
              {EVALUATION_SCHEDULES.map((s) => {
                const isSelected = draft.evaluationScheduleId === s.id;
                return (
                  <motion.button key={s.id} type="button" whileTap={{ scale: 0.97 }}
                    onClick={() => updateDraft("evaluationScheduleId", s.id)} aria-pressed={isSelected}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer text-center transition-all ${isSelected ? "border-teal-400 bg-teal-50/60 ring-1 ring-teal-400 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                    <div className="text-xl mb-1" aria-hidden="true">{s.icon}</div>
                    <div className={`font-semibold text-sm ${isSelected ? "text-teal-700" : "text-slate-800"}`}>{s.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Consent */}
          <section>
            <div className={`rounded-2xl border-2 p-4 transition-all ${draft.healthConsentGiven ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20" : errors.consent ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
              <div className="flex items-start gap-3">
                <button type="button" role="checkbox" aria-checked={draft.healthConsentGiven} aria-required="true"
                  onClick={() => { updateDraft("healthConsentGiven", !draft.healthConsentGiven); setErrors((e) => ({ ...e, consent: undefined })); }}
                  className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center ${draft.healthConsentGiven ? "bg-emerald-600 border-emerald-600" : errors.consent ? "border-red-400" : "border-slate-300 hover:border-emerald-400"}`}>
                  {draft.healthConsentGiven && <CheckCircle2 size={11} className="text-white fill-white" />}
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                    Đồng ý chia sẻ thông tin sức khỏe <span className="text-rose-500">*</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tôi đồng ý để NutriWallet AI sử dụng thông tin sức khoẻ cá nhân nhằm cá nhân hoá gợi ý dinh dưỡng và cảnh báo an toàn thực phẩm. Dữ liệu lưu trên thiết bị của bạn.
                  </p>
                  {errors.consent && <p className="mt-1.5 text-xs text-red-600 font-medium" role="alert">{errors.consent}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose}
              className="cursor-pointer rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
              Hủy
            </button>
            <button type="submit" disabled={isSaving}
              className="cursor-pointer rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
              {isSaving ? (
                <><RefreshCw size={15} className="animate-spin" aria-hidden="true" /> Đang lưu...</>
              ) : (
                <><Save size={15} aria-hidden="true" /> Lưu hồ sơ sức khoẻ</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { profileData, updateProfile, loading, error } = useProfileData();
  const { budget, updateBudgetData } = useBudgetData();
  const { replaceUser, currentUser } = useAuth();
  const { user, stats } = profileData;
  const avatarPreviewUrlRef = useRef("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [profileMeta, setProfileMeta] = useState(readProfileMeta);
  const [profileForm, setProfileForm] = useState(() => createProfileForm(user, readProfileMeta()));

  const { settings, saveSettings } = useSettingsData();
  const [settingsState, setSettingsState] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { healthProfile, saveHealthProfile, isSaving: isSavingHealth, saveSuccess: saveHealthSuccess } = useHealthProfile();

  useEffect(() => {
    if (settings) {
      queueMicrotask(() => { setSettingsState(settings); });
    }
  }, [settings]);

  function handleSettingsChange(key, value) {
    setSettingsState((current) => ({ ...current, [key]: value }));
    setSaveSuccess(false);
  }

  async function handleSaveSettings() {
    if (!settingsState) return;
    setIsSavingSettings(true);
    const res = await saveSettings(settingsState);
    if (res.success) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
    setIsSavingSettings(false);
  }

  function clearAvatarPreview() {
    if (!avatarPreviewUrlRef.current) return;
    URL.revokeObjectURL(avatarPreviewUrlRef.current);
    avatarPreviewUrlRef.current = "";
  }

  function resetProfileForm(nextUser = user, nextProfileMeta = profileMeta) {
    setProfileForm(createProfileForm(nextUser, nextProfileMeta));
  }

  useEffect(() => () => { clearAvatarPreview(); }, []);

  const settingsGoal = settings?.goal ?? null;
  const tags = useMemo(() => {
    if (!settingsGoal) return [];
    return settingsGoal.split(",").map((g) => {
      const trimmed = g.trim();
      return onboardingGoalMap[trimmed] || trimmed;
    }).filter(Boolean);
  }, [settingsGoal]);

  function handleProfileFieldChange(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    clearAvatarPreview();
    const objectUrl = URL.createObjectURL(file);
    avatarPreviewUrlRef.current = objectUrl;
    setProfileForm((current) => ({ ...current, avatarUrl: objectUrl, avatarFile: file }));
  }

  function handleOpenEditModal() { resetProfileForm(user, profileMeta); setIsEditOpen(true); }

  function handleCloseEditModal() {
    clearAvatarPreview();
    resetProfileForm(user, profileMeta);
    setIsEditOpen(false);
  }

  async function handleSaveProfile(event) {
    event.preventDefault();
    const result = await updateProfile({ fullName: profileForm.fullName, avatarUrl: profileForm.avatarUrl, avatarFile: profileForm.avatarFile });
    if (result.error) return;
    const nextProfileMeta = normalizeProfileMeta(profileForm);
    const nextProfile = result.data;
    clearAvatarPreview();
    setProfileMeta(nextProfileMeta);
    persistProfileMeta(nextProfileMeta);
    resetProfileForm(nextProfile.user, nextProfileMeta);
    replaceUser({ ...(currentUser ?? {}), fullName: nextProfile.user.fullName, email: nextProfile.user.email, avatarUrl: nextProfile.user.avatarUrl });
    setIsEditOpen(false);
  }

  return (
    <AppShell pageLabel="Hồ sơ">
      {isEditOpen && (
        <EditProfileModal profileForm={profileForm} onChange={handleProfileFieldChange} onAvatarChange={handleAvatarChange} onClose={handleCloseEditModal} onSubmit={handleSaveProfile} />
      )}
      {isBudgetEditOpen && (
        <EditBudgetModal budget={budget} onClose={() => setIsBudgetEditOpen(false)} onSubmit={updateBudgetData} />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white xl:text-4xl">Hồ sơ</h1>
        {(loading || error) && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {loading ? "Đang tải hồ sơ..." : error}
          </p>
        )}
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="overflow-hidden rounded-[1.6rem] bg-emerald-100 shadow-lg dark:bg-emerald-950">
              <img src={user.avatarUrl} alt={user.fullName} className="h-24 w-24 object-cover sm:h-28 sm:w-28" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{user.fullName}</h2>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Tham gia {formatJoinedDate(user.createdAt)} • {profileMeta.headline}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => <Tag key={tag} text={tag} />)}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleOpenEditModal}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40">
              <Pencil size={17} aria-hidden="true" /> Sửa hồ sơ
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:max-w-xs">
          <div className="relative">
            <MiniInfoCard icon={<Wallet size={18} />} label="Ngân sách hiện tại" value={formatMoney(budget?.amount ?? stats.currentBudget)} />
            <button type="button" onClick={() => setIsBudgetEditOpen(true)} title="Chỉnh sửa ngân sách"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-emerald-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700">
              <Pencil size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Health & Safety Section */}
      <section className="mt-6">
        <HealthProfileSection
          healthProfile={healthProfile}
          saveHealthProfile={saveHealthProfile}
          isSaving={isSavingHealth}
          saveSuccess={saveHealthSuccess}
        />
      </section>

      {/* Health & Finance Settings */}
      <section className="mt-6">
        <SettingsCard title="Hồ sơ Sức khỏe & Tài chính" icon={<Heart size={18} className="text-rose-500" />}>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-1">
                <Sparkles size={16} className="text-emerald-500" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Phân tích cá nhân hóa bởi AI</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI sẽ dựa vào các thông số dưới đây để phân tích thể chất, dinh dưỡng và đưa ra gợi ý kế hoạch ăn uống, chi tiêu phù hợp nhất cho bạn.
              </p>
            </div>
            {settingsState && (
              <>
                <SettingsInput label="Giới tính" type="select" value={settingsState.gender} onChange={(val) => handleSettingsChange("gender", val)}
                  options={[{ label: "Chọn giới tính", value: "" }, { label: "Nam", value: "MALE" }, { label: "Nữ", value: "FEMALE" }, { label: "Khác", value: "OTHER" }]} />
                <SettingsInput label="Tuổi" type="number" placeholder="Ví dụ: 25" value={settingsState.age} onChange={(val) => handleSettingsChange("age", val)} />
                <div className="grid grid-cols-2 gap-3">
                  <SettingsInput label="Chiều cao" type="number" placeholder="170" suffix="cm" value={settingsState.height} onChange={(val) => handleSettingsChange("height", val)} />
                  <SettingsInput label="Cân nặng" type="number" placeholder="65" suffix="kg" value={settingsState.weight} onChange={(val) => handleSettingsChange("weight", val)} />
                </div>
                <SettingsInput label="Mức độ vận động" type="select" value={settingsState.activityLevel} onChange={(val) => handleSettingsChange("activityLevel", val)}
                  options={[{ label: "Ít vận động (văn phòng)", value: "SEDENTARY" }, { label: "Nhẹ nhàng (1-3 ngày/tuần)", value: "LIGHTLY_ACTIVE" }, { label: "Vừa phải (3-5 ngày/tuần)", value: "MODERATELY_ACTIVE" }, { label: "Tích cực (6-7 ngày/tuần)", value: "VERY_ACTIVE" }]} />
                <SettingsInput label="Chế độ ăn kiêng" type="text" placeholder="Ví dụ: Bình thường, Chay, Keto, Low-carb..." value={settingsState.diet} onChange={(val) => handleSettingsChange("diet", val)} />
                <SettingsInput label="Mục tiêu sử dụng" type="text" placeholder="Ví dụ: Giảm cân, Giữ dáng, Tiết kiệm tiền..." value={settingsState.goal} onChange={(val) => handleSettingsChange("goal", val)} />
                <SettingsInput label="Ngân sách chi tiêu tháng" type="number" placeholder="Ví dụ: 5000000" suffix="VND" value={settingsState.monthlyBudget} onChange={(val) => handleSettingsChange("monthlyBudget", val)} />

                <button type="button" onClick={handleSaveSettings} disabled={isSavingSettings}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50">
                  {isSavingSettings ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
                  {isSavingSettings ? "Đang lưu..." : saveSuccess ? "✓ Đã lưu thành công!" : "Lưu thông số sức khỏe & tài chính"}
                </button>
              </>
            )}
          </div>
        </SettingsCard>
      </section>
    </AppShell>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EditProfileModal({ profileForm, onChange, onAvatarChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] dark:bg-slate-950/60 sm:items-center sm:justify-center sm:p-4">
      <button type="button" aria-label="Đóng sửa hồ sơ" className="absolute inset-0 cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sửa hồ sơ</h2>
          <button type="button" onClick={onClose} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-[1.4rem] bg-emerald-100 shadow-md dark:bg-emerald-950">
                <img src={profileForm.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              </div>
              <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700" title="Đổi ảnh đại diện">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            </div>
          </div>
          <Field label="Tên hiển thị">
            <input type="text" name="fullName" value={profileForm.fullName} onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={profileForm.email} disabled readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400" />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Email hiện được quản lý từ tài khoản đăng nhập, chưa hỗ trợ chỉnh sửa tại đây.</p>
          </Field>
          <Field label="Dòng mô tả">
            <input type="text" name="headline" value={profileForm.headline} onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" />
          </Field>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">Hủy</button>
            <button type="submit" disabled={!profileForm.fullName.trim()} className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300">Lưu hồ sơ</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function Tag({ text }) {
  return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">{text}</span>;
}

function MiniInfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <div className="text-emerald-600 dark:text-emerald-400">{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function SettingsCard({ id, title, icon, children }) {
  return (
    <div id={id} className="scroll-mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">{icon}</div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function SettingsInput({ label, type = "text", value, onChange, options, suffix, placeholder }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
        <div className="relative w-full sm:max-w-[220px]">
          {type === "select" ? (
            <select value={value} onChange={(event) => onChange(event.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-8 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500">
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : (
            <div className="relative flex items-center">
              <input type={type} value={value || ""} placeholder={placeholder} onChange={(event) => onChange(event.target.value)}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 ${suffix ? "pr-12" : ""}`} />
              {suffix && <span className="absolute right-3 text-xs font-semibold text-slate-400">{suffix}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditBudgetModal({ budget, onClose, onSubmit }) {
  const [amount, setAmount] = useState(budget?.amount || 0);
  const [period, setPeriod] = useState(budget?.period || "MONTHLY");
  const [warningThreshold, setWarningThreshold] = useState(budget?.warningThresholdPercent || 80);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0) { setError("Số tiền ngân sách phải lớn hơn 0"); return; }
    setIsSaving(true);
    try {
      const today = new Date();
      const startDate = today.toISOString().slice(0, 10);
      const end = new Date(today);
      if (period === "WEEKLY") end.setDate(today.getDate() + 6);
      if (period === "MONTHLY") end.setMonth(today.getMonth() + 1, 0);
      await onSubmit({ amount: Number(amount), warningThresholdPercent: Number(warningThreshold), period, startDate, endDate: period === "DAILY" ? startDate : end.toISOString().slice(0, 10), currency: budget?.currency || "VND", active: true });
      onClose();
    } catch (err) {
      setError(err.message || "Không thể lưu ngân sách");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] dark:bg-slate-950/60 sm:items-center sm:justify-center sm:p-4">
      <button type="button" aria-label="Đóng sửa ngân sách" className="absolute inset-0 cursor-pointer" onClick={onClose} />
      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{budget?.id ? "Sửa ngân sách hiện tại" : "Tạo ngân sách mới"}</h2>
          <button type="button" onClick={onClose} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Kỳ ngân sách</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
              <option value="DAILY">Theo ngày</option>
              <option value="WEEKLY">Theo tuần</option>
              <option value="MONTHLY">Theo tháng</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Số tiền (VND)</span>
            <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" placeholder="Ví dụ: 5000000" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Ngưỡng cảnh báo (%)</span>
            <input type="number" min="1" max="100" value={warningThreshold} onChange={(e) => setWarningThreshold(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" placeholder="Ví dụ: 80" />
          </label>
          {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">Hủy</button>
            <button type="submit" disabled={isSaving} className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50">
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
