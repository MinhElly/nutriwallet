import { CheckCircle, MailCheck, MessageCircle, User } from "lucide-react";
import { userInfo } from "../../data/dashboardData";

export default function AccountCard() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 xl:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle size={16} strokeWidth={1.9} />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Tài khoản và xác minh
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm xl:grid-cols-3 xl:gap-0">
        <div className="flex items-center gap-3 xl:border-r xl:border-slate-200 xl:pr-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <MailCheck size={20} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">Email</p>
            <b className="mt-0.5 block truncate font-medium text-slate-900">
              {userInfo.email}
            </b>

            <p className="mt-2.5 text-sm text-slate-500">Xác minh email lúc</p>
            <b className="mt-0.5 block font-medium text-slate-900">
              {userInfo.emailVerifiedAt}
            </b>
          </div>
        </div>

        <div className="flex items-center gap-3 xl:border-r xl:border-slate-200 xl:px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
            <MessageCircle size={20} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">Nền tảng nhắn tin</p>
            <b className="mt-0.5 block font-medium text-slate-900">
              {userInfo.messengerPlatform}
            </b>

            <p className="mt-2.5 text-sm text-slate-500">Liên kết lúc</p>
            <b className="mt-0.5 block font-medium text-slate-900">
              {userInfo.messengerLinkedAt}
            </b>
          </div>
        </div>

        <div className="flex items-center gap-3 xl:pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <User size={20} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-500">Vai trò</p>
            <b className="mt-0.5 block font-medium text-slate-900">
              {userInfo.role}
            </b>
          </div>
        </div>
      </div>
    </section>
  );
}
