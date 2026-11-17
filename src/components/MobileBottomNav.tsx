import React from "react";
import { Camera, Clock, HelpCircle, Languages } from "lucide-react";
import type { AppTab } from "../types/translator";

interface MobileBottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenCamera: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCamera,
}) => {
  return (
    <nav
      aria-label="Mobil navigatsiya"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-[#0F1521]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center px-2"
    >
      <button
        type="button"
        onClick={() => onTabChange("translator")}
        className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors cursor-pointer ${
          activeTab === "translator"
            ? "text-[#2563EB] dark:text-[#60A5FA]"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <Languages className="w-5 h-5" />
        <span className="text-[11px] font-medium leading-none whitespace-nowrap">Tarjimon</span>
      </button>

      <button
        type="button"
        onClick={onOpenCamera}
        className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#2563EB] transition-colors cursor-pointer"
      >
        <Camera className="w-5 h-5" />
        <span className="text-[11px] font-medium leading-none whitespace-nowrap">Kamera</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("history")}
        className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors cursor-pointer ${
          activeTab === "history"
            ? "text-[#2563EB] dark:text-[#60A5FA]"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <Clock className="w-5 h-5" />
        <span className="text-[11px] font-medium leading-none whitespace-nowrap">Tarix</span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange("guide")}
        className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors cursor-pointer ${
          activeTab === "guide"
            ? "text-[#2563EB] dark:text-[#60A5FA]"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <HelpCircle className="w-5 h-5" />
        <span className="text-[11px] font-medium leading-none whitespace-nowrap">Qo'llanma</span>
      </button>
    </nav>
  );
};
