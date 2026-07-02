import { useState } from "react";
import {
  Server,
  Key,
  AlertTriangle,
  Database,
  Cpu,
  Activity,
  HardDrive
} from "lucide-react";
import toast from "react-hot-toast";

export default function SystemSettingsTab() {
  // Toggle states
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [autoRetrainAI, setAutoRetrainAI] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);

  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    openai: "sk-••••••••••••••••4f2a",
    firebase: "AIza••••••••••••••••kx9",
    sendgrid: "SG.••••••••••••••••mN7"
  });

  // Toggle Handlers
  const handleToggle = (settingName, currentValue, setter) => {
    const nextValue = !currentValue;
    setter(nextValue);
    if (nextValue) {
      toast.success(`Đã kích hoạt cấu hình: ${settingName}`);
    } else {
      toast.error(`Đã vô hiệu hóa cấu hình: ${settingName}`);
    }
  };

  // API Key Rotation
  const handleRotateKey = (serviceName, keyId) => {
    const confirm = window.confirm(`Bạn có chắc chắn muốn xoay vòng (rotate) API Key cho dịch vụ ${serviceName}? Hành động này sẽ thay đổi khóa kết nối.`);
    if (!confirm) return;

    const toastId = toast.loading(`Đang vô hiệu hóa khóa cũ của ${serviceName}...`);
    setTimeout(() => {
      toast.loading(`Đang tạo khóa mới và đồng bộ hệ thống cấu hình...`, { id: toastId });
      setTimeout(() => {
        // Generate random string
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let randStr = "";
        for (let i = 0; i < 4; i++) randStr += chars.charAt(Math.floor(Math.random() * chars.length));
        
        setApiKeys((prev) => ({
          ...prev,
          [keyId]: `${keyId === 'openai' ? 'sk' : keyId === 'firebase' ? 'AIza' : 'SG'}-••••••••••••••••${randStr}`
        }));

        toast.success(`Khóa mới cho ${serviceName} đã được cập nhật trực tuyến!`, {
          id: toastId,
          duration: 3000
        });
      }, 1500);
    }, 1500);
  };

  // Danger Zone Actions
  const handleExecuteAction = (actionLabel, actionDetails, successMsg) => {
    const doubleConfirm = window.confirm(`XÁC NHẬN HÀNH ĐỘNG DANGER ZONE:\n\nBạn đang thực hiện: ${actionLabel}\n(${actionDetails})\n\nBạn có chắc chắn muốn thực thi?`);
    if (!doubleConfirm) return;

    const toastId = toast.loading(`Đang thực thi lệnh hệ thống...`);
    setTimeout(() => {
      toast.success(successMsg, {
        id: toastId,
        duration: 3500
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            System Settings
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Cấu hình hệ thống, bảo mật và hạ tầng
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold w-fit">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>v2.4.1 • Stable</span>
        </div>
      </div>

      {/* Section 1: Server Controls */}
      <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
        <div className="flex items-center gap-2.5 mb-6">
          <Server className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-white">
            Server Controls
          </h3>
        </div>

        <div className="divide-y divide-[#25214d]/60 space-y-4">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between py-2">
            <div>
              <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tắt toàn bộ truy cập người dùng để bảo trì</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("Maintenance Mode", maintenanceMode, setMaintenanceMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                maintenanceMode ? "bg-purple-600" : "bg-[#25214d]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-sm font-bold text-white">Debug Mode</h4>
              <p className="text-xs text-slate-400 mt-0.5">Ghi log chi tiết — không dùng trên production</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("Debug Mode", debugMode, setDebugMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                debugMode ? "bg-purple-600" : "bg-[#25214d]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  debugMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-sm font-bold text-white">Auto Retrain AI</h4>
              <p className="text-xs text-slate-400 mt-0.5">Tự động retrain khi accuracy xuống dưới 94%</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("Auto Retrain AI", autoRetrainAI, setAutoRetrainAI)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                autoRetrainAI ? "bg-purple-600" : "bg-[#25214d]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoRetrainAI ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Toggle 4 */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <h4 className="text-sm font-bold text-white">Rate Limiting</h4>
              <p className="text-xs text-slate-400 mt-0.5">Giới hạn 100 requests/phút mỗi user</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("Rate Limiting", rateLimiting, setRateLimiting)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                rateLimiting ? "bg-purple-600" : "bg-[#25214d]"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  rateLimiting ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: System Health */}
      <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md space-y-6">
        <div className="flex items-center gap-2.5">
          <HardDrive className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-white">
            System Health
          </h3>
        </div>

        {/* Meters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meter 1 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-300">Storage</span>
              <span className="font-bold text-purple-400">34% (340 / 1000 GB)</span>
            </div>
            <div className="w-full bg-[#201d41] rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: "34%" }} />
            </div>
          </div>

          {/* Meter 2 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-slate-300">AI Model Cache</span>
              <span className="font-bold text-blue-400">61% warm</span>
            </div>
            <div className="w-full bg-[#201d41] rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: "61%" }} />
            </div>
          </div>
        </div>

        {/* Grid cards info */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="rounded-2xl border border-[#25214d]/50 bg-[#1f1c42]/15 p-4 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">UPTIME</span>
            <span className="text-lg font-black text-white block mt-1">99.97%</span>
          </div>

          <div className="rounded-2xl border border-[#25214d]/50 bg-[#1f1c42]/15 p-4 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">LATENCY P95</span>
            <span className="text-lg font-black text-white block mt-1">180ms</span>
          </div>

          <div className="rounded-2xl border border-[#25214d]/50 bg-[#1f1c42]/15 p-4 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ACTIVE CONNECTIONS</span>
            <span className="text-lg font-black text-white block mt-1">1,847</span>
          </div>

          <div className="rounded-2xl border border-[#25214d]/50 bg-[#1f1c42]/15 p-4 text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">QUEUED JOBS</span>
            <span className="text-lg font-black text-white block mt-1">23</span>
          </div>
        </div>
      </div>

      {/* Section 3: API Keys & Integrations */}
      <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
        <div className="flex items-center gap-2.5 mb-6">
          <Key className="text-purple-400" size={20} />
          <h3 className="text-lg font-bold text-white">
            API Keys & Integrations
          </h3>
        </div>

        <div className="space-y-4">
          {/* Key 1 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-[#25214d]/60 bg-[#1f1b40]/15">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">OpenAI Vision API</h4>
                <code className="text-xs text-slate-500 font-mono block mt-0.5">{apiKeys.openai}</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRotateKey("OpenAI Vision API", "openai")}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
            >
              Rotate
            </button>
          </div>

          {/* Key 2 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-[#25214d]/60 bg-[#1f1b40]/15">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Firebase Auth</h4>
                <code className="text-xs text-slate-500 font-mono block mt-0.5">{apiKeys.firebase}</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRotateKey("Firebase Auth", "firebase")}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
            >
              Rotate
            </button>
          </div>

          {/* Key 3 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-[#25214d]/60 bg-[#1f1b40]/15">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">SendGrid Email</h4>
                <code className="text-xs text-slate-500 font-mono block mt-0.5">{apiKeys.sendgrid}</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleRotateKey("SendGrid Email", "sendgrid")}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
            >
              Rotate
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Danger Zone */}
      <div className="rounded-[24px] border border-rose-950 bg-[#1a0f14] p-6 shadow-md space-y-6">
        <div>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="text-rose-500 animate-pulse" size={20} />
            <h3 className="text-lg font-bold text-white">
              Danger Zone
            </h3>
          </div>
          <p className="text-xs text-rose-400 font-medium mt-1">
            Các hành động không thể hoàn tác. Cần xác nhận hai bước.
          </p>
        </div>

        <div className="space-y-4">
          {/* Action 1 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-950/60 bg-rose-950/5">
            <div>
              <h4 className="text-sm font-bold text-white">Flush AI Cache</h4>
              <p className="text-xs text-slate-400 mt-0.5">Xóa toàn bộ cache nhận diện AI (30 phút downtime)</p>
            </div>
            <button
              type="button"
              onClick={() => handleExecuteAction(
                "Flush AI Cache",
                "Xóa toàn bộ cache dữ liệu nhận diện AI",
                "Bộ nhớ đệm nhận diện AI đã được làm sạch thành công!"
              )}
              className="rounded-xl border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-amber-400 hover:text-white transition-all cursor-pointer"
            >
              Execute
            </button>
          </div>

          {/* Action 2 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-950/60 bg-rose-950/5">
            <div>
              <h4 className="text-sm font-bold text-white">Reset Rate Limits</h4>
              <p className="text-xs text-slate-400 mt-0.5">Đặt lại giới hạn cho tất cả user</p>
            </div>
            <button
              type="button"
              onClick={() => handleExecuteAction(
                "Reset Rate Limits",
                "Reset giới hạn cuộc gọi API của tất cả người dùng",
                "Toàn bộ giới hạn cuộc gọi API đã được đặt lại thành công!"
              )}
              className="rounded-xl border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-amber-400 hover:text-white transition-all cursor-pointer"
            >
              Execute
            </button>
          </div>

          {/* Action 3 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-950/60 bg-rose-950/5">
            <div>
              <h4 className="text-sm font-bold text-white">Purge Flagged Content</h4>
              <p className="text-xs text-slate-400 mt-0.5">Xóa vĩnh viễn 47 bài đang bị ẩn</p>
            </div>
            <button
              type="button"
              onClick={() => handleExecuteAction(
                "Purge Flagged Content",
                "Xóa hoàn toàn 47 bài viết vi phạm bị báo cáo",
                "Hệ thống đã dọn dẹp và xóa vĩnh viễn 47 bài viết bị ẩn!"
              )}
              className="rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-rose-400 hover:text-white transition-all cursor-pointer"
            >
              Execute
            </button>
          </div>

          {/* Action 4 */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-rose-950/60 bg-rose-950/5">
            <div>
              <h4 className="text-sm font-bold text-white">Factory Reset Database</h4>
              <p className="text-xs text-rose-400 mt-0.5">⚠ XÓA TOÀN BỘ DỮ LIỆU — không thể phục hồi</p>
            </div>
            <button
              type="button"
              onClick={() => handleExecuteAction(
                "Factory Reset Database",
                "Xóa sạch hoàn toàn Cơ sở dữ liệu sản xuất",
                "Đã xóa sạch cơ sở dữ liệu và đặt lại cài đặt gốc thành công!"
              )}
              className="rounded-xl border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-600 px-4 py-2 text-xs font-bold text-rose-400 hover:text-white transition-all cursor-pointer"
            >
              Execute
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
