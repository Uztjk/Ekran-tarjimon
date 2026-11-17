export type BlockCategory = "heading" | "button" | "label" | "body" | "status";
export type BlockTone = "light" | "dark" | "accent";
export type ViewMode = "overlay" | "split" | "list";
export type AppTab = "translator" | "history" | "guide";
export type NicheMode = "general" | "ecommerce" | "finance" | "travel";

export interface UserQuota {
  uid: string;
  displayName: string;
  plan: "free" | "pro";
  dailyUsed: number;
  bonusCredits: number;
  totalTranslations: number;
  lastResetDate: string;
  preferredTargetLang: string;
  referredBy?: string;
  referralCount?: number;
  lastClaimedReferralId?: string;
  adRewardsToday?: number;
}

export interface ReferralDoc {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  rewardCredits: number;
  claimed: boolean;
  createdAt?: unknown;
}

export interface MonetizationConfig {
  id: "monetization";
  adsgramBlockId: string;
  sponsorActive: boolean;
  sponsorTitle: string;
  sponsorDescription: string;
  sponsorCtaLabel: string;
  sponsorUrl: string;
}

export interface PaymentRequestDoc {
  id: string;
  userId: string;
  userName: string;
  planRequested: "pro_monthly" | "pro_yearly" | "pack_100";
  paymentMethod:
    | "spitamen_bank"
    | "dcity"
    | "alif_bank"
    | "tajikistan_cards"
    | "telegram_stars"
    | "visa_mastercard";
  amountUsd: number;
  amountUzs?: number;
  status: "pending" | "approved" | "rejected";
  note: string;
  createdAt?: unknown;
}

export interface TextBlock {
  id: string;
  originalText: string;
  translatedText: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0..1000
  category: BlockCategory;
  bgTone: BlockTone;
}

export interface TranslationResult {
  detectedLanguage: string;
  summary: string;
  blocks: TextBlock[];
  durationMs: number;
}

export interface HistoryItem {
  id: string;
  createdAt: number;
  title: string;
  sourceLang: string;
  targetLang: string;
  targetLangName: string;
  detectedLanguage: string;
  summary: string;
  imageDataUrl: string;
  blocks: TextBlock[];
  durationMs: number;
}

export interface LanguageOption {
  code: string;
  nameUz: string;
  nativeName?: string;
  speechCode: string;
  shortCode: string;
  popular?: boolean;
}

export interface CropRegion {
  ymin: number; // 0..1
  xmin: number; // 0..1
  ymax: number; // 0..1
  xmax: number; // 0..1
}
