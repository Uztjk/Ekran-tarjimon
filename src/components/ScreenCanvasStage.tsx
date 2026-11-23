import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Clipboard,
  Crop,
  Download,
  Eye,
  Monitor,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import viralAfterImg from "../assets/images/viral2_after_1795000626258.jpg";
import viralBeforeImg from "../assets/images/viral2_before_1795000602170.jpg";
import { useUiLang } from "../contexts/UiLangContext";
import type {
  CropRegion,
  TextBlock,
  TranslatedVariant,
  ViewMode,
} from "../types/translator";
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
  translatedVariants?: TranslatedVariant[];
  activeTargetLang?: string;
  onSelectVariant?: (targetLang: string) => void;
  onDownloadTranslated?: () => void;
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
  translatedVariants = [],
  activeTargetLang,
  onSelectVariant,
  onDownloadTranslated,
  onUploadFile,
  onSelectSample,
  onOpenCamera,
  onOpenScreenShare,
  onRetranslate,
  onCropTranslate,
  onClearScreen,
}) => {
  const { t } = useUiLang();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 360, height: 720 });
  const [isPeekingOriginal, setIsPeekingOriginal] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [cropRect, setCropRect] = useState<CropRegion | null>(null);
  const [samplePreviewTranslated, setSamplePreviewTranslated] = useState(true);
  const [beforeAfterPos, setBeforeAfterPos] = useState<number>(58);

  const samplePreviews = useMemo(() => {
    if (typeof document === "undefined") return [];
    return SAMPLE_SCREENS.map((preset) => ({
      ...preset,
      dataUrl: preset.generate(),
    }));
  }, []);

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
        className={`rounded-2xl border transition-colors bg-white dark:bg-[#131B2B] p-4 sm:p-7 space-y-6 ${
          isDraggingOver
            ? "border-[#2563EB] bg-[#2563EB]/5"
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {/* Hero Split: Clear Value + Interactive Before/After Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4 text-left">
            <p className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
              {t.heroEyebrow}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance leading-tight">
              {t.heroTitle}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <label className="px-5 py-3 min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-all shadow-sm">
                <Upload className="w-4 h-4" />
                <span>{t.chooseScreenshot}</span>
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
                className="px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>{t.camera}</span>
              </button>

              {typeof navigator !== "undefined" &&
                Boolean(navigator.mediaDevices?.getDisplayMedia) && (
                  <button
                    type="button"
                    onClick={onOpenScreenShare}
                    className="px-4 py-3 min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Monitor className="w-4 h-4" />
                    <span>{t.screenShare}</span>
                  </button>
                )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.heroSteps}
            </p>

            <p className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Clipboard className="w-3.5 h-3.5" />
              <span>{t.pasteHint}</span>
            </p>
          </div>

          {/* Interactive Real Before -> After Wipe Card */}
          <div className="md:col-span-5 flex flex-col items-center gap-2.5">
            <div className="relative w-full max-w-[240px] aspect-[9/14] rounded-2xl overflow-hidden bg-[#08101C] border border-slate-200 dark:border-slate-700 shadow-md select-none">
              {/* Translated Uzbek layer (bottom, revealed on right side) */}
              <img
                src={viralAfterImg}
                alt="Xitoycha mahsulot sahifasining o'zbekcha tarjimasi"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-center scale-[1.18] pointer-events-none"
              />
              {/* Original Chinese layer (clipped by slider) */}
              <div
                style={{ clipPath: `inset(0 ${100 - beforeAfterPos}% 0 0)` }}
                className="absolute inset-0 pointer-events-none"
              >
                <img
                  src={viralBeforeImg}
                  alt="Asl xitoycha 1688 ekrani"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center scale-[1.18]"
                />
              </div>

              {/* Divider handle */}
              <div
                style={{ left: `${beforeAfterPos}%` }}
                className="absolute inset-y-0 w-0.5 bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.85)] pointer-events-none"
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#2563EB] border-2 border-white text-white flex items-center justify-center text-[10px] font-bold shadow">
                  ↔
                </div>
              </div>

              {/* Interactive range overlay */}
              <input
                type="range"
                min={0}
                max={100}
                value={beforeAfterPos}
                onChange={(e) => setBeforeAfterPos(Number(e.target.value))}
                aria-label="Asl rasm va tarjima qilingan rasmni solishtirish"
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B0F17] rounded-lg">
              <button
                type="button"
                onClick={() => setBeforeAfterPos(100)}
                className={`px-2.5 py-1 min-h-[30px] text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  beforeAfterPos >= 85
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.compareOriginal}
              </button>
              <button
                type="button"
                onClick={() => setBeforeAfterPos(50)}
                className={`px-2.5 py-1 min-h-[30px] text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  beforeAfterPos > 15 && beforeAfterPos < 85
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.compareSplit}
              </button>
              <button
                type="button"
                onClick={() => setBeforeAfterPos(0)}
                className={`px-2.5 py-1 min-h-[30px] text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  beforeAfterPos <= 15
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.compareTranslated}
              </button>
            </div>
          </div>
        </div>

        {/* 4-Language Translated Samples Gallery */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                {t.samplesTitle}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.samplesSubtitle}
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B0F17] rounded-lg">
              <button
                type="button"
                onClick={() => setSamplePreviewTranslated(true)}
                className={`px-2.5 py-1 min-h-[30px] text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  samplePreviewTranslated
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.tabTranslated}
              </button>
              <button
                type="button"
                onClick={() => setSamplePreviewTranslated(false)}
                className={`px-2.5 py-1 min-h-[30px] text-[11px] font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  !samplePreviewTranslated
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {t.tabOriginal}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {samplePreviews.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectSample(preset.id)}
                className="group text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B0F17] hover:border-[#2563EB] p-2 space-y-2 transition-colors cursor-pointer"
              >
                <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700">
                  {preset.dataUrl && (
                    <img
                      src={preset.dataUrl}
                      alt={preset.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover block"
                    />
                  )}
                  {samplePreviewTranslated &&
                    preset.previewBlocks.map((block) => {
                      const [ymin, xmin, ymax, xmax] = block.box_2d;
                      let toneClass = "bg-white/95 text-slate-900 border-slate-300/80";
                      if (block.bgTone === "dark") {
                        toneClass = "bg-[#0F172A]/95 text-slate-50 border-slate-700";
                      } else if (block.bgTone === "accent") {
                        toneClass = "bg-[#2563EB]/95 text-white border-[#1D4ED8]";
                      }
                      return (
                        <div
                          key={block.id}
                          style={{
                            top: `${ymin / 10}%`,
                            left: `${xmin / 10}%`,
                            width: `${Math.max(6, (xmax - xmin) / 10)}%`,
                            height: `${Math.max(2.6, (ymax - ymin) / 10)}%`,
                          }}
                          className={`absolute px-0.5 rounded-[2px] border text-[6px] sm:text-[7px] leading-tight font-semibold flex items-center overflow-hidden ${toneClass} ${
                            block.category === "button" ? "justify-center text-center" : ""
                          }`}
                        >
                          <span className="truncate w-full">{block.translatedText}</span>
                        </div>
                      );
                    })}
                </div>
                <div className="px-0.5 space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#2563EB]">
                    {preset.sourceCode.toUpperCase()} → UZ ({t.tabTranslated})
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {preset.langHint}
                  </p>
                </div>
              </button>
            ))}
          </div>
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
            <span>{t.peekOriginal}</span>
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
            <span>{isCropMode ? t.cropDragging : t.cropTranslate}</span>
          </button>

          <button
            type="button"
            disabled={isTranslating}
            onClick={onRetranslate}
            className="px-3 py-1.5 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTranslating ? "animate-spin" : ""}`} />
            <span>{t.retranslate}</span>
          </button>

          {blocks.length > 0 && onDownloadTranslated && (
            <button
              type="button"
              onClick={onDownloadTranslated}
              className="px-3 py-1.5 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.savePng}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {viewMode !== "list" && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
              <span>{t.opacityLabel}</span>
              <input
                type="range"
                min={35}
                max={100}
                value={overlayOpacity}
                onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
                className="w-20 accent-[#2563EB] cursor-pointer"
                aria-label={t.opacityLabel}
              />
              <span className="font-mono tabular-nums w-8 text-right">{overlayOpacity}%</span>
            </label>
          )}

          <button
            type="button"
            onClick={onClearScreen}
            aria-label={t.clearScreenAria}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Saved Target-Language Switcher for Current Image */}
      {translatedVariants.length > 0 && onSelectVariant && (
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
            {t.translatedLangsLabel}
          </span>
          {translatedVariants.map((variant) => {
            const isActive = variant.targetLang === activeTargetLang;
            return (
              <button
                key={variant.targetLang}
                type="button"
                onClick={() => onSelectVariant(variant.targetLang)}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? "bg-[#2563EB] text-white"
                    : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-[#2563EB]"
                }`}
              >
                {variant.targetLangName}
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Phone Screen Canvas */}
      <div className="p-4 sm:p-6 bg-slate-100/80 dark:bg-[#0B0F17] flex justify-center">
        {viewMode === "split" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl items-start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                {t.originalScreenLabel}
              </p>
              <div className="relative mx-auto max-w-[360px] rounded-[24px] overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-sm">
                <img
                  src={imageDataUrl}
                  alt={t.originalScreenLabel}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto block select-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
                {t.translatedScreenLabel}
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
                  {t.translatingOverlay}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
