import React, { useState } from "react";
import CandidateFoodSelector from "./CandidateFoodSelector";
import CustomFoodInput from "./CustomFoodInput";
import ServingSizeSelector from "./ServingSizeSelector";
import ToppingInput from "./ToppingInput";
import HealthWarningCard from "./HealthWarningCard";
import MealSummaryCard from "./MealSummaryCard";
import ConfirmationFooter from "./ConfirmationFooter";

export default function ScanMealFallback({ analysisResult, onSave }) {
  const [step, setStep] = useState(1);
  
  // State
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isCustomFood, setIsCustomFood] = useState(false);
  const [customFoodName, setCustomFoodName] = useState("");
  const [servingSize, setServingSize] = useState(""); // 'small', 'medium', 'large', 'custom'
  const [customServingSize, setCustomServingSize] = useState("");
  const [toppings, setToppings] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const candidates = analysisResult?.candidateFoods || [];
  const healthWarnings = analysisResult?.healthWarnings || [];
  
  // Computed
  const hasWarnings = healthWarnings.length > 0;
  
  const getFinalFoodName = () => {
    return isCustomFood ? customFoodName : selectedCandidate?.name;
  };

  const handleNext = () => {
    // Step 1: Select Food
    if (step === 1) {
      if (!selectedCandidate && !isCustomFood) return;
      if (isCustomFood && !customFoodName.trim()) return;
      setStep(2);
      return;
    }
    
    // Step 2: Select Serving Size
    if (step === 2) {
      if (!servingSize) return;
      if (servingSize === "custom" && !customServingSize) return;
      setStep(3);
      return;
    }
    
    // Step 3: Toppings
    if (step === 3) {
      if (hasWarnings) {
        setStep(4);
      } else {
        setStep(5); // Skip warnings step if none
      }
      return;
    }
    
    // Step 4: Warnings
    if (step === 4) {
      setStep(5);
      return;
    }
  };

  const handleBack = () => {
    if (step === 1) {
      if (isCustomFood) {
        setIsCustomFood(false);
        setCustomFoodName("");
      }
      return;
    }
    if (step === 5 && !hasWarnings) {
      setStep(3);
      return;
    }
    setStep(step - 1);
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    const fallbackData = {
      foodName: getFinalFoodName(),
      servingSize: servingSize === "custom" ? customServingSize : servingSize,
      toppings: toppings.trim(),
      warningsAcknowledged: true
    };
    
    // Merge fallback data into original result
    const finalResult = {
      ...analysisResult,
      foodName: fallbackData.foodName,
      fallbackData,
    };
    
    try {
      await onSave(finalResult);
    } finally {
      setIsSaving(false);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !selectedCandidate && !isCustomFood) return true;
    if (step === 1 && isCustomFood && !customFoodName.trim()) return true;
    if (step === 2 && !servingSize) return true;
    if (step === 2 && servingSize === "custom" && !customServingSize) return true;
    return false;
  };

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      
      {/* Progress bar */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3, hasWarnings ? 4 : null, 5].filter(Boolean).map((s, idx, arr) => {
          // Normalize step for progress bar display
          const displayStep = s;
          const isActive = step >= displayStep;
          return (
            <div
              key={displayStep}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                isActive ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800"
              }`}
            />
          );
        })}
      </div>

      {/* Step 1: Food Selection */}
      {step === 1 && !isCustomFood && (
        <CandidateFoodSelector
          candidates={candidates}
          selectedFood={selectedCandidate}
          onSelectFood={setSelectedCandidate}
          onSelectNone={() => {
            setSelectedCandidate(null);
            setIsCustomFood(true);
          }}
        />
      )}

      {/* Step 1 (Alternative): Custom Food */}
      {step === 1 && isCustomFood && (
        <CustomFoodInput
          value={customFoodName}
          onChange={setCustomFoodName}
        />
      )}

      {/* Step 2: Serving Size */}
      {step === 2 && (
        <ServingSizeSelector
          value={servingSize}
          customValue={customServingSize}
          onChange={setServingSize}
          onCustomChange={(val) => {
            setServingSize("custom");
            setCustomServingSize(val);
          }}
        />
      )}

      {/* Step 3: Toppings */}
      {step === 3 && (
        <ToppingInput
          value={toppings}
          onChange={setToppings}
        />
      )}

      {/* Step 4: Warnings (Optional) */}
      {step === 4 && hasWarnings && (
        <HealthWarningCard warnings={healthWarnings} />
      )}

      {/* Step 5: Summary */}
      {step === 5 && (
        <MealSummaryCard
          foodName={getFinalFoodName()}
          servingSize={servingSize}
          customServingSize={customServingSize}
          toppings={toppings}
          warnings={healthWarnings}
        />
      )}

      {/* Footer Navigation */}
      <ConfirmationFooter
        onBack={(step > 1 || isCustomFood) ? handleBack : null}
        onConfirm={step === 5 ? handleConfirm : handleNext}
        isConfirming={isSaving}
        disableConfirm={isNextDisabled()}
        confirmText={step === 5 ? "Xác nhận & Lưu" : "Tiếp tục"}
      />
      
    </section>
  );
}
