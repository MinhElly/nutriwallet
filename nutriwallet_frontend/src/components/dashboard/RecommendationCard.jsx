import {
  Brain,
  Lightbulb,
  Salad,
  WalletCards,
} from "lucide-react";
import { aiRecommendations } from "../../data/dashboardData";
import SectionCard from "./SectionCard";

const toneClasses = {
  warning: {
    container: "border-rose-100 bg-rose-50/80",
    iconWrap: "bg-rose-100 text-rose-500",
  },
  caution: {
    container: "border-amber-100 bg-amber-50/80",
    iconWrap: "bg-amber-100 text-amber-500",
  },
  success: {
    container: "border-emerald-100 bg-emerald-50/80",
    iconWrap: "bg-emerald-100 text-emerald-500",
  },
  info: {
    container: "border-sky-100 bg-sky-50/80",
    iconWrap: "bg-sky-100 text-sky-500",
  },
};

const iconMap = {
  budget: WalletCards,
  nutrition: Salad,
  positive: Brain,
  suggestion: Lightbulb,
};

export default function RecommendationCard() {
  return (
    <SectionCard title="Gợi ý AI" icon={Brain} compact>
      <div className="flex h-full flex-col gap-2.5">
        {aiRecommendations.map((item) => {
          const tone = toneClasses[item.tone] ?? toneClasses.info;
          const Icon = iconMap[item.icon] ?? Lightbulb;

          return (
            <div
              key={item.id}
              className={`flex items-start gap-2.5 rounded-2xl border px-3 py-2.5 ${tone.container}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone.iconWrap}`}
              >
                <Icon size={16} strokeWidth={1.9} />
              </div>

              <p className="pt-0.5 text-[13px] font-medium leading-5 text-slate-700 sm:text-sm">
                {item.content}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
