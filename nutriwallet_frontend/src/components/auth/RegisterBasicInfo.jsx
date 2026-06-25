import {
  User,
  Mail,
  Lock,
  Eye,
  ArrowRight,
  ShieldCheck,
  Sprout,
} from "lucide-react";

function RegisterBasicInfo({ onNext }) {
  return (
    <div className="grid flex-1 grid-cols-1 items-center gap-10 lg:grid-cols-2">
      <section className="hidden text-center lg:block">
        <div className="mx-auto mb-8 flex h-[250px] w-[250px] items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A] shadow-[0_22px_60px_rgba(34,197,94,.16)]">
          <ShieldCheck size={100} />
        </div>

        <h2 className="text-[26px] font-extrabold leading-tight text-[#166534]">
          Bước đầu tiên cho
          <br />
          một lối sống khỏe mạnh
        </h2>

        <p className="mx-auto mt-4 max-w-[360px] text-[15px] leading-7 text-[#64748B]">
          Cung cấp thông tin để AI cá nhân hóa kế hoạch dinh dưỡng cho bạn.
        </p>
      </section>

      <section className="rounded-[26px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <Title
          title="Thông tin cơ bản"
          subtitle="Hãy bắt đầu với thông tin cá nhân của bạn"
        />

        <div className="mt-7 space-y-5">
          <Input
            label="Họ và tên"
            icon={<User size={18} />}
            placeholder="Nhập họ và tên"
          />

          <Input
            label="Email"
            icon={<Mail size={18} />}
            placeholder="youremail@example.com"
          />

          <Input
            label="Mật khẩu"
            icon={<Lock size={18} />}
            placeholder="Tối thiểu 8 ký tự"
            rightIcon={<Eye size={18} />}
          />

          <button
            onClick={onNext}
            className="btn-gradient flex h-12 w-full items-center justify-center gap-3 rounded-[14px] text-sm font-bold text-white"
          >
            Tiếp theo
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-sm text-[#64748B]">
            Đã có tài khoản?{" "}
            <a className="font-bold text-[#16A34A]" href="#">
              Đăng nhập
            </a>
          </p>
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

function Input({ label, icon, placeholder, rightIcon }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">{label}</label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
          {icon}
        </div>

        <input
          placeholder={placeholder}
          className="h-12 w-full rounded-[14px] border border-[#E5E7EB] bg-white pl-11 pr-11 text-sm outline-none placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:ring-4 focus:ring-[#DCFCE7]"
        />

        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterBasicInfo;
