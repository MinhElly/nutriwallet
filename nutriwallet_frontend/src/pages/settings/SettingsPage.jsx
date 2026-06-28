import {
  Bell,
  Bot,
  Check,
  Lock,
  Save,
  Settings2,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import {
  applySettingsState,
  profileData,
  settingsData,
} from "../../data/accountData";

function getInitialSettingsMap() {
  const settingsMap = settingsData.sections.reduce((result, section) => {
    section.items.forEach((item) => {
      if (item.key === "default_model" || item.key === "warning_threshold_percent") {
        return;
      }

      result[item.key] = item.value;
    });

    return result;
  }, {});

  const autoLinkSetting = settingsData.systemSettings.find(
    (item) => item.settingKey === "messenger.auto_link_guest_session",
  );

  settingsMap.messenger_auto_link_guest_session =
    autoLinkSetting?.settingValue === "true";

  return settingsMap;
}

function formatSavedTime(date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SettingsPage() {
  const initialSettings = useMemo(() => getInitialSettingsMap(), []);
  const [settingsState, setSettingsState] = useState(initialSettings);
  const [savedSettingsState, setSavedSettingsState] = useState(initialSettings);
  const [lastSavedAt, setLastSavedAt] = useState(new Date());

  const hasUnsavedChanges =
    JSON.stringify(settingsState) !== JSON.stringify(savedSettingsState);

  function handleChange(key, value) {
    setSettingsState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSaveSettings() {
    applySettingsState(settingsState);
    setSavedSettingsState(settingsState);
    setLastSavedAt(new Date());
  }

  const accountFields = [
    {
      key: "display_name",
      label: "Tên hiển thị",
      type: "text",
    },
    {
      key: "language",
      label: "Ngôn ngữ",
      type: "select",
      options: [
        { label: "Tiếng Việt", value: "vi" },
        { label: "English", value: "en" },
      ],
    },
    {
      key: "currency",
      label: "Tiền tệ",
      type: "text",
    },
  ];

  const notificationFields = [
    {
      key: "email_analysis_ready",
      label: "Email khi AI phân tích xong",
    },
    {
      key: "budget_warning_push",
      label: "Cảnh báo khi gần vượt ngân sách",
    },
  ];

  const automationFields = [
    {
      key: "auto_create_expense",
      label: "Tự tạo khoản chi từ bữa ăn",
    },
    {
      key: "messenger_auto_link_guest_session",
      label: "Tự liên kết guest session",
    },
  ];

  return (
    <AppShell pageLabel="Cài đặt">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold xl:text-4xl">Cài đặt hệ thống</h1>
        </div>

        <div className="flex items-center gap-3">
          {!hasUnsavedChanges && (
            <p className="text-sm font-medium text-slate-500">
              Đã lưu lúc {formatSavedTime(lastSavedAt)}
            </p>
          )}

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-500"
          >
            {hasUnsavedChanges ? <Save size={18} /> : <Check size={18} />}
            {hasUnsavedChanges ? "Lưu cấu hình" : "Đã lưu"}
          </button>
        </div>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={profileData.user.avatarUrl}
              alt={profileData.user.fullName}
              className="h-20 w-20 rounded-[1.5rem] object-cover shadow-sm"
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  {profileData.user.fullName}
                </h2>
                <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                  {profileData.user.role}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {profileData.user.email} • {profileData.chatbotProfile.platform}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <ProfilePill text="Email đã xác minh" />
                <ProfilePill text="Messenger đã kết nối" />
                <ProfilePill text={`Provider ${profileData.user.provider}`} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
            PSID: {profileData.chatbotProfile.psid}
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SettingsCard title="Tài khoản" icon={<UserRound size={18} />}>
          <div className="space-y-3">
            {accountFields.map((field) => (
              <InputField
                key={field.key}
                field={field}
                value={settingsState[field.key]}
                onChange={handleChange}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Thông báo" icon={<Bell size={18} />}>
          <div className="space-y-3">
            {notificationFields.map((field) => (
              <ToggleRow
                key={field.key}
                label={field.label}
                value={settingsState[field.key]}
                onToggle={() => handleChange(field.key, !settingsState[field.key])}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Tự động hóa" icon={<Bot size={18} />}>
          <div className="space-y-3">
            {automationFields.map((field) => (
              <ToggleRow
                key={field.key}
                label={field.label}
                value={settingsState[field.key]}
                onToggle={() => handleChange(field.key, !settingsState[field.key])}
              />
            ))}
          </div>
        </SettingsCard>

        <SettingsCard title="Bảo mật và kết nối" icon={<Lock size={18} />}>
          <div className="space-y-3">
            <ReadOnlyRow label="Email" value={profileData.user.email} />
            <ReadOnlyRow
              label="Trạng thái email"
              value={profileData.emailVerification.verifiedAt ? "Đã xác minh" : "Chưa xác minh"}
            />
            <ReadOnlyRow label="Nền tảng" value={profileData.chatbotProfile.platform} />
            <ReadOnlyRow
              label="Guest session code"
              value={profileData.chatbotProfile.guestSessionCode}
            />
          </div>
        </SettingsCard>
      </section>
    </AppShell>
  );
}

function ProfilePill({ text }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {text}
    </span>
  );
}

function SettingsCard({ title, icon, children }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      </div>

      {children}
    </div>
  );
}

function InputField({ field, value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-900">{field.label}</p>

        <div className="w-full sm:max-w-[220px]">
          {field.type === "select" ? (
            <select
              value={value}
              onChange={(event) => onChange(field.key, event.target.value)}
              className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950"
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(field.key, event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-slate-950"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>

      <button
        type="button"
        onClick={onToggle}
        className={`relative flex h-8 w-14 cursor-pointer items-center rounded-full border transition-colors ${
          value
            ? "border-slate-950 bg-slate-950"
            : "border-slate-300 bg-slate-200"
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
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
