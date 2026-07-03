import { Pencil, Wallet, X, Heart, Sparkles, Save } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import AppShell from "../../components/layout/AppShell";
import { useProfileData } from "../../hooks/useProfileData";
import { useAuth } from "../../hooks/useAuth";
import { useBudgetData } from "../../hooks/useBudgetData";
import { useSettingsData } from "../../hooks/useSettingsData";

const PROFILE_META_STORAGE_KEY = "nw_profile_meta";
const defaultProfileMeta = {
  headline: "Người dùng sức khỏe",
};

function readProfileMeta() {
  if (typeof window === "undefined") {
    return { ...defaultProfileMeta };
  }

  try {
    const rawValue = window.localStorage.getItem(PROFILE_META_STORAGE_KEY);

    if (!rawValue) {
      return { ...defaultProfileMeta };
    }

    const parsedValue = JSON.parse(rawValue);

    return {
      headline: parsedValue?.headline?.trim() || defaultProfileMeta.headline,
    };
  } catch {
    return { ...defaultProfileMeta };
  }
}

function persistProfileMeta(profileMeta) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PROFILE_META_STORAGE_KEY,
    JSON.stringify(profileMeta),
  );
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
  return {
    headline: profileForm.headline.trim() || defaultProfileMeta.headline,
  };
}

function formatMoney(value) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function formatJoinedDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric",
  });
}

const onboardingGoalMap = {
  lose_weight: "Giảm cân",
  gain_muscle: "Tăng cơ bắp",
  maintain: "Duy trì cân nặng",
  healthy: "Ăn uống lành mạnh",
  save_money: "Tiết kiệm chi phí",
  track_all: "Theo dõi tổng thể",
};

