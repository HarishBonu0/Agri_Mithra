import type { Lang } from "@/lib/translations";

interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionLike {
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export type AssistantLanguage = "en" | "te" | "hi" | "ta" | "kn";

export type AgricultureIntent =
  | "crop_selection"
  | "sowing"
  | "soil_nutrition"
  | "irrigation"
  | "pest_disease"
  | "weed_control"
  | "weather_risk"
  | "harvest"
  | "post_harvest"
  | "market_guidance"
  | "govt_scheme"
  | "mixed"
  | "unknown";

export interface FarmerEntities {
  crop?: string;
  location?: string;
  soil_type?: string;
  season_or_month?: string;
  farm_size?: string;
  irrigation_availability?: string;
  growth_stage?: string;
  symptoms?: string;
  budget_level?: string;
  urgency?: string;
}

export interface FarmerInputAnalysis {
  normalizedText: string;
  correctedTerms: string[];
  intent: AgricultureIntent;
  entities: FarmerEntities;
  clarifyingQuestions: string[];
}

export interface FileEvidenceContext {
  fileName: string;
  mimeType: string;
  previewUrl?: string;
  evidenceNote?: string;
}

export interface FarmerAdviceSections {
  quickSummary: string;
  whyThisAdvice: string;
  whatToDoNow: string[];
  next7DaysPlan: string[];
  warningSigns: string[];
  confidenceLevel: "High" | "Medium" | "Low";
  oneNextBestQuestion: string;
}

const LOCALIZED_SECTION_TITLES: Record<AssistantLanguage, {
  quickSummary: string;
  whyThisAdvice: string;
  whatToDoNow: string;
  next7DaysPlan: string;
  warningSigns: string;
  confidenceLevel: string;
  oneNextBestQuestion: string;
}> = {
  en: {
    quickSummary: "Quick Summary",
    whyThisAdvice: "Why This Advice",
    whatToDoNow: "What To Do Now",
    next7DaysPlan: "Next 7 Days Plan",
    warningSigns: "Warning Signs",
    confidenceLevel: "Confidence Level",
    oneNextBestQuestion: "One Next Best Question",
  },
  te: {
    quickSummary: "త్వరిత సారాంశం",
    whyThisAdvice: "ఈ సలహా ఎందుకు",
    whatToDoNow: "ఇప్పుడే చేయాల్సినవి",
    next7DaysPlan: "తదుపరి 7 రోజుల ప్రణాళిక",
    warningSigns: "హెచ్చరిక సూచనలు",
    confidenceLevel: "నమ్మకం స్థాయి",
    oneNextBestQuestion: "తదుపరి ఉత్తమ ప్రశ్న",
  },
  hi: {
    quickSummary: "त्वरित सारांश",
    whyThisAdvice: "यह सलाह क्यों",
    whatToDoNow: "अभी क्या करें",
    next7DaysPlan: "अगले 7 दिन की योजना",
    warningSigns: "चेतावनी संकेत",
    confidenceLevel: "विश्वास स्तर",
    oneNextBestQuestion: "अगला सबसे अच्छा सवाल",
  },
  ta: {
    quickSummary: "விரைவு சுருக்கம்",
    whyThisAdvice: "இந்த ஆலோசனை ஏன்",
    whatToDoNow: "இப்போது செய்யவேண்டியது",
    next7DaysPlan: "அடுத்த 7 நாள் திட்டம்",
    warningSigns: "எச்சரிக்கை அறிகுறிகள்",
    confidenceLevel: "நம்பிக்கை அளவு",
    oneNextBestQuestion: "அடுத்த சிறந்த கேள்வி",
  },
  kn: {
    quickSummary: "ತ್ವರಿತ ಸಾರಾಂಶ",
    whyThisAdvice: "ಈ ಸಲಹೆ ಏಕೆ",
    whatToDoNow: "ಈಗ ಮಾಡಬೇಕಾದುದು",
    next7DaysPlan: "ಮುಂದಿನ 7 ದಿನಗಳ ಯೋಜನೆ",
    warningSigns: "ಎಚ್ಚರಿಕೆ ಸೂಚನೆಗಳು",
    confidenceLevel: "ವಿಶ್ವಾಸ ಮಟ್ಟ",
    oneNextBestQuestion: "ಮುಂದಿನ ಉತ್ತಮ ಪ್ರಶ್ನೆ",
  },
};

const getLocalizedFallback = (
  language: AssistantLanguage,
  fallbackQuestion: string
): FarmerAdviceSections => {
  if (language === "te") {
    return {
      quickSummary: "సురక్షితమైన సలహా ఇవ్వడానికి మరికొన్ని పొలం వివరాలు అవసరం.",
      whyThisAdvice: "మీ ప్రశ్న వ్యవసాయానికి సంబంధించినది, కానీ ముఖ్యమైన సమాచారం లేదు.",
      whatToDoNow: ["పంట పేరు చెప్పండి", "ప్రాంతం మరియు వృద్ధి దశ చెప్పండి"],
      next7DaysPlan: ["ప్రతిరోజూ పంటను పరిశీలించండి", "లక్షణాల ఫోటోలు నమోదు చేయండి"],
      warningSigns: ["లక్షణాలు వేగంగా వ్యాపించడం", "పొలంలో అకస్మాత్తుగా వాడిపోవడం"],
      confidenceLevel: "Low",
      oneNextBestQuestion: fallbackQuestion,
    };
  }

  return {
    quickSummary: "I need a bit more field detail to give safe advice.",
    whyThisAdvice: "Your query is agriculture-related, but key farm context is missing.",
    whatToDoNow: ["Share crop name", "Share location and growth stage"],
    next7DaysPlan: ["Monitor crop daily", "Record visible symptoms with photos"],
    warningSigns: ["Rapid spread of symptoms", "Sudden wilting across field"],
    confidenceLevel: "Low",
    oneNextBestQuestion: fallbackQuestion,
  };
};

const isPaddyQuery = (message: string): boolean => /\b(paddy|rice|vari)\b/i.test(message || "");

const isGenericFallbackResponse = (sections: FarmerAdviceSections): boolean => {
  const joined = [
    sections.quickSummary,
    sections.whyThisAdvice,
    ...sections.whatToDoNow,
    ...sections.warningSigns,
  ]
    .join(" ")
    .toLowerCase();

  return (
    joined.includes("share crop name") ||
    joined.includes("share location and growth stage") ||
    joined.includes("rapid spread of symptoms") ||
    joined.includes("పంట పేరు చెప్పండి")
  );
};

const getDirectPaddyGuidance = (
  language: AssistantLanguage,
  analysis: FarmerInputAnalysis
): FarmerAdviceSections => {
  const soil = analysis.entities.soil_type || "black soil";
  const stage = analysis.entities.growth_stage || "beginning stage";

  if (language === "te") {
    return {
      quickSummary: "వరి విత్తడం దశలవారీగా చేస్తే మంచి మొలక మరియు మంచి దిగుబడి వస్తుంది.",
      whyThisAdvice: "మీరు ప్రారంభ దశలో ఉన్నందున నేల సిద్ధీకరణ, నర్సరీ మరియు నీటి నిర్వహణ చాలా ముఖ్యమైనవి.",
      whatToDoNow: [
        `నేల సిద్ధం చేయండి: ${soil} లో 2-3 సార్లు దున్ని, కలుపు తొలగించి, సమం చేయండి`,
        "విత్తనాలు నాటే ముందు 12-24 గంటలు నానబెట్టి శుద్ధి చేసి నర్సరీలో చల్లండి",
        `ప్రస్తుత ${stage} లో 2-3 సెం.మీ నీటి పొర ఉంచి, నీరు నిల్వ నియంత్రించండి`,
      ],
      next7DaysPlan: [
        "రోజు 1-2: నేల సమం చేసి నీటి బండ్లు సరిచూడండి",
        "రోజు 3-4: నర్సరీలో మొలక పర్యవేక్షణ చేసి తేలికపాటి తేమ ఉంచండి",
        "రోజు 5-7: మొక్కల దూరం ప్లాన్ చేసి ప్రధాన పొలం సిద్ధం చేయండి",
      ],
      warningSigns: [
        "మొక్కలు పసుపు పడితే నత్రజని లోపం ఉండొచ్చు",
        "నీరు ఎక్కువ నిలిస్తే వేరు కుళ్ళు వచ్చే ప్రమాదం ఉంటుంది",
      ],
      confidenceLevel: "High",
      oneNextBestQuestion: "మీరు నర్సరీ దశలో ఉన్నారా లేదా నాటు దశలో ఉన్నారా?",
    };
  }

  return {
    quickSummary: "For paddy at beginning stage, focus on land preparation, nursery sowing, and stable water management.",
    whyThisAdvice: "At early stage, good field leveling and seed handling in black soil decide crop establishment.",
    whatToDoNow: [
      `Prepare field in ${soil}: plow 2-3 times, remove weeds, and level the land`,
      "Pre-soak and treat seeds for 12-24 hours, then sow evenly in nursery bed",
      `At ${stage}, maintain shallow standing water (about 2-3 cm) and avoid water stagnation`,
    ],
    next7DaysPlan: [
      "Day 1-2: Complete leveling and bund repair for water control",
      "Day 3-4: Monitor germination and keep nursery moisture uniform",
      "Day 5-7: Plan transplant spacing and prepare the main field",
    ],
    warningSigns: [
      "Yellowing seedlings can indicate nitrogen deficiency",
      "Too much standing water may cause root stress and poor growth",
    ],
    confidenceLevel: "High",
    oneNextBestQuestion: "Are you currently in nursery stage or ready for transplanting?",
  };
};

const INTENT_KEYWORDS: Record<Exclude<AgricultureIntent, "mixed" | "unknown">, string[]> = {
  crop_selection: ["crop", "variety", "seed type", "which crop", "ఏ పంట", "बीज", "விதை", "ಬೀಜ"],
  sowing: ["sow", "sowing", "germination", "spacing", "విత్త", "बुवाई", "விதைப்பு", "ಬಿತ್ತನೆ"],
  soil_nutrition: ["soil", "fertilizer", "nutrient", "npk", "ph", "మట్టి", "मिट्टी", "மண்", "ಮಣ್ಣು"],
  irrigation: ["irrigation", "water", "drip", "sprinkler", "నీరు", "सिंचाई", "நீர்", "ನೀರಾವರಿ"],
  pest_disease: ["pest", "disease", "insect", "fungus", "spot", "పురుగు", "कीट", "பூச்சி", "ಕೀಟ"],
  weed_control: ["weed", "weedicide", "manual weeding", "కలుపు", "खरपतवार", "களை", "ಕಳೆ"],
  weather_risk: ["rain", "weather", "storm", "heat", "frost", "వాతావరణ", "मौसम", "வானிலை", "ಹವಾಮಾನ"],
  harvest: ["harvest", "maturity", "ready to cut", "కోత", "कटाई", "அறுவடை", "ಕೊಯ್ಲು"],
  post_harvest: ["storage", "drying", "grading", "post harvest", "నిల్వ", "भंडारण", "சேமிப்பு", "ಸಂಗ್ರಹ"],
  market_guidance: ["market", "sell", "mandi", "price", "అమ్మకం", "बाजार", "சந்தை", "ಮಾರುಕಟ್ಟೆ"],
  govt_scheme: ["scheme", "subsidy", "government", "yojana", "పథకం", "योजना", "திட்டம்", "ಯೋಜನೆ"],
};

const SPELLING_NORMALIZATION: Record<string, string> = {
  tomoto: "tomato",
  tomata: "tomato",
  chilli: "chilli",
  chilii: "chilli",
  paddyy: "paddy",
  cottan: "cotton",
  blite: "blight",
  mildeww: "mildew",
};

export const mapTransliterationToLanguage = (
  input: string,
  fallback: AssistantLanguage = "en"
): AssistantLanguage => {
  const text = input.trim().toLowerCase();

  if (/(nenu|meeru|panta|raithu|vathavaranam|patti|vari)/.test(text)) return "te";
  if (/(main|kheti|fasal|beej|mitti|paani|sinchai)/.test(text)) return "hi";
  if (/(naan|vivasayam|vithai|mann|neer|payir)/.test(text)) return "ta";
  if (/(nanu|krishi|beeja|mannu|neeru|bele)/.test(text)) return "kn";

  return fallback;
};

export const normalizeLanguagePreference = (
  appLang: Lang,
  userText: string,
  explicitPreference?: string
): AssistantLanguage => {
  const requested = (explicitPreference || "").toLowerCase();
  // Strictly respect selected app language.
  const selected: AssistantLanguage = appLang === "te" ? "te" : "en";

  if (requested === "te" || requested === "telugu") return "te";
  if (requested === "en" || requested === "english") return "en";

  return selected;
};

export const classifyAgricultureIntent = (input: string): AgricultureIntent => {
  const text = input.toLowerCase();
  const matched = Object.entries(INTENT_KEYWORDS)
    .filter(([, keywords]) => keywords.some((word) => text.includes(word)))
    .map(([intent]) => intent as Exclude<AgricultureIntent, "mixed" | "unknown">);

  if (matched.length === 0) return "unknown";
  if (matched.length > 1) return "mixed";
  return matched[0];
};

const extractEntity = (input: string, patterns: RegExp[]): string | undefined => {
  for (const pattern of patterns) {
    const found = input.match(pattern);
    if (found?.[1]) return found[1].trim();
  }
  return undefined;
};

export const analyzeFarmerInput = (rawInput: string): FarmerInputAnalysis => {
  const lower = rawInput.toLowerCase();
  const correctedTerms: string[] = [];

  let normalized = lower;
  Object.entries(SPELLING_NORMALIZATION).forEach(([wrong, right]) => {
    if (normalized.includes(wrong)) {
      normalized = normalized.split(wrong).join(right);
      correctedTerms.push(`${wrong} -> ${right}`);
    }
  });

  const intent = classifyAgricultureIntent(normalized);
  const entities: FarmerEntities = {
    crop: extractEntity(normalized, [/crop\s*[:=-]?\s*([a-z\s]+)/i, /(paddy|rice|cotton|maize|tomato|chilli|wheat|banana)/i]),
    location: extractEntity(normalized, [/in\s+([a-z\s]+)(?:\s|$)/i, /location\s*[:=-]?\s*([a-z\s]+)/i]),
    soil_type: extractEntity(normalized, [/soil\s*[:=-]?\s*([a-z\s]+)/i, /(black|red|sandy|clay|loamy)\s+soil/i]),
    season_or_month: extractEntity(normalized, [/season\s*[:=-]?\s*([a-z\s]+)/i, /(kharif|rabi|zaid|june|july|august|september|october|november|december|january|february|march|april|may)/i]),
    farm_size: extractEntity(normalized, [/([0-9]+\.?[0-9]*)\s*(acre|acres|ha|hectare)/i]),
    irrigation_availability: extractEntity(normalized, [/irrigation\s*[:=-]?\s*([a-z\s]+)/i, /(drip|canal|borewell|rainfed|sprinkler)/i]),
    growth_stage: extractEntity(normalized, [/stage\s*[:=-]?\s*([a-z\s]+)/i, /(nursery|vegetative|flowering|fruiting|maturity)/i]),
    symptoms: extractEntity(normalized, [/symptom[s]?\s*[:=-]?\s*([a-z\s,.-]+)/i, /(spots|yellowing|wilting|rot|stunting|leaf curl)/i]),
    budget_level: extractEntity(normalized, [/budget\s*[:=-]?\s*([a-z\s]+)/i, /(low|medium|high)/i]),
    urgency: extractEntity(normalized, [/urgency\s*[:=-]?\s*([a-z\s]+)/i, /(urgent|today|immediately|asap)/i]),
  };

  const clarifyingQuestions: string[] = [];
  if (!entities.crop && (intent === "crop_selection" || intent === "pest_disease" || intent === "irrigation")) {
    clarifyingQuestions.push("Which crop are you currently growing?");
  }
  if (!entities.location && (intent === "crop_selection" || intent === "weather_risk")) {
    clarifyingQuestions.push("Which district or village is your farm in?");
  }
  if (!entities.growth_stage && (intent === "irrigation" || intent === "pest_disease" || intent === "harvest")) {
    clarifyingQuestions.push("What is the current crop growth stage?");
  }

  return {
    normalizedText: normalized,
    correctedTerms,
    intent,
    entities,
    clarifyingQuestions: clarifyingQuestions.slice(0, 2),
  };
};

const intentLabel = (intent: AgricultureIntent): string => {
  if (intent === "unknown") return "unknown";
  if (intent === "mixed") return "mixed";
  return intent;
};

export const AGRICULTURE_SYSTEM_PROMPT = `
You are AgriMithra Agriculture Assistant.
Role: practical farmer assistant.
Scope: agriculture only (crop lifecycle, soil, irrigation, pest/disease, weather risk adaptation, harvest, post-harvest, market readiness, scheme awareness high-level).
Answer only the crop or topic the user asked about.
Do not add general farming advice or unrelated tips.
Strictly refuse finance/trading/investment advice.
No guaranteed yield/profit promises.
Do not provide dangerous certainty about pesticide dosage or disease cure.
If severe risk is suspected, advise immediate local agriculture officer/agronomist.
If the question is unclear or missing crop details, ask one targeted follow-up instead of guessing.
Support: English, Telugu, Hindi, Tamil, Kannada.
Use simple, voice-friendly phrasing for farmers.
Response must be JSON with keys:
quickSummary, whyThisAdvice, whatToDoNow, next7DaysPlan, warningSigns, confidenceLevel, oneNextBestQuestion.
`.trim();

export const ANALYZER_PROMPT = `
Normalize user text/transcript. Extract entities:
crop, location, soil_type, season_or_month, farm_size, irrigation_availability, growth_stage, symptoms, budget_level, urgency.
Return intent from:
crop_selection, sowing, soil_nutrition, irrigation, pest_disease, weed_control, weather_risk, harvest, post_harvest, market_guidance, govt_scheme, mixed, unknown.
`.trim();

export const FORMATTER_PROMPT = `
Format final answer in this exact farmer-facing order:
Quick Summary
Why This Advice
What To Do Now (numbered)
Next 7 Days Plan
Warning Signs
Confidence Level (High/Medium/Low)
One Next Best Question
`.trim();

const sanitizeText = (value: string): string =>
  value
    .replace(/\s+/g, " ")
    .replace(/\*/g, "")
    .trim();

const containsEnglishLetters = (value: string): boolean => /[A-Za-z]/.test(value);

const teluguSafeLine = (line: string): string => {
  if (!containsEnglishLetters(line)) return line;
  return "దయచేసి పంటను గమనించి ఈ రోజు జాగ్రత్తగా చర్యలు తీసుకోండి.";
};

const buildConciseFarmerMessage = (
  sections: FarmerAdviceSections,
  language: AssistantLanguage
): string => {
  const hasValidAnswer =
    (sections.whatToDoNow && sections.whatToDoNow.length > 0) ||
    (sections.next7DaysPlan && sections.next7DaysPlan.length > 0);

  if (sections.confidenceLevel === "Low" && !hasValidAnswer) {
    const followUp = sanitizeText(sections.oneNextBestQuestion || (language === "te"
      ? "మీరు ఏ పంట గురించి అడుగుతున్నారు?"
      : "Which crop are you referring to?"));
    return language === "te" ? `స్పష్టత కావాలి\n✔ ${teluguSafeLine(followUp)}` : `Need more detail\n✔ ${followUp}`;
  }

  const actionLines = [
    ...sections.whatToDoNow.slice(0, 2),
    sections.warningSigns[0] || sections.oneNextBestQuestion,
  ].map((line) => sanitizeText(line)).filter(Boolean);

  const heading = language === "te" ? "త్వరిత సలహా" : "Quick Advice";
  const bullets = actionLines
    .slice(0, 3)
    .map((line) => {
      const safeLine = language === "te" ? teluguSafeLine(line) : line;
      return `✔ ${safeLine}`;
    })
    .join("\n");

  return `${heading}\n${bullets}`;
};

export const buildAgriculturePrompt = (payload: {
  language: AssistantLanguage;
  analysis: FarmerInputAnalysis;
  weatherHint?: string;
  fileContext?: FileEvidenceContext;
  userMessage: string;
  actionMode?: "normal" | "detail" | "repeat";
  repeatCount?: number;
  previousQuestion?: string;
  previousResponse?: string;
}): string => {
  const {
    language,
    analysis,
    weatherHint,
    fileContext,
    userMessage,
    actionMode = "normal",
    repeatCount,
    previousQuestion,
    previousResponse,
  } = payload;

  const actionInstruction =
    actionMode === "detail"
      ? `User asked for more detail. Expand the previous answer, add new information only, and do not repeat the earlier response.`
      : actionMode === "repeat"
      ? `This question was already answered before. Give a different explanation, not the same wording or same order.`
      : `Give a short, direct answer in 3-4 points only.`;

  return [
    AGRICULTURE_SYSTEM_PROMPT,
    ANALYZER_PROMPT,
    FORMATTER_PROMPT,
    `Language: ${language}`,
    `Response Mode: ${actionMode}`,
    `Repeated Question Count: ${repeatCount ?? 0}`,
    previousQuestion ? `Previous Question: ${previousQuestion}` : "",
    previousResponse ? `Previous Answer: ${previousResponse}` : "",
    `Instruction: ${actionInstruction}`,
    `Intent: ${intentLabel(analysis.intent)}`,
    `Extracted Entities: ${JSON.stringify(analysis.entities)}`,
    `Corrected Terms: ${analysis.correctedTerms.join(", ") || "none"}`,
    `Weather Context: ${weatherHint || "not available"}`,
    `File Evidence: ${fileContext ? JSON.stringify(fileContext) : "none"}`,
    `User Question: ${userMessage}`,
    analysis.clarifyingQuestions.length > 0
      ? `If required, ask max 1-2 clarifying questions from: ${analysis.clarifyingQuestions.join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

export const formatFarmerResponse = (
  raw: unknown,
  fallbackQuestion: string,
  language: AssistantLanguage = "en"
): FarmerAdviceSections => {
  const safeFallback = getLocalizedFallback(language, fallbackQuestion);

  if (!raw || typeof raw !== "object") return safeFallback;

  const parsed = raw as Partial<FarmerAdviceSections>;
  const confidence = parsed.confidenceLevel;
  const validConfidence = confidence === "High" || confidence === "Medium" || confidence === "Low";

  return {
    quickSummary: parsed.quickSummary || safeFallback.quickSummary,
    whyThisAdvice: parsed.whyThisAdvice || safeFallback.whyThisAdvice,
    whatToDoNow:
      Array.isArray(parsed.whatToDoNow) && parsed.whatToDoNow.length > 0
        ? parsed.whatToDoNow.map(String)
        : safeFallback.whatToDoNow,
    next7DaysPlan:
      Array.isArray(parsed.next7DaysPlan) && parsed.next7DaysPlan.length > 0
        ? parsed.next7DaysPlan.map(String)
        : safeFallback.next7DaysPlan,
    warningSigns:
      Array.isArray(parsed.warningSigns) && parsed.warningSigns.length > 0
        ? parsed.warningSigns.map(String)
        : safeFallback.warningSigns,
    confidenceLevel: validConfidence ? confidence : "Low",
    oneNextBestQuestion: parsed.oneNextBestQuestion || fallbackQuestion,
  };
};

export const handleFileUploadForCropEvidence = (file: File): FileEvidenceContext => {
  const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
  const evidenceNote =
    file.type.startsWith("image/")
      ? "Image evidence received. If confidence is low, request more field photos from different angles."
      : "Report/document uploaded. If details are incomplete, request additional field evidence.";

  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    previewUrl,
    evidenceNote,
  };
};

export const callAIAPI = async (payload: {
  apiBaseUrl: string;
  message: string;
  language: AssistantLanguage;
  analysis: FarmerInputAnalysis;
  weatherHint?: string;
  file?: File;
  fileContext?: FileEvidenceContext;
  actionMode?: "normal" | "detail" | "repeat";
  repeatCount?: number;
  previousQuestion?: string;
  previousResponse?: string;
  signal?: AbortSignal;
}): Promise<FarmerAdviceSections> => {
  const prompt = buildAgriculturePrompt({
    language: payload.language,
    analysis: payload.analysis,
    weatherHint: payload.weatherHint,
    fileContext: payload.fileContext,
    userMessage: payload.message,
    actionMode: payload.actionMode,
    repeatCount: payload.repeatCount,
    previousQuestion: payload.previousQuestion,
    previousResponse: payload.previousResponse,
  });

  const fallbackQuestion =
    payload.analysis.clarifyingQuestions[0] || "What crop and growth stage should I consider?";

  try {
    let response: Response;

    if (payload.file) {
      const form = new FormData();
      form.append("image", payload.file);
      form.append("message", payload.message);
      form.append("language", payload.language);
      form.append("prompt", prompt);
      form.append("analysis", JSON.stringify(payload.analysis));
      if (payload.weatherHint) form.append("weatherHint", payload.weatherHint);

      response = await fetch(`${payload.apiBaseUrl}/api/ai-assistant/chat`, {
        method: "POST",
        body: form,
        signal: payload.signal,
      });
    } else {
      response = await fetch(`${payload.apiBaseUrl}/api/ai-assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payload.message,
          language: payload.language,
          prompt,
          analysis: payload.analysis,
          weatherHint: payload.weatherHint,
        }),
        signal: payload.signal,
      });
    }

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const formatted = formatFarmerResponse(data?.data, fallbackQuestion, payload.language);

    // Guarantee a useful answer for paddy queries even when backend returns generic fallback text.
    if (isPaddyQuery(payload.message) && (formatted.confidenceLevel === "Low" || isGenericFallbackResponse(formatted))) {
      return getDirectPaddyGuidance(payload.language, payload.analysis);
    }

    return formatted;
  } catch {
    if (isPaddyQuery(payload.message)) {
      return getDirectPaddyGuidance(payload.language, payload.analysis);
    }
    return formatFarmerResponse(undefined, fallbackQuestion, payload.language);
  }
};

