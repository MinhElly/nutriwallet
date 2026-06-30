import { CheckCircle, MailCheck, MessageCircle, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function AccountCard() {
  const { currentUser } = useAuth();
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <CheckCircle size={16} strokeWidth={1.9} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Tài khoản và xác minh
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm xl:grid-cols-3 xl:gap-0">
        <div className="flex items-center gap-3 xl:border-r xl:border-slate-200 xl:pr-5 dark:xl:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <MailCheck size={20} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
            <b className="mt-0.5 block truncate font-medium text-slate-900 dark:text-slate-200">
              {currentUser?.email ?? ""}
            </b>

            <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">Xác minh email lúc</p>
            <b className="mt-0.5 block font-medium text-slate-900 dark:text-slate-200">
              {currentUser?.emailVerifiedAt ?? ""}
            </b>
          </div>
        </div>

        <div className="flex items-center gap-3 xl:border-r xl:border-slate-200 xl:px-5 dark:xl:border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
            <MessageCircle size={20} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Nền tảng nhắn tin</p>
            <b className="mt-0.5 block font-medium text-slate-900 dark:text-slate-200">
              {currentUser?.messengerPlatform ?? "Messenger"}
            </b>

            <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400">Liên kết lúc</p>
            <b className="mt-0.5 block font-medium text-slate-900 dark:text-slate-200">
              {currentUser?.messengerLinkedAt ?? ""}
            </b>
          </div>
        </div>

        <div className="flex items-center gap-3 xl:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <User size={20} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">Vai trò</p>
            <b className="mt-0.5 block font-medium text-slate-900 dark:text-slate-200">
              {currentUser?.role ?? ""}
            </b>
          </div>
        </div>
      </div>
    </section>
  );
}
