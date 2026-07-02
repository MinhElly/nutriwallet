import {
  Bell,
  Bot,
  Check,
  Lock,
  Moon,
  Palette,
  Save,
  Sun,
  UserRound,
  Heart,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { useTheme } from "../../hooks/useTheme";
import { useSettingsData } from "../../hooks/useSettingsData";
import { useProfileData } from "../../hooks/useProfileData";
import { useAuth } from "../../hooks/useAuth";

function formatSavedTime(date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const location = useLocation();
  const { settings, loading, error, saveSettings } = useSettingsData();
  const { profileData, refetchProfile, linkAccount, unlinkAccount } =
    useProfileData();
  const { currentUser } = useAuth();

  const [linkCode, setLinkCode] = useState("");
  const [linkError, setLinkError] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const handleLinkMessenger = async () => {
    if (!linkCode.trim()) {
      setLinkError("Vui lòng nhập mã liên kết.");
      return;
    }
    setLinkError("");
    setIsLinking(true);
    const res = await linkAccount(linkCode.trim());
    setIsLinking(false);
    if (res.error) {
      setLinkError(res.error);
    } else {
      setLinkCode("");
      alert("Liên kết tài khoản Messenger thành công!");
    }
  };

  const handleUnlinkMessenger = async () => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn hủy liên kết tài khoản Messenger không?",
      )
    ) {
      setIsLinking(true);
      const res = await unlinkAccount();
      setIsLinking(false);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Hủy liên kết tài khoản Messenger thành công!");
      }
    }
  };

  const [settingsState, setSettingsState] = useState(null);
  const [savedSettingsState, setSavedSettingsState] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (settings) {
      const timer = setTimeout(() => {
        setSettingsState(settings);
        setSavedSettingsState(settings);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  useEffect(() => {
    if (location.hash !== "#messenger-chatbot" || !settingsState) {
      return;
    }

    const timer = window.setTimeout(() => {
      const target = document.getElementById("messenger-chatbot");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [location.hash, settingsState]);

  const hasUnsavedChanges = (() => {
    if (!settingsState || !savedSettingsState) return false;
    const settingsSnapshot = { ...settingsState };
    const savedSnapshot = { ...savedSettingsState };
    delete settingsSnapshot.theme;
    delete savedSnapshot.theme;
    return JSON.stringify(settingsSnapshot) !== JSON.stringify(savedSnapshot);
  })();

  function handleChange(key, value) {
    setSettingsState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  // Đổi theme ngay lập tức (không cần nhấn Lưu)
  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    setSettingsState((curr) => ({ ...curr, theme: newTheme }));
    setSavedSettingsState((curr) => ({ ...curr, theme: newTheme }));
  }

  async function handleSaveSettings() {
    if (!settingsState) return;
    setIsSaving(true);
    const res = await saveSettings(settingsState);
    if (res.success) {
      setSavedSettingsState(settingsState);
      setLastSavedAt(new Date());
      if (refetchProfile) {
        refetchProfile();
      }
    }
    setIsSaving(false);
  }

  if (loading && !settingsState) {
    return (
      <AppShell pageLabel="Cài đặt">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Đang tải cài đặt...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageLabel="Cài đặt">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold xl:text-4xl text-slate-950 dark:text-white">
            Cài đặt hệ thống
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {!hasUnsavedChanges && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Đã lưu lúc {formatSavedTime(lastSavedAt)}
            </p>
          )}

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || isSaving}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : hasUnsavedChanges ? (
              <Save size={18} />
            ) : (
              <Check size={18} />
            )}
            {isSaving
              ? "Đang lưu..."
              : hasUnsavedChanges
                ? "Lưu cấu hình"
                : "Đã lưu"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      )}

      {settingsState && (
        <>
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser?.avatarUrl || profileData?.user?.avatarUrl}
                  alt={currentUser?.fullName || profileData?.user?.fullName}
                  className="h-20 w-20 rounded-[1.5rem] object-cover shadow-sm"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                      {settingsState.display_name}
                    </h2>
                    <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300">
                      {profileData?.user?.role || "USER"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {profileData?.user?.email}{" "}
                    {profileData?.chatbotProfile
                      ? `• ${profileData.chatbotProfile.platform}`
                      : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <ProfilePill text="Email đã xác minh" />
                    {profileData?.chatbotProfile && (
                      <ProfilePill text="Messenger đã kết nối" />
                    )}
                    <ProfilePill
                      text={`Provider ${profileData?.user?.provider || "LOCAL"}`}
                    />
                  </div>
                </div>
              </div>

              {profileData?.chatbotProfile && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  PSID: {profileData.chatbotProfile.psid}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Health & Finance Profile Settings Card */}
            <SettingsCard
              title="Hồ sơ Sức khỏe & Tài chính"
              icon={<Heart size={18} className="text-rose-500" />}
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-1">
                    <Sparkles size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Phân tích cá nhân hóa bởi AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    AI sẽ dựa vào các thông số dưới đây để phân tích thể chất,
                    dinh dưỡng và đưa ra gợi ý kế hoạch ăn uống, chi tiêu phù
                    hợp nhất cho bạn.
                  </p>
                </div>

                <SettingsInput
                  label="Giới tính"
                  type="select"
                  value={settingsState.gender}
                  onChange={(val) => handleChange("gender", val)}
                  options={[
                    { label: "Chọn giới tính", value: "" },
                    { label: "Nam", value: "MALE" },
                    { label: "Nữ", value: "FEMALE" },
                    { label: "Khác", value: "OTHER" },
                  ]}
                />

                <SettingsInput
                  label="Tuổi"
                  type="number"
                  placeholder="Ví dụ: 25"
                  value={settingsState.age}
                  onChange={(val) => handleChange("age", val)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <SettingsInput
                    label="Chiều cao"
                    type="number"
                    placeholder="170"
                    suffix="cm"
                    value={settingsState.height}
                    onChange={(val) => handleChange("height", val)}
                  />
                  <SettingsInput
                    label="Cân nặng"
                    type="number"
                    placeholder="65"
                    suffix="kg"
                    value={settingsState.weight}
                    onChange={(val) => handleChange("weight", val)}
                  />
                </div>

                <SettingsInput
                  label="Mức độ vận động"
                  type="select"
                  value={settingsState.activityLevel}
                  onChange={(val) => handleChange("activityLevel", val)}
                  options={[
                    { label: "Ít vận động (văn phòng)", value: "SEDENTARY" },
                    {
                      label: "Nhẹ nhàng (1-3 ngày/tuần)",
                      value: "LIGHTLY_ACTIVE",
                    },
                    {
                      label: "Vừa phải (3-5 ngày/tuần)",
                      value: "MODERATELY_ACTIVE",
                    },
                    { label: "Tích cực (6-7 ngày/tuần)", value: "VERY_ACTIVE" },
                  ]}
                />

                <SettingsInput
                  label="Chế độ ăn kiêng"
                  type="text"
                  placeholder="Ví dụ: Bình thường, Chay, Keto, Low-carb..."
                  value={settingsState.diet}
                  onChange={(val) => handleChange("diet", val)}
                />

                <SettingsInput
                  label="Mục tiêu sử dụng"
                  type="text"
                  placeholder="Ví dụ: Giảm cân, Giữ dáng, Tiết kiệm tiền..."
                  value={settingsState.goal}
                  onChange={(val) => handleChange("goal", val)}
                />

                <SettingsInput
                  label="Ngân sách chi tiêu tháng"
                  type="number"
                  placeholder="Ví dụ: 5000000"
                  suffix="VND"
                  value={settingsState.monthlyBudget}
                  onChange={(val) => handleChange("monthlyBudget", val)}
                />
              </div>
            </SettingsCard>

            {/* Other System Settings */}
            <div className="space-y-6">
              <SettingsCard title="Tài khoản" icon={<UserRound size={18} />}>
                <div className="space-y-3">
                  <SettingsInput
                    label="Tên hiển thị"
                    type="text"
                    value={settingsState.display_name}
                    onChange={(val) => handleChange("display_name", val)}
                  />
                  <SettingsInput
                    label="Ngôn ngữ"
                    type="select"
                    value={settingsState.language}
                    onChange={(val) => handleChange("language", val)}
                    options={[
                      { label: "Tiếng Việt", value: "vi" },
                      { label: "English", value: "en" },
                    ]}
                  />
                </div>
              </SettingsCard>

              {/* Theme Settings Card */}
              <SettingsCard
                title="Giao diện & Chủ đề"
                icon={<Palette size={18} />}
              >
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Chế độ giao diện
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleThemeChange("light")}
                        className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                          theme === "light"
                            ? "border-amber-500 bg-amber-50/60 text-amber-900 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-300"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Sun size={18} className="text-amber-500" />
                        Giao diện Sáng
                      </button>
                      <button
                        type="button"
                        onClick={() => handleThemeChange("dark")}
                        className={`flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                          theme === "dark"
                            ? "border-emerald-500 bg-emerald-50/60 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Moon size={18} className="text-emerald-400" />
                        Giao diện Tối
                      </button>
                    </div>
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard title="Thông báo" icon={<Bell size={18} />}>
                <div className="space-y-3">
                  <ToggleRow
                    label="Email khi AI phân tích xong"
                    value={settingsState.email_analysis_ready}
                    onToggle={() =>
                      handleChange(
                        "email_analysis_ready",
                        !settingsState.email_analysis_ready,
                      )
                    }
                  />
                  <ToggleRow
                    label="Cảnh báo khi gần vượt ngân sách"
                    value={settingsState.budget_warning_push}
                    onToggle={() =>
                      handleChange(
                        "budget_warning_push",
                        !settingsState.budget_warning_push,
                      )
                    }
                  />
                </div>
              </SettingsCard>

              <SettingsCard title="Tự động hóa" icon={<Bot size={18} />}>
                <div className="space-y-3">
                  <ToggleRow
                    label="Tự tạo khoản chi từ bữa ăn"
                    value={settingsState.auto_create_expense}
                    onToggle={() =>
                      handleChange(
                        "auto_create_expense",
                        !settingsState.auto_create_expense,
                      )
                    }
                  />
                </div>
              </SettingsCard>

              <SettingsCard
                id="messenger-chatbot"
                title="Bảo mật và kết nối"
                icon={<Lock size={18} />}
              >
                <div className="space-y-3">
                  <ReadOnlyRow label="Email" value={profileData?.user?.email} />
                  <ReadOnlyRow
                    label="Trạng thái email"
                    value={
                      profileData?.emailVerification?.verifiedAt
                        ? "Đã xác minh"
                        : "Đã xác minh"
                    }
                  />
                  {profileData?.chatbotProfile ? (
                    <div className="space-y-3">
                      <ReadOnlyRow
                        label="Nền tảng Chatbot"
                        value={profileData.chatbotProfile.platform}
                      />
                      <ReadOnlyRow label="Trạng thái" value="Đã liên kết" />
                      <button
                        type="button"
                        onClick={handleUnlinkMessenger}
                        disabled={isLinking}
                        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        Hủy liên kết Messenger
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-emerald-50/30 p-4 dark:border-slate-800 dark:bg-emerald-950/10">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <MessageCircle size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Messenger Chatbot
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Kết nối với chatbot của chúng tôi trên Messenger để có
                        thể theo dõi nhanh thực đơn ăn uống của bạn qua hình
                        ảnh.
                      </p>

                      <div className="mt-4 space-y-2">
                        <input
                          type="text"
                          placeholder="Nhập mã liên kết (ví dụ: NW-ABCXYZ)"
                          value={linkCode}
                          onChange={(e) => setLinkCode(e.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                        />
                        {linkError && (
                          <p className="text-[10px] font-semibold text-red-500">
                            {linkError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleLinkMessenger}
                          disabled={isLinking}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-500 disabled:opacity-50"
                        >
                          Xác nhận liên kết
                        </button>
                      </div>

                      <div className="relative my-3 flex items-center justify-center">
                        <span className="absolute bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-900">
                          hoặc
                        </span>
                        <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                      </div>

                      <a
                        href={`https://www.facebook.com/messages/t/${import.meta.env.VITE_MESSENGER_PAGE_ID || "951984884671043"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <MessageCircle size={14} />
                        Nhắn tin cho Chatbot
                      </a>
                    </div>
                  )}
                </div>
              </SettingsCard>
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function ProfilePill({ text }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
      {text}
    </span>
  );
}

function SettingsCard({ id, title, icon, children }) {
  return (
    <div
      id={id}
      className="scroll-mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white">
          {title}
        </h2>
      </div>

      {children}
    </div>
  );
}

function SettingsInput({
  label,
  type = "text",
  value,
  onChange,
  options,
  suffix,
  placeholder,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </p>

        <div className="relative w-full sm:max-w-[220px]">
          {type === "select" ? (
            <select
              value={value}
              onChange={(event) => onChange(event.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-8 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative flex items-center">
              <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 ${
                  suffix ? "pr-12" : ""
                }`}
              />
              {suffix && (
                <span className="absolute right-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                  {suffix}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </p>

      <button
        type="button"
        onClick={onToggle}
        className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full border transition-colors ${
          value
            ? "border-slate-950 bg-slate-950 dark:border-emerald-500 dark:bg-emerald-600"
            : "border-slate-300 bg-slate-200 dark:border-slate-700 dark:bg-slate-800"
        }`}
      >
        <span
          className={`absolute h-6 w-6 rounded-full bg-white transition-transform ${
            value ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function ReadOnlyRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {value || "N/A"}
      </p>
    </div>
  );
}
