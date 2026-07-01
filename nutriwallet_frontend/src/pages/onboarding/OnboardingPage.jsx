import { useState, useEffect } from "react";
import { Leaf, CheckCircle2, Flame, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../hooks/useAuth";
import { calculateTDEE } from "../../utils/calculations";
import { saveOnboarding } from "../../services/profile.service";
import NumberTicker from "../../components/common/NumberTicker";

// Constants
const GOALS = [
  {
    id: "lose_weight",
    icon: "🏃",
    title: "Giảm cân",
    desc: "Giảm mỡ, duy trì cơ bắp theo kế hoạch khoa học",
    selectedColor: "border-green-500 bg-green-50/50 ring-1 ring-green-500",
    checkColor: "text-green-600",
    checkFill: "fill-green-100",
  },
  {
    id: "gain_muscle",
    icon: "💪",
    title: "Tăng cơ bắp",
    desc: "Tăng protein, hỗ trợ lịch tập sức mạnh",
    selectedColor: "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500",
    checkColor: "text-blue-600",
    checkFill: "fill-blue-100",
  },
  {
    id: "maintain",
    icon: "⚖️",
    title: "Duy trì cân nặng",
    desc: "Cân bằng calories nạp vào và tiêu thụ mỗi ngày",
    selectedColor: "border-amber-500 bg-amber-50/50 ring-1 ring-amber-500",
    checkColor: "text-amber-600",
    checkFill: "fill-amber-100",
  },
  {
    id: "healthy",
    icon: "🥗",
    title: "Ăn uống lành mạnh",
    desc: "Cải thiện chất lượng dinh dưỡng, tập thói quen",
    selectedColor: "border-teal-500 bg-teal-50/50 ring-1 ring-teal-500",
    checkColor: "text-teal-600",
    checkFill: "fill-teal-100",
  },
  {
    id: "save_money",
    icon: "💰",
    title: "Tiết kiệm chi phí",
    desc: "Kiểm soát ngân sách ăn uống, tối ưu chi tiêu",
    selectedColor: "border-violet-500 bg-violet-50/50 ring-1 ring-violet-500",
    checkColor: "text-violet-600",
    checkFill: "fill-violet-100",
  },
  {
    id: "track_all",
    icon: "📊",
    title: "Theo dõi tổng thể",
    desc: "Nắm bắt toàn bộ dinh dưỡng và chi tiêu",
    selectedColor: "border-rose-500 bg-rose-50/50 ring-1 ring-rose-500",
    checkColor: "text-rose-600",
    checkFill: "fill-rose-100",
  },
];

const ACTIVITIES = [
  { id: "sedentary", icon: "🛋️", title: "Ít vận động", desc: "Ngồi nhiều, ít tập luyện", factor: 1.2 },
  { id: "light", icon: "🚶", title: "Nhẹ nhàng", desc: "Tập nhẹ 1–3 ngày/tuần", factor: 1.375 },
  { id: "moderate", icon: "🚴", title: "Vừa phải", desc: "Tập vừa 3–5 ngày/tuần", factor: 1.55 },
  { id: "active", icon: "🏃", title: "Tích cực", desc: "Tập mạnh 6–7 ngày/tuần", factor: 1.725 },
];

const DIETS = [
  "Không giới hạn",
  "Chay",
  "Low Carb",
  "High Protein",
  "Keto",
  "Không Gluten",
];

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

// Motion Variants
const stepVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 250, damping: 25 } 
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } }
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { replaceUser, currentUser } = useAuth();
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
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
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
      selectedNotifs: ["meal_reminder", "budget_alert"]
    };
  });

  // Lưu nháp tự động
  useEffect(() => {
    localStorage.setItem("nw_onboarding_draft", JSON.stringify(formData));
    setFieldErrors({}); // Reset error when user types
    setError(null);
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("nw_onboarding_step", step);
    setMaxStep(prev => {
      const newMax = Math.max(prev, step);
      localStorage.setItem("nw_onboarding_maxStep", newMax);
      return newMax;
    });
  }, [step]);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomBudgetChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "") {
      updateForm("customBudgetRaw", "");
      return;
    }
    const num = parseInt(val, 10);
    if (num <= 10000000) {
      updateForm("customBudgetRaw", num.toString());
    }
  };

  const getCustomBudgetDisplay = () => {
    if (!formData.customBudgetRaw) return "";
    return new Intl.NumberFormat("vi-VN").format(parseInt(formData.customBudgetRaw, 10));
  };

  const actFactor = ACTIVITIES.find((a) => a.id === formData.activity)?.factor || 1.2;
  const tdee = calculateTDEE(formData.gender, formData.age, formData.height, formData.weight, actFactor);

  const handleSkipOrFinish = async () => {
    // Validation
    const ageNum = Number(formData.age);
    const heightNum = Number(formData.height);
    const weightNum = Number(formData.weight);
    
    let errors = {};
    if (!ageNum || ageNum <= 0 || ageNum > 120) {
      errors.age = true;
      setError("Vui lòng nhập độ tuổi hợp lệ (1-120).");
      setStep(2);
    } else if (!heightNum || heightNum < 50 || heightNum > 250) {
      errors.height = true;
      setError("Vui lòng nhập chiều cao hợp lệ (50-250cm).");
      setStep(2);
    } else if (!weightNum || weightNum < 20 || weightNum > 300) {
      errors.weight = true;
      setError("Vui lòng nhập cân nặng hợp lệ (20-300kg).");
      setStep(2);
    } else if (formData.budget === "custom" && !formData.customBudgetRaw) {
      errors.customBudgetRaw = true;
      setError("Vui lòng nhập ngân sách tùy chỉnh.");
      setStep(3);
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const payload = { ...formData, tdee };
      const response = await saveOnboarding(payload);
      
      if (response && response.user) {
        // Cập nhật Auth Context
        replaceUser({
          ...currentUser,
          ...response.user,
        });
      }
      
      localStorage.setItem("nw_onboarding_completed", "true");
      localStorage.removeItem("nw_onboarding_draft");
      localStorage.removeItem("nw_onboarding_step");
      localStorage.removeItem("nw_onboarding_maxStep");
      navigate("/dashboard");
    } catch (err) {
      setError("Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleGoal = (id) => {
    setFormData((prev) => {
      const goals = prev.selectedGoals;
      return {
        ...prev,
        selectedGoals: goals.includes(id) ? goals.filter((g) => g !== id) : [...goals, id]
      };
    });
  };

  const toggleNotif = (id) => {
    setFormData((prev) => {
      const notifs = prev.selectedNotifs;
      return {
        ...prev,
        selectedNotifs: notifs.includes(id) ? notifs.filter((n) => n !== id) : [...notifs, id]
      };
    });
  };

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
          onClick={handleSkipOrFinish}
          className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Bỏ qua
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[860px] mx-auto px-4 py-8 sm:py-12 flex flex-col">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Bước {step} / 3</span>
          </div>
          <div className="flex gap-2 h-1.5 mb-4">
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                disabled={i > maxStep}
                onClick={() => setStep(i)}
                className={`flex-1 rounded-full transition-colors duration-500 ${
                  i <= step ? "bg-emerald-500" : "bg-slate-200"
                } ${i <= maxStep ? "cursor-pointer hover:bg-emerald-400" : "opacity-50"}`}
              />
            ))}
          </div>
          {error && (
            <div className="p-3 mb-2 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}
        </div>

        {/* Steps Container */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-4 pb-2">
                  <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Mục tiêu của bạn là gì?</h1>
                  <p className="text-slate-500 text-base max-w-xl leading-relaxed font-light">
                    AI sẽ cá nhân hóa toàn bộ trải nghiệm theo mục tiêu bạn chọn. Có thể chọn nhiều mục tiêu.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GOALS.map((goal) => {
                    const isSelected = formData.selectedGoals.includes(goal.id);
                    return (
                      <motion.button
                        key={goal.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleGoal(goal.id)}
                        className={`relative p-5 rounded-3xl text-left cursor-pointer transition-all duration-200 border ${
                          isSelected
                            ? `${goal.selectedColor} shadow-sm`
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="text-2xl mb-3">{goal.icon}</div>
                        <h3 className="font-medium text-slate-900 text-lg tracking-[-0.02em] mb-1">{goal.title}</h3>
                        <p className="text-sm text-slate-500 font-light leading-relaxed">{goal.desc}</p>
                        {isSelected && (
                          <div className={`absolute top-5 right-5 ${goal.checkColor}`}>
                            <CheckCircle2 size={20} className={goal.checkFill} />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-4 pb-2">
                  <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Thông tin cơ thể</h1>
                  <p className="text-slate-500 text-base font-light max-w-xl leading-relaxed">
                    AI tính toán nhu cầu calories cá nhân hoá dựa trên các chỉ số của bạn.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,320px)] gap-6 items-start">
                  {/* Left Column */}
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Giới tính</label>
                        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1">
                          {["Nam", "Nữ"].map((g) => (
                            <button
                              key={g}
                              onClick={() => updateForm("gender", g)}
                              className={`flex-1 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all ${
                                formData.gender === g ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Tuổi</label>
                        <input
                          type="number"
                          value={formData.age}
                          onChange={(e) => updateForm("age", e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none font-medium transition-all text-sm ${
                            fieldErrors.age 
                              ? "border-red-500 ring-1 ring-red-500 animate-shake bg-red-50/30 text-red-700" 
                              : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Chiều cao (cm)</label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => updateForm("height", e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none font-medium transition-all text-sm ${
                            fieldErrors.height 
                              ? "border-red-500 ring-1 ring-red-500 animate-shake bg-red-50/30 text-red-700" 
                              : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2">Cân nặng (kg)</label>
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) => updateForm("weight", e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 outline-none font-medium transition-all text-sm ${
                            fieldErrors.weight 
                              ? "border-red-500 ring-1 ring-red-500 animate-shake bg-red-50/30 text-red-700" 
                              : "border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-3">Mức độ vận động</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ACTIVITIES.map((act) => (
                          <motion.button
                            key={act.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateForm("activity", act.id)}
                            className={`relative p-3 rounded-2xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                              formData.activity === act.id
                                ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div className="text-3xl mb-2">{act.icon}</div>
                            <div className="font-medium text-slate-900 tracking-[-0.02em] text-xs mb-1">{act.title}</div>
                            <div className="text-[10px] font-light text-slate-500">{act.desc}</div>
                            {formData.activity === act.id && (
                              <div className="absolute top-2 right-2 text-emerald-600">
                                <CheckCircle2 size={16} className="fill-emerald-100" />
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <label className="block text-[10px] font-medium text-emerald-600 uppercase tracking-widest mb-4">Chế độ ăn ưu tiên</label>
                      <div className="flex flex-wrap gap-2.5">
                        {DIETS.map((d) => (
                          <button
                            key={d}
                            onClick={() => updateForm("diet", d)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all border ${
                              formData.diet === d
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0B1519] p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-row items-center justify-between">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-500 font-medium tracking-widest text-[10px] uppercase">AI Estimate</span>
                        </div>
                        <div className="text-4xl sm:text-5xl font-light tracking-[-0.04em] leading-none text-white mb-1 flex items-baseline">
                          <NumberTicker value={tdee} className="mr-2" /> 
                          <span className="text-base font-normal text-white/70 tracking-normal">kcal</span>
                        </div>
                        <div className="text-[11px] font-medium text-white/40 mt-2">
                          TDEE Daily Energy Exp.
                        </div>
                      </div>
                      <div className="relative z-10 flex-shrink-0">
                        <Flame size={48} className="text-emerald-500 opacity-80" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-4 pb-2">
                  <h1 className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-slate-900">Ngân sách & Thông báo</h1>
                  <p className="text-slate-500 text-base font-light max-w-xl leading-relaxed">
                    Cân đối chi tiêu và chọn các thông báo hữu ích cho hành trình của bạn.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,320px)] gap-6 items-start">
                  <div className="space-y-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4">Ngân sách ăn uống hằng ngày</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BUDGETS.map((b) => (
                          <div key={b.id} className="flex flex-col">
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateForm("budget", b.id)}
                              className={`w-full p-4 rounded-2xl border cursor-pointer text-left transition-all ${
                                formData.budget === b.id
                                  ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm"
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
                              }`}
                            >
                              <div className="text-2xl mb-2">{b.icon}</div>
                              <div className="font-medium text-slate-900 tracking-[-0.02em] text-sm mb-0.5">{b.title}</div>
                              <div className="text-sm font-light text-slate-500">{b.desc}</div>
                            </motion.button>

                            <AnimatePresence>
                              {formData.budget === "custom" && b.id === "custom" && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 overflow-hidden"
                                >
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={getCustomBudgetDisplay()}
                                      onChange={handleCustomBudgetChange}
                                      placeholder="Ví dụ: 80.000"
                                      className={`w-full bg-white border rounded-xl px-4 py-2.5 outline-none font-medium text-sm transition-all ${
                                        fieldErrors.customBudgetRaw 
                                          ? "border-red-500 ring-1 ring-red-500 animate-shake bg-red-50/30 text-red-700" 
                                          : "border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                      }`}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">đ/ngày</span>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                      <h3 className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-4">Nhận thông báo về</h3>
                      <div className="space-y-2.5">
                        {NOTIFICATIONS.map((n) => {
                          const isSelected = formData.selectedNotifs.includes(n.id);
                          return (
                            <motion.button
                              key={n.id}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => toggleNotif(n.id)}
                              className={`w-full flex cursor-pointer items-center justify-between p-4 rounded-2xl border transition-all ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <span className="font-medium text-sm tracking-tight text-slate-900">{n.title}</span>
                              {isSelected && <CheckCircle2 size={18} className="text-emerald-600" />}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#0B1519] text-white p-6 sm:p-8 rounded-3xl shadow-lg h-fit">
                    <div className="flex items-center gap-2 mb-8">
                      <span className="text-white/40 font-medium tracking-widest text-[10px] uppercase">Tóm tắt thiết lập</span>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Mục tiêu</span>
                        <div className="font-normal text-sm text-white/90 leading-snug">
                          {formData.selectedGoals.length > 0 
                            ? GOALS.filter(g => formData.selectedGoals.includes(g.id)).map(g => g.title).join(", ")
                            : "Chưa chọn"}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Ngân sách</span>
                        <div className="font-normal text-sm text-white/90">
                          {formData.budget === "custom" 
                            ? (formData.customBudgetRaw ? `${getCustomBudgetDisplay()} đ/ngày (Tùy chỉnh)` : "Chưa nhập (Tùy chỉnh)")
                            : BUDGETS.find(b => b.id === formData.budget)?.title}
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Calories mục tiêu</span>
                        <div className="font-light tracking-tight text-emerald-400 text-lg">
                          {new Intl.NumberFormat("vi-VN").format(tdee)} kcal
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Vận động</span>
                        <div className="font-normal text-sm text-white/90">{ACTIVITIES.find(a => a.id === formData.activity)?.title}</div>
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
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Quay lại
          </button>
          
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={step === 3 ? handleSkipOrFinish : nextStep}
            disabled={isSubmitting}
            className={`px-8 py-3.5 cursor-pointer rounded-2xl font-medium text-sm bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-emerald-600/30 transition-all flex items-center gap-2 ${isSubmitting ? "opacity-70 pointer-events-none" : ""}`}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              step === 3 ? "Bắt đầu hành trình" : "Tiếp tục"
            )}
            {!isSubmitting && step < 3 && <ArrowRight size={16} strokeWidth={2.5} />}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
