import { Camera, Image as ImageIcon, Info, MessageCircleMore, Mic, Smile, ThumbsUp } from "lucide-react";
import { motion } from "motion/react";

function Bubble({ align = "left", children }) {
  const bubbleClass =
    align === "right"
      ? "ml-auto bg-[linear-gradient(135deg,#22c55e,#16a34a)] text-white"
      : "bg-white text-slate-700 shadow-[0_16px_30px_-24px_rgba(15,23,42,0.25)]";

  return (
    <div className={`max-w-[82%] rounded-[22px] px-4 py-3 text-sm leading-6 ${bubbleClass}`}>
      {children}
    </div>
  );
}

function MessengerInputIcon({ children }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-500">
      {children}
    </div>
  );
}

export default function MessengerPreview({ conversations }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute inset-x-10 bottom-8 top-12 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_70%)] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[34px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,252,0.96))] p-3 shadow-[0_26px_70px_-36px_rgba(15,23,42,0.38)]"
      >
        <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fbff,#f5f7fb)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_14px_24px_-14px_rgba(16,185,129,0.8)]">
                <MessageCircleMore size={17} strokeWidth={2.1} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-slate-900">NutriWallet AI</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-400">Đang hoạt động</p>
              </div>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-sky-500">
              <Info size={14} strokeWidth={2.2} />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="space-y-3">
                <Bubble align="right">{conversation.userMessage}</Bubble>

                <Bubble align="left">
                  <div className="space-y-1.5">
                    {conversation.aiLines.map((line) => (
                      <p key={`${conversation.id}-${line}`}>{line}</p>
                    ))}
                  </div>
                </Bubble>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-slate-200/80 pt-3">
            <MessengerInputIcon>
              <Camera size={15} strokeWidth={2.1} />
            </MessengerInputIcon>
            <MessengerInputIcon>
              <ImageIcon size={15} strokeWidth={2.1} />
            </MessengerInputIcon>
            <MessengerInputIcon>
              <Mic size={15} strokeWidth={2.1} />
            </MessengerInputIcon>

            <div className="flex h-9 min-w-0 flex-1 items-center rounded-full bg-white px-3 text-xs text-slate-400 shadow-inner">
              Aa
            </div>

            <MessengerInputIcon>
              <Smile size={15} strokeWidth={2.1} />
            </MessengerInputIcon>
            <MessengerInputIcon>
              <ThumbsUp size={15} strokeWidth={2.1} />
            </MessengerInputIcon>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
