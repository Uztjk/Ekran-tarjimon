import React from "react";
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
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F1521]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[52px] md:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onTabChange("translator")}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
        >
          EkranTarjimon
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Asosiy sahifalar"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
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
            Tarjimon
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
            {historyCount > 0 ? `Tarix (${historyCount})` : "Tarix"}
          </button>
          <button
            type="button"
            onClick={onOpenPricing}
            className="whitespace-nowrap shrink-0 py-1.5 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            Tariflar
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
            Qo'llanma
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onUploadClick}
            className="px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
          >
            Skrinshot yuklash
          </button>
        </div>
      </div>
    </header>
  );
};
