import { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 px-8 py-7">
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
        </main>
      </div>
    </div>
  );
}
