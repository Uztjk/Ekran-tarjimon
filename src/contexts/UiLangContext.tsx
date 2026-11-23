import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  UI_TRANSLATIONS,
  type UiDictionary,
  type UiLang,
} from "../i18n/translations";

const UI_LANG_STORAGE_KEY = "ekrantarjimon_ui_lang_v1";

interface UiLangContextValue {
  uiLang: UiLang;
  setUiLang: (lang: UiLang) => void;
  t: UiDictionary;
}

const UiLangContext = createContext<UiLangContextValue>({
  uiLang: "uz",
  setUiLang: () => {},
  t: UI_TRANSLATIONS.uz,
});

function detectInitialUiLang(): UiLang {
  try {
    const saved = localStorage.getItem(UI_LANG_STORAGE_KEY);
    if (saved === "uz" || saved === "ru" || saved === "en" || saved === "tj") {
      return saved;
    }
    const tgCode = (
      window as unknown as {
        Telegram?: {
          WebApp?: { initDataUnsafe?: { user?: { language_code?: string } } };
        };
      }
    ).Telegram?.WebApp?.initDataUnsafe?.user?.language_code
      ?.toLowerCase()
      .slice(0, 2);

    if (tgCode === "ru") return "ru";
    if (tgCode === "tg") return "tj";
    if (tgCode === "en") return "en";
  } catch {
    // Fallback to uz
  }
  return "uz";
}

export const UiLangProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [uiLang, setUiLangState] = useState<UiLang>(detectInitialUiLang);

  const setUiLang = (lang: UiLang) => {
    setUiLangState(lang);
    try {
      localStorage.setItem(UI_LANG_STORAGE_KEY, lang);
    } catch {
      // Ignore storage error
    }
  };

  useEffect(() => {
    document.documentElement.lang = uiLang === "tj" ? "tg" : uiLang;
  }, [uiLang]);

  const value = useMemo<UiLangContextValue>(
    () => ({
      uiLang,
      setUiLang,
      t: UI_TRANSLATIONS[uiLang],
    }),
    [uiLang]
  );

  return (
    <UiLangContext.Provider value={value}>{children}</UiLangContext.Provider>
  );
};

export function useUiLang() {
  return useContext(UiLangContext);
}
