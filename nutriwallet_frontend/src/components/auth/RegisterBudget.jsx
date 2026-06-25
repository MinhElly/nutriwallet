import { useState } from "react";
import { Wallet, Check, PartyPopper, Sprout } from "lucide-react";

function RegisterBudget({ onBack }) {
  const [budgetType, setBudgetType] = useState("daily");

  return (
    <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-2">
      <section className="hidden text-center lg:block">
        <div className="mx-auto mb-8 flex h-[250px] w-[250px] items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shadow-[0_22px_60px_rgba(34,197,94,.16)]">
          <Wallet size={110} />
        </div>

        <h2 className="text-[24px] font-extrabold leading-tight text-[#166534]">
          Kiểm soát chi tiêu thông minh
        </h2>

        <p className="mx-auto mt-4 max-w-[360px] text-[15px] leading-7 text-[#64748B]">
          Quản lý ngân sách hiệu quả để duy trì thói quen ăn uống lành mạnh.
        </p>
      </section>

      <section className="rounded-[26px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <Title
          title="Ngân sách ăn uống"
          subtitle="AI sẽ theo dõi và cảnh báo khi sắp vượt ngân sách"
        />

        <div className="mt-7">
          <div className="grid grid-cols-3 rounded-[14px] bg-[#F1F5F9] p-1">
            {[
              { id: "daily", label: "Hằng ngày" },
              { id: "weekly", label: "Hằng tuần" },
              { id: "monthly", label: "Hằng tháng" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setBudgetType(item.id)}
                className={`h-10 rounded-[12px] text-sm font-bold transition ${
                  budgetType === item.id
                    ? "bg-white text-[#16A34A] shadow-sm"
                    : "text-[#64748B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-bold">
              Ngân sách mỗi ngày
            </label>

            <div className="relative">
              <input
                defaultValue="200,000"
                className="h-12 w-full rounded-[14px] border border-[#E5E7EB] px-5 pr-10 text-[15px] outline-none focus:border-[#16A34A] focus:ring-4 focus:ring-[#DCFCE7]"
              />

              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[#64748B]">
                đ
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[18px] border border-[#BBF7D0] bg-[#F0FDF4] p-5">
            <h3 className="flex items-center gap-2 font-extrabold">
              <PartyPopper size={20} className="text-[#16A34A]" />
              Gần xong rồi!
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#64748B]">
              Nhấn Hoàn thành để bắt đầu sử dụng NutriWallet AI với 14 ngày dùng
              thử miễn phí.
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <button
              onClick={onBack}
              className="flex h-12 items-center justify-center rounded-[14px] border border-[#16A34A] font-bold text-[#16A34A]"
            >
              Quay lại
            </button>

            <button className="btn-gradient flex h-12 items-center justify-center gap-2 rounded-[14px] font-bold text-white">
              <Check size={18} />
              Hoàn thành
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Title({ title, subtitle }) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-[28px] font-extrabold tracking-[-0.03em]">
        {title}
        <Sprout size={22} className="text-[#16A34A]" />
      </h1>
      <p className="mt-2 text-sm text-[#64748B]">{subtitle}</p>
    </div>
  );
}

export default RegisterBudget;
