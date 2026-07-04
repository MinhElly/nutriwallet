import { useState, useEffect } from "react";
import {
  Leaf, CheckCircle2, Flame, ArrowRight, ArrowLeft, Loader2,
  ShieldCheck, Plus, X, Info, CalendarCheck2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { calculateTDEE } from "../../utils/calculations";
import { saveOnboarding } from "../../services/profile.service";
import { useHealthProfile } from "../../hooks/useHealthProfile";
import api, { unwrapApiData } from "../../services/api";
import {
  calcNextEvaluationDate,
  MEDICAL_CONDITIONS,
  COMMON_ALLERGIES,
  USER_CLASSIFICATIONS,
  EVALUATION_SCHEDULES,
} from "../../services/health.service";
import NumberTicker from "../../components/common/NumberTicker";

// ─── Constants ───────────────────────────────────────────────────────────────

const GOALS = [
  { id: "lose_weight", icon: "🏃", title: "Giảm cân", desc: "Giảm mỡ, duy trì cơ bắp theo kế hoạch khoa học", selectedColor: "border-green-500 bg-green-50/50 ring-1 ring-green-500", checkColor: "text-green-600", checkFill: "fill-green-100" },
  { id: "gain_muscle", icon: "💪", title: "Tăng cơ bắp", desc: "Tăng protein, hỗ trợ lịch tập sức mạnh", selectedColor: "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500", checkColor: "text-blue-600", checkFill: "fill-blue-100" },
  { id: "maintain", icon: "⚖️", title: "Duy trì cân nặng", desc: "Cân bằng calories nạp vào và tiêu thụ mỗi ngày", selectedColor: "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500", checkColor: "text-amber-600", checkFill: "fill-amber-100" },
  { id: "healthy", icon: "🥗", title: "Ăn uống lành mạnh", desc: "Cải thiện chất lượng dinh dưỡng, tập thói quen", selectedColor: "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500", checkColor: "text-teal-600", checkFill: "fill-teal-100" },
  { id: "save_money", icon: "💰", title: "Tiết kiệm chi phí", desc: "Kiểm soát ngân sách ăn uống, tối ưu chi tiêu", selectedColor: "border-violet-500 bg-violet-50/50 ring-1 ring-violet-500", checkColor: "text-violet-600", checkFill: "fill-violet-100" },
  { id: "track_all", icon: "📊", title: "Theo dõi tổng thể", desc: "Nắm bắt toàn bộ dinh dưỡng và chi tiêu", selectedColor: "border-rose-500 bg-rose-50/50 ring-1 ring-rose-500", checkColor: "text-rose-600", checkFill: "fill-rose-100" },
];

const ACTIVITIES = [
  { id: "sedentary", icon: "🛋️", title: "Ít vận động", desc: "Ngồi nhiều, ít tập luyện", factor: 1.2 },
  { id: "light", icon: "🚶", title: "Nhẹ nhàng", desc: "Tập nhẹ 1–3 ngày/tuần", factor: 1.375 },
  { id: "moderate", icon: "🚴", title: "Vừa phải", desc: "Tập vừa 3–5 ngày/tuần", factor: 1.55 },
  { id: "active", icon: "🏃", title: "Tích cực", desc: "Tập mạnh 6–7 ngày/tuần", factor: 1.725 },
];

const DIETS = ["Không giới hạn", "Chay", "Low Carb", "High Protein", "Keto", "Không Gluten"];

const BUDGETS = [
  { id: "saving", icon: "🪙", title: "Tiết kiệm", desc: "< 50k / ngày" },
  { id: "normal", icon: "💵", title: "Bình thường", desc: "50k – 100k / ngày" },
  { id: "comfortable", icon: "💳", title: "Thoải mái", desc: "100k – 200k / ngày" },
  { id: "premium", icon: "💎", title: "Cao cấp", desc: "> 200k / ngày" },
  { id: "custom", icon: "💰", title: "Tùy chỉnh", desc: "Nhập theo nhu cầu" },
];

const NOTIFICATIONS = [
  { id: "meal_reminder", title: "📚 Nhắc ghi bữa ăn" },
  { id: "budget_alert", title: "🚨 Cảnh báo ngân sách" },
  { id: "ai_suggest", title: "🧠 AI gợi ý dinh dưỡng" },
  { id: "weekly_report", title: "📊 Báo cáo tiến độ tuần" },
];

const TOTAL_STEPS = 5;

// ─── Motion Variants ─────────────────────────────────────────────────────────

const stepVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
  exit: { opacity: 0, y: -14, transition: { duration: 0.15 } },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Chip bộ chọn nhiều lựa chọn */
function MultiSelectChip({ item, selected, onToggle, colorClass = "border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500" }) {
  const isSelected = selected;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onToggle(item.id)}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-sm cursor-pointer transition-all duration-150 ${
        isSelected ? `${colorClass} text-slate-900 font-medium` : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
      aria-pressed={isSelected}
      aria-label={item.label}
    >
      <span aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
      {isSelected && <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-100 ml-0.5" aria-hidden="true" />}
    </motion.button>
  );
}

/** Input thêm tag tự do */
function TagInput({ tags, onAdd, onRemove, placeholder, ariaLabel }) {
  const [inputVal, setInputVal] = useState("");

  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault();
      const val = inputVal.trim().replace(/,/g, "");
      if (val && !tags.includes(val)) {
        onAdd(val);
      }
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
    <div className="space-y-2.5">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2" role="list" aria-label={`Danh sách ${ariaLabel}`}>
          {tags.map((tag) => (
            <span
              key={tag}
              role="listitem"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-800 text-xs font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemove(tag)}
                className="text-orange-500 hover:text-orange-700 cursor-pointer"
                aria-label={`Xoá ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={() => {
            if (inputVal.trim() && !tags.includes(inputVal.trim())) {
              onAdd(inputVal.trim());
              setInputVal("");
            }
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium cursor-pointer hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          aria-label={`Thêm ${ariaLabel}`}
        >
          <Plus size={15} />
          Thêm
        </button>
      </div>
      <p className="text-[10px] text-slate-400">Nhấn <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-500">Enter</kbd> hoặc dấu phẩy để thêm</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { replaceUser, currentUser } = useAuth();
  const { saveHealthProfile } = useHealthProfile();

  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("nw_onboarding_step");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [maxStep, setMaxStep] = useState(() => {
    const saved = localStorage.getItem("nw_onboarding_maxStep");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("nw_onboarding_draft");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      selectedGoals: [],
      gender: "Nam",
      age: "25",
      height: "170",
      weight: "65",
      activity: ACTIVITIES[1].id,
      diet: DIETS[0],
      budget: BUDGETS[1].id,
      customBudgetRaw: "",
      selectedNotifs: ["meal_reminder", "budget_alert"],
      // Health data (step 4 & 5)
      medicalConditions: [],
      customCondition: "",
      allergies: [],
      restrictedFoods: [],
      healthConsentGiven: false,
      userClassification: null,
      evaluationScheduleId: "3_months",
    };
  });

  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    async function checkExistingSettings() {
      try {
        const settingsRes = await api.get("/api/settings/user");
        const settings = unwrapApiData(settingsRes);

        if (settings && settings.gender) {
          localStorage.setItem("nw_onboarding_completed", "true");
          replaceUser({ ...currentUser, onboardingCompleted: true });
          navigate("/dashboard");
          return;
        }
      } catch (err) {
        console.error("Error checking existing onboarding settings:", err);
      } finally {
        setCheckingOnboarding(false);
      }
    }
    checkExistingSettings();
  }, [currentUser, replaceUser, navigate]);

  // ─── Persistence ────────────────────────────────────────────────────────────

  useEffect(() => { localStorage.setItem("nw_onboarding_draft", JSON.stringify(formData)); }, [formData]);
  useEffect(() => { localStorage.setItem("nw_onboarding_step", step); }, [step]);

  if (checkingOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Đang tải cấu hình...</p>
        </div>
      </div>
    );
  }

  // ─── Step navigation ─────────────────────────────────────────────────────────

  const goToStep = (newStep) => {
    setStep(newStep);
    setMaxStep((prev) => {
      const newMax = Math.max(prev, newStep);
      localStorage.setItem("nw_onboarding_maxStep", newMax);
      return newMax;
    });
    setError(null);
  };

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors({});
    setError(null);
  };

  // ─── Validation per step ─────────────────────────────────────────────────────

  const validateStep = (s) => {
    const ageNum = Number(formData.age);
    const heightNum = Number(formData.height);
    const weightNum = Number(formData.weight);
    let errors = {};

    if (s === 2) {
      if (!ageNum || ageNum <= 0 || ageNum > 120) { errors.age = "Tuổi không hợp lệ (1-120)"; }
      if (!heightNum || heightNum < 50 || heightNum > 250) { errors.height = "Chiều cao không hợp lệ (50-250cm)"; }
      if (!weightNum || weightNum < 20 || weightNum > 300) { errors.weight = "Cân nặng không hợp lệ (20-300kg)"; }
    }
    if (s === 3 && formData.budget === "custom" && !formData.customBudgetRaw) {
      errors.customBudgetRaw = "Vui lòng nhập ngân sách tùy chỉnh";
    }
    if (s === 4 && !formData.healthConsentGiven) {
      errors.consent = "Bạn cần đồng ý để tiếp tục";
    }
    if (s === 5 && !formData.userClassification) {
      errors.classification = "Vui lòng chọn phân loại";
    }

    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setError(firstError);
      return;
    }
    if (step < TOTAL_STEPS) goToStep(step + 1);
  };

  const prevStep = () => { if (step > 1) goToStep(step - 1); };

  // ─── Toggle helpers ───────────────────────────────────────────────────────────

  const toggleGoal = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedGoals: prev.selectedGoals.includes(id)
        ? prev.selectedGoals.filter((g) => g !== id)
        : [...prev.selectedGoals, id],
    }));
  };

  const toggleNotif = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedNotifs: prev.selectedNotifs.includes(id)
        ? prev.selectedNotifs.filter((n) => n !== id)
        : [...prev.selectedNotifs, id],
    }));
  };

  const toggleCondition = (id) => {
    setFormData((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.includes(id)
        ? prev.medicalConditions.filter((c) => c !== id)
        : [...prev.medicalConditions, id],
    }));
  };

  const toggleAllergy = (id) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(id)
        ? prev.allergies.filter((a) => a !== id)
        : [...prev.allergies, id],
    }));
  };

  const addRestrictedFood = (food) => {
    setFormData((prev) => ({
      ...prev,
      restrictedFoods: [...prev.restrictedFoods, food],
    }));
  };

  const removeRestrictedFood = (food) => {
    setFormData((prev) => ({
      ...prev,
      restrictedFoods: prev.restrictedFoods.filter((f) => f !== food),
    }));
  };

  // ─── Budget helpers ───────────────────────────────────────────────────────────

  const handleCustomBudgetChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "") { updateForm("customBudgetRaw", ""); return; }
    const num = parseInt(val, 10);
    if (num <= 10000000) updateForm("customBudgetRaw", num.toString());
  };

  const getCustomBudgetDisplay = () => {
    if (!formData.customBudgetRaw) return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(formData.customBudgetRaw, 10));
  };

  const actFactor = ACTIVITIES.find((a) => a.id === formData.activity)?.factor || 1.2;
  const tdee = calculateTDEE(formData.gender, formData.age, formData.height, formData.weight, actFactor);

  // ─── Submit ───────────────────────────────────────────────────────────────────

  const handleFinish = async () => {
    const errors = validateStep(5);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // 1. Lưu settings chính
      const payload = { ...formData, tdee };
      const response = await saveOnboarding(payload);
      if (response?.user) {
        replaceUser({ ...currentUser, ...response.user });
      }

      // 2. Lưu health profile vào API
      const healthResult = await saveHealthProfile({
        medicalConditions: formData.medicalConditions,
        customCondition: formData.customCondition,
        allergies: formData.allergies,
        restrictedFoods: formData.restrictedFoods,
        healthConsentGiven: formData.healthConsentGiven,
        healthConsentDate: formData.healthConsentGiven ? new Date().toISOString() : null,
        userClassification: formData.userClassification,
        evaluationScheduleId: formData.evaluationScheduleId,
        nextEvaluationDate: calcNextEvaluationDate(formData.evaluationScheduleId),
      });

      if (!healthResult.success) {
        throw new Error(healthResult.error || "Không thể lưu hồ sơ sức khỏe.");
      }

      localStorage.setItem("nw_onboarding_completed", "true");
      localStorage.removeItem("nw_onboarding_draft");
      localStorage.removeItem("nw_onboarding_step");
      localStorage.removeItem("nw_onboarding_maxStep");
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Skip (bỏ qua toàn bộ) ──────────────────────────────────────────────────

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const payload = { ...formData, tdee };
      const response = await saveOnboarding(payload);
      if (response?.user) replaceUser({ ...currentUser, ...response.user });
      localStorage.setItem("nw_onboarding_completed", "true");
      localStorage.removeItem("nw_onboarding_draft");
      localStorage.removeItem("nw_onboarding_step");
      localStorage.removeItem("nw_onboarding_maxStep");
      navigate("/dashboard");
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Computed ─────────────────────────────────────────────────────────────────

  const isLastStep = step === TOTAL_STEPS;
  const evalSchedule = EVALUATION_SCHEDULES.find((s) => s.id === formData.evaluationScheduleId);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Leaf size={16} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "Psionic" }}>
            NutriWallet AI
          </span>
        </div>
        <button
          onClick={handleSkip}
          disabled={isSubmitting}
          className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
        >
          Bỏ qua
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-[880px] mx-auto px-4 py-8 sm:py-12 flex flex-col">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">
              Bước {step} / {TOTAL_STEPS}
            </span>
            <span className="text-[11px] font-medium text-slate-300 tracking-wide">
              {Math.round((step / TOTAL_STEPS) * 100)}%
            </span>
          </div>
          <div className="flex gap-2 h-1.5 mb-4">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((i) => (
              <button
                key={i}
                disabled={i > maxStep}
                onClick={() => i <= maxStep && goToStep(i)}
                aria-label={`Đến bước ${i}`}
                className={`flex-1 rounded-full transition-colors duration-500 ${
                  i <= step ? "bg-emerald-500" : "bg-slate-200"
                } ${i <= maxStep ? "cursor-pointer hover:bg-emerald-400" : "opacity-50 cursor-default"}`}
              />
            ))}
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 mb-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2"
                role="alert"
              >
                <span className="text-lg" aria-hidden="true">⚠️</span> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Steps */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Mục tiêu ─────────────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="space-y-4 pb-2">
                  <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Mục tiêu của bạn là gì?</h1>
                  <p className="text-slate-500 text-base max-w-xl leading-relaxed font-light">AI sẽ cá nhân hóa toàn bộ trải nghiệm theo mục tiêu bạn chọn. Có thể chọn nhiều mục tiêu.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="group" aria-label="Chọn mục tiêu">
                  {GOALS.map((goal) => {
                    const isSelected = formData.selectedGoals.includes(goal.id);
                    return (
                      <motion.button
                        key={goal.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleGoal(goal.id)}
                        aria-pressed={isSelected}
                        className={`relative p-5 rounded-3xl text-left cursor-pointer transition-all duration-200 border ${
                          isSelected ? `${goal.selectedColor} shadow-sm` : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-2xl mb-3" aria-hidden="true">{goal.icon}</div>
                        <h3 className="font-medium text-slate-900 text-lg tracking-[-0.02em] mb-1">{goal.title}</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">{goal.desc}</p>
                        {isSelected && (
                          <div className={`absolute top-5 right-5 ${goal.checkColor}`} aria-hidden="true">
                            <CheckCircle2 size={20} className={goal.checkFill} />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Thông tin cơ thể ────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="space-y-4 pb-2">
                  <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Thông tin cơ thể</h1>
                  <p className="text-slate-500 text-base font-light max-w-xl leading-relaxed">AI tính toán nhu cầu calories cá nhân hoá dựa trên các chỉ số của bạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,320px)] gap-6 items-start">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2" id="gender-label">Giới tính</label>
                        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1" role="group" aria-labelledby="gender-label">
                          {["Nam", "Nữ"].map((g) => (
                            <button key={g} onClick={() => updateForm("gender", g)} aria-pressed={formData.gender === g}
                              className={`flex-1 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all ${formData.gender === g ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="input-age" className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Tuổi</label>
                        <input id="input-age" type="number" value={formData.age} onChange={(e) => updateForm("age", e.target.value)} aria-describedby={fieldErrors.age ? "err-age" : undefined}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none font-medium transition-all text-sm ${fieldErrors.age ? "border-red-500 ring-1 ring-red-500 bg-red-50/30 text-red-700" : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"}`} />
                        {fieldErrors.age && <p id="err-age" className="mt-1 text-xs text-red-600">{fieldErrors.age}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="input-height" className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Chiều cao (cm)</label>
                        <input id="input-height" type="number" value={formData.height} onChange={(e) => updateForm("height", e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none font-medium transition-all text-sm ${fieldErrors.height ? "border-red-500 ring-1 ring-red-500 bg-red-50/30 text-red-700" : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"}`} />
                        {fieldErrors.height && <p className="mt-1 text-xs text-red-600">{fieldErrors.height}</p>}
                      </div>
                      <div>
                        <label htmlFor="input-weight" className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Cân nặng (kg)</label>
                        <input id="input-weight" type="number" value={formData.weight} onChange={(e) => updateForm("weight", e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none font-medium transition-all text-sm ${fieldErrors.weight ? "border-red-500 ring-1 ring-red-500 bg-red-50/30 text-red-700" : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"}`} />
                        {fieldErrors.weight && <p className="mt-1 text-xs text-red-600">{fieldErrors.weight}</p>}
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3" id="activity-label">Mức độ vận động</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-labelledby="activity-label">
                        {ACTIVITIES.map((act) => (
                          <motion.button key={act.id} whileTap={{ scale: 0.98 }} onClick={() => updateForm("activity", act.id)} aria-pressed={formData.activity === act.id}
                            className={`relative p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center ${formData.activity === act.id ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <div className="text-3xl mb-2" aria-hidden="true">{act.icon}</div>
                            <div className="font-medium text-slate-900 tracking-[-0.02em] text-xs mb-1">{act.title}</div>
                            <div className="text-[10px] font-light text-slate-500">{act.desc}</div>
                            {formData.activity === act.id && <div className="absolute top-2 right-2 text-emerald-600" aria-hidden="true"><CheckCircle2 size={16} className="fill-emerald-100" /></div>}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <label className="block text-[10px] font-medium text-emerald-600 uppercase tracking-widest mb-4" id="diet-label">Chế độ ăn ưu tiên</label>
                      <div className="flex flex-wrap gap-2.5" role="group" aria-labelledby="diet-label">
                        {DIETS.map((d) => (
                          <button key={d} onClick={() => updateForm("diet", d)} aria-pressed={formData.diet === d}
                            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${formData.diet === d ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0B1519] p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-row items-center justify-between" aria-label="Chỉ số TDEE ước tính">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-500 font-medium tracking-widest text-[10px] uppercase">AI Estimate</span>
                        </div>
                        <div className="text-4xl sm:text-5xl font-light tracking-[-0.04em] leading-none text-white mb-1 flex items-baseline">
                          <NumberTicker value={tdee} className="mr-2" />
                          <span className="text-base font-normal text-white/70 tracking-normal">kcal</span>
                        </div>
                        <div className="text-[11px] font-medium text-white/40 mt-2">TDEE Daily Energy Exp.</div>
                      </div>
                      <div className="relative z-10 flex-shrink-0">
                        <Flame size={48} className="text-emerald-500 opacity-80" strokeWidth={1.5} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Ngân sách & Thông báo ───────────────────────────── */}
            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="space-y-4 pb-2">
                  <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Ngân sách & Thông báo</h1>
                  <p className="text-slate-500 text-base font-light max-w-xl leading-relaxed">Cân đối chi tiêu và chọn các thông báo hữu ích cho hành trình của bạn.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,320px)] gap-6 items-start">
                  <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4" id="budget-label">Ngân sách ăn uống hằng ngày</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-labelledby="budget-label">
                        {BUDGETS.map((b) => (
                          <div key={b.id} className="flex flex-col">
                            <motion.button whileTap={{ scale: 0.98 }} onClick={() => updateForm("budget", b.id)} aria-pressed={formData.budget === b.id}
                              className={`w-full p-4 rounded-2xl border cursor-pointer text-left transition-all ${formData.budget === b.id ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                              <div className="text-2xl mb-2" aria-hidden="true">{b.icon}</div>
                              <div className="font-medium text-slate-900 tracking-[-0.02em] text-sm mb-0.5">{b.title}</div>
                              <div className="text-sm font-light text-slate-500">{b.desc}</div>
                            </motion.button>
                            <AnimatePresence>
                              {formData.budget === "custom" && b.id === "custom" && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 overflow-hidden">
                                  <div className="relative">
                                    <input type="text" value={getCustomBudgetDisplay()} onChange={handleCustomBudgetChange} placeholder="Ví dụ: 80.000" aria-label="Nhập ngân sách tùy chỉnh"
                                      className={`w-full bg-white border rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all ${fieldErrors.customBudgetRaw ? "border-red-500 ring-1 ring-red-500 bg-red-50/30 text-red-700" : "border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"}`} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium" aria-hidden="true">đ/ngày</span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4" id="notif-label">Nhận thông báo về</h3>
                      <div className="space-y-2.5" role="group" aria-labelledby="notif-label">
                        {NOTIFICATIONS.map((n) => {
                          const isSelected = formData.selectedNotifs.includes(n.id);
                          return (
                            <motion.button key={n.id} whileTap={{ scale: 0.99 }} onClick={() => toggleNotif(n.id)} aria-pressed={isSelected}
                              className={`w-full flex cursor-pointer items-center justify-between p-4 rounded-2xl border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                              <span className="font-medium text-sm tracking-tight text-slate-900">{n.title}</span>
                              {isSelected && <CheckCircle2 size={18} className="text-emerald-600" aria-hidden="true" />}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#0B1519] text-white p-6 sm:p-8 rounded-3xl shadow-lg h-fit" aria-label="Tóm tắt thiết lập">
                    <div className="flex items-center gap-2 mb-8">
                      <span className="text-white/40 font-medium tracking-widest text-[10px] uppercase">Tóm tắt thiết lập</span>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Mục tiêu</span>
                        <div className="font-normal text-sm text-white/90 leading-snug">
                          {formData.selectedGoals.length > 0 ? GOALS.filter((g) => formData.selectedGoals.includes(g.id)).map((g) => g.title).join(", ") : "Chưa chọn"}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Ngân sách</span>
                        <div className="font-normal text-sm text-white/90">
                          {formData.budget === "custom" ? (formData.customBudgetRaw ? `${getCustomBudgetDisplay()} đ/ngày` : "Chưa nhập") : BUDGETS.find((b) => b.id === formData.budget)?.title}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Calories mục tiêu</span>
                        <div className="font-light tracking-tight text-emerald-400 text-lg">{new Intl.NumberFormat("vi-VN").format(tdee)} kcal</div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Vận động</span>
                        <div className="font-normal text-sm text-white/90">{ACTIVITIES.find((a) => a.id === formData.activity)?.title}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Sức khoẻ & An toàn ─────────────────────────────── */}
            {step === 4 && (
              <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="space-y-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                      <ShieldCheck size={20} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Sức khoẻ & An toàn</h1>
                  </div>
                  <p className="text-slate-500 text-base font-light max-w-xl leading-relaxed">
                    Thông tin này giúp AI cảnh báo khi bạn gặp thực phẩm không phù hợp với sức khoẻ. Hoàn toàn bảo mật và bạn có thể bỏ qua.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bệnh nền */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium text-rose-500 uppercase tracking-widest mb-1" id="conditions-label">Bệnh nền</label>
                      <p className="text-xs text-slate-400">Chọn các bệnh lý bạn đang mắc phải (nếu có)</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5" role="group" aria-labelledby="conditions-label">
                      {MEDICAL_CONDITIONS.map((c) => (
                        <MultiSelectChip
                          key={c.id}
                          item={c}
                          selected={formData.medicalConditions.includes(c.id)}
                          onToggle={toggleCondition}
                          colorClass="border-rose-400 bg-rose-50/60 ring-1 ring-rose-400"
                        />
                      ))}
                    </div>
                    {formData.medicalConditions.includes("other") && (
                      <div>
                        <label htmlFor="custom-condition" className="block text-xs font-medium text-slate-500 mb-1.5">Mô tả bệnh nền khác</label>
                        <input
                          id="custom-condition"
                          type="text"
                          value={formData.customCondition}
                          onChange={(e) => updateForm("customCondition", e.target.value)}
                          placeholder="Ví dụ: Lupus, Parkinson..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dị ứng */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium text-amber-500 uppercase tracking-widest mb-1" id="allergies-label">Dị ứng thực phẩm</label>
                      <p className="text-xs text-slate-400">AI sẽ cảnh báo khi phát hiện thực phẩm bạn dị ứng</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5" role="group" aria-labelledby="allergies-label">
                      {COMMON_ALLERGIES.map((a) => (
                        <MultiSelectChip
                          key={a.id}
                          item={a}
                          selected={formData.allergies.includes(a.id)}
                          onToggle={toggleAllergy}
                          colorClass="border-amber-400 bg-amber-50/60 ring-1 ring-amber-400"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thực phẩm hạn chế */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <label className="block text-[10px] font-medium text-orange-500 uppercase tracking-widest mb-1">Thực phẩm hạn chế</label>
                      <p className="text-xs text-slate-400">Các thực phẩm bạn muốn tránh (theo sở thích hoặc chỉ định y tế)</p>
                    </div>
                    <TagInput
                      tags={formData.restrictedFoods}
                      onAdd={addRestrictedFood}
                      onRemove={removeRestrictedFood}
                      placeholder="Ví dụ: thịt đỏ, rượu bia, cà phê..."
                      ariaLabel="Thêm thực phẩm hạn chế"
                    />
                  </div>

                  {/* Consent PDPA */}
                  <div className={`p-6 rounded-3xl border-2 transition-all ${formData.healthConsentGiven ? "border-emerald-400 bg-emerald-50/40" : fieldErrors.consent ? "border-red-300 bg-red-50/30" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-start gap-4">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={formData.healthConsentGiven}
                        aria-required="true"
                        onClick={() => {
                          updateForm("healthConsentGiven", !formData.healthConsentGiven);
                          setFieldErrors((e) => ({ ...e, consent: undefined }));
                        }}
                        className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded-md border-2 cursor-pointer transition-all flex items-center justify-center ${
                          formData.healthConsentGiven ? "bg-emerald-600 border-emerald-600" : fieldErrors.consent ? "border-red-400" : "border-slate-300 hover:border-emerald-400"
                        }`}
                      >
                        {formData.healthConsentGiven && <CheckCircle2 size={12} className="text-white fill-white" />}
                      </button>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          Đồng ý chia sẻ thông tin sức khỏe <span className="text-rose-500">*</span>
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Tôi đồng ý để <strong>NutriWallet AI</strong> sử dụng thông tin sức khoẻ cá nhân nhằm cá nhân hoá gợi ý dinh dưỡng và cảnh báo an toàn thực phẩm. Thông tin được lưu trữ trên thiết bị của bạn và không chia sẻ với bên thứ ba.
                        </p>
                        {fieldErrors.consent && (
                          <p className="text-xs text-red-600 font-medium" role="alert">{fieldErrors.consent}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-sky-50 border border-sky-100">
                      <Info size={14} className="text-sky-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="text-[11px] text-sky-700 leading-relaxed">
                        Bạn có thể bỏ qua bước này và cập nhật thông tin sức khỏe sau trong phần Hồ sơ.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: Phân loại & Lịch đánh giá ──────────────────────── */}
            {step === 5 && (
              <motion.div key="step5" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8">
                <div className="space-y-4 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                      <CalendarCheck2 size={20} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Phân loại & Lịch đánh giá</h1>
                  </div>
                  <p className="text-slate-500 text-base font-light max-w-xl leading-relaxed">
                    Giúp AI tối ưu hoá gợi ý theo mức độ và nhắc bạn đánh giá lại định kỳ.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,340px)] gap-6 items-start">
                  <div className="space-y-6">
                    {/* User Classification */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <div>
                        <label className="block text-[10px] font-medium text-violet-500 uppercase tracking-widest mb-1" id="classification-label">Phân loại người dùng</label>
                        <p className="text-xs text-slate-400">Chọn nhóm phù hợp nhất với bạn</p>
                      </div>
                      <div className="space-y-3" role="group" aria-labelledby="classification-label">
                        {USER_CLASSIFICATIONS.map((cls) => {
                          const isSelected = formData.userClassification === cls.id;
                          return (
                            <motion.button
                              key={cls.id}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => { updateForm("userClassification", cls.id); setFieldErrors((e) => ({ ...e, classification: undefined })); }}
                              aria-pressed={isSelected}
                              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer text-left transition-all ${
                                isSelected ? `${cls.color} shadow-sm` : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                              }`}
                            >
                              <div className="text-3xl flex-shrink-0" aria-hidden="true">{cls.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 text-sm mb-0.5">{cls.label}</div>
                                <div className="text-xs text-slate-500 font-light">{cls.desc}</div>
                              </div>
                              {isSelected && <CheckCircle2 size={20} className="text-emerald-600 fill-emerald-100 flex-shrink-0" aria-hidden="true" />}
                            </motion.button>
                          );
                        })}
                      </div>
                      {fieldErrors.classification && (
                        <p className="text-xs text-red-600 font-medium" role="alert">{fieldErrors.classification}</p>
                      )}
                    </div>

                    {/* Evaluation Schedule */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <div>
                        <label className="block text-[10px] font-medium text-teal-500 uppercase tracking-widest mb-1" id="schedule-label">Lịch đánh giá định kỳ</label>
                        <p className="text-xs text-slate-400">NutriWallet sẽ nhắc bạn cập nhật thông số sức khỏe sau</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-labelledby="schedule-label">
                        {EVALUATION_SCHEDULES.map((s) => {
                          const isSelected = formData.evaluationScheduleId === s.id;
                          return (
                            <motion.button key={s.id} whileTap={{ scale: 0.97 }} onClick={() => updateForm("evaluationScheduleId", s.id)} aria-pressed={isSelected}
                              className={`p-4 rounded-2xl border-2 cursor-pointer text-center transition-all ${isSelected ? "border-teal-400 bg-teal-50/60 ring-1 ring-teal-400 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                              <div className="text-2xl mb-2" aria-hidden="true">{s.icon}</div>
                              <div className={`font-semibold text-sm mb-0.5 ${isSelected ? "text-teal-700" : "text-slate-900"}`}>{s.label}</div>
                              <div className="text-[10px] text-slate-400">{s.desc}</div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Final Summary Card */}
                  <div className="bg-[#0B1519] text-white p-6 sm:p-8 rounded-3xl shadow-lg sticky top-24" aria-label="Tóm tắt toàn bộ thiết lập">
                    <div className="mb-6">
                      <span className="text-white/40 font-medium tracking-widest text-[10px] uppercase">Tóm tắt hành trình</span>
                    </div>
                    <div className="space-y-5">
                      <SummaryRow label="Mục tiêu" value={formData.selectedGoals.length > 0 ? GOALS.filter((g) => formData.selectedGoals.includes(g.id)).map((g) => g.title).join(", ") : "Chưa chọn"} />
                      <SummaryRow label="Calories / ngày" value={`${new Intl.NumberFormat("vi-VN").format(tdee)} kcal`} accent />
                      <SummaryRow label="Ngân sách" value={formData.budget === "custom" ? (formData.customBudgetRaw ? `${getCustomBudgetDisplay()} đ/ngày` : "Tùy chỉnh") : BUDGETS.find((b) => b.id === formData.budget)?.title} />
                      <SummaryRow label="Bệnh nền" value={formData.medicalConditions.length > 0 ? `${formData.medicalConditions.length} bệnh lý` : "Không có"} />
                      <SummaryRow label="Dị ứng" value={formData.allergies.length > 0 ? `${formData.allergies.length} loại` : "Không có"} />
                      <SummaryRow label="Thực phẩm hạn chế" value={formData.restrictedFoods.length > 0 ? formData.restrictedFoods.join(", ") : "Không có"} />
                      <SummaryRow
                        label="Phân loại"
                        value={formData.userClassification ? USER_CLASSIFICATIONS.find((c) => c.id === formData.userClassification)?.label : "Chưa chọn"}
                      />
                      <SummaryRow label="Đánh giá mỗi" value={evalSchedule?.label ?? "3 tháng"} />
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${formData.healthConsentGiven ? "bg-emerald-400" : "bg-slate-600"}`} aria-hidden="true" />
                          <span className="text-[11px] text-white/50">
                            {formData.healthConsentGiven ? "Đã đồng ý chia sẻ dữ liệu sức khỏe" : "Chưa đồng ý chia sẻ dữ liệu sức khỏe"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            onClick={prevStep}
            className={`px-5 py-3 cursor-pointer rounded-2xl font-medium text-sm transition-all flex items-center gap-2 ${
              step === 1 ? "opacity-0 pointer-events-none" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-label="Quay lại bước trước"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Quay lại
          </button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={isLastStep ? handleFinish : nextStep}
            disabled={isSubmitting}
            className={`px-8 py-3.5 cursor-pointer rounded-2xl font-medium text-sm bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all flex items-center gap-2 ${isSubmitting ? "opacity-70 pointer-events-none" : ""}`}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : null}
            {isSubmitting ? "Đang lưu..." : isLastStep ? "🚀 Bắt đầu hành trình" : "Tiếp tục"}
            {!isSubmitting && !isLastStep && <ArrowRight size={16} strokeWidth={2.5} aria-hidden="true" />}
          </motion.button>
        </div>
      </main>
    </div>
  );
}

// ─── Helper component ─────────────────────────────────────────────────────────

function SummaryRow({ label, value, accent = false }) {
  return (
    <div className="space-y-1">
      <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">{label}</span>
      <div className={`font-normal text-sm leading-snug ${accent ? "text-emerald-400 font-light text-lg tracking-tight" : "text-white/90"}`}>
        {value || "—"}
      </div>
    </div>
  );
}
