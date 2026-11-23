import React, { useState } from "react";
import { ArrowRight, Trash2 } from "lucide-react";
import { useUiLang } from "../contexts/UiLangContext";
import type { HistoryItem } from "../types/translator";

interface HistoryViewProps {
  items: HistoryItem[];
  onRestoreItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onRestoreItem,
  onDeleteItem,
  onClearAll,
}) => {
  const { uiLang, t } = useUiLang();
  const [showTranslatedThumb, setShowTranslatedThumb] = useState(true);

  const localeMap = {
    uz: "uz-UZ",
    ru: "ru-RU",
    en: "en-US",
    tj: "tg-TJ",
  } as const;

  const formatTime = (ts: number) => {
    try {
      return new Intl.DateTimeFormat(localeMap[uiLang], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(ts));
    } catch {
      return "";
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {t.historyTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t.historySubtitle}
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B0F17] rounded-xl">
              <button
                type="button"
                onClick={() => setShowTranslatedThumb(true)}
                className={`px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  showTranslatedThumb
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.historyTranslatedThumb}
              </button>
              <button
                type="button"
                onClick={() => setShowTranslatedThumb(false)}
                className={`px-3 py-1.5 min-h-[32px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  !showTranslatedThumb
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.historyOriginalThumb}
              </button>
            </div>

            <button
              type="button"
              onClick={onClearAll}
              className="px-4 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              {t.clearHistoryBtn}
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] p-12 text-center space-y-2">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {t.historyEmptyTitle}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.historyEmptyDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] p-4 flex gap-4 items-start"
            >
              <div className="relative w-20 h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900">
                <img
                  src={item.imageDataUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover block"
                />
                {showTranslatedThumb &&
                  item.blocks.map((block) => {
                    const [ymin, xmin, ymax, xmax] = block.box_2d;
                    let toneClass = "bg-white/95 text-slate-900";
                    if (block.bgTone === "dark") {
                      toneClass = "bg-[#0F172A]/95 text-slate-50";
                    } else if (block.bgTone === "accent") {
                      toneClass = "bg-[#2563EB]/95 text-white";
                    }
                    return (
                      <div
                        key={block.id}
                        style={{
                          top: `${ymin / 10}%`,
                          left: `${xmin / 10}%`,
                          width: `${Math.max(8, (xmax - xmin) / 10)}%`,
                          height: `${Math.max(3, (ymax - ymin) / 10)}%`,
                        }}
                        className={`absolute px-0.5 rounded-[1px] text-[4px] leading-none font-semibold flex items-center overflow-hidden ${toneClass}`}
                      >
                        <span className="truncate w-full">{block.translatedText}</span>
                      </div>
                    );
                  })}
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-between min-h-[144px]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{formatTime(item.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t.blocksCount(item.blocks.length)}</span>
                  </div>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.detectedLanguage} → {item.targetLangName}
                  </p>
                  {item.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onRestoreItem(item)}
                    className="px-3.5 py-2 min-h-[40px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t.historyOpenBtn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={t.historyDeleteAria}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
