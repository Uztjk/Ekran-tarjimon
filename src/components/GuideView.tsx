import React from "react";
import { useUiLang } from "../contexts/UiLangContext";

interface GuideViewProps {
  onStartTranslating: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onStartTranslating }) => {
  const { t } = useUiLang();

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-balance">
          {t.guideTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          {t.guideSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {t.guideSteps.map((step) => (
          <div
            key={step.num}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] p-6 space-y-2.5"
          >
            <span className="font-mono text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
              {step.num}
            </span>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {step.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onStartTranslating}
          className="px-6 py-3 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          {t.guideBackBtn}
        </button>
        <a
          href="https://t.me/Admiin_0571"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          {t.guideSupport}
        </a>
      </div>
    </section>
  );
};
