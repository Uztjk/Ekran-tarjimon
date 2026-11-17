import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_ADSGRAM_BLOCK_ID =
  (import.meta.env.VITE_ADSGRAM_BLOCK_ID as string | undefined)?.trim() ||
  "77602";

interface AdsgramShowResult {
  done: boolean;
  description: string;
  state: "load" | "render" | "playing" | "destroy";
  error: boolean;
}

interface AdsgramController {
  show: () => Promise<AdsgramShowResult>;
  destroy?: () => void;
}

interface AdsgramGlobal {
  init: (config: {
    blockId: string;
    debug?: boolean;
    debugConsole?: boolean;
  }) => AdsgramController;
}

declare global {
  interface Window {
    Adsgram?: AdsgramGlobal;
  }
}

async function ensureAdsgramLoaded(): Promise<AdsgramGlobal | null> {
  if (window.Adsgram) return window.Adsgram;

  const existing = document.querySelector<HTMLScriptElement>(
    'script[src*="sad.adsgram.ai"]'
  );
  if (!existing) {
    const script = document.createElement("script");
    script.src = "https://sad.adsgram.ai/js/sad.min.js";
    script.async = true;
    document.head.appendChild(script);
  }

  for (let i = 0; i < 25; i += 1) {
    if (window.Adsgram) return window.Adsgram;
    await new Promise((r) => setTimeout(r, 150));
  }
  return window.Adsgram ?? null;
}

function formatAdsgramFailureMessage(rawErr: unknown, blockId: string): string {
  const errObj =
    rawErr && typeof rawErr === "object"
      ? (rawErr as { description?: string; message?: string; state?: string })
      : null;
  const rawDesc =
    errObj?.description ||
    errObj?.message ||
    (typeof rawErr === "string" ? rawErr : "");
  const lower = rawDesc.toLowerCase();

  const tgInitData = (
    window as unknown as {
      Telegram?: { WebApp?: { initData?: string } };
    }
  ).Telegram?.WebApp?.initData;

  if (lower.includes("not equal") || lower.includes("referrer") || lower.includes("url")) {
    return `Adsgram kabinetida (partner.adsgram.ai) Web App URL manzili joriy sayt (${window.location.origin}) bilan mos emas. (${rawDesc})`;
  }

  if (
    !tgInitData &&
    (lower.includes("telegram") || lower.includes("session") || lower.includes("initdata") || !rawDesc)
  ) {
    return "Adsgram reklamalari faqat Telegram Mini App (bottingiz menyusi) ichida ochilganda ishlaydi. Oddiy brauzerda test qilib bo'lmaydi.";
  }

  if (lower.includes("not found") || lower.includes("invalid") || lower.includes("block")) {
    return `Blok ID (${blockId}) topilmadi yoki hali moderatsiyadan o'tmagan. (${rawDesc})`;
  }

  if (rawDesc) {
    return `Reklama ko'rsatilmadi: ${rawDesc}`;
  }

  return "Hozircha reklama mavjud emas. Ilovani Telegram botingiz orqali ochib qayta urinib ko'ring.";
}

export function useAdsgram(
  onRewardEarned: () => Promise<void> | void,
  customBlockId?: string
) {
  const activeBlockId = (customBlockId || DEFAULT_ADSGRAM_BLOCK_ID).trim() || "77602";
  const controllerRef = useRef<{ blockId: string; instance: AdsgramController } | null>(
    null
  );
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [adMessage, setAdMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    ensureAdsgramLoaded().then((sdk) => {
      if (!mounted || !sdk) return;
      if (controllerRef.current?.blockId === activeBlockId) return;
      try {
        controllerRef.current = {
          blockId: activeBlockId,
          instance: sdk.init({ blockId: activeBlockId }),
        };
      } catch {
        // Defer initialization until showRewardedAd is triggered
      }
    });
    return () => {
      mounted = false;
    };
  }, [activeBlockId]);

  const showRewardedAd = useCallback(async () => {
    setAdMessage(null);
    setIsShowingAd(true);
    try {
      const sdk = await ensureAdsgramLoaded();
      if (!sdk) {
        setAdMessage(
          "Adsgram skripti yuklanmadi (internet yoki reklama bloklovchini tekshiring)."
        );
        return false;
      }

      const controller =
        controllerRef.current?.blockId === activeBlockId
          ? controllerRef.current.instance
          : sdk.init({ blockId: activeBlockId });
      controllerRef.current = { blockId: activeBlockId, instance: controller };

      const result = await controller.show();
      if (result && result.done && !result.error) {
        await onRewardEarned();
        setAdMessage("Tabriklaymiz! +2 ta bepul tarjima krediti qo'shildi.");
        return true;
      }

      if (result?.error) {
        setAdMessage(formatAdsgramFailureMessage(result, activeBlockId));
      } else {
        setAdMessage("Reklama oxirigacha ko'rilmadi.");
      }
      return false;
    } catch (err) {
      controllerRef.current = null;
      setAdMessage(formatAdsgramFailureMessage(err, activeBlockId));
      return false;
    } finally {
      setIsShowingAd(false);
    }
  }, [onRewardEarned, activeBlockId]);

  return {
    blockId: activeBlockId,
    showRewardedAd,
    isShowingAd,
    adMessage,
    clearAdMessage: () => setAdMessage(null),
  };
}
