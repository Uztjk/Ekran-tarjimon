import React, { useEffect, useRef, useState } from "react";
import { Camera, Monitor, RefreshCw, Upload, X } from "lucide-react";

export type CaptureKind = "camera" | "screen";

interface CaptureModalProps {
  mode: CaptureKind | null;
  onClose: () => void;
  onCaptureFrame: (dataUrl: string, mimeType: string, label: string) => void;
  onSwitchToUpload: () => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({
  mode,
  onClose,
  onCaptureFrame,
  onSwitchToUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  useEffect(() => {
    if (!mode) {
      stopStream();
      return;
    }

    let cancelled = false;

    async function startCapture() {
      setErrorMsg(null);
      setIsReady(false);
      stopStream();

      try {
        if (!navigator.mediaDevices) {
          throw new Error("UNSUPPORTED");
        }

        let stream: MediaStream;
        if (mode === "camera") {
          if (!navigator.mediaDevices.getUserMedia) {
            throw new Error("UNSUPPORTED");
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });
        } else {
          if (!navigator.mediaDevices.getDisplayMedia) {
            throw new Error("SCREEN_UNSUPPORTED");
          }
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              frameRate: { ideal: 15 },
            },
            audio: false,
          });
        }

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        // Handle user stopping screen share via browser chrome
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            stopStream();
            onClose();
          };
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg === "SCREEN_UNSUPPORTED") {
          setErrorMsg(
            "Bu brauzerda jonli ekran ulashish qo'llab-quvvatlanmaydi (ko'pincha mobil brauzerlarda cheklangan). Telefon skrinshotini yuklang yoki kameradan foydalaning."
          );
        } else if (msg === "UNSUPPORTED") {
          setErrorMsg("Ushbu qurilmada kamera yoki ekran yozib olish imkoniyati topilmadi.");
        } else if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
          setErrorMsg(
            mode === "camera"
              ? "Kameraga ruxsat berilmadi. Brauzer sozlamalaridan ruxsatni yoqing yoki skrinshot yuklang."
              : "Ekran ulashish bekor qilindi yoki ruxsat berilmadi."
          );
        } else {
          setErrorMsg(
            mode === "camera"
              ? "Kamerani ishga tushirib bo'lmadi. Qurilmangizda kamera ulanganligini tekshiring."
              : "Ekran ulashishni boshlab bo'lmadi. Skrinshot faylini yuklash usulidan foydalanishingiz mumkin."
          );
        }
      }
    }

    startCapture();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [mode, facingMode]);

  if (!mode) return null;

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !isReady || video.videoWidth === 0) return;

    const maxDim = 1600;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const label = mode === "camera" ? "Kamera kadri" : "Ekran kadri";
    stopStream();
    onCaptureFrame(dataUrl, "image/jpeg", label);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-modal-title"
    >
      <div className="w-full sm:max-w-2xl bg-white dark:bg-[#131B2B] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            {mode === "camera" ? (
              <Camera className="w-5 h-5 text-[#2563EB]" />
            ) : (
              <Monitor className="w-5 h-5 text-[#2563EB]" />
            )}
            <h2
              id="capture-modal-title"
              className="font-display text-base font-semibold text-slate-900 dark:text-white"
            >
              {mode === "camera"
                ? "Kamera orqali ekranni skanerlash"
                : "Jonli ekran oynasidan kadr olish"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            aria-label="Yopish"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
          {errorMsg ? (
            <div className="py-10 px-4 text-center space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                {errorMsg}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                    onSwitchToUpload();
                  }}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Skrinshot yuklash</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video sm:aspect-[16/10] flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-white text-sm">
                    {mode === "camera" ? "Kamera ishga tushmoqda..." : "Ekran tanlanmoqda..."}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === "camera"
                  ? "Boshqa telefon yoki monitor ekranini kadrga to'g'rilang va «Kadrni tarjima qilish» tugmasini bosing."
                  : "Telefon aks ettirilgan oyna (scrcpy, Phone Link) yoki brauzer tabini tanlab, kerakli paytda kadr oling."}
              </p>
            </div>
          )}
        </div>

        {!errorMsg && (
          <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#0F1521]">
            {mode === "camera" ? (
              <button
                type="button"
                onClick={() =>
                  setFacingMode((prev) => (prev === "environment" ? "user" : "environment"))
                }
                className="px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium inline-flex items-center gap-2 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Kamerani almashtirish</span>
              </button>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Jonli oqim tayyor bo'lgach kadr oling
              </span>
            )}

            <button
              type="button"
              disabled={!isReady}
              onClick={handleCapture}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              Kadrni tarjima qilish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
