import { Sparkles } from "lucide-react";
import FeatureCard from "./FeatureCard";

export default function WelcomeModal({
  eyebrow,
  title,
  description,
  features,
  stepIndex,
  totalSteps,
}) {
  return (
    <div className="space-y-6 px-5 py-5 sm:px-7 sm:py-7">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
        <Sparkles size={14} strokeWidth={2.2} />
        {eyebrow}
      </div>

      <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
        Bước {stepIndex + 1} / {totalSteps}
      </div>

      <div className="space-y-3">
        <h2 className="whitespace-nowrap text-2xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-[2.35rem]">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>

      <div className="grid gap-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
}
