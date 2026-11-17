import React, { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Search,
  Sparkles,
  Volume2,
} from "lucide-react";
import { getLanguageByCode } from "../constants/languages";
import type { BlockCategory, TextBlock } from "../types/translator";

interface InspectorPanelProps {
  blocks: TextBlock[];
  summary: string;
  detectedLanguage: string;
  targetLang: string;
  durationMs: number | null;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlockText: (id: string, newTranslatedText: string) => void;
  isTranslating: boolean;
}

type FilterType = "all" | BlockCategory;

const CATEGORY_LABELS: Record<FilterType, string> = {
  all: "Hammasi",
  heading: "Sarlavha",
  button: "Tugma",
  label: "Yorliq",
  body: "Matn",
  status: "Holat",
};

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  blocks,
  summary,
  detectedLanguage,
  targetLang,
  durationMs,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlockText,
  isTranslating,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId]
  );

  const filteredBlocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return blocks.filter((b) => {
      if (filter !== "all" && b.category !== filter) return false;
      if (!q) return true;
      return (
        b.originalText.toLowerCase().includes(q) ||
        b.translatedText.toLowerCase().includes(q)
      );
    });
  }, [blocks, filter, searchQuery]);

  const copyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      // Clipboard blocked silently
    }
  };

  const copyAll = async () => {
    if (blocks.length === 0) return;
    const text = blocks.map((b) => b.translatedText).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1800);
    } catch {
      // Clipboard blocked silently
    }
  };

  const exportTxt = () => {
    if (blocks.length === 0) return;
    const targetName = getLanguageByCode(targetLang).nameUz;
    const lines = [
      `EkranTarjimon — ${detectedLanguage} -> ${targetName}`,
      summary ? `Qisqacha mazmun: ${summary}` : "",
      "",
      ...blocks.map((b, i) => `${i + 1}. ${b.translatedText}\n   [Original: ${b.originalText}]`),
    ].filter((line) => line !== undefined);

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ekran-tarjima-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const speakText = (text: string, langCode: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageByCode(langCode).speechCode;
    window.speechSynthesis.speak(utterance);
  };

  const handleRefine = async (block: TextBlock) => {
    setRefiningId(block.id);
    setAlternatives([]);
    try {
      const targetName = getLanguageByCode(targetLang).nameUz;
      const res = await fetch("/api/translate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: block.originalText,
          targetLang,
          targetLangName: targetName,
          context: `Mobile UI ${block.category}`,
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        translatedText?: string;
        alternatives?: string[];
      };
      if (Array.isArray(data.alternatives)) {
        setAlternatives(data.alternatives);
      }
    } finally {
      setRefiningId(null);
    }
  };

  const targetName = getLanguageByCode(targetLang).nameUz;

  return (
    <aside className="bg-white dark:bg-[#131B2B] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      {/* Header & Unboxed Metadata */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Aniqlangan matnlar
          </h2>
          {blocks.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={copyAll}
                className="px-2.5 py-1.5 min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedAll ? "Nusxalandi" : "Barchasi"}</span>
              </button>
              <button
                type="button"
                onClick={exportTxt}
                aria-label="Matnni TXT fayl sifatida yuklab olish"
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {blocks.length > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span>{blocks.length} ta blok</span>
            <span aria-hidden="true">·</span>
            <span>
              {detectedLanguage} → {targetName}
            </span>
            {durationMs !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{(durationMs / 1000).toFixed(1)} s</span>
              </>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isTranslating
              ? "Ekran tahlil qilinmoqda..."
              : "Skrinshot yuklanganda barcha matn bloklari shu yerda ko'rinadi."}
          </p>
        )}

        {summary && (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {summary}
          </p>
        )}
      </div>

      {/* Selected Block Detail Panel */}
      {selectedBlock && (
        <div className="p-4 bg-slate-50 dark:bg-[#0F1521] border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
              Tanlangan blok · {CATEGORY_LABELS[selectedBlock.category]}
            </span>
            <button
              type="button"
              onClick={() => {
                onSelectBlock(null);
                setAlternatives([]);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Yopish
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Asl matn
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedBlock.originalText}
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="selected-translation-input"
              className="block text-[11px] font-medium text-slate-400 dark:text-slate-500"
            >
              Tarjima (tahrirlash mumkin)
            </label>
            <textarea
              id="selected-translation-input"
              rows={2}
              value={selectedBlock.translatedText}
              onChange={(e) => onUpdateBlockText(selectedBlock.id, e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => copyText(selectedBlock.translatedText, selectedBlock.id)}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              {copiedId === selectedBlock.id ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Nusxalash</span>
            </button>

            <button
              type="button"
              onClick={() => speakText(selectedBlock.translatedText, targetLang)}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tinglash</span>
            </button>

            <button
              type="button"
              disabled={refiningId === selectedBlock.id}
              onClick={() => handleRefine(selectedBlock)}
              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{refiningId === selectedBlock.id ? "Izlanmoqda..." : "Muqobil variantlar"}</span>
            </button>
          </div>

          {alternatives.length > 0 && (
            <div className="pt-1 space-y-1.5">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Muqobil tarjima takliflari:
              </p>
              <div className="flex flex-col gap-1.5">
                {alternatives.map((alt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onUpdateBlockText(selectedBlock.id, alt)}
                    className="text-left px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 hover:border-[#2563EB] transition-colors cursor-pointer"
                  >
                    {alt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Category Tabs */}
      {blocks.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Matn bo'yicha qidirish..."
              className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B0F17] rounded-xl overflow-x-auto">
            {(["all", "heading", "button", "body", "label"] as FilterType[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filter === cat
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto max-h-[540px] divide-y divide-slate-100 dark:divide-slate-800/80">
        {blocks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Hozircha matn bloklari yo'q. Chap tomondan skrinshot yoki namuna ekran tanlang.
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Qidiruv bo'yicha mos matn topilmadi.
          </div>
        ) : (
          filteredBlocks.map((block, index) => {
            const isSelected = block.id === selectedBlockId;
            return (
              <div
                key={block.id}
                onClick={() => onSelectBlock(block.id)}
                className={`px-4 py-3.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#2563EB]/8 dark:bg-[#2563EB]/15"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                      <span className="font-mono">{String(index + 1).padStart(2, "0")}</span>
                      <span aria-hidden="true">·</span>
                      <span>{CATEGORY_LABELS[block.category]}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                      {block.translatedText}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                      {block.originalText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyText(block.translatedText, block.id);
                    }}
                    aria-label="Tarjimani nusxalash"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
                  >
                    {copiedId === block.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
