import { Camera, FileImage, Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

export default function UploadCard({ onAnalyzeSuccess }) {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleOpenCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileName("");
    setIsAnalyzing(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh trước khi phân tích.");
      return;
    }

    setIsAnalyzing(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    onAnalyzeSuccess?.();

    setIsAnalyzing(false);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/heic"
        onChange={handleFileChange}
        className="hidden"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/20 px-6 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
        {previewUrl ? (
          <div className="w-full">
            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <img
                src={previewUrl}
                alt="Ảnh món ăn đã chọn"
                className="h-72 w-full object-cover"
              />

              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-4 break-all text-sm font-medium text-slate-700 dark:text-slate-300">
              {fileName}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleChooseFile}
                disabled={isAnalyzing}
                className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FileImage size={18} />
                Đổi ảnh
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex h-12 items-center gap-3 rounded-xl bg-emerald-600 px-8 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang phân tích...
                  </>
                ) : (
                  "Phân tích ảnh"
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400">
              <UploadCloud size={42} strokeWidth={1.8} />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-slate-950 dark:text-white">
              Tải ảnh hoặc kéo thả vào đây
            </h2>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Hỗ trợ JPG, PNG, HEIC. Dung lượng tối đa 10MB.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={handleChooseFile}
                className="flex h-12 items-center gap-3 rounded-xl bg-emerald-600 px-8 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <FileImage size={18} />
                Chọn ảnh
              </button>

              <button
                type="button"
                onClick={handleOpenCamera}
                className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-8 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Camera size={18} />
                Camera
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
