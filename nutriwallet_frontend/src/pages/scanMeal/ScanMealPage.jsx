import { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/scanMeal/PageHeader";
import UploadCard from "../../components/scanMeal/UploadCard";
import TipsCard from "../../components/scanMeal/TipsCard";
import AnalysisResultCard from "../../components/scanMeal/AnalysisResultCard";
import ScanMealFallback from "../../components/scanMeal/fallback/ScanMealFallback";
import { saveAnalyzedMeal } from "../../services/scanMeal.service";
import { useHealthProfile } from "../../hooks/useHealthProfile";
import toast from "react-hot-toast";

export default function ScanMealPage() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { healthProfile, getAlertsForMeal } = useHealthProfile();

  const handleAnalyzeSuccess = (result) => {
    setAnalysisResult(result);
  };

  const handleUpdateResult = (updatedResult) => {
    setAnalysisResult(updatedResult);
  };

  const handleSaveMeal = async (finalResultToSave = analysisResult) => {
    if (!finalResultToSave || isSaving) return;
    setIsSaving(true);
    const toastId = toast.loading("Đang lưu bữa ăn...");
    try {
      await saveAnalyzedMeal(finalResultToSave);
      toast.success("Lưu bữa ăn và ghi nhận chi tiêu thành công!", { id: toastId });
      setAnalysisResult(null);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Không thể lưu bữa ăn lúc này.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Tính health alerts cho kết quả phân tích hiện tại
  const healthAlerts = analysisResult
    ? getAlertsForMeal({
        foodName: analysisResult.foodName || "",
        description: analysisResult.description || "",
        ingredients: analysisResult.ingredients || [],
      })
    : [];

  return (
    <AppShell pageLabel="Quét bữa ăn">
      <PageHeader />

      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <div className="space-y-6">
          <UploadCard onAnalyzeSuccess={handleAnalyzeSuccess} />
          <TipsCard />
        </div>

        {analysisResult?.requiresClarification || (analysisResult?.ai?.confidence && analysisResult.ai.confidence < 70) ? (
          <ScanMealFallback 
            analysisResult={analysisResult} 
            onSave={handleSaveMeal} 
          />
        ) : (
          <AnalysisResultCard
            result={analysisResult}
            onUpdateResult={handleUpdateResult}
            onSave={() => handleSaveMeal()}
            isSaving={isSaving}
            healthAlerts={healthAlerts}
            healthProfile={healthProfile}
          />
        )}
      </div>
    </AppShell>
  );
}
