import { BadgeCheck, CalendarClock, Pencil, Share2, Wallet, X } from "lucide-react";
import { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { applyProfileDataUpdates, profileData } from "../../data/accountData";

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

  function handleSaveProfile(event) {
    event.preventDefault();
    applyProfileDataUpdates({
      fullName: profileForm.fullName,
      email: profileForm.email,
    });
    setIsEditOpen(false);
  }

  return (
    <AppShell pageLabel="Hồ sơ">
      {isEditOpen && (
        <EditProfileModal
          profileForm={profileForm}
          onChange={handleProfileFieldChange}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleSaveProfile}
        />
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold xl:text-4xl">Hồ sơ</h1>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="overflow-hidden rounded-[1.6rem] bg-emerald-100 shadow-lg shadow-slate-200/70">
              <img
                src={user.avatarUrl}
                alt={profileForm.fullName}
                className="h-24 w-24 object-cover sm:h-28 sm:w-28"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  {profileForm.fullName}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <BadgeCheck size={14} />
                  Thành viên Pro
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-slate-500">
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
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              <Pencil size={17} />
              Sửa hồ sơ
            </button>

            <button
              type="button"
              onClick={handleShareProfile}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700"
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

function EditProfileModal({ profileForm, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-0 backdrop-blur-[1px] sm:items-center sm:justify-center sm:p-4">
      <button
        type="button"
        aria-label="Đóng sửa hồ sơ"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 w-full rounded-t-[28px] bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900">Sửa hồ sơ</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="Tên hiển thị">
            <input
              type="text"
              name="fullName"
              value={profileForm.fullName}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
            />
          </Field>

          <Field label="Dòng mô tả">
            <input
              type="text"
              name="headline"
              value={profileForm.headline}
              onChange={onChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Tag 1">
              <input
                type="text"
                name="interestOne"
                value={profileForm.interestOne}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
              />
            </Field>

            <Field label="Tag 2">
              <input
                type="text"
                name="interestTwo"
                value={profileForm.interestTwo}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
              />
            </Field>

            <Field label="Tag 3">
              <input
                type="text"
                name="interestThree"
                value={profileForm.interestThree}
                onChange={onChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500"
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
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
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Tag({ text }) {
  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      {text}
    </span>
  );
}

function MiniInfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-500">
        <div className="text-emerald-600">{icon}</div>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoCard({ title, items }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>

      <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="text-sm font-bold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
