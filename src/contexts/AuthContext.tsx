import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";
import type {
  MonetizationConfig,
  NicheMode,
  PaymentRequestDoc,
  ReferralDoc,
  UserQuota,
} from "../types/translator";

const GUEST_QUOTA_KEY = "ekrantarjimon_guest_quota_v1";
const PENDING_REF_KEY = "ekrantarjimon_pending_ref_v1";
const REF_ID_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

export const GUEST_DAILY_LIMIT = 3;
export const FREE_USER_DAILY_LIMIT = 10;
export const REFERRAL_INVITER_BONUS = 10;
export const REFERRAL_INVITED_BONUS = 5;
export const AD_REWARD_CREDITS = 2;
export const MAX_AD_REWARDS_PER_DAY = 5;

export const DEFAULT_MONETIZATION_CONFIG: MonetizationConfig = {
  id: "monetization",
  adsgramBlockId: "int-60310",
  sponsorActive: true,
  sponsorTitle: "Reklama va hamkorlik o'rni",
  sponsorDescription:
    "Do'koningiz, Telegram kanalingiz yoki kargo xizmatingizni EkranTarjimon foydalanuvchilariga taniting.",
  sponsorCtaLabel: "Reklama berish",
  sponsorUrl: "https://t.me/Admiin_0571",
};

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

interface GuestUsageState {
  date: string;
  count: number;
  adBonusCredits: number;
  adRewardsToday: number;
}

function readGuestUsage(): GuestUsageState {
  const today = getTodayDateString();
  try {
    const raw = localStorage.getItem(GUEST_QUOTA_KEY);
    if (!raw) {
      return { date: today, count: 0, adBonusCredits: 0, adRewardsToday: 0 };
    }
    const parsed = JSON.parse(raw) as Partial<GuestUsageState>;
    if (parsed.date !== today) {
      return {
        date: today,
        count: 0,
        adBonusCredits: Number(parsed.adBonusCredits) || 0,
        adRewardsToday: 0,
      };
    }
    return {
      date: today,
      count: Number(parsed.count) || 0,
      adBonusCredits: Number(parsed.adBonusCredits) || 0,
      adRewardsToday: Number(parsed.adRewardsToday) || 0,
    };
  } catch {
    return { date: today, count: 0, adBonusCredits: 0, adRewardsToday: 0 };
  }
}

