"use client";

interface ScanProgressProps {
  status: string;
  progress: number;
  progressMsg: string | null;
}

const STEPS = [
  { key: "scraping", label: "Scraping Videos", icon: "📡" },
  { key: "analyzing", label: "Matching Brands", icon: "🧠" },
  { key: "researching", label: "Researching", icon: "🔍" },
  { key: "generating", label: "Writing Emails", icon: "✍️" },
];

export function ScanProgress({ status, progress, progressMsg }: ScanProgressProps) {
  const currentStepIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      <div>
        <div className="text-4xl mb-4">🔄</div>
        <h2 className="text-xl font-bold text-gray-900">Scanning your channel...</h2>
        <p className="text-sm text-gray-500 mt-1">This usually takes 5-10 minutes</p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#C8FF00] to-[#a6d400] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, i) => {
          const isDone = currentStepIdx > i;
          const isCurrent = currentStepIdx === i;
          return (
            <div
              key={step.key}
              className={`flex flex-col items-center gap-1.5 ${
                isDone
                  ? "text-green-600"
                  : isCurrent
                  ? "text-gray-900"
                  : "text-gray-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isDone
                    ? "bg-green-100"
                    : isCurrent
                    ? "bg-[#C8FF00]/20 animate-pulse"
                    : "bg-gray-50"
                }`}
              >
                {isDone ? "✓" : step.icon}
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Current status message */}
      {progressMsg && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2.5">
          {progressMsg}
        </p>
      )}
    </div>
  );
}
