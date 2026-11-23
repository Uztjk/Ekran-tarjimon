import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useUiLang } from "../contexts/UiLangContext";
import type { LanguageOption } from "../types/translator";

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  options: LanguageOption[];
  ariaLabel: string;
  accent?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  options,
  ariaLabel,
  accent = false,
}) => {
  const { t } = useUiLang();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.code === value) ?? options[0],
    [options, value]
  );

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
    const timer = setTimeout(() => searchInputRef.current?.focus(), 30);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const { popularList, otherList } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? options.filter(
          (l) =>
            l.nameUz.toLowerCase().includes(q) ||
            (l.nativeName && l.nativeName.toLowerCase().includes(q)) ||
            l.code.toLowerCase().includes(q)
        )
      : options;

    if (q) {
      return { popularList: [], otherList: filtered };
    }

    return {
      popularList: filtered.filter((l) => l.popular),
      otherList: filtered.filter((l) => !l.popular),
    };
  }, [options, query]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-3.5 py-2 min-h-[42px] rounded-xl border bg-slate-50 dark:bg-[#0B0F17] text-xs sm:text-sm flex items-center justify-between gap-2 max-w-[200px] sm:max-w-[230px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
          isOpen
            ? "border-[#2563EB] ring-2 ring-[#2563EB]/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        } ${
          accent
            ? "font-semibold text-[#2563EB] dark:text-[#60A5FA]"
            : "font-medium text-slate-900 dark:text-white"
        }`}
      >
        <span className="truncate whitespace-nowrap">{selected?.nameUz}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="sm:hidden fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />

          <div
            role="listbox"
            aria-label={ariaLabel}
            className="fixed sm:absolute bottom-0 sm:bottom-auto left-0 sm:left-0 right-0 sm:right-auto sm:top-full sm:mt-2 z-50 w-full sm:w-[320px] max-h-[75vh] sm:max-h-[420px] bg-white dark:bg-[#131B2B] rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />

            {/* Search Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.langSearchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B0F17] text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t.closeBtn}
                className="sm:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Options List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-2">
              {popularList.length > 0 && (
                <div>
                  <p className="px-2.5 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    {t.langPopularTitle}
                  </p>
                  {popularList.map((lang) => {
                    const isSelected = lang.code === value;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(lang.code)}
                        className={`w-full px-3 py-2 min-h-[42px] rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]"
                            : "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium truncate">
                            {lang.nameUz}
                          </div>
                          {lang.nativeName && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {lang.nativeName}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {otherList.length > 0 && (
                <div>
                  {popularList.length > 0 && (
                    <p className="px-2.5 py-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {t.langAllTitle(options.length)}
                    </p>
                  )}
                  {otherList.map((lang) => {
                    const isSelected = lang.code === value;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(lang.code)}
                        className={`w-full px-3 py-2 min-h-[42px] rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#2563EB]/10 text-[#2563EB] dark:text-[#60A5FA]"
                            : "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-medium truncate">
                            {lang.nameUz}
                          </div>
                          {lang.nativeName && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {lang.nativeName}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {popularList.length === 0 && otherList.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  {t.langNotFound(query)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