function writeGuestUsage(state: GuestUsageState) {
  try {
    localStorage.setItem(GUEST_QUOTA_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage error
  }
}

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  quota: UserQuota | null;
  guestUsedToday: number;
  dailyLimit: number;
  remainingToday: number;
  canTranslate: boolean;
  isPro: boolean;
  adRewardsToday: number;
  canWatchAdReward: boolean;
  myRequests: PaymentRequestDoc[];
  adminRequests: PaymentRequestDoc[];
  referrals: ReferralDoc[];
  referralCount: number;
  monetizationConfig: MonetizationConfig;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  consumeQuota: () => Promise<void>;
  grantAdReward: () => Promise<void>;
  saveMonetizationConfig: (
    next: Omit<MonetizationConfig, "id">
  ) => Promise<void>;
  logTranslationToCloud: (entry: {
    title: string;
    nicheMode: NicheMode;
    sourceLang: string;
    targetLang: string;
    detectedLanguage: string;
    summary: string;
    blockCount: number;
    previewLines: string[];
  }) => Promise<void>;
  submitPaymentRequest: (params: {
    planRequested: "pro_monthly" | "pro_yearly" | "pack_100";
    paymentMethod: PaymentRequestDoc["paymentMethod"];
    amountUsd: number;
    note: string;
  }) => Promise<void>;
  reviewPaymentRequest: (
    req: PaymentRequestDoc,
    decision: "approved" | "rejected"
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [quota, setQuota] = useState<UserQuota | null>(null);
  const [guestState, setGuestState] = useState<GuestUsageState>(() =>
    readGuestUsage()
  );
  const [myRequests, setMyRequests] = useState<PaymentRequestDoc[]>([]);
  const [adminRequests, setAdminRequests] = useState<PaymentRequestDoc[]>([]);
  const [referrals, setReferrals] = useState<ReferralDoc[]>([]);
  const [monetizationConfig, setMonetizationConfig] =
    useState<MonetizationConfig>(DEFAULT_MONETIZATION_CONFIG);
  const claimingIdsRef = useRef<Set<string>>(new Set());

  const isAdmin =
    Boolean(user?.emailVerified) && user?.email === ADMIN_EMAIL;

  // Subscribe to public admin-managed ad/sponsor banner configuration
  useEffect(() => {
    const configRef = doc(db, "appConfig", "monetization");
    const unsub = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<MonetizationConfig>;
          setMonetizationConfig({
            id: "monetization",
            adsgramBlockId:
              data.adsgramBlockId?.trim() ||
              DEFAULT_MONETIZATION_CONFIG.adsgramBlockId,
            sponsorActive:
              typeof data.sponsorActive === "boolean"
                ? data.sponsorActive
                : DEFAULT_MONETIZATION_CONFIG.sponsorActive,
            sponsorTitle: data.sponsorTitle ?? "",
            sponsorDescription: data.sponsorDescription ?? "",
            sponsorCtaLabel: data.sponsorCtaLabel ?? "",
            sponsorUrl: data.sponsorUrl ?? "",
          });
        } else {
          setMonetizationConfig(DEFAULT_MONETIZATION_CONFIG);
        }
      },
      () => {
        setMonetizationConfig(DEFAULT_MONETIZATION_CONFIG);
      }
    );
    return () => unsub();
  }, []);

  // Capture ?ref=<uid> referral parameter from URL
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const refParam = url.searchParams.get("ref")?.trim() || "";
      if (REF_ID_PATTERN.test(refParam)) {
        localStorage.setItem(PENDING_REF_KEY, refParam);
        url.searchParams.delete("ref");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {
      // Ignore URL/storage errors
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setQuota(null);
        setMyRequests([]);
        setAdminRequests([]);
        setReferrals([]);
        claimingIdsRef.current.clear();
      }
    });
    return () => unsub();
  }, []);

  // Ensure /users/{uid} exists & listen cleanly once authenticated
  useEffect(() => {
    if (!authReady || !user) return;

    const userRef = doc(db, "users", user.uid);
    const today = getTodayDateString();
    const safeName =
      (user.displayName || user.email || "Foydalanuvchi")
        .trim()
        .slice(0, 100) || "Foydalanuvchi";

    let initialized = false;

    const unsubUser = onSnapshot(
      userRef,
      async (snap) => {
        if (!snap.exists()) {
          if (!initialized) {
            initialized = true;
            let pendingRef = "";
            try {
              pendingRef = localStorage.getItem(PENDING_REF_KEY)?.trim() || "";
            } catch {
              pendingRef = "";
            }

            const hasValidPendingRef =
              Boolean(pendingRef) &&
              pendingRef !== user.uid &&
              REF_ID_PATTERN.test(pendingRef);

            if (hasValidPendingRef) {
              try {
                const batch = writeBatch(db);
                batch.set(userRef, {
                  uid: user.uid,
                  displayName: safeName,
                  plan: "free",
                  dailyUsed: 0,
                  bonusCredits: REFERRAL_INVITED_BONUS,
                  totalTranslations: 0,
                  lastResetDate: today,
                  preferredTargetLang: "uz",
                  referredBy: pendingRef,
                  referralCount: 0,
                  adRewardsToday: 0,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                batch.set(doc(db, "referrals", user.uid), {
                  id: user.uid,
                  referrerId: pendingRef,
                  referredUserId: user.uid,
                  referredUserName: safeName,
                  rewardCredits: REFERRAL_INVITER_BONUS,
                  claimed: false,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
                await batch.commit();
                try {
                  localStorage.removeItem(PENDING_REF_KEY);
                } catch {
                  // Ignore
                }
                return;
              } catch {
                try {
                  localStorage.removeItem(PENDING_REF_KEY);
                } catch {
                  // Ignore
                }
              }
            }

            try {
              await setDoc(userRef, {
                uid: user.uid,
                displayName: safeName,
                plan: "free",
                dailyUsed: 0,
                bonusCredits: 0,
                totalTranslations: 0,
                lastResetDate: today,
                preferredTargetLang: "uz",
                referredBy: "",
                referralCount: 0,
                adRewardsToday: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
            }
          }
          return;
        }

        const data = snap.data() as UserQuota;
        const sameDay = data.lastResetDate === today;
        const effectiveDailyUsed = sameDay ? data.dailyUsed : 0;
        const effectiveAdRewards = sameDay ? data.adRewardsToday || 0 : 0;
        setQuota({
          uid: data.uid,
          displayName: data.displayName,
          plan: data.plan,
          dailyUsed: effectiveDailyUsed,
          bonusCredits: data.bonusCredits || 0,
          totalTranslations: data.totalTranslations || 0,
          lastResetDate: today,
          preferredTargetLang: data.preferredTargetLang || "uz",
          referredBy: data.referredBy || "",
          referralCount: data.referralCount || 0,
          lastClaimedReferralId: data.lastClaimedReferralId,
          adRewardsToday: effectiveAdRewards,
        });
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    );

    const myReqQuery = query(
      collection(db, "paymentRequests"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubMyReq = onSnapshot(
      myReqQuery,
      (snap) => {
        setMyRequests(snap.docs.map((d) => d.data() as PaymentRequestDoc));
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "paymentRequests");
      }
    );

    const refQuery = query(
      collection(db, "referrals"),
      where("referrerId", "==", user.uid),
      limit(30)
    );
    const unsubRefs = onSnapshot(
      refQuery,
      (snap) => {
        setReferrals(snap.docs.map((d) => d.data() as ReferralDoc));
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "referrals");
      }
    );

    let unsubAdmin = () => {};
    if (user.emailVerified && user.email === ADMIN_EMAIL) {
      const adminQuery = query(
        collection(db, "paymentRequests"),
        orderBy("createdAt", "desc"),
        limit(30)
      );
      unsubAdmin = onSnapshot(
        adminQuery,
        (snap) => {
          setAdminRequests(snap.docs.map((d) => d.data() as PaymentRequestDoc));
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, "paymentRequests");
        }
      );
    }

    return () => {
      unsubUser();
      unsubMyReq();
      unsubRefs();
      unsubAdmin();
    };
  }, [authReady, user]);

  // Atomically claim any newly registered referral rewards (+10 bonus credits each)
  useEffect(() => {
    if (!user || !quota) return;
    const unclaimed = referrals.filter(
      (r) => !r.claimed && !claimingIdsRef.current.has(r.id)
    );
    if (unclaimed.length === 0) return;

    let cancelled = false;
    (async () => {
      let runningCredits = quota.bonusCredits || 0;
      let runningCount = quota.referralCount || 0;
      for (const refDoc of unclaimed) {
        if (cancelled) break;
        claimingIdsRef.current.add(refDoc.id);
        try {
          const batch = writeBatch(db);
          batch.update(doc(db, "referrals", refDoc.id), {
            claimed: true,
            updatedAt: serverTimestamp(),
          });
          runningCredits += REFERRAL_INVITER_BONUS;
          runningCount += 1;
          batch.update(doc(db, "users", user.uid), {
            bonusCredits: runningCredits,
            referralCount: runningCount,
            lastClaimedReferralId: refDoc.id,
            updatedAt: serverTimestamp(),
          });
          await batch.commit();
        } catch {
          claimingIdsRef.current.delete(refDoc.id);
          break;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, quota, referrals]);

  const isPro = quota?.plan === "pro";
  const dailyLimit = user ? FREE_USER_DAILY_LIMIT : GUEST_DAILY_LIMIT;
  const usedToday = user ? quota?.dailyUsed ?? 0 : guestState.count;
  const bonusCredits = user
    ? quota?.bonusCredits ?? 0
    : guestState.adBonusCredits;
  const remainingDaily = Math.max(0, dailyLimit - usedToday);
  const remainingToday = isPro ? 999 : remainingDaily + bonusCredits;
  const canTranslate = isPro || remainingDaily > 0 || bonusCredits > 0;
  const adRewardsToday = user
    ? quota?.adRewardsToday ?? 0
    : guestState.adRewardsToday;
  const canWatchAdReward = !isPro && adRewardsToday < MAX_AD_REWARDS_PER_DAY;
  const referralCount = Math.max(quota?.referralCount ?? 0, referrals.length);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const consumeQuota = useCallback(async () => {
    const today = getTodayDateString();
    if (!user) {
      const current = readGuestUsage();
      const next: GuestUsageState =
        current.count < GUEST_DAILY_LIMIT
          ? { ...current, date: today, count: current.count + 1 }
          : {
              ...current,
              date: today,
              adBonusCredits: Math.max(0, current.adBonusCredits - 1),
            };
      setGuestState(next);
      writeGuestUsage(next);
      return;
    }

    if (!quota) return;
    const userRef = doc(db, "users", user.uid);
    const currentDaily = quota.lastResetDate === today ? quota.dailyUsed : 0;
    const usingBonus =
      quota.plan !== "pro" &&
      currentDaily >= FREE_USER_DAILY_LIMIT &&
      quota.bonusCredits > 0;

    try {
      await updateDoc(userRef, {
        dailyUsed: usingBonus ? currentDaily : Math.min(500, currentDaily + 1),
        bonusCredits: usingBonus
          ? Math.max(0, quota.bonusCredits - 1)
          : quota.bonusCredits,
        totalTranslations: Math.min(100000, quota.totalTranslations + 1),
        lastResetDate: today,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  }, [user, quota]);

  const grantAdReward = useCallback(async () => {
    const today = getTodayDateString();
    if (!user) {
      const current = readGuestUsage();
      if (current.adRewardsToday >= MAX_AD_REWARDS_PER_DAY) return;
      const next: GuestUsageState = {
        ...current,
        date: today,
        adBonusCredits: current.adBonusCredits + AD_REWARD_CREDITS,
        adRewardsToday: current.adRewardsToday + 1,
      };
      setGuestState(next);
      writeGuestUsage(next);
      return;
    }

    if (!quota) return;
    const currentAdCount =
      quota.lastResetDate === today ? quota.adRewardsToday || 0 : 0;
    if (currentAdCount >= MAX_AD_REWARDS_PER_DAY) return;

    const userRef = doc(db, "users", user.uid);
    try {
      await updateDoc(userRef, {
        bonusCredits: (quota.bonusCredits || 0) + AD_REWARD_CREDITS,
        adRewardsToday: currentAdCount + 1,
        lastResetDate: today,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  }, [user, quota]);

  const logTranslationToCloud = useCallback(
    async (entry: {
      title: string;
      nicheMode: NicheMode;
      sourceLang: string;
      targetLang: string;
      detectedLanguage: string;
      summary: string;
      blockCount: number;
      previewLines: string[];
    }) => {
      if (!user) return;
      const logId = `tr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const logRef = doc(db, "users", user.uid, "translations", logId);

      const cleanPreview = entry.previewLines
        .filter((l) => typeof l === "string" && l.trim().length > 0)
        .slice(0, 8)
        .map((l) => l.trim().slice(0, 280));

      try {
        await setDoc(logRef, {
          id: logId,
          userId: user.uid,
          title: (entry.title || "Ekran").trim().slice(0, 120),
          nicheMode: entry.nicheMode,
          sourceLang: entry.sourceLang.slice(0, 12),
          targetLang: entry.targetLang.slice(0, 12),
          detectedLanguage: (entry.detectedLanguage || "Aniqlangan")
            .trim()
            .slice(0, 60),
          summary: (entry.summary || "").trim().slice(0, 500),
          blockCount: Math.max(0, Math.min(500, Math.round(entry.blockCount))),
          previewLines: cleanPreview,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `users/${user.uid}/translations/${logId}`
        );
      }
    },
    [user]
  );

  const submitPaymentRequest = useCallback(
    async (params: {
      planRequested: "pro_monthly" | "pro_yearly" | "pack_100";
      paymentMethod: PaymentRequestDoc["paymentMethod"];
      amountUsd: number;
      note: string;
    }) => {
      if (!user) {
        throw new Error(
          "Buyurtma yuborish uchun avval Google akkaunt bilan kiring."
        );
      }
      const reqId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const reqRef = doc(db, "paymentRequests", reqId);
      const userName = (user.displayName || user.email || "Foydalanuvchi")
        .trim()
        .slice(0, 100);
      const cleanNote = params.note.trim().slice(0, 240);
      const cleanAmount = Math.max(
        1,
        Math.min(10000, Number(params.amountUsd.toFixed(2)))
      );

      try {
        await setDoc(reqRef, {
          id: reqId,
          userId: user.uid,
          userName,
          planRequested: params.planRequested,
          paymentMethod: params.paymentMethod,
          amountUsd: cleanAmount,
          status: "pending",
          note: cleanNote,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        fetch("/api/notify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: reqId,
            userName,
            planRequested: params.planRequested,
            paymentMethod: params.paymentMethod,
            amountUsd: cleanAmount,
            note: cleanNote,
          }),
        }).catch(() => {});
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `paymentRequests/${reqId}`
        );
      }
    },
    [user]
  );

  const reviewPaymentRequest = useCallback(
    async (req: PaymentRequestDoc, decision: "approved" | "rejected") => {
      if (!isAdmin) return;
      const batch = writeBatch(db);
      const reqRef = doc(db, "paymentRequests", req.id);
      batch.update(reqRef, {
        status: decision,
        updatedAt: serverTimestamp(),
      });

      if (decision === "approved") {
        const targetUserRef = doc(db, "users", req.userId);
        if (req.planRequested === "pack_100") {
          batch.update(targetUserRef, {
            bonusCredits: increment(100),
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.update(targetUserRef, {
            plan: "pro",
            updatedAt: serverTimestamp(),
          });
        }
      }

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `paymentRequests/${req.id}`
        );
      }
    },
    [isAdmin]
  );

  const saveMonetizationConfig = useCallback(
    async (next: Omit<MonetizationConfig, "id">) => {
      if (!isAdmin) {
        throw new Error("Faqat admin o'zgartira oladi.");
      }
      const cleanBlockId = next.adsgramBlockId.trim().slice(0, 64) || "int-60310";
      const cleanTitle = next.sponsorTitle.trim().slice(0, 80);
      const cleanDesc = next.sponsorDescription.trim().slice(0, 180);
      const cleanCta = next.sponsorCtaLabel.trim().slice(0, 40);
      let cleanUrl = next.sponsorUrl.trim().slice(0, 300);
      if (cleanUrl && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl.replace(/^http:\/\//, "")}`;
      }

      const configRef = doc(db, "appConfig", "monetization");
      try {
        await setDoc(configRef, {
          id: "monetization",
          adsgramBlockId: cleanBlockId,
          sponsorActive: Boolean(next.sponsorActive),
          sponsorTitle: cleanTitle,
          sponsorDescription: cleanDesc,
          sponsorCtaLabel: cleanCta,
          sponsorUrl: cleanUrl,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          "appConfig/monetization"
        );
      }
    },
    [isAdmin]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        quota,
        guestUsedToday: guestState.count,
        dailyLimit,
        remainingToday,
        canTranslate,
        isPro,
        adRewardsToday,
        canWatchAdReward,
        myRequests,
        adminRequests,
        referrals,
        referralCount,
        monetizationConfig,
        signInWithGoogle,
        signOutUser,
        consumeQuota,
        grantAdReward,
        saveMonetizationConfig,
        logTranslationToCloud,
        submitPaymentRequest,
        reviewPaymentRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
