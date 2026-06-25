import { useState } from "react";
import RegisterStepIndicator from "../../components/auth/RegisterStepIndicator";
import RegisterBasicInfo from "../../components/auth/RegisterBasicInfo";
import RegisterHealthGoal from "../../components/auth/RegisterHealthGoal";
import RegisterBudget from "../../components/auth/RegisterBudget";

function RegisterPage() {
  const [step, setStep] = useState(1);

  return (
    <main
      className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-[#0F172A]"
      style={{ fontFamily: "Inter, Manrope, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .register-shell {
          background:
            radial-gradient(circle at 20% 20%, rgba(34,197,94,0.10), transparent 28%),
            radial-gradient(circle at 80% 80%, rgba(34,197,94,0.12), transparent 30%),
            linear-gradient(180deg, #F8FAFC 0%, #F0FDF4 100%);
        }

        .btn-gradient {
          background: linear-gradient(135deg, #16A34A 0%, #22C55E 100%);
          transition: .25s ease;
        }

        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px -18px rgba(34,197,94,.7);
        }
      `}</style>

      <div className="register-shell mx-auto flex min-h-[calc(100vh-48px)] max-w-[1180px] flex-col rounded-[28px] border border-[#E5E7EB] bg-white/80 px-10 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <RegisterStepIndicator step={step} />

        {step === 1 && <RegisterBasicInfo onNext={() => setStep(2)} />}

        {step === 2 && (
          <RegisterHealthGoal
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && <RegisterBudget onBack={() => setStep(2)} />}
      </div>
    </main>
  );
}

export default RegisterPage;
