import { BadgeCheck, CalendarClock, Pencil, Share2, Wallet, X } from "lucide-react";
import { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { useProfileData } from "../../hooks/useProfileData";
import { useAuth } from "../../hooks/useAuth";

function formatDateTime(dateValue) {
  return new Date(dateValue).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

export default function ProfilePage() {
  const { profileData, updateProfile } = useProfileData();
  const { replaceUser, currentUser } = useAuth();
  const { user, stats } = profileData;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState("Chia sẻ");
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName,
    email: user.email,
    headline: "Người dùng sức khỏe",
    interestOne: "Kiểm soát chi tiêu",
    interestTwo: "Ăn uống khoa học",
    interestThree: "Đã liên kết Messenger",
    avatarUrl: user.avatarUrl,
  });

  const tags = [
    profileForm.interestOne,
    profileForm.interestTwo,
    profileForm.interestThree,
  ].filter(Boolean);

  async function handleShareProfile() {
    const shareText = `${profileForm.fullName}\n${profileForm.email}\n${profileForm.headline}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Hồ sơ ${profileForm.fullName}`,
          text: shareText,
        });
        setShareLabel("Đã chia sẻ");
        window.setTimeout(() => setShareLabel("Chia sẻ"), 2000);
        return;
      }

      await navigator.clipboard.writeText(shareText);
      setShareLabel("Đã sao chép");
      window.setTimeout(() => setShareLabel("Chia sẻ"), 2000);
    } catch {
      setShareLabel("Chưa chia sẻ");
      window.setTimeout(() => setShareLabel("Chia sẻ"), 2000);
    }
  }

  function handleProfileFieldChange(event) {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleAvatarChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setProfileForm((current) => ({ ...current, avatarUrl: objectUrl }));
  }

  function handleSaveProfile(event) {
    event.preventDefault();
    updateProfile({
      fullName: profileForm.fullName,
      email: profileForm.email,
      avatarUrl: profileForm.avatarUrl,
    });
    replaceUser({
      ...currentUser,
      fullName: profileForm.fullName,
      email: profileForm.email,
      avatarUrl: profileForm.avatarUrl,
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
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleSaveProfile}
        />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold xl:text-4xl text-slate-950 dark:text-white">Hồ sơ</h1>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="overflow-hidden rounded-[1.6rem] bg-emerald-100 shadow-lg dark:bg-emerald-950">
              <img
                src={profileForm.avatarUrl || user.avatarUrl}
                alt={profileForm.fullName}
                className="h-24 w-24 object-cover sm:h-28 sm:w-28"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {profileForm.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <BadgeCheck size={14} />
                  Thành viên Pro
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Tham gia {formatJoinedDate(user.createdAt)} • {profileForm.headline}
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
              onClick={() => setIsEditOpen(true)}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
            >
              <Pencil size={17} />
              Sửa hồ sơ
            </button>

            <button
              type="button"
              onClick={handleShareProfile}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Share2 size={17} />
              {shareLabel}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MiniInfoCard
            icon={<Wallet size={18} />}
            label="Ngân sách hiện tại"
            value={formatMoney(stats.currentBudget)}
          />
          <MiniInfoCard
            icon={<CalendarClock size={18} />}
            label="Ngày tham gia"
            value={stats.memberSince}
          />
        </div>
      </section>

      <section className="mt-6">
        <InfoCard
          title="Thông tin tài khoản"
          items={[
            { label: "ID người dùng", value: `#${user.id}` },
            { label: "Tên hiển thị", value: profileForm.fullName },
            { label: "Email", value: profileForm.email },
            { label: "Vai trò", value: user.role },
            { label: "Trạng thái", value: user.status },
            { label: "Phương thức đăng nhập", value: user.provider },
            { label: "Tạo lúc", value: formatDateTime(user.createdAt) },
            { label: "Cập nhật lần cuối", value: formatDateTime(user.updatedAt) },
          ]}
        />
      </section>
    </AppShell>
  );
}

function EditProfileModal({ profileForm, onChange, onAvatarChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] sm:items-center sm:justify-center sm:p-4 dark:bg-slate-950/60">
      <button
        type="button"
        aria-label="Đóng sửa hồ sơ"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6 dark:border dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sửa hồ sơ</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Avatar picker */}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Tag 1">
              <input
                type="text"
                name="interestOne"
                value={profileForm.interestOne}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>

            <Field label="Tag 2">
              <input
                type="text"
                name="interestTwo"
                value={profileForm.interestTwo}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>

            <Field label="Tag 3">
              <input
                type="text"
                name="interestThree"
                value={profileForm.interestThree}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
          </div>

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
              className="cursor-pointer rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
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
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
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
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>

      <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
