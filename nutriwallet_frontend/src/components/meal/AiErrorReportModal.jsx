import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { submitAiErrorReport } from "../../services/aiLog.service";

export default function AiErrorReportModal({ meal, onClose }) {
  const [reason, setReason] = useState("WRONG_FOOD_NAME");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!meal) return null;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Đang gửi báo cáo lỗi...");
    try {
      await submitAiErrorReport({ mealRecordId: meal.id, reason, description: description.trim() });
      toast.success("Báo cáo lỗi nhận diện AI thành công. Cảm ơn phản hồi của bạn!", { id: toastId });
      onClose();
    } catch (error) {
      toast.error(error.message || "Gửi báo cáo thất bại.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="ai-error-report-title">
      <button type="button" aria-label="Đóng báo cáo lỗi" className="absolute inset-0 cursor-default" onClick={onClose} />
      <div className="relative w-full max-w-md space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="ai-error-report-title" className="flex items-center gap-2 text-lg font-bold text-slate-950 dark:text-white">
              <AlertTriangle className="text-amber-500" size={20} aria-hidden="true" />
              Báo cáo lỗi nhận diện AI
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bữa ăn: {meal.mealName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-rose-500 hover:text-white dark:bg-slate-800">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="report-reason">Lý do lỗi</label>
            <select id="report-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white">
              <option value="WRONG_FOOD_NAME">Sai tên món ăn</option>
              <option value="WRONG_NUTRITION">Sai lượng calo/dinh dưỡng</option>
              <option value="WRONG_PRICE">Sai giá tiền ước lượng</option>
              <option value="OTHER">Lý do khác</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" htmlFor="report-description">Mô tả chi tiết lỗi</label>
            <textarea id="report-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Nhập chi tiết để giúp chúng tôi cải thiện kết quả nhận diện..." className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50 dark:border-slate-800 dark:text-slate-200">Hủy</button>
          <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}</button>
        </div>
      </div>
    </div>
  );
}
