import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  Camera,
  Crown,
  ExternalLink,
  Megaphone,
  Monitor,
  Moon,
  PlayCircle,
  Sun,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { CaptureModal, type CaptureKind } from "./components/CaptureModal";
import { GuideView } from "./components/GuideView";
import { Header } from "./components/Header";
import { HistoryView } from "./components/HistoryView";
import { InspectorPanel } from "./components/InspectorPanel";
import { LanguageSelector } from "./components/LanguageSelector";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { OfflineIndicator, PWAInstallButton } from "./components/PWAInstallButton";
import { PricingModal } from "./components/PricingModal";
import { ScreenCanvasStage } from "./components/ScreenCanvasStage";
import {
  getLanguageByCode,
  SOURCE_LANGUAGES,
  TARGET_LANGUAGES,
} from "./constants/languages";
import { useAuth } from "./contexts/AuthContext";
import { useAdsgram } from "./hooks/useAdsgram";
import type {
  AppTab,
  CropRegion,
  HistoryItem,
  NicheMode,
  TextBlock,
  TranslationResult,
  ViewMode,
} from "./types/translator";
import {
  cropImageRegion,
  prepareImageForUpload,
  SAMPLE_SCREENS,
} from "./utils/sampleScreens";

const HISTORY_STORAGE_KEY = "ekrantarjimon_history_v1";
const THEME_STORAGE_KEY = "ekrantarjimon_theme_v1";

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<AppTab>("translator");
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
    } catch {
      return false;
    }
  });

  const {
    user,
    canTranslate,
    remainingToday,
    dailyLimit,
    isPro,
    canWatchAdReward,
    monetizationConfig,
    consumeQuota,
    grantAdReward,
    logTranslationToCloud,
  } = useAuth();

  const { showRewardedAd, isShowingAd, adMessage, clearAdMessage } =
    useAdsgram(grantAdReward, monetizationConfig.adsgramBlockId);

  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("uz");
  const [viewMode, setViewMode] = useState<ViewMode>("overlay");
  const [nicheMode, setNicheMode] = useState<NicheMode>("general");
  const [overlayOpacity, setOverlayOpacity] = useState<number>(92);

  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [screenTitle, setScreenTitle] = useState<string>("Telefon ekrani");

  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [captureModalMode, setCaptureModalMode] = useState<CaptureKind | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);

  // Telegram Mini App integration when opened inside Telegram WebView
  useEffect(() => {
    const tg = (
      window as unknown as {
        Telegram?: { WebApp?: { ready?: () => void; expand?: () => void } };
      }
    ).Telegram?.WebApp;
    if (tg) {
      tg.ready?.();
      tg.expand?.();
    }
  }, []);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // Ignore storage errors
    }
  }, [isDark]);

  // Persist history safely (keep last 15 items to stay within localStorage quota)
  const saveToHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((p) => p.id !== item.id)].slice(0, 15);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // If quota exceeded due to large screenshots, keep fewer items
        const trimmed = next.slice(0, 5);
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
        } catch {
          // Ignore
        }
      }
      return next;
    });
  }, []);

  const translateImage = useCallback(
    async (
      dataUrl: string,
      mimeType: string,
      title: string,
      opts?: { srcLang?: string; tgtLang?: string; isCroppedRegion?: boolean }
    ) => {
      if (!canTranslate) {
        setErrorMessage(
          "Bugungi bepul tarjima limitingiz tugadi. Davom etish uchun Google bilan kiring yoki Pro tarifga o'ting."
        );
        setIsPricingOpen(true);
        return;
      }

      const activeSrc = opts?.srcLang ?? sourceLang;
      const activeTgt = opts?.tgtLang ?? targetLang;
      const srcName = getLanguageByCode(activeSrc).nameUz;
      const tgtName = getLanguageByCode(activeTgt).nameUz;

      setIsTranslating(true);
      setErrorMessage(null);
      setSelectedBlockId(null);

      try {
        const res = await fetch("/api/translate-screen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType,
            sourceLang: activeSrc,
            targetLang: activeTgt,
            sourceLangName: srcName,
            targetLangName: tgtName,
            isCroppedRegion: Boolean(opts?.isCroppedRegion),
            nicheMode,
          }),
        });

        const payload = (await res.json()) as Partial<TranslationResult> & {
          error?: string;
        };

        if (!res.ok) {
          throw new Error(payload.error || "Tarjima jarayonida xatolik yuz berdi.");
        }

        const resultBlocks = Array.isArray(payload.blocks) ? payload.blocks : [];
        const detected = payload.detectedLanguage || "Aniqlangan";
        const sum = payload.summary || "";
        const ms = typeof payload.durationMs === "number" ? payload.durationMs : null;

        setBlocks(resultBlocks);
        setDetectedLanguage(detected);
        setSummary(sum);
        setDurationMs(ms);

        if (resultBlocks.length === 0) {
          setErrorMessage(
            "Ushbu tasvirda o'qiladigan matn topilmadi. Aniqroq skrinshot yuklab ko'ring."
          );
        } else {
          await consumeQuota();
          logTranslationToCloud({
            title,
            nicheMode,
            sourceLang: activeSrc,
            targetLang: activeTgt,
            detectedLanguage: detected,
            summary: sum,
            blockCount: resultBlocks.length,
            previewLines: resultBlocks.map((b) => b.translatedText),
          }).catch(() => {});

          saveToHistory({
            id: `hist-${Date.now()}`,
            createdAt: Date.now(),
            title,
            sourceLang: activeSrc,
            targetLang: activeTgt,
            targetLangName: tgtName,
            detectedLanguage: detected,
            summary: sum,
            imageDataUrl: dataUrl,
            blocks: resultBlocks,
            durationMs: ms ?? 0,
          });
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Server bilan bog'lanishda xatolik yuz berdi."
        );
      } finally {
        setIsTranslating(false);
      }
    },
    [
      canTranslate,
      sourceLang,
      targetLang,
      nicheMode,
      consumeQuota,
      logTranslationToCloud,
      saveToHistory,
    ]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setActiveTab("translator");
        setErrorMessage(null);
        const prepared = await prepareImageForUpload(file);
        const cleanTitle = file.name.replace(/\.[^.]+$/, "") || "Skrinshot";
        setImageDataUrl(prepared.dataUrl);
        setImageMimeType(prepared.mimeType);
        setScreenTitle(cleanTitle);
        setBlocks([]);
        await translateImage(prepared.dataUrl, prepared.mimeType, cleanTitle);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Rasmni yuklab bo'lmadi."
        );
      }
    },
    [translateImage]
  );

  // Global Ctrl+V / Cmd+V image paste support
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFileUpload(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFileUpload]);

  const handleSelectSample = async (presetId: string) => {
    const preset = SAMPLE_SCREENS.find((s) => s.id === presetId);
    if (!preset) return;
    setActiveTab("translator");
    const dataUrl = preset.generate();
    setImageDataUrl(dataUrl);
    setImageMimeType("image/png");
    setScreenTitle(preset.label);
    setSourceLang(preset.sourceCode);
    setBlocks([]);
    await translateImage(dataUrl, "image/png", preset.label, {
      srcLang: preset.sourceCode,
    });
  };

  const handleCaptureFrame = async (
    dataUrl: string,
    mimeType: string,
    label: string
  ) => {
    setCaptureModalMode(null);
    setActiveTab("translator");
    setImageDataUrl(dataUrl);
    setImageMimeType(mimeType);
    setScreenTitle(label);
    setBlocks([]);
    await translateImage(dataUrl, mimeType, label);
  };

  const handleCropTranslate = async (region: CropRegion) => {
    if (!imageDataUrl) return;
    try {
      const cropped = await cropImageRegion(imageDataUrl, region);
      // Translate the cropped area and show it clearly as the focused screen
      setImageDataUrl(cropped.dataUrl);
      setImageMimeType(cropped.mimeType);
      const cropTitle = `${screenTitle} (kesilgan hudud)`;
      setScreenTitle(cropTitle);
      setBlocks([]);
      await translateImage(cropped.dataUrl, cropped.mimeType, cropTitle, {
        isCroppedRegion: true,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Hududni kesishda xatolik."
      );
    }
  };

  const handleTargetLangChange = (newTarget: string) => {
    setTargetLang(newTarget);
    if (imageDataUrl && !isTranslating && newTarget !== targetLang) {
      translateImage(imageDataUrl, imageMimeType, screenTitle, {
        tgtLang: newTarget,
      });
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === "auto") {
      const nextTarget = targetLang === "en" ? "uz" : "en";
      setSourceLang(targetLang);
      handleTargetLangChange(nextTarget);
      return;
    }
    const prevSource = sourceLang;
    setSourceLang(targetLang);
    handleTargetLangChange(prevSource);
  };

  const handleUpdateBlockText = (id: string, newTranslatedText: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, translatedText: newTranslatedText } : b))
    );
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setImageDataUrl(item.imageDataUrl);
    setImageMimeType("image/jpeg");
    setScreenTitle(item.title);
    setSourceLang(item.sourceLang);
    setTargetLang(item.targetLang);
    setDetectedLanguage(item.detectedLanguage);
    setSummary(item.summary);
    setBlocks(item.blocks);
    setDurationMs(item.durationMs);
    setSelectedBlockId(null);
    setErrorMessage(null);
    setActiveTab("translator");
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f);
          e.target.value = "";
        }}
      />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenPricing={() => setIsPricingOpen(true)}
        historyCount={history.length}
      />

      <main className="flex-1">
        {activeTab === "translator" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4">
            {/* Workspace Language & View Toolbar */}
            <section
              aria-label="Tarjima sozlamalari va boshqaruv paneli"
              className="rounded-2xl bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Language Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <LanguageSelector
                    ariaLabel="Manba tili"
                    value={sourceLang}
                    onChange={setSourceLang}
                    options={SOURCE_LANGUAGES}
                  />

                  <button
                    type="button"
                    onClick={handleSwapLanguages}
                    aria-label="Tillarni almashtirish"
                    className="min-h-[42px] min-w-[42px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#2563EB] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>

                  <LanguageSelector
                    ariaLabel="Tarjima tili"
                    value={targetLang}
                    onChange={handleTargetLangChange}
                    options={TARGET_LANGUAGES}
                    accent
                  />
                </div>

                {/* View Mode + Capture & Theme Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B0F17] rounded-xl">
                    {(
                      [
                        { id: "overlay", label: "Ustma-ust" },
                        { id: "split", label: "Yonma-yon" },
                        { id: "list", label: "Ro'yxat" },
                      ] as Array<{ id: ViewMode; label: string }>
                    ).map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setViewMode(mode.id)}
                        className={`px-3 py-1.5 min-h-[34px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          viewMode === mode.id
                            ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCaptureModalMode("camera")}
                      className="px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Kamera</span>
                    </button>
                    {typeof navigator !== "undefined" &&
                      Boolean(navigator.mediaDevices?.getDisplayMedia) && (
                        <button
                          type="button"
                          onClick={() => setCaptureModalMode("screen")}
                          className="px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Monitor className="w-4 h-4" />
                          <span>Ekran ulashish</span>
                        </button>
                      )}
                  </div>

                  <PWAInstallButton />

                  <button
                    type="button"
                    onClick={() => setIsDark((prev) => !prev)}
                    aria-label={isDark ? "Yorug' rejim" : "Tungi rejim"}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Niche Specialization & Quota Row */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1">
                    Uslub:
                  </span>
                  {(
                    [
                      { id: "general", label: "Umumiy" },
                      { id: "ecommerce", label: "1688 / Taobao / Trendyol" },
                      { id: "finance", label: "Bank va Rasmiy" },
                      { id: "travel", label: "Sayohat va Menyu" },
                    ] as Array<{ id: NicheMode; label: string }>
                  ).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setNicheMode(n.id)}
                      className={`px-2.5 py-1.5 min-h-[32px] text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        nicheMode === n.id
                          ? "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                    {isPro
                      ? "Pro tarif · Cheksiz"
                      : `Bugungi limit: ${remainingToday} / ${dailyLimit}`}
                  </span>
                  {!isPro && canWatchAdReward && (
                    <button
                      type="button"
                      onClick={showRewardedAd}
                      disabled={isShowingAd}
                      className="px-3 py-1.5 min-h-[34px] rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>{isShowingAd ? "Yuklanmoqda..." : "+2 (Reklama)"}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsPricingOpen(true)}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-[#2563EB] text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    {isPro ? (
                      <UserIcon className="w-3.5 h-3.5 text-[#2563EB]" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 text-[#2563EB]" />
                    )}
                    <span>
                      {user
                        ? isPro
                          ? "Akkaunt"
                          : "Pro olish"
                        : "Kirish / Pro"}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Ad reward feedback notice */}
            {adMessage && (
              <div className="rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-slate-800 dark:text-slate-200">
                <span className="font-medium">{adMessage}</span>
                <button
                  type="button"
                  onClick={clearAdMessage}
                  className="font-medium text-[#2563EB] hover:underline cursor-pointer shrink-0"
                >
                  Yopish
                </button>
              </div>
            )}

            {/* Error Notice */}
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800 dark:text-rose-200"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium">{errorMessage}</p>
                </div>
                {!canTranslate && canWatchAdReward && (
                  <button
                    type="button"
                    onClick={showRewardedAd}
                    disabled={isShowingAd}
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{isShowingAd ? "Yuklanmoqda..." : "Reklama ko'rish (+2)"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-xs font-medium underline cursor-pointer shrink-0"
                >
                  Yopish
                </button>
              </div>
            )}

            {/* Main 2-Column Workspace */}
            {viewMode === "list" && imageDataUrl ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#131B2B] border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {screenTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Almashtirish</span>
                    </button>
                  </div>
                  <img
                    src={imageDataUrl}
                    alt={screenTitle}
                    referrerPolicy="no-referrer"
                    className="w-full max-w-[280px] mx-auto rounded-2xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div className="lg:col-span-8">
                  <InspectorPanel
                    blocks={blocks}
                    summary={summary}
                    detectedLanguage={detectedLanguage}
                    targetLang={targetLang}
                    durationMs={durationMs}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onUpdateBlockText={handleUpdateBlockText}
                    isTranslating={isTranslating}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7 xl:col-span-8">
                  <ScreenCanvasStage
                    imageDataUrl={imageDataUrl}
                    blocks={blocks}
                    viewMode={viewMode}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    overlayOpacity={overlayOpacity}
                    onOverlayOpacityChange={setOverlayOpacity}
                    isTranslating={isTranslating}
                    onUploadFile={handleFileUpload}
                    onSelectSample={handleSelectSample}
                    onOpenCamera={() => setCaptureModalMode("camera")}
                    onOpenScreenShare={() => setCaptureModalMode("screen")}
                    onRetranslate={() => {
                      if (imageDataUrl) {
                        translateImage(imageDataUrl, imageMimeType, screenTitle);
                      }
                    }}
                    onCropTranslate={handleCropTranslate}
                    onClearScreen={() => {
                      setImageDataUrl(null);
                      setBlocks([]);
                      setSummary("");
                      setDetectedLanguage("");
                      setDurationMs(null);
                      setSelectedBlockId(null);
                      setErrorMessage(null);
                    }}
                  />
                </div>

                <div className="lg:col-span-5 xl:col-span-4">
                  <InspectorPanel
                    blocks={blocks}
                    summary={summary}
                    detectedLanguage={detectedLanguage}
                    targetLang={targetLang}
                    durationMs={durationMs}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onUpdateBlockText={handleUpdateBlockText}
                    isTranslating={isTranslating}
                  />
                </div>
              </div>
            )}

            {/* Admin-managed Direct Sponsor Banner (hidden for Pro users) */}
            {!isPro &&
              monetizationConfig.sponsorActive &&
              (monetizationConfig.sponsorTitle ||
                monetizationConfig.sponsorDescription) && (
                <section
                  aria-label="Homiy reklama banneri"
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Homiy
                        </span>
                        {monetizationConfig.sponsorTitle && (
                          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {monetizationConfig.sponsorTitle}
                          </h3>
                        )}
                      </div>
                      {monetizationConfig.sponsorDescription && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {monetizationConfig.sponsorDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <a
                    href={monetizationConfig.sponsorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>{monetizationConfig.sponsorCtaLabel || "Batafsil"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </section>
              )}
          </div>
        )}

        {activeTab === "history" && (
          <HistoryView
            items={history}
            onRestoreItem={handleRestoreHistory}
            onDeleteItem={handleDeleteHistory}
            onClearAll={handleClearHistory}
          />
        )}

        {activeTab === "guide" && (
          <GuideView onStartTranslating={() => setActiveTab("translator")} />
        )}
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenCamera={() => setCaptureModalMode("camera")}
      />

      <CaptureModal
        mode={captureModalMode}
        onClose={() => setCaptureModalMode(null)}
        onCaptureFrame={handleCaptureFrame}
        onSwitchToUpload={() => fileInputRef.current?.click()}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
}
