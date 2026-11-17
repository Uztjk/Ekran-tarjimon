import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Clipboard,
  Crop,
  Eye,
  Monitor,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import type { CropRegion, TextBlock, ViewMode } from "../types/translator";
import { SAMPLE_SCREENS } from "../utils/sampleScreens";

interface ScreenCanvasStageProps {
  imageDataUrl: string | null;
  blocks: TextBlock[];
  viewMode: ViewMode;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (value: number) => void;
  isTranslating: boolean;
  onUploadFile: (file: File) => void;
  onSelectSample: (presetId: string) => void;
  onOpenCamera: () => void;
  onOpenScreenShare: () => void;
  onRetranslate: () => void;
  onCropTranslate: (region: CropRegion) => void;
  onClearScreen: () => void;
}

export const ScreenCanvasStage: React.FC<ScreenCanvasStageProps> = ({
  imageDataUrl,
  blocks,
  viewMode,
  selectedBlockId,
  onSelectBlock,
  overlayOpacity,
  onOverlayOpacityChange,
  isTranslating,
  onUploadFile,
  onSelectSample,
  onOpenCamera,
  onOpenScreenShare,
  onRetranslate,
  onCropTranslate,
  onClearScreen,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 360, height: 720 });
  const [isPeekingOriginal, setIsPeekingOriginal] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<CropRegion | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [imageDataUrl, viewMode]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onUploadFile(file);
    }
  };

  const getRelativePoint = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCropMode) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getRelativePoint(e);
    setDragStart(pt);
    setCropRect({ xmin: pt.x, ymin: pt.y, xmax: pt.x, ymax: pt.y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isCropMode || !dragStart) return;
    const pt = getRelativePoint(e);
    setCropRect({
      xmin: Math.min(dragStart.x, pt.x),
      ymin: Math.min(dragStart.y, pt.y),
      xmax: Math.max(dragStart.x, pt.x),
      ymax: Math.max(dragStart.y, pt.y),
    });
  };

  const handlePointerUp = () => {
    if (!isCropMode || !dragStart || !cropRect) return;
    setDragStart(null);
    const width = cropRect.xmax - cropRect.xmin;
    const height = cropRect.ymax - cropRect.ymin;
    if (width > 0.04 && height > 0.03) {
      setIsCropMode(false);
      onCropTranslate(cropRect);
      setCropRect(null);
    } else {
      setCropRect(null);
    }
  };

  const renderOverlayBlocks = () => {
    if (isPeekingOriginal || isCropMode || blocks.length === 0) return null;

    return blocks.map((block) => {
      const [ymin, xmin, ymax, xmax] = block.box_2d;
      const topPct = ymin / 10;
      const leftPct = xmin / 10;
      const widthPct = Math.max(2, (xmax - xmin) / 10);
      const heightPct = Math.max(1.8, (ymax - ymin) / 10);

      const boxPixelWidth = (widthPct / 100) * stageSize.width;
      const boxPixelHeight = (heightPct / 100) * stageSize.height;
      const charCount = Math.max(1, block.translatedText.length);

      // Adaptive font size calculation so translated text fits cleanly inside its bounding box
      const areaEstimate = boxPixelWidth * boxPixelHeight;
      const idealByArea = Math.sqrt((areaEstimate * 0.72) / charCount) * 1.15;
      const idealByHeight = boxPixelHeight * (block.category === "heading" ? 0.65 : 0.62);
      const computedFontSize = Math.max(
        9,
        Math.min(18, Math.min(idealByArea, idealByHeight))
      );

      const isSelected = selectedBlockId === block.id;

      let toneClasses =
        "bg-white text-slate-900 border-slate-300/70";
      if (block.bgTone === "dark") {
        toneClasses = "bg-[#0F172A] text-slate-50 border-slate-700/80";
      } else if (block.bgTone === "accent") {
        toneClasses = "bg-[#2563EB] text-white border-[#1D4ED8]";
      }

      return (
        <button
          key={block.id}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectBlock(isSelected ? null : block.id);
          }}
          title={`${block.originalText} → ${block.translatedText}`}
          style={{
            top: `${topPct}%`,
            left: `${leftPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
            opacity: overlayOpacity / 100,
            fontSize: `${computedFontSize}px`,
            lineHeight: 1.15,
          }}
          className={`absolute z-10 px-1 py-0.5 rounded-[4px] border text-left flex items-center overflow-hidden transition-transform duration-150 cursor-pointer focus-visible:outline-none ${toneClasses} ${
            isSelected
              ? "ring-2 ring-[#2563EB] ring-offset-1 scale-[1.02] z-20 shadow-md"
              : "hover:z-20 hover:ring-1 hover:ring-[#2563EB]/70"
          } ${block.category === "button" ? "justify-center text-center font-semibold" : ""} ${
            block.category === "heading" ? "font-semibold" : "font-medium"
          }`}
        >
          <span className="line-clamp-3 break-words w-full">{block.translatedText}</span>
        </button>
      );
    });
  };

  if (!imageDataUrl) {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed transition-colors bg-white dark:bg-[#131B2B] p-6 sm:p-10 flex flex-col items-center justify-center text-center min-h-[460px] lg:min-h-[600px] ${
          isDraggingOver
            ? "border-[#2563EB] bg-[#2563EB]/5"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        <div className="max-w-md space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
            <Upload className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-balance">
              Telefon ekranini yuklang yoki skanerlang
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Skrinshotni shu yerga tashlang, Ctrl+V bilan joylang, kamera orqali suratga oling yoki jonli ekran oynasini ulang.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Skrinshot tanlash</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadFile(f);
                  e.target.value = "";
                }}
              />
            </label>

            <button
              type="button"
              onClick={onOpenCamera}
              className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Kamera</span>
            </button>

            {typeof navigator !== "undefined" &&
              Boolean(navigator.mediaDevices?.getDisplayMedia) && (
                <button
                  type="button"
                  onClick={onOpenScreenShare}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Monitor className="w-4 h-4" />
                  <span>Ekran ulashish</span>
                </button>
              )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Tezkor sinab ko'rish uchun namuna telefon ekranlari:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {SAMPLE_SCREENS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectSample(preset.id)}
                  className="px-3 py-2 min-h-[40px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500 inline-flex items-center gap-1.5">
            <Clipboard className="w-3.5 h-3.5" />
            <span>Maslahat: Skrinshotni nusxalab Ctrl+V bossangiz ham darhol ochiladi</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className={`rounded-2xl bg-white dark:bg-[#131B2B] border transition-colors overflow-hidden ${
        isDraggingOver
          ? "border-[#2563EB]"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Stage Controls Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#0F1521]">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onPointerDown={() => setIsPeekingOriginal(true)}
            onPointerUp={() => setIsPeekingOriginal(false)}
            onPointerLeave={() => setIsPeekingOriginal(false)}
            onPointerCancel={() => setIsPeekingOriginal(false)}
            className="px-3 py-1.5 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Original (bosib turing)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsCropMode((prev) => !prev);
              setCropRect(null);
            }}
            className={`px-3 py-1.5 min-h-[40px] rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
              isCropMode
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Crop className="w-3.5 h-3.5" />
            <span>{isCropMode ? "Hududni tortib belgilang..." : "Hududni kesib tarjima"}</span>
          </button>

          <button
            type="button"
            disabled={isTranslating}
            onClick={onRetranslate}
            className="px-3 py-1.5 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTranslating ? "animate-spin" : ""}`} />
            <span>Qayta tarjima</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {viewMode !== "list" && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
              <span>Qoplama</span>
              <input
                type="range"
                min={35}
                max={100}
                value={overlayOpacity}
                onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
                className="w-20 accent-[#2563EB] cursor-pointer"
                aria-label="Tarjima qoplamasi shaffofligi"
              />
              <span className="font-mono tabular-nums w-8 text-right">{overlayOpacity}%</span>
            </label>
          )}

          <button
            type="button"
            onClick={onClearScreen}
            aria-label="Ekranni tozalash"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Phone Screen Canvas */}
      <div className="p-4 sm:p-6 bg-slate-100/80 dark:bg-[#0B0F17] flex justify-center">
        {viewMode === "split" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl items-start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                Asl ekran
              </p>
              <div className="relative mx-auto max-w-[360px] rounded-[24px] overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-sm">
                <img
                  src={imageDataUrl}
                  alt="Asl telefon ekrani"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block select-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                Tarjima qilingan ekran
              </p>
              <div
                ref={stageRef}
                onClick={() => onSelectBlock(null)}
                className="relative mx-auto max-w-[360px] rounded-[24px] overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-sm"
              >
                <img
                  src={imageDataUrl}
                  alt="Tarjima qilingan telefon ekrani"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block select-none"
                />
                {renderOverlayBlocks()}
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={stageRef}
            onClick={() => !isCropMode && onSelectBlock(null)}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className={`relative mx-auto w-full max-w-[390px] rounded-[26px] overflow-hidden border-4 border-slate-800 dark:border-slate-700 bg-slate-950 shadow-lg ${
              isCropMode ? "cursor-crosshair touch-none" : ""
            }`}
          >
            <img
              src={imageDataUrl}
              alt="Yuklangan telefon ekrani"
              referrerPolicy="no-referrer"
              className="w-full h-auto block select-none pointer-events-none"
            />

            {renderOverlayBlocks()}

            {/* Crop selection rectangle */}
            {isCropMode && cropRect && (
              <div
                style={{
                  left: `${cropRect.xmin * 100}%`,
                  top: `${cropRect.ymin * 100}%`,
                  width: `${(cropRect.xmax - cropRect.xmin) * 100}%`,
                  height: `${(cropRect.ymax - cropRect.ymin) * 100}%`,
                }}
                className="absolute z-30 border-2 border-[#2563EB] bg-[#2563EB]/20 pointer-events-none"
              />
            )}

            {/* Loading Scrim */}
            {isTranslating && (
              <div className="absolute inset-0 z-30 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center gap-3">
                <div className="w-9 h-9 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <p className="text-sm font-semibold text-white">
                  Ekrandagi matnlar aniqlanib tarjima qilinmoqda...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
