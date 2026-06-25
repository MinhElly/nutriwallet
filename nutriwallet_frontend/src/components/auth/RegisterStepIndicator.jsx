import { Check } from "lucide-react";

function RegisterStepIndicator({ step }) {
  return (
    <header className="mb-6 flex flex-col items-center">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A] text-sm font-extrabold text-white">
          NW
        </div>
        <span className="text-lg font-extrabold">NutriWallet AI</span>
      </div>

      <div className="flex items-center gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                step >= item
                  ? "bg-[#16A34A] text-white shadow-[0_12px_28px_rgba(34,197,94,.35)]"
                  : "bg-[#F1F5F9] text-[#64748B]"
              }`}
            >
              {step > item ? <Check size={18} /> : item}
            </div>

            {item !== 3 && (
              <div
                className={`h-[2px] w-20 ${
                  step > item ? "bg-[#16A34A]" : "bg-[#E5E7EB]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </header>
  );
}

export default RegisterStepIndicator;
