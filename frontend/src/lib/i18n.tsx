import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { translations, type Lang } from "./translations";

type InterpolationValues = Record<string, string | number>;

const getByPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
};

const toCamel = (value: string): string => value.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

const normalizeLegacyKey = (key: string): string => {
  return key
    .split(".")
    .map((part) => toCamel(part))
    .join(".");
};

const interpolate = (template: string, values?: InterpolationValues): string => {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, values?: InterpolationValues) => string;
  dictionary: (typeof translations)[Lang];
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  dictionary: translations.en,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("agrimitra-lang") as Lang | null;
    if (savedLang && (savedLang === "en" || savedLang === "te")) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("agrimitra-lang", newLang);
  };

  const t = useCallback((key: string, values?: InterpolationValues) => {
    const translated = getByPath(translations[lang], key) ?? getByPath(translations[lang], normalizeLegacyKey(key));
    if (typeof translated !== "string") {
      return key;
    }
    return interpolate(translated, values);
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t, dictionary: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
