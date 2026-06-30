import { useState } from "react";
import AppShell from "../../components/layout/AppShell";
import PageHeader from "../../components/scanMeal/PageHeader";
import UploadCard from "../../components/scanMeal/UploadCard";
import TipsCard from "../../components/scanMeal/TipsCard";
import AnalysisResultCard from "../../components/scanMeal/AnalysisResultCard";
import { mockAnalysisResult } from "../../data/scanMealData";

export default function ScanMealPage() {
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyzeSuccess = () => {
    setAnalysisResult(mockAnalysisResult);
  };

  const handleUpdateResult = (updatedResult) => {
    setAnalysisResult(updatedResult);
  };

  return (
    <AppShell pageLabel="Quét bữa ăn">
      <PageHeader />

      <div className="grid gap-6 xl:grid-cols-[1fr_520px]">
        <div className="space-y-6">
          <UploadCard onAnalyzeSuccess={handleAnalyzeSuccess} />
          <TipsCard />
        </div>

        <AnalysisResultCard
          result={analysisResult}
          onUpdateResult={handleUpdateResult}
        />
      </div>
    </AppShell>
  );
}