export const handleVoiceInput = async (payload: {
  preferredLanguage: AssistantLanguage;
  apiBaseUrl: string;
  onInterim?: (text: string) => void;
}): Promise<string> => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang =
      payload.preferredLanguage === "te"
        ? "te-IN"
        : payload.preferredLanguage === "hi"
        ? "hi-IN"
        : payload.preferredLanguage === "ta"
        ? "ta-IN"
        : payload.preferredLanguage === "kn"
        ? "kn-IN"
        : "en-IN";

    return new Promise((resolve, reject) => {
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        payload.onInterim?.(transcript);
        resolve(transcript);
      };
      recognition.onerror = () => {
        reject(new Error("speech-recognition-failed"));
      };
      recognition.start();
    });
  }

  const sttResp = await fetch(`${payload.apiBaseUrl}/api/ai-assistant/stt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language: payload.preferredLanguage }),
  });

  if (!sttResp.ok) {
    throw new Error("stt-unavailable");
  }

  const data = await sttResp.json();
  return String(data?.transcript || "").trim();
};

let currentAudio: HTMLAudioElement | null = null;
let availableVoices: SpeechSynthesisVoice[] = [];

const loadVoices = (): void => {
  if (!("speechSynthesis" in window)) return;
  availableVoices = window.speechSynthesis.getVoices();
  console.log("[TTS] available voices:", availableVoices.map((v) => `${v.name} (${v.lang})`));
};

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export const handleVoiceOutput = async (payload: {
  text: string;
  preferredLanguage: AssistantLanguage;
  apiBaseUrl: string;
  stop?: boolean;
}): Promise<void> => {
  if (payload.stop) {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    window.speechSynthesis.cancel();
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis.cancel();

  try {
    const response = await fetch(`${payload.apiBaseUrl}/api/ai-assistant/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: payload.text,
        language: payload.preferredLanguage,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      currentAudio = new Audio(audioUrl);
      await currentAudio.play();
      return;
    }
  } catch {
    // Browser fallback below
  }

  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(payload.text);

    if (payload.preferredLanguage === "te") {
      const teluguVoice = availableVoices.find((v) => v.lang.toLowerCase().includes("te"));
      if (teluguVoice) {
        utterance.voice = teluguVoice;
      }
      utterance.lang = "te-IN";
    } else {
      const englishVoice = availableVoices.find((v) => v.lang.toLowerCase().includes("en"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.lang = "en-US";
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
};

const formatSectionsToText = (sections: FarmerAdviceSections, language: AssistantLanguage): string => {
  return buildConciseFarmerMessage(sections, language);
};

export const handleSendMessage = async (payload: {
  message: string;
  appLang: Lang;
  apiBaseUrl: string;
  explicitLanguage?: string;
  weatherHint?: string;
  file?: File;
  fileContext?: FileEvidenceContext;
  actionMode?: "normal" | "detail" | "repeat";
  repeatCount?: number;
  previousQuestion?: string;
  previousResponse?: string;
  signal?: AbortSignal;
}): Promise<{
  language: AssistantLanguage;
  analysis: FarmerInputAnalysis;
  sections: FarmerAdviceSections;
  formattedText: string;
}> => {
  const language = normalizeLanguagePreference(payload.appLang, payload.message, payload.explicitLanguage);

  const analysis = analyzeFarmerInput(payload.message);
  const sections = await callAIAPI({
    apiBaseUrl: payload.apiBaseUrl,
    message: payload.message,
    language,
    analysis,
    weatherHint: payload.weatherHint,
    file: payload.file,
    fileContext: payload.fileContext,
    actionMode: payload.actionMode,
    repeatCount: payload.repeatCount,
    previousQuestion: payload.previousQuestion,
    previousResponse: payload.previousResponse,
    signal: payload.signal,
  });

  return {
    language,
    analysis,
    sections,
    formattedText: formatSectionsToText(sections, language),
  };
};
