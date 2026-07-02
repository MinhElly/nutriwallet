import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, MessageCircleMore, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { welcomeGuideContent } from "../../../data/welcomeGuideContent";
import ConnectionGuide from "./ConnectionGuide";
import GuideFooter from "./GuideFooter";
import MessengerPreview from "./MessengerPreview";
import WelcomeModal from "./WelcomeModal";

const stepMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
};

function StepBadge({ stepIndex, totalSteps }) {
  return (
    <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
      Bước {stepIndex + 1} / {totalSteps}
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-600">
      <Heart size={14} className="fill-emerald-500 text-emerald-500" strokeWidth={2} />
      NutriWallet AI
    </div>
  );
}

function HighlightedTitle({ title, nowrap = false }) {
  const highlighted = title
    .replace(" AI", " <span class=\"text-emerald-500\">AI</span>")
    .replace(" Messenger", " <span class=\"text-emerald-500\">Messenger</span>");

  return (
    <h2
      className={
        nowrap
          ? "whitespace-nowrap text-2xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-[2.35rem]"
          : "max-w-[12ch] text-3xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-[2.35rem]"
      }
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

function StepContent({ step, stepIndex, totalSteps, onGoToSettings }) {
  if (step.id === "welcome") {
    return (
      <WelcomeModal
        eyebrow={step.eyebrow}
        title={step.title}
        description={step.description}
        features={step.features}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
      />
    );
  }

  if (step.id === "messenger-preview") {
    return (
      <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="space-y-4">
          <BrandHeader />
          <StepBadge stepIndex={stepIndex} totalSteps={totalSteps} />
          <div className="space-y-3">
            <HighlightedTitle title={step.title} />
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              {step.description}
            </p>
          </div>
        </div>

        <MessengerPreview conversations={step.conversations} />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-5 py-5 sm:px-7 sm:py-7">
      <div className="space-y-4">
        <BrandHeader />
        <StepBadge stepIndex={stepIndex} totalSteps={totalSteps} />
        <div className="space-y-3">
          <HighlightedTitle title={step.title} nowrap />
          <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {step.description}
          </p>
        </div>
      </div>

      <ConnectionGuide
        guideSteps={step.guideSteps}
        highlightedActionLabel={step.highlightedActionLabel}
        note={step.note}
        onGoToSettings={onGoToSettings}
      />
    </div>
  );
}

export default function FirstTimeWelcomeGuide({
  defaultOpen = true,
  content = welcomeGuideContent,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [stepIndex, setStepIndex] = useState(0);

  if (!isOpen) {
    return null;
  }

  const steps = content.steps;
  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const handleSecondaryAction = () => {
    if (isFirstStep) {
      setIsOpen(false);
      return;
    }

    setStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const handlePrimaryAction = () => {
    if (isLastStep) {
      setIsOpen(false);
      return;
    }

    setStepIndex((currentIndex) => Math.min(currentIndex + 1, steps.length - 1));
  };

  const handleGoToSettings = () => {
    setIsOpen(false);
    navigate("/settings#messenger-chatbot");
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex max-h-[92vh] w-full max-w-[820px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] shadow-[0_42px_110px_-40px_rgba(15,23,42,0.36)]"
          role="dialog"
          aria-modal="true"
          aria-label="Hướng dẫn chào mừng lần đầu của NutriWallet AI"
        >
          <button
            type="button"
            aria-label="Đóng hướng dẫn"
            onClick={() => setIsOpen(false)}
            className="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            <X size={18} strokeWidth={2} />
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_28%)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={stepMotion.initial}
                animate={stepMotion.animate}
                exit={stepMotion.exit}
                transition={stepMotion.transition}
              >
                <StepContent
                  step={currentStep}
                  stepIndex={stepIndex}
                  totalSteps={steps.length}
                  onGoToSettings={handleGoToSettings}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <GuideFooter
            currentStep={stepIndex}
            totalSteps={steps.length}
            secondaryActionLabel={currentStep.secondaryActionLabel}
            primaryActionLabel={currentStep.primaryActionLabel}
            onSecondaryAction={handleSecondaryAction}
            onPrimaryAction={handlePrimaryAction}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
