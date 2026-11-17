import React, { useState } from "react";
import { Download, Smartphone, WifiOff } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-4 h-4 text-[#2563EB]" />
        <span>Ilovani o'rnatish</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-4 h-4 text-[#2563EB]" />
          <span>Ekranga qo'shish</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                iPhone / iPad ekraniga o'rnatish
              </h3>
              <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
                <li>
                  Safari pastki panelidagi <strong>Ulashish (Share)</strong> tugmasini bosing.
                </li>
                <li>
                  Pastga tushib <strong>Asosiy ekranga qo'shish (Add to Home Screen)</strong> bandini tanlang.
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold cursor-pointer"
              >
                Tushunarli
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Oflayn rejim · Saqlangan tarix ko'rsatilmoqda</span>
    </div>
  );
};
