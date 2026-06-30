import { Bus, ReceiptText, ShoppingCart, Utensils } from "lucide-react";
import SectionCard from "./SectionCard";

function CategoryIcon({ category }) {
  if (category === "Di chuyển") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
        <Bus size={14} strokeWidth={1.9} />
      </span>
    );
  }

  if (category === "Ăn ngoài") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400">
        <Utensils size={14} strokeWidth={1.9} />
      </span>
    );
  }

  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
      <ShoppingCart size={14} strokeWidth={1.9} />
    </span>
  );
}

export default function ExpenseTable({ expenses }) {
  const recentExpenses = expenses.slice(0, 3);

  return (
    <SectionCard title="Các khoản chi gần đây" icon={ReceiptText} viewAllTo="/expense-history">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Danh mục
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Số tiền
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tiền tệ
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Ngày
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Ghi chú
              </th>
            </tr>
          </thead>

          <tbody>
            {recentExpenses.map((item, index) => (
              <tr
                key={`${item.category}-${item.date}-${index}`}
                className="border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={item.category} />
                    <span className="text-[13px] font-medium text-slate-900 sm:text-sm dark:text-slate-200">
                      {item.category}
                    </span>
                  </div>
                </td>

                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {item.amount}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {item.currency}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {item.date}
                </td>
                <td className="px-3 py-2 text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">
                  {item.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