export default function ProfilePage() {
  const { profileData, updateProfile, loading, error } = useProfileData();
  const { budget, updateBudgetData } = useBudgetData();
  const { replaceUser, currentUser } = useAuth();
  const { user, stats } = profileData;
  const avatarPreviewUrlRef = useRef("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [profileMeta, setProfileMeta] = useState(readProfileMeta);
  const [profileForm, setProfileForm] = useState(() =>
    createProfileForm(user, readProfileMeta()),
  );

  const {
    settings,
    saveSettings,
  } = useSettingsData();
  const [settingsState, setSettingsState] = useState(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      queueMicrotask(() => {
        setSettingsState(settings);
      });
    }
  }, [settings]);

  function handleSettingsChange(key, value) {
    setSettingsState((current) => ({
      ...current,
      [key]: value,
    }));
    setSaveSuccess(false);
  }

  async function handleSaveSettings() {
    if (!settingsState) return;
    setIsSavingSettings(true);
    const res = await saveSettings(settingsState);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSavingSettings(false);
  }

  function clearAvatarPreview() {
    if (!avatarPreviewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(avatarPreviewUrlRef.current);
    avatarPreviewUrlRef.current = "";
  }

  function resetProfileForm(nextUser = user, nextProfileMeta = profileMeta) {
    setProfileForm(createProfileForm(nextUser, nextProfileMeta));
  }

  useEffect(
    () => () => {
      clearAvatarPreview();
    },
    [],
  );

  const settingsGoal = settings?.goal ?? null;
  const tags = useMemo(() => {
    if (!settingsGoal) return [];
    return settingsGoal
      .split(",")
      .map((g) => {
        const trimmed = g.trim();
        return onboardingGoalMap[trimmed] || trimmed;
      })
      .filter(Boolean);
  }, [settingsGoal]);

  function handleProfileFieldChange(event) {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    clearAvatarPreview();

    const objectUrl = URL.createObjectURL(file);
    avatarPreviewUrlRef.current = objectUrl;

    setProfileForm((current) => ({
      ...current,
      avatarUrl: objectUrl,
      avatarFile: file,
    }));
  }

  function handleOpenEditModal() {
    resetProfileForm(user, profileMeta);
    setIsEditOpen(true);
  }

  function handleCloseEditModal() {
    clearAvatarPreview();
    resetProfileForm(user, profileMeta);
    setIsEditOpen(false);
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    const result = await updateProfile({
      fullName: profileForm.fullName,
      avatarUrl: profileForm.avatarUrl,
      avatarFile: profileForm.avatarFile,
    });

    if (result.error) {
      return;
    }

    const nextProfileMeta = normalizeProfileMeta(profileForm);
    const nextProfile = result.data;

    clearAvatarPreview();
    setProfileMeta(nextProfileMeta);
    persistProfileMeta(nextProfileMeta);
    resetProfileForm(nextProfile.user, nextProfileMeta);
    replaceUser({
      ...(currentUser ?? {}),
      fullName: nextProfile.user.fullName,
      email: nextProfile.user.email,
      avatarUrl: nextProfile.user.avatarUrl,
    });
    setIsEditOpen(false);
  }

  return (
    <AppShell pageLabel="Hồ sơ">
      {isEditOpen && (
        <EditProfileModal
          profileForm={profileForm}
          onChange={handleProfileFieldChange}
          onAvatarChange={handleAvatarChange}
          onClose={handleCloseEditModal}
          onSubmit={handleSaveProfile}
        />
      )}

      {isBudgetEditOpen && (
        <EditBudgetModal
          budget={budget}
          onClose={() => setIsBudgetEditOpen(false)}
          onSubmit={updateBudgetData}
        />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white xl:text-4xl">
          Hồ sơ
        </h1>
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
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="h-24 w-24 object-cover sm:h-28 sm:w-28"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {user.fullName}
                </h2>
              </div>

              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Tham gia {formatJoinedDate(user.createdAt)} •{" "}
                {profileMeta.headline}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Tag key={tag} text={tag} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <Pencil size={17} />
              Sửa hồ sơ
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:max-w-xs">
          <div className="relative">
            <MiniInfoCard
              icon={<Wallet size={18} />}
              label="Ngân sách hiện tại"
              value={formatMoney(budget?.amount ?? stats.currentBudget)}
            />
            <button
              type="button"
              onClick={() => setIsBudgetEditOpen(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-emerald-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Chỉnh sửa ngân sách"
            >
              <Pencil size={14} />
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6">
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
                AI sẽ dựa vào các thông số dưới đây để phân tích thể chất, dinh
                dưỡng và đưa ra gợi ý kế hoạch ăn uống, chi tiêu phù hợp nhất
                cho bạn.
              </p>
            </div>

            {settingsState && (
              <>
                <SettingsInput
                  label="Giới tính"
                  type="select"
                  value={settingsState.gender}
                  onChange={(val) => handleSettingsChange("gender", val)}
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
                  onChange={(val) => handleSettingsChange("age", val)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <SettingsInput
                    label="Chiều cao"
                    type="number"
                    placeholder="170"
                    suffix="cm"
                    value={settingsState.height}
                    onChange={(val) => handleSettingsChange("height", val)}
                  />
                  <SettingsInput
                    label="Cân nặng"
                    type="number"
                    placeholder="65"
                    suffix="kg"
                    value={settingsState.weight}
                    onChange={(val) => handleSettingsChange("weight", val)}
                  />
                </div>

                <SettingsInput
                  label="Mức độ vận động"
                  type="select"
                  value={settingsState.activityLevel}
                  onChange={(val) => handleSettingsChange("activityLevel", val)}
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
                  onChange={(val) => handleSettingsChange("diet", val)}
                />

                <SettingsInput
                  label="Mục tiêu sử dụng"
                  type="text"
                  placeholder="Ví dụ: Giảm cân, Giữ dáng, Tiết kiệm tiền..."
                  value={settingsState.goal}
                  onChange={(val) => handleSettingsChange("goal", val)}
                />

                <SettingsInput
                  label="Ngân sách chi tiêu tháng"
                  type="number"
                  placeholder="Ví dụ: 5000000"
                  suffix="VND"
                  value={settingsState.monthlyBudget}
                  onChange={(val) => handleSettingsChange("monthlyBudget", val)}
                />

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSavingSettings ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save size={18} />
                  )}
                  {isSavingSettings
                    ? "Đang lưu..."
                    : saveSuccess
                      ? "Đã lưu thành công!"
                      : "Lưu thông số sức khỏe & tài chính"}
                </button>
              </>
            )}
          </div>
        </SettingsCard>
      </section>
    </AppShell>
  );
}

function EditProfileModal({
  profileForm,
  onChange,
  onAvatarChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] dark:bg-slate-950/60 sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng sửa hồ sơ"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Sửa hồ sơ
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-[1.4rem] bg-emerald-100 shadow-md dark:bg-emerald-950">
                <img
                  src={profileForm.avatarUrl}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700"
                title="Đổi ảnh đại diện"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
          </div>

          <Field label="Tên hiển thị">
            <input
              type="text"
              name="fullName"
              value={profileForm.fullName}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              name="email"
              value={profileForm.email}
              disabled
              readOnly
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Email hiện được quản lý từ tài khoản đăng nhập, chưa hỗ trợ chỉnh
              sửa tại đây.
            </p>
          </Field>

          <Field label="Dòng mô tả">
            <input
              type="text"
              name="headline"
              value={profileForm.headline}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </Field>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!profileForm.fullName.trim()}
              className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              Lưu hồ sơ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function Tag({ text }) {
  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
      {text}
    </span>
  );
}

function MiniInfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <div className="text-emerald-600 dark:text-emerald-400">{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
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
                value={value || ""}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
                className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500 ${
                  suffix ? "pr-12" : ""
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditBudgetModal({ budget, onClose, onSubmit }) {
  const [amount, setAmount] = useState(budget?.amount || 0);
  const [warningThreshold, setWarningThreshold] = useState(budget?.warningThresholdPercent || 80);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Số tiền ngân sách phải lớn hơn 0");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit({
        amount: Number(amount),
        warningThresholdPercent: Number(warningThreshold),
        period: "MONTHLY",
        startDate: budget?.startDate || new Date().toISOString().slice(0, 10),
        endDate: budget?.endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
        currency: budget?.currency || "VND",
        active: true,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Không thể lưu ngân sách");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] dark:bg-slate-950/60 sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng sửa ngân sách"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {budget?.id ? "Sửa ngân sách hiện tại" : "Tạo ngân sách mới"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Số tiền (VND)
            </span>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ví dụ: 5000000"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Ngưỡng cảnh báo (%)
            </span>
            <input
              type="number"
              min="1"
              max="100"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Ví dụ: 80"
            />
          </label>

          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-emerald-300"
            >
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
