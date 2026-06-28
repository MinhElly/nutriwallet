import { CheckCircle, Lightbulb } from "lucide-react";

const tips = [
  "Dùng ảnh rõ nét, đủ sáng.",
  "Đảm bảo toàn bộ món ăn nằm trong khung hình.",
  "Một đĩa hoặc một phần ăn sẽ cho kết quả tốt hơn.",
];

export default function TipsCard() {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400">
          <Lightbulb size={24} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-950 dark:text-white">
            Mẹo để phân tích chính xác hơn
          </h3>

          <div className="mt-4 space-y-3">
            {tips.map((tip) => (
              <div
                key={tip}
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
              >
                <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
