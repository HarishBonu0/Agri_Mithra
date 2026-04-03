import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type Lang = "en" | "te";

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", te: "డాష్‌బోర్డ్" },
  "nav.assistant": { en: "Crop Assistant", te: "పంట సహాయకుడు" },
  "nav.schemes": { en: "Scheme Finder", te: "పథకాల శోధన" },
  "nav.news": { en: "News", te: "వార్తలు" },
  "search.placeholder": { en: "Search...", te: "శోధించండి..." },
  
  // Dashboard
  "dashboard.welcome": { en: "Welcome back, Farmer", te: "మళ్ళీ స్వాగతం, రైతు" },
  "dashboard.weather": { en: "Weather", te: "వాతావరణం" },
  "dashboard.crops": { en: "Your Crops", te: "మీ పంటలు" },
  "dashboard.no_crops": { en: "No crops added yet", te: "ఇంకా పంటలు జోడించలేదు" },
  "dashboard.add_crop": { en: "Add Crop", te: "పంట జోడించండి" },
  "dashboard.quick_actions": { en: "Quick Actions", te: "త్వరిత చర్యలు" },
  "dashboard.scan_crop": { en: "Scan Crop", te: "పంట స్కాన్" },
  "dashboard.find_scheme": { en: "Find Scheme", te: "పథకం కనుగొనండి" },
  "dashboard.view_news": { en: "View News", te: "వార్తలు చూడండి" },
  
  // Auth Pages
  "auth.login_title": { en: "Welcome Back", te: "తిరిగి స్వాగతం" },
  "auth.login_subtitle": { en: "Login with your mobile number to continue.", te: "కొనసాగించడానికి మీ మొబైల్ నంబర్ ఉపయోగించి లాగిన్ చేయండి." },
  "auth.signup_title": { en: "Create Account", te: "ఖాతా సృష్టించండి" },
  "auth.signup_subtitle": { en: "Sign up to access AgriMithra modules.", te: "AgriMithra మాడ్యూల్‌ల యాక్సెస్ చేయడానికి సైన్ అప్ చేయండి." },
  "auth.forgot_title": { en: "Reset Password", te: "పాస్‌వర్డ్ రీసెట్ చేయండి" },
  "auth.forgot_subtitle": { en: "Verify your mobile number with OTP and set a new password.", te: "OTP తో మీ మొబైల్ నంబర్ ధృవీకరించండి మరియు కొత్త పాస్‌వర్డ్ సెట్ చేయండి." },
  
  // Form Labels
  "form.name": { en: "Name", te: "పేరు" },
  "form.name_placeholder": { en: "Enter your full name", te: "మీ పూర్తి పేరు నమోదు చేయండి" },
  "form.mobile": { en: "Mobile Number", te: "మొబైల్ నంబర్" },
  "form.mobile_placeholder": { en: "Enter 10-digit mobile", te: "10-అంకెల మొబైల్‌ను నమోదు చేయండి" },
  "form.password": { en: "Password", te: "పాస్‌వర్డ్" },
  "form.password_placeholder": { en: "Enter password (min 6 characters)", te: "పాస్‌వర్డ్ నమోదు చేయండి (కనీసం 6 అక్షరాలు)" },
  "form.confirm_password": { en: "Confirm Password", te: "పాస్‌వర్డ్‌ను నిర్ధారించండి" },
  "form.confirm_placeholder": { en: "Re-enter password", te: "పాస్‌వర్డ్‌ను పునः నమోదు చేయండి" },
  "form.otp": { en: "OTP", te: "OTP" },
  "form.otp_placeholder": { en: "Enter OTP", te: "OTP నమోదు చేయండి" },
  "form.new_password": { en: "New Password", te: "కొత్త పాస్‌వర్డ్" },
  "form.new_password_placeholder": { en: "Enter new password", te: "కొత్త పాస్‌వర్డ్ నమోదు చేయండి" },
  
  // Error Messages
  "error.mobile_required": { en: "Mobile number must be exactly 10 digits", te: "మొబైల్ నంబర్ సరిగ్గా 10 అంకెలు ఉండాలి" },
  "error.name_required": { en: "Name is required", te: "పేరు అవసరమైనది" },
  "error.password_required": { en: "Password is required", te: "పాస్‌వర్డ్ అవసరమైనది" },
  "error.password_min": { en: "Password must be at least 6 characters", te: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి" },
  "error.password_mismatch": { en: "Passwords do not match", te: "పాస్‌వర్డ్‌లు సరిపోలడం లేదు" },
  "error.otp_required": { en: "OTP must be 4 to 6 digits", te: "OTP 4 నుండి 6 అంకెలు ఉండాలి" },
  
  // Buttons
  "btn.login": { en: "Login", te: "లాగిన్" },
  "btn.signup": { en: "Sign Up", te: "సైన్ అప్" },
  "btn.reset_password": { en: "Update Password", te: "పాస్‌వర్డ్ నవీకరించండి" },
  "btn.forgot_password": { en: "Forgot password?", te: "పాస్‌వర్డ్‌ను మరిచిపోయారా?" },
  "btn.create_account": { en: "Create account", te: "ఖాతా సృష్టించండి" },
  "btn.back_to_login": { en: "Back to login", te: "లాగిన్‌కు తిరిగి వెళ్లండి" },
  "btn.already_account": { en: "Already have an account?", te: "ఇప్పటికే ఖాతా ఉందా?" },
  "btn.send_otp": { en: "Send OTP", te: "OTP పంపండి" },
  
  // Assistant/Schemes/News
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
  "schemes.login_prompt": { en: "Please login to access Scheme Finder", te: "స్కీమ్ ఫైండర్ యాక్సెస్ చేయడానికి దయచేసి లాగిన్ చేయండి" },
    "schemes.subtitle": { en: "Answer 5 quick questions to find government schemes you're eligible for", te: "మీరు అర్హమైన ప్రభుత్వ పథకాలను కనుగొనడానికి 5 శీఘ్ర ప్రశ్నలకు సమాధానం ఇవ్వండి" },
    "schemes.profile": { en: "Farmer Profile", te: "రైతు ప్రొఫైల్" },
    "schemes.state": { en: "Which state are you in?", te: "మీరు ఏ రాష్ట్రంలో ఉన్నారు?" },
    "schemes.land": { en: "How much land do you have? (hectares)", te: "మీకు ఎంత భూమి ఉంది? (హెక్టార్లు)" },
    "schemes.income": { en: "What is your annual income?", te: "మీ వార్షిక ఆదాయం ఎంత?" },
    "schemes.aadhaar": { en: "Do you have Aadhaar linked?", te: "మీకు ఆధార్ లింక్ చేయబడిందా?" },
    "schemes.bank": { en: "Do you have a bank account with DBT enabled?", te: "మీకు DBT సక్షమ బ్యాంక్ ఖాతా ఉందా?" },
    "schemes.unit_hectares": { en: "Hectares", te: "హెక్టార్లు" },
    "schemes.unit_acres": { en: "Acres", te: "ఎకరాలు" },
    "schemes.unit_cents": { en: "Cents", te: "సెంట్లు" },
    "schemes.check": { en: "Check Eligible Schemes", te: "అర్హ పథకాలను తనిఖీ చేయండి" },
    "schemes.reset": { en: "Reset", te: "రీసెట్" },
    "schemes.back": { en: "Back", te: "వెనక్కి" },
    "schemes.back_to_form": { en: "Back to form", te: "ఫారమ్‌కు వెనక్కి" },
    "schemes.checking": { en: "Checking scheme eligibility...", te: "పథకాల అర్హతను తనిఖీ చేస్తోంది..." },
    "schemes.error_title": { en: "Error", te: "లోపం" },
    "schemes.not_entered": { en: "Not entered", te: "నమోదు చేయలేదు" },
    "schemes.found": { en: "found", te: "కనుగొన్నారు" },
    "schemes.official_sources": { en: "Official Sources", te: "అధికారిక మూలాలు" },
    "schemes.land_required": { en: "Please enter your land size", te: "దయచేసి మీ భూమి పరిమాణాన్ని నమోదు చేయండి" },
    "schemes.income_required": { en: "Please enter your annual income", te: "దయచేసి మీ వార్షిక ఆదాయాన్ని నమోదు చేయండి" },
    "schemes.income_example": { en: "Example: 300000", te: "ఉదాహరణ: 300000" },
    "schemes.no_schemes": { en: "No tracked scheme matched all provided details. Update profile fields and retry.", te: "అందించిన వివరాలకు ఏ పథకం సరిపోలలేదు. ప్రొఫైల్ ఫీల్డ్‌లను నవీకరించండి మరియు మళ్లీ ప్రయత్నించండి." },
    "schemes.schemes_found": { en: "These national/state schemes match your profile based on the details provided.", te: "ఇవి అందించిన వివరాల ఆధారంగా మీ ప్రొఫైల్‌కు సరిపోలే జాతీయ/రాష్ట్ర పథకాలు." },
    "schemes.why_match": { en: "Why you match", te: "మీరు ఎందుకు సరిపోలుతారు" },
    "schemes.steps": { en: "Next steps", te: "తరువాత సోపానాలు" },
    "schemes.error": { en: "I could not check eligibility right now. Please make sure the backend is running and try again.", te: "నేను ప్రస్తుతం అర్హతను తనిఖీ చేయలేను. దయచేసి బ్యాకెండ్ నడుస్తోందని నిర్ధారించుకోండి మరియు మళ్లీ ప్రయత్నించండి." },
    "common.yes": { en: "Yes", te: "అవును" },
    "common.no": { en: "No", te: "కాదు" },
  "news.title": { en: "Agricultural News", te: "వ్యవసాయ వార్తలు" },
  "news.all": { en: "All", te: "అన్ని" },
  "news.crops": { en: "Crops", te: "పంటలు" },
  "news.market": { en: "Market", te: "మార్కెట్" },
  "news.policy": { en: "Policy", te: "విధానం" },
  "news.technology": { en: "Technology", te: "సాంకేతికత" },
  "news.read_more": { en: "Read more", te: "మరింత చదవండి" },
  "news.login_prompt": { en: "Please login to access News", te: "వార్తలు యాక్సెస్ చేయడానికి దయచేసి లాగిన్ చేయండి" },
  "weather.sunny": { en: "Sunny", te: "ఎండ" },
  "weather.recommendation": { en: "Good day for field work", te: "పొలం పనికి మంచి రోజు" },
  
  // Profile Dropdown
  "profile.name": { en: "Name", te: "పేరు" },
  "profile.mobile": { en: "Mobile", te: "మొబైల్" },
  "profile.logout": { en: "Logout", te: "లాగిన్ నుండి బయటపడండి" },
  
  // Crop Assistant
  "assistant.no_image": { en: "Please upload a crop image", te: "దయచేసి పంట ఇమేజ్ అప్‌లోడ్ చేయండి" },
  "assistant.upload_prompt": { en: "Click or drag to upload an image", te: "ఇమేజ్ అప్‌లోడ్ చేయడానికి క్లిక్ లేదా డ్రాగ్ చేయండి" },
  "assistant.analyze": { en: "Analyze Crop", te: "పంటను విశ్లేషించండి" },
  "assistant.scan_another": { en: "Scan Another Crop", te: "మరొక పంటను స్కాన్ చేయండి" },
  "assistant.login_required": { en: "Login Required", te: "లాగిన్ అవసరం" },
  "assistant.login_prompt": { en: "Please login to access Crop Assistant", te: "పంట సహాయకుడిని ఉపయోగించడానికి దయచేసి లాగిన్ చేయండి" },
  "assistant.go_login": { en: "Go to Login", te: "లాగిన్‌కు వెళ్లండి" },
  "assistant.file_hint": { en: "PNG, JPG up to 5MB", te: "PNG, JPG 5MB వరకు" },
  "assistant.selected": { en: "Selected", te: "ఎంచుకున్నది" },
  "assistant.invalid_file": { en: "Please upload an image file", te: "దయచేసి ఇమేజ్ ఫైల్‌ను అప్‌లోడ్ చేయండి" },
  "assistant.file_too_large": { en: "Image must be less than 5MB", te: "ఇమేజ్ 5MB కంటే తక్కువగా ఉండాలి" },
  "assistant.failed": { en: "Failed to analyze crop image", te: "పంట ఇమేజ్ విశ్లేషణ విఫలమైంది" },
  "assistant.unknown": { en: "Unknown", te: "తెలియదు" },
  "assistant.not_available": { en: "Not available", te: "లభ్యం లేదు" },
  "assistant.what_happening": { en: "What is happening", te: "ఏం జరుగుతోంది" },
  "assistant.why_happens": { en: "Why this happens", te: "ఇది ఎందుకు జరుగుతుంది" },
  "assistant.now": { en: "Do this now (today)", te: "ఇప్పుడే చేయాల్సినవి (ఈరోజు)" },
  "assistant.next7": { en: "Plan for next 7 days", te: "తదుపరి 7 రోజుల ప్రణాళిక" },
  "assistant.prevent": { en: "How to prevent again", te: "మళ్లీ రాకుండా ఎలా నివారించాలి" },
  "assistant.loss_reduce": { en: "How to reduce crop loss now", te: "ఇప్పుడే పంట నష్టాన్ని ఎలా తగ్గించాలి" },
  "assistant.pesticides": { en: "Suggested pesticide options", te: "సూచించిన కీటకనాశక ఎంపికలు" },
  "assistant.when": { en: "When", te: "ఎప్పుడు" },
  "assistant.dose": { en: "Dose", te: "మోతాదు" },
  "assistant.timing": { en: "Timing", te: "సమయం" },
  "assistant.safety": { en: "Safety", te: "భద్రత" },
  "assistant.warning_signs": { en: "Warning signs to watch", te: "గమనించాల్సిన హెచ్చరిక సూచనలు" },
  "assistant.important_note": { en: "Important note", te: "ముఖ్య గమనిక" },
  "assistant.status": { en: "Diagnosis status", te: "నిర్ధారణ స్థితి" },
  "assistant.status_confirmed": { en: "Confirmed", te: "నిర్ధారిత" },
  "assistant.status_low": { en: "Low confidence", te: "తక్కువ నమ్మకం" },
  "assistant.status_unknown": { en: "Unknown", te: "తెలియదు" },
  "assistant.alternatives": { en: "Possible alternatives", te: "సాధ్యమైన ప్రత్యామ్నాయాలు" },
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

  const t = useCallback((key: string) => translations[key]?.[lang] || key, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
