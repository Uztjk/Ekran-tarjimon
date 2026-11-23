import React, { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Crown,
  ExternalLink,
  Gift,
  LogIn,
  LogOut,
  Megaphone,
  PlayCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  AD_REWARD_CREDITS,
  FREE_USER_DAILY_LIMIT,
  GUEST_DAILY_LIMIT,
  MAX_AD_REWARDS_PER_DAY,
  REFERRAL_INVITED_BONUS,
  REFERRAL_INVITER_BONUS,
  useAuth,
} from "../contexts/AuthContext";
import { useUiLang } from "../contexts/UiLangContext";
import { useAdsgram } from "../hooks/useAdsgram";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PlanKey = "pro_monthly" | "pro_yearly" | "pack_100";
type MethodKey =
  | "spitamen_bank"
  | "dcity"
  | "alif_bank"
  | "tajikistan_cards"
  | "telegram_stars"
  | "visa_mastercard";

const PLAN_DETAILS: Record<
  PlanKey,
  {
    title: string;
    priceLabel: string;
    starsAmount: number;
    amountUsd: number;
    desc: string;
  }
> = {
  pro_monthly: {
    title: "Pro Oylik",
    priceLabel: "$3 / oy",
    starsAmount: 150,
    amountUsd: 3,
    desc: "Cheksiz ekran tarjimasi, 1688/Taobao/Trendyol rejimi va ustuvor tezlik",
  },
  pro_yearly: {
    title: "Pro Yillik (33% chegirma)",
    priceLabel: "$24 / yil",
    starsAmount: 1200,
    amountUsd: 24,
    desc: "Yil davomida cheksiz tarjima va barcha kelgusi yangilanishlar",
  },
  pack_100: {
    title: "100 ta Kredit Paketi",
    priceLabel: "$1.50",
    starsAmount: 75,
    amountUsd: 1.5,
    desc: "Obunasiz, muddati tugamaydigan 100 ta qo'shimcha ekran tarjimasi",
  },
};

const METHOD_LABELS: Record<MethodKey, string> = {
  spitamen_bank: "Spitamen Bank",
  dcity: "Dushanbe City (DCity)",
  alif_bank: "Alif Bank",
  tajikistan_cards: "Tojikiston bank kartalari (Korti Milli)",
  telegram_stars: "Telegram Stars",
  visa_mastercard: "Visa / Mastercard",
};

const SPITAMEN_CARD_NUMBER = "4607 6555 1873 8133";
const ADMIN_TELEGRAM_HANDLE = "@Admiin_0571";
const ADMIN_TELEGRAM_URL = "https://t.me/Admiin_0571";

