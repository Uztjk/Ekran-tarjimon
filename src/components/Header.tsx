import React from "react";
import { useUiLang } from "../contexts/UiLangContext";
import { UI_LANG_OPTIONS, type UiLang } from "../i18n/translations";
import type { AppTab } from "../types/translator";

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onUploadClick: () => void;
  onOpenPricing: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onUploadClick,
  onOpenPricing,
  historyCount,
}) => {
  const { uiLang, setUiLang, t } = useUiLang();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F1521]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[52px] md:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onTabChange("translator")}
          className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
        >
          EkranTarjimon
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label={t.navTranslator}
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => onTabChange("translator")}
            className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              activeTab === "translator"
                ? "border-[#2563EB] text-slate-900 dark:text-white"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t.navTranslator}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("history")}
            className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              activeTab === "history"
                ? "border-[#2563EB] text-slate-900 dark:text-white"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {historyCount > 0 ? `${t.navHistory} (${historyCount})` : t.navHistory}
          </button>
          <button
            type="button"
            onClick={onOpenPricing}
            className="whitespace-nowrap shrink-0 py-1.5 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            {t.navPricing}
          </button>
          <button
            type="button"
            onClick={() => onTabChange("guide")}
            className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
              activeTab === "guide"
                ? "border-[#2563EB] text-slate-900 dark:text-white"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t.navGuide}
          </button>
        </nav>

        {/* Zone 3: UI Language Switcher (UZ / RU / EN / TJ) + Primary Upload CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile compact selector */}
          <select
            aria-label={t.menuLangAria}
            value={uiLang}
            onChange={(e) => setUiLang(e.target.value as UiLang)}
            className="lg:hidden min-h-[38px] px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            {UI_LANG_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.short} · {opt.label}
              </option>
            ))}
          </select>

          {/* Desktop 1-click segmented switcher */}
          <div
            role="group"
            aria-label={t.menuLangAria}
            className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0B0F17] border border-slate-200/70 dark:border-slate-800"
          >
            {UI_LANG_OPTIONS.map((opt) => {
              const active = uiLang === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setUiLang(opt.code)}
                  title={opt.label}
                  className={`px-2 py-1 min-h-[30px] rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-white dark:bg-slate-800 text-[#2563EB] dark:text-[#60A5FA] shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {opt.short}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onUploadClick}
            className="px-3 sm:px-4 py-2 min-h-[38px] sm:min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
          >
            <span className="sm:hidden">{t.uploadShort}</span>
            <span className="hidden sm:inline">{t.uploadScreenshot}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
