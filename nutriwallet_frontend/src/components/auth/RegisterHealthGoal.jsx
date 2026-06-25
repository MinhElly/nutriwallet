import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
  Bike,
  Scale,
  Dumbbell,
  Sprout,
} from "lucide-react";
import { useState } from "react";

function RegisterHealthGoal({ onBack, onNext }) {
  const [goal, setGoal] = useState("muscle");

  const goals = [
    {
      id: "lose",
      icon: "🏃",
      title: "Giảm cân",
      desc: "Giảm calories, tăng cường hoạt động thể chất",
    },
    {
      id: "maintain",
      icon: "⚖️",
      title: "Duy trì cân nặng",
      desc: "Cân bằng calories nạp và tiêu thụ hằng ngày",
    },
    {
      id: "muscle",
      icon: "💪",
      title: "Tăng cơ bắp",
      desc: "Tăng protein, hỗ trợ tập luyện sức mạnh",
    },
  ];

  return (
    <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-2">
      <section className="hidden text-center lg:block">
        <div className="mx-auto mb-8 flex h-[250px] w-[250px] items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shadow-[0_22px_60px_rgba(34,197,94,.16)]">
          <Target size={110} />
        </div>

        <h2 className="text-[24px] font-extrabold leading-tight text-[#166534]">
          Chọn mục tiêu phù hợp
        </h2>

        <p className="mx-auto mt-4 max-w-[360px] text-[15px] leading-7 text-[#64748B]">
          Để chúng tôi đồng hành và giúp bạn đạt được kết quả tốt nhất.
        </p>
      </section>

      <section className="rounded-[26px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <Title
          title="Mục tiêu sức khỏe"
          subtitle="AI sẽ cá nhân hóa gợi ý theo mục tiêu của bạn"
        />

        <div className="mt-7 space-y-4">
          {goals.map((item) => (
            <button
              key={item.id}
              onClick={() => setGoal(item.id)}
              className={`flex w-full items-center justify-between rounded-[18px] border p-5 text-left transition ${
                goal === item.id
                  ? "border-[#16A34A] bg-[#F0FDF4]"
                  : "border-[#E5E7EB] bg-white hover:bg-[#F8FAFC]"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-[#0F172A]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[#64748B]">{item.desc}</p>
                </div>
              </div>

              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                  goal === item.id
                    ? "border-[#16A34A] bg-[#16A34A] text-white"
                    : "border-[#CBD5E1]"
                }`}
              >
                {goal === item.id && <Check size={14} />}
              </div>
            </button>
          ))}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={onBack}
              className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#16A34A] font-bold text-[#16A34A]"
            >
              Quay lại
            </button>

            <button
              onClick={onNext}
              className="btn-gradient flex h-12 items-center justify-center gap-2 rounded-[14px] font-bold text-white"
            >
              Tiếp theo
              <ArrowRight size={18} />
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

export default RegisterHealthGoal;