function formatUsd(amountUsd?: number, legacyUzs?: number): string {
  if (typeof amountUsd === "number") {
    return `$${amountUsd.toFixed(2).replace(/\.00$/, "")}`;
  }
  if (typeof legacyUzs === "number") {
    return `${legacyUzs.toLocaleString("uz-UZ")} so'm`;
  }
  return "$0";
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { uiLang, t } = useUiLang();
  const {
    user,
    isAdmin,
    quota,
    remainingToday,
    isPro,
    adRewardsToday,
    canWatchAdReward,
    myRequests,
    adminRequests,
    referralCount,
    monetizationConfig,
    signInWithGoogle,
    signOutUser,
    grantAdReward,
    saveMonetizationConfig,
    submitPaymentRequest,
    reviewPaymentRequest,
  } = useAuth();

  const { showRewardedAd, isShowingAd, adMessage } = useAdsgram(
    grantAdReward,
    monetizationConfig.adsgramBlockId
  );

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("pro_monthly");
  const [paymentMethod, setPaymentMethod] = useState<MethodKey>("spitamen_bank");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"plans" | "admin">("plans");
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const [botConfigured, setBotConfigured] = useState(false);
  const [adminNotifyConfigured, setAdminNotifyConfigured] = useState(false);
  const [starsLoading, setStarsLoading] = useState(false);
  const [starsInvoiceUrl, setStarsInvoiceUrl] = useState<string | null>(null);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  const [adsgramBlockIdInput, setAdsgramBlockIdInput] = useState(
    monetizationConfig.adsgramBlockId
  );
  const [sponsorActiveInput, setSponsorActiveInput] = useState(
    monetizationConfig.sponsorActive
  );
  const [sponsorTitleInput, setSponsorTitleInput] = useState(
    monetizationConfig.sponsorTitle
  );
  const [sponsorDescriptionInput, setSponsorDescriptionInput] = useState(
    monetizationConfig.sponsorDescription
  );
  const [sponsorCtaLabelInput, setSponsorCtaLabelInput] = useState(
    monetizationConfig.sponsorCtaLabel
  );
  const [sponsorUrlInput, setSponsorUrlInput] = useState(
    monetizationConfig.sponsorUrl
  );
  const [savingAdConfig, setSavingAdConfig] = useState(false);
  const [adConfigMessage, setAdConfigMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code?: unknown }).code || "")
          : "";
      if (code.includes("popup-blocked")) {
        setAuthError(
          "Brauzer kirish oynasini blokladi. Ruxsat berib qayta bosing."
        );
      } else if (code.includes("unauthorized-domain")) {
        setAuthError(
          "Ushbu domen Firebase Authorized domains ro'yxatiga qo'shilmagan."
        );
      } else if (code.includes("popup-closed-by-user")) {
        setAuthError("Kirish oynasi yopildi. Qayta urinib ko'ring.");
      } else {
        setAuthError(
          "Google bilan kirib bo'lmadi. Ilovani Telegram ichida emas, oddiy Chrome brauzerida ochib ko'ring."
        );
      }
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    setAdsgramBlockIdInput(monetizationConfig.adsgramBlockId);
    setSponsorActiveInput(monetizationConfig.sponsorActive);
    setSponsorTitleInput(monetizationConfig.sponsorTitle);
    setSponsorDescriptionInput(monetizationConfig.sponsorDescription);
    setSponsorCtaLabelInput(monetizationConfig.sponsorCtaLabel);
    setSponsorUrlInput(monetizationConfig.sponsorUrl);
  }, [monetizationConfig, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    fetch("/api/telegram/capabilities")
      .then((r) => r.json())
      .then((data: { botConfigured?: boolean; adminNotifyConfigured?: boolean }) => {
        if (!active) return;
        setBotConfigured(Boolean(data.botConfigured));
        setAdminNotifyConfigured(Boolean(data.adminNotifyConfigured));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    setStarsInvoiceUrl(null);
  }, [selectedPlan, paymentMethod]);

  const referralUrl = user
    ? `${window.location.origin}/?ref=${user.uid}`
    : "";

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(SPITAMEN_CARD_NUMBER.replace(/\s+/g, ""));
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  const handleCopyReferral = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 1800);
    } catch {
      // Ignore clipboard errors
    }
  };

  const handlePayWithStars = async () => {
    if (!user) {
      setFeedback("Avval Google akkaunt bilan kiring.");
      return;
    }
    setFeedback(null);
    setStarsLoading(true);
    try {
      const res = await fetch("/api/telegram/create-stars-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          planRequested: selectedPlan,
        }),
      });
      const data = (await res.json()) as {
        invoiceLink?: string;
        payloadId?: string;
        starsAmount?: number;
        error?: string;
      };
      if (!res.ok || !data.invoiceLink) {
        throw new Error(data.error || "Stars havolasini yaratib bo'lmadi.");
      }

      const tgWebApp = (
        window as unknown as {
          Telegram?: {
            WebApp?: {
              openInvoice?: (
                url: string,
                cb?: (status: string) => void
              ) => void;
            };
          };
        }
      ).Telegram?.WebApp;

      if (tgWebApp?.openInvoice) {
        tgWebApp.openInvoice(data.invoiceLink, async (status) => {
          if (status === "paid") {
            try {
              const planInfo = PLAN_DETAILS[selectedPlan];
              await submitPaymentRequest({
                planRequested: selectedPlan,
                paymentMethod: "telegram_stars",
                amountUsd: planInfo.amountUsd,
                note: `Telegram Stars to'landi (${data.starsAmount} ★ · ${data.payloadId})`,
              });
              setFeedback(
                "Telegram Stars to'lovi qabul qilindi! So'rovingiz tasdiqlash uchun adminga yuborildi."
              );
            } catch (err) {
              setFeedback(
                err instanceof Error
                  ? err.message
                  : "To'lov qayd etishda xatolik."
              );
            }
          } else if (status === "cancelled") {
            setFeedback("Telegram Stars to'lovi bekor qilindi.");
          } else if (status === "failed") {
            setFeedback("Telegram Stars to'lovida xatolik yuz berdi.");
          }
        });
      } else {
        setStarsInvoiceUrl(data.invoiceLink);
      }
    } catch (err) {
      setFeedback(
        err instanceof Error
          ? err.message
          : "Telegram Stars havolasini olishda xatolik."
      );
    } finally {
      setStarsLoading(false);
    }
  };

  const handleSetupWebhook = async () => {
    setWebhookMessage(null);
    try {
      const res = await fetch("/api/telegram/setup-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originUrl: window.location.origin }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        webhookUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Webhook ulanmadi.");
      }
      setWebhookMessage(`Webhook muvaffaqiyatli ulandi: ${data.webhookUrl}`);
    } catch (err) {
      setWebhookMessage(
        err instanceof Error ? err.message : "Webhook ulashda xatolik."
      );
    }
  };

  const handleSaveMonetizationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdConfigMessage(null);
    setSavingAdConfig(true);
    try {
      await saveMonetizationConfig({
        adsgramBlockId: adsgramBlockIdInput.trim() || "int-60310",
        sponsorActive: sponsorActiveInput,
        sponsorTitle: sponsorTitleInput.trim(),
        sponsorDescription: sponsorDescriptionInput.trim(),
        sponsorCtaLabel: sponsorCtaLabelInput.trim() || "Batafsil",
        sponsorUrl: sponsorUrlInput.trim() || "https://t.me/Admiin_0571",
      });
      setAdConfigMessage(
        "Reklama va Adsgram sozlamalari barcha foydalanuvchilar uchun saqlandi."
      );
    } catch (err) {
      setAdConfigMessage(
        err instanceof Error
          ? err.message
          : "Reklama sozlamalarini saqlashda xatolik yuz berdi."
      );
    } finally {
      setSavingAdConfig(false);
    }
  };

  if (!isOpen) return null;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const planInfo = PLAN_DETAILS[selectedPlan];
      await submitPaymentRequest({
        planRequested: selectedPlan,
        paymentMethod,
        amountUsd: planInfo.amountUsd,
        note,
      });
      setNote("");
      setFeedback(
        `To'lov so'rovingiz qabul qilindi. Tezroq faollashtirish uchun to'lov chekini Telegramda ${ADMIN_TELEGRAM_HANDLE} ga yuboring.`
      );
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "So'rov yuborishda xatolik yuz berdi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
    >
      <div className="w-full sm:max-w-3xl bg-white dark:bg-[#131B2B] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5 text-[#2563EB]" />
            <h2
              id="pricing-modal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-white"
            >
              {t.pricingModalTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B0F17] rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveView("plans")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    activeView === "plans"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  {t.pricingTabPlans}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("admin")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md inline-flex items-center gap-1 cursor-pointer ${
                    activeView === "admin"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    {t.pricingTabAdmin} (
                    {adminRequests.filter((r) => r.status === "pending").length})
                  </span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {/* Account & Current Quota Summary */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1521] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {user
                  ? user.displayName || user.email
                  : uiLang === "ru"
                  ? "Гостевой режим"
                  : uiLang === "en"
                  ? "Guest mode"
                  : uiLang === "tj"
                  ? "Ҳолати меҳмон"
                  : "Mehmon rejimi"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {isPro ? (
                  <span>{t.proUnlimited}</span>
                ) : user ? (
                  <span>
                    {t.dailyLimitLabel(remainingToday, FREE_USER_DAILY_LIMIT)}
                    {quota && quota.bonusCredits > 0
                      ? ` (+${quota.bonusCredits} bonus)`
                      : ""}
                  </span>
                ) : (
                  <span>
                    {t.dailyLimitLabel(remainingToday, GUEST_DAILY_LIMIT)} ·{" "}
                    {t.pricingSubtitleGuest}
                  </span>
                )}
              </div>
            </div>

            {user ? (
              <button
                type="button"
                onClick={signOutUser}
                className="px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.pricingSignOut}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signingIn}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>
                  {signingIn ? t.pricingSigningIn : t.pricingSignInGoogle}
                </span>
              </button>
            )}
            {authError && (
              <p className="w-full text-xs font-medium text-rose-600 dark:text-rose-400">
                {authError}
              </p>
            )}
          </div>

          {activeView === "admin" && isAdmin ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                  Kelib tushgan to&apos;lov so&apos;rovlari
                </h3>
                {adminRequests.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    Hozircha to&apos;lov so&apos;rovlari yo&apos;q.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    {adminRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0F1521]"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {req.userName} ·{" "}
                            {PLAN_DETAILS[req.planRequested]?.title}
                          </div>
                          <div className="text-xs text-slate-500 tabular-nums">
                            {METHOD_LABELS[req.paymentMethod] ??
                              req.paymentMethod}{" "}
                            · {formatUsd(req.amountUsd, req.amountUzs)} · Holat:{" "}
                            <span className="font-semibold">
                              {req.status === "pending"
                                ? "Kutilmoqda"
                                : req.status === "approved"
                                ? "Tasdiqlangan"
                                : "Rad etilgan"}
                            </span>
                          </div>
                          {req.note && (
                            <div className="text-xs text-slate-600 dark:text-slate-300">
                              Izoh: {req.note}
                            </div>
                          )}
                        </div>

                        {req.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => reviewPaymentRequest(req, "approved")}
                              className="px-3 py-1.5 min-h-[36px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                            >
                              Tasdiqlash
                            </button>
                            <button
                              type="button"
                              onClick={() => reviewPaymentRequest(req, "rejected")}
                              className="px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                            >
                              Rad etish
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Admin-only Telegram Bot & Stars automation guide */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1521] p-4 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-display text-xs font-semibold text-slate-900 dark:text-white">
                    Telegram Bot xabarnomasi va avtomatik Stars
                  </h4>
                  {botConfigured && (
                    <button
                      type="button"
                      onClick={handleSetupWebhook}
                      className="px-3 py-1.5 min-h-[34px] rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer"
                    >
                      Stars Webhook ulash
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {botConfigured && adminNotifyConfigured
                    ? "Bot tokeni va admin chat ID faol. Har bir yangi to'lov so'rovi Telegramingizga avtomatik keladi va Stars to'lov havolalari ishlamoqda."
                    : "Avtomatik Telegram xabarnomasi va Telegram Stars chekini yoqish uchun Settings > Secrets bo'limiga TELEGRAM_BOT_TOKEN (@BotFather dan) hamda TELEGRAM_ADMIN_CHAT_ID (@userinfobot dan olingan ID) kalitlarini kiriting."}
                </p>
                {webhookMessage && (
                  <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                    {webhookMessage}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  <a
                    href="/promo-video-2.mp4"
                    download="EkranTarjimon-Reels-2.mp4"
                    className="px-3 py-1.5 min-h-[34px] rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>🔥 Yangi Reels video #2 (.mp4)</span>
                  </a>
                  <a
                    href="/promo-video.mp4"
                    download="EkranTarjimon-Reels-1.mp4"
                    className="px-3 py-1.5 min-h-[34px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5"
                  >
                    <span>🎬 Reels video #1 (.mp4)</span>
                  </a>
                  <a
                    href="/promo-poster.jpg"
                    download="EkranTarjimon-Poster.jpg"
                    className="px-3 py-1.5 min-h-[34px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5"
                  >
                    <span>🖼 Reklama rasmi (.jpg)</span>
                  </a>
                </div>
              </div>

              {/* Admin-only Adsgram & Direct Sponsor Banner settings */}
              <form
                onSubmit={handleSaveMonetizationConfig}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1521] p-4 space-y-3.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#2563EB]" />
                    <h4 className="font-display text-xs font-semibold text-slate-900 dark:text-white">
                      Reklama va Adsgram sozlamalari
                    </h4>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sponsorActiveInput}
                      onChange={(e) => setSponsorActiveInput(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span>Homiy bannerini ko&apos;rsatish</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="admin-adsgram-block"
                      className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
                    >
                      Adsgram Block ID (Telegram Mini App)
                    </label>
                    <input
                      id="admin-adsgram-block"
                      type="text"
                      maxLength={64}
                      value={adsgramBlockIdInput}
                      onChange={(e) => setAdsgramBlockIdInput(e.target.value)}
                      placeholder="int-60310"
                      className="w-full px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="admin-sponsor-cta"
                      className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
                    >
                      Banner tugmasi matni
                    </label>
                    <input
                      id="admin-sponsor-cta"
                      type="text"
                      maxLength={40}
                      value={sponsorCtaLabelInput}
                      onChange={(e) => setSponsorCtaLabelInput(e.target.value)}
                      placeholder="Reklama berish"
                      className="w-full px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="admin-sponsor-title"
                    className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
                  >
                    Homiy banneri sarlavhasi (barcha brauzer va PWA da ishlaydi)
                  </label>
                  <input
                    id="admin-sponsor-title"
                    type="text"
                    maxLength={80}
                    value={sponsorTitleInput}
                    onChange={(e) => setSponsorTitleInput(e.target.value)}
                    placeholder="Masalan: Kargo yoki Telegram kanalingiz reklamasi"
                    className="w-full px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="admin-sponsor-desc"
                    className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
                  >
                    Banner matni
                  </label>
                  <input
                    id="admin-sponsor-desc"
                    type="text"
                    maxLength={220}
                    value={sponsorDescriptionInput}
                    onChange={(e) => setSponsorDescriptionInput(e.target.value)}
                    placeholder="Qisqa reklama taklifi..."
                    className="w-full px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="admin-sponsor-url"
                    className="block text-[11px] font-medium text-slate-600 dark:text-slate-400"
                  >
                    Tugma havolasi (https://...)
                  </label>
                  <input
                    id="admin-sponsor-url"
                    type="url"
                    maxLength={240}
                    value={sponsorUrlInput}
                    onChange={(e) => setSponsorUrlInput(e.target.value)}
                    placeholder="https://t.me/Admiin_0571"
                    className="w-full px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                {adConfigMessage && (
                  <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                    {adConfigMessage}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pro obunachilar uchun reklama va banner yashiriladi.
                  </span>
                  <button
                    type="submit"
                    disabled={savingAdConfig}
                    className="px-4 py-2 min-h-[38px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>
                      {savingAdConfig
                        ? "Saqlanmoqda..."
                        : "Reklama sozlamalarini saqlash"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Plan Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(Object.keys(PLAN_DETAILS) as PlanKey[]).map((key) => {
                  const item = PLAN_DETAILS[key];
                  const active = selectedPlan === key;
                  const localizedTitle =
                    uiLang === "ru"
                      ? key === "pro_monthly"
                        ? "Pro Месяц"
                        : key === "pro_yearly"
                        ? "Pro Год (−33%)"
                        : "Пакет 100 кредитов"
                      : uiLang === "en"
                      ? key === "pro_monthly"
                        ? "Pro Monthly"
                        : key === "pro_yearly"
                        ? "Pro Yearly (33% off)"
                        : "100 Credits Pack"
                      : uiLang === "tj"
                      ? key === "pro_monthly"
                        ? "Pro Моҳона"
                        : key === "pro_yearly"
                        ? "Pro Солона (33% тахфиф)"
                        : "Бастаи 100 кредит"
                      : item.title;
                  const localizedDesc =
                    uiLang === "ru"
                      ? key === "pro_monthly"
                        ? "Безлимитный перевод экранов, режим 1688/Taobao/Trendyol и приоритет"
                        : key === "pro_yearly"
                        ? "Безлимитный перевод на весь год и все будущие обновления"
                        : "100 дополнительных переводов без подписки и срока действия"
                      : uiLang === "en"
                      ? key === "pro_monthly"
                        ? "Unlimited screen translations, 1688/Taobao/Trendyol mode & priority speed"
                        : key === "pro_yearly"
                        ? "Unlimited translations all year plus every upcoming update"
                        : "100 non-expiring screen translations without a subscription"
                      : uiLang === "tj"
                      ? key === "pro_monthly"
                        ? "Тарҷумаи бемаҳдуди экран, ҳолати 1688/Taobao/Trendyol ва суръати баланд"
                        : key === "pro_yearly"
                        ? "Тарҷумаи бемаҳдуд барои як сол ва ҳамаи навсозиҳои оянда"
                        : "100 тарҷумаи беобуна, ки муҳлаташон намегузарад"
                      : item.desc;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPlan(key)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                        active
                          ? "border-[#2563EB] bg-[#2563EB]/5 ring-1 ring-[#2563EB]"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                            {localizedTitle}
                          </span>
                          {active && (
                            <Check className="w-4 h-4 text-[#2563EB] shrink-0" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-[#2563EB] dark:text-[#60A5FA] tabular-nums">
                            {item.priceLabel}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            · {item.starsAmount} ★
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {localizedDesc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Rewarded / Interstitial Ad Card (Adsgram int-60310) */}
              {!isPro && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1521] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {t.pricingFreeAdTitle} (+{AD_REWARD_CREDITS})
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      +{AD_REWARD_CREDITS} · {adRewardsToday} / {MAX_AD_REWARDS_PER_DAY}
                    </p>
                    {adMessage && (
                      <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                        {adMessage}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={showRewardedAd}
                    disabled={!canWatchAdReward || isShowingAd}
                    className="px-4 py-2 min-h-[40px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>
                      {isShowingAd
                        ? t.adRewardLoading
                        : canWatchAdReward
                        ? t.pricingWatchAdBtn
                        : `${adRewardsToday} / ${MAX_AD_REWARDS_PER_DAY}`}
                    </span>
                  </button>
                </div>
              )}

              {/* Referral Program Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F1521] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#2563EB]" />
                    <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      {t.pricingInviteTitle}
                    </h3>
                  </div>
                  {user && (
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
                      {referralCount} · +{quota?.bonusCredits ?? 0}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.pricingInviteDesc} (+{REFERRAL_INVITER_BONUS} / +{REFERRAL_INVITED_BONUS})
                </p>

                {user ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      aria-label={t.pricingCopyLink}
                      value={referralUrl}
                      className="flex-1 min-w-[200px] px-3 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyReferral}
                      className="px-3.5 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {copiedRef ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedRef ? t.pricingCopied : t.pricingCopyLink}
                      </span>
                    </button>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(
                        referralUrl
                      )}&text=${encodeURIComponent(
                        "🔥 1688, Taobao, Trendyol & Telegram Screen Translator (+5 credits) 👇\n🤖 https://t.me/Ek_tarjimonbot"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.pricingShareTelegram}</span>
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(
                        "https://t.me/Ek_tarjimonbot"
                      )}&text=${encodeURIComponent(
                        "🔥 EkranTarjimon — 1688, Taobao, Trendyol screen translator bot 👇"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 min-h-[38px] rounded-xl border border-[#2563EB]/30 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.pricingShareGroup}</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="px-3.5 py-2 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t.pricingSignInGoogle}</span>
                    </button>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(
                        "https://t.me/Ek_tarjimonbot"
                      )}&text=${encodeURIComponent(
                        "🔥 EkranTarjimon — 1688, Taobao, Trendyol screen translator bot 👇"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 min-h-[38px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.pricingShareGroup}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Payment Method & Order Form */}
              <form
                onSubmit={handleOrder}
                className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800"
              >
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.pricingPayMethod}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(METHOD_LABELS) as MethodKey[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`px-3.5 py-2.5 min-h-[42px] rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          paymentMethod === m
                            ? "bg-[#2563EB] text-white border-[#2563EB]"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {METHOD_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receiving Card / Payment Instructions */}
                {paymentMethod === "telegram_stars" ? (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1521] p-3.5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        Telegram Stars ({PLAN_DETAILS[selectedPlan].starsAmount} ★) ·{" "}
                        {ADMIN_TELEGRAM_HANDLE}
                      </p>
                      <a
                        href={ADMIN_TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center whitespace-nowrap"
                      >
                        {t.pricingSupportLink}
                      </a>
                    </div>

                    {botConfigured && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handlePayWithStars}
                          disabled={starsLoading || isPro}
                          className="px-4 py-2 min-h-[40px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {starsLoading
                              ? t.adRewardLoading
                              : `${t.pricingPayStarsBtn} (${PLAN_DETAILS[selectedPlan].starsAmount} ★)`}
                          </span>
                        </button>
                        {starsInvoiceUrl && (
                          <a
                            href={starsInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 min-h-[40px] rounded-xl border border-[#2563EB] text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/10 inline-flex items-center whitespace-nowrap"
                          >
                            Telegram Stars
                          </a>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <a
                        href={ADMIN_TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                      >
                        {ADMIN_TELEGRAM_HANDLE}
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1521] p-3.5 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Spitamen Bank (VISA)
                        </p>
                        <p className="font-mono text-base font-bold text-slate-900 dark:text-white tracking-wider tabular-nums">
                          {SPITAMEN_CARD_NUMBER}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyCard}
                          className="px-3 py-1.5 min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          {copiedCard ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {copiedCard ? t.pricingCopied : t.copyBtn}
                          </span>
                        </button>
                        <a
                          href={ADMIN_TELEGRAM_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 min-h-[38px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center whitespace-nowrap"
                        >
                          {t.pricingSupportLink}
                        </a>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      DCity, Alif, Spitamen (VISA) ·{" "}
                      <strong>{PLAN_DETAILS[selectedPlan].priceLabel}</strong> ·{" "}
                      <a
                        href={ADMIN_TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline"
                      >
                        {ADMIN_TELEGRAM_HANDLE}
                      </a>
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="payment-note"
                    className="block text-xs font-medium text-slate-600 dark:text-slate-400"
                  >
                    {t.pricingPayNotePlaceholder}
                  </label>
                  <input
                    id="payment-note"
                    type="text"
                    maxLength={240}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t.pricingPayNotePlaceholder}
                    className="w-full px-3.5 py-2.5 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                {feedback && (
                  <p className="text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
                    {feedback}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <strong>{PLAN_DETAILS[selectedPlan].priceLabel}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={submitting || isPro}
                    className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
                  >
                    {isPro
                      ? t.proUnlimited
                      : submitting
                      ? t.adRewardLoading
                      : `${t.pricingSubmitRequest} (${METHOD_LABELS[paymentMethod]})`}
                  </button>
                </div>
              </form>

              {/* User's Recent Payment Requests */}
              {myRequests.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    So&apos;nggi to&apos;lov so&apos;rovlaringiz
                  </p>
                  <div className="space-y-1.5">
                    {myRequests.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        className="text-xs flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300"
                      >
                        <span>
                          {PLAN_DETAILS[r.planRequested]?.title} ·{" "}
                          {METHOD_LABELS[r.paymentMethod] ?? r.paymentMethod}
                        </span>
                        <span className="font-medium tabular-nums">
                          {r.status === "pending"
                            ? "Tekshirilmoqda"
                            : r.status === "approved"
                            ? "Tasdiqlandi"
                            : "Rad etildi"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
