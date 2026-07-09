import React from "react";

export default function ProgressSteps({ steps, currentStep, title, subtitle }) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="mb-8 rounded-[1.25rem] border border-[#E8DFD1] bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#A8895C]">Planning flow</p>
          <h2 className="mt-1 text-xl font-serif text-[#1F2E27]">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-[#3D3530]">{subtitle}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {steps.map((step, index) => {
          const isActive = index === safeIndex;
          const isCompleted = index < safeIndex;

          return (
            <div key={step.id} className="flex flex-1 items-center gap-3 min-w-[140px]">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                isCompleted || isActive
                  ? "border-[#A8895C] bg-[#A8895C] text-white"
                  : "border-[#E8DFD1] bg-[#F8F6F0] text-[#3D3530]"
              }`}>
                {index + 1}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isActive || isCompleted ? "text-[#1F2E27]" : "text-[#8F847C]"}`}>
                  {step.label}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8F847C]">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
