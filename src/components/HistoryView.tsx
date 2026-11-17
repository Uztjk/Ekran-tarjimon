import React from "react";
import { ArrowRight, Trash2 } from "lucide-react";
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
  const formatTime = (ts: number) => {
    try {
      return new Intl.DateTimeFormat("uz-UZ", {
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
            Tarjima tarixi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Avval tarjima qilingan telefon ekranlari qurilmangizda saqlanadi.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="px-4 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            Barcha tarixni tozalash
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] p-12 text-center space-y-2">
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            Saqlangan ekranlar hali yo'q
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tarjima qilgan har bir telefon skrinshotingiz avtomatik ravishda shu yerda saqlanadi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] p-4 flex gap-4 items-start"
            >
              <img
                src={item.imageDataUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-20 h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-900"
              />

              <div className="min-w-0 flex-1 flex flex-col justify-between min-h-[144px]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{formatTime(item.createdAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.blocks.length} ta blok</span>
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
                    <span>Ochish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label="Tarixdan o'chirish"
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
