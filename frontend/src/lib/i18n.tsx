import React, { createContext, useContext, useState, useCallback } from "react";

type Lang = "en" | "te";

const translations: Record<string, Record<Lang, string>> = {
  "nav.dashboard": { en: "Dashboard", te: "డాష్‌బోర్డ్" },
  "nav.assistant": { en: "Crop Assistant", te: "పంట సహాయకుడు" },
  "nav.schemes": { en: "Scheme Finder", te: "పథకాల శోధన" },
  "nav.news": { en: "News", te: "వార్తలు" },
  "search.placeholder": { en: "Search...", te: "శోధించండి..." },
  "dashboard.welcome": { en: "Welcome back, Farmer", te: "మళ్ళీ స్వాగతం, రైతు" },
  "dashboard.weather": { en: "Weather", te: "వాతావరణం" },
  "dashboard.crops": { en: "Your Crops", te: "మీ పంటలు" },
  "dashboard.quick_actions": { en: "Quick Actions", te: "త్వరిత చర్యలు" },
  "dashboard.scan_crop": { en: "Scan Crop", te: "పంట స్కాన్" },
  "dashboard.find_scheme": { en: "Find Scheme", te: "పథకం కనుగొనండి" },
  "dashboard.market_price": { en: "Market Prices", te: "మార్కెట్ ధరలు" },
  "dashboard.soil_test": { en: "Soil Test", te: "నేల పరీక్ష" },
  "assistant.title": { en: "Crop Health Assistant", te: "పంట ఆరోగ్య సహాయకుడు" },
  "assistant.upload": { en: "Upload crop image", te: "పంట చిత్రాన్ని అప్‌లోడ్ చేయండి" },
  "assistant.drag": { en: "Drag & drop or click to upload", te: "డ్రాగ్ & డ్రాప్ లేదా అప్‌లోడ్ క్లిక్ చేయండి" },
  "assistant.voice": { en: "Describe with voice", te: "గొంతుతో వివరించండి" },
  "assistant.analyzing": { en: "Analyzing your crop...", te: "మీ పంటను విశ్లేషిస్తోంది..." },
  "assistant.disease": { en: "Disease Detected", te: "వ్యాధి గుర్తించబడింది" },
  "assistant.confidence": { en: "Confidence", te: "నమ్మకం" },
  "assistant.solution": { en: "Recommended Solution", te: "సిఫార్సు చేసిన పరిష్కారం" },
  "assistant.risk": { en: "Risk Level", te: "ప్రమాద స్థాయి" },
  "schemes.title": { en: "Government Scheme Finder", te: "ప్రభుత్వ పథకాల శోధకం" },
  "schemes.ask": { en: "Ask about any government scheme...", te: "ఏదైనా ప్రభుత్వ పథకం గురించి అడగండి..." },
  "schemes.quick": { en: "Quick Questions", te: "త్వరిత ప్రశ్నలు" },
  "news.title": { en: "Agricultural News", te: "వ్యవసాయ వార్తలు" },
  "news.all": { en: "All", te: "అన్ని" },
  "news.crops": { en: "Crops", te: "పంటలు" },
  "news.market": { en: "Market", te: "మార్కెట్" },
  "news.policy": { en: "Policy", te: "విధానం" },
  "news.technology": { en: "Technology", te: "సాంకేతికత" },
  "news.read_more": { en: "Read more", te: "మరింత చదవండి" },
  "weather.sunny": { en: "Sunny", te: "ఎండ" },
  "weather.recommendation": { en: "Good day for field work", te: "పొలం పనికి మంచి రోజు" },
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");
  const t = useCallback((key: string) => translations[key]?.[lang] || key, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
