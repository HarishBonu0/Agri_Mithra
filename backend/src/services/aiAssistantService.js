import { generateTextWithLlm } from './llmService.js';

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are AgriMithra, a knowledgeable and friendly agricultural assistant for Indian farmers. You are multilingual and always respond in the same language the farmer uses.

YOUR EXPERTISE:
- Crop selection and variety recommendations
- Soil preparation and soil health management
- Sowing, transplanting, spacing, and nursery management
- Fertilizers (organic and chemical) with specific quantities and timing
- Irrigation methods (drip, sprinkler, flood) and scheduling
- Pest and disease identification, prevention, and treatment
- Weed management and herbicide guidance
- Weather adaptation and climate-smart farming
- Harvesting, post-harvest storage, and grading
- Market guidance and price trends
- Government schemes, subsidies, and PM-KISAN
- Farm economics and input cost management

LANGUAGE RULES — THIS IS CRITICAL:
- If the farmer writes in Telugu script → respond entirely in Telugu
- If the farmer writes in Hindi → respond entirely in Hindi
- If the farmer writes in Tamil → respond entirely in Tamil
- If the farmer writes in Kannada → respond entirely in Kannada
- If the farmer writes in English → respond entirely in English
- If you see Telugu words like vari, panta, raithu, nenu → respond in Telugu

STRICT LANGUAGE CONSISTENCY (for voice output compatibility):
- When responding in Telugu: every JSON field value must be written fully in Telugu script
  - Use "రోజు 1-2:" instead of "Day 1-2:"
  - Use "హెచ్చరిక:" instead of "Warning:"
  - Use "మొదటి చర్య:" instead of "Step 1:"
  - Chemical names like Mancozeb → write as "మాంకోజెబ్ (Mancozeb)" — Telugu pronunciation first
  - Urea → "యూరియా", DAP → "డి.ఎ.పి.", Carbendazim → "కార్బెండాజిమ్"
- When responding in Hindi: every value must be Devanagari script, no English words
- When responding in Tamil: every value must be Tamil script
- When responding in Kannada: every value must be Kannada script
- NEVER write "Day 1-2", "Step", "Warning", "Note" in an Indian-language response — use the native equivalent

ANSWER QUALITY:
- Give COMPLETE answers — do not cut short, do not say "consult an expert" without first giving actual advice
- Include specific quantities: grams/liters per acre, number of days, spacing in cm
- Use chemical/product names common in Indian markets (Mancozeb, Chlorpyrifos, DAP, Urea, etc.)
- Always include safety precautions when mentioning pesticides
- If a question is unclear, make a reasonable assumption and state it
- Never promise specific yield numbers or profits

RESPONSE FORMAT — Return ONLY a valid JSON object, no markdown, no extra text:
{
  "quickSummary": "1-2 sentences that directly answer the question",
  "whyThisAdvice": "2-3 sentences explaining the reasoning or science",
  "whatToDoNow": [
    "Numbered step with specific details, quantities, and timing",
    "Step 2...",
    "Step 3...",
    "...include as many steps as needed for a complete answer"
  ],
  "next7DaysPlan": [
    "Day 1-2: specific actions (use native language equivalent of 'Day' when not responding in English)",
    "Day 3-4: specific actions",
    "Day 5-7: specific actions"
  ],
  "warningSigns": [
    "What to watch for and what to do if you see it",
    "..."
  ],
  "confidenceLevel": "High",
  "oneNextBestQuestion": "A specific follow-up question to help the farmer more"
}

CRITICAL: Do NOT limit array length. A thorough answer has 5-8 steps in whatToDoNow. Always fill all fields.`;

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const getFallback = (language = 'en') => {
  if (language === 'te') {
    return {
      quickSummary: 'AI సహాయకుడు తాత్కాలికంగా అందుబాటులో లేడు. దయచేసి కొంత సేపటిలో మళ్ళీ ప్రయత్నించండి.',
      whyThisAdvice: 'సాంకేతిక సమస్య కారణంగా సమాధానం ఇవ్వలేకపోతున్నాను.',
      whatToDoNow: [
        'మీ దగ్గర్లోని కృషి విజ్ఞాన కేంద్రం (KVK) సంప్రదించండి',
        'స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి',
        'రైతు హెల్ప్‌లైన్ 1800-180-1551 కి కాల్ చేయండి',
      ],
      next7DaysPlan: [],
      warningSigns: [],
      confidenceLevel: 'Low',
      oneNextBestQuestion: 'మీరు ఏ పంట గురించి సమాచారం కావాలి?',
    };
  }
  return {
    quickSummary: 'AI assistant is temporarily unavailable. Please try again shortly.',
    whyThisAdvice: 'There is a temporary technical issue.',
    whatToDoNow: [
      'Contact your nearest Krishi Vigyan Kendra (KVK)',
      'Call Kisan Call Centre: 1800-180-1551 (free)',
      'Try your question again in a few minutes',
    ],
    next7DaysPlan: [],
    warningSigns: [],
    confidenceLevel: 'Low',
    oneNextBestQuestion: 'Which crop are you asking about?',
  };
};

// ─── Parse LLM JSON response ──────────────────────────────────────────────────

const parseLlmResponse = (text, language) => {
  const fallback = getFallback(language);
  if (!text || typeof text !== 'string') return fallback;

  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('No JSON braces found');

    const parsed = JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));

    return {
      quickSummary: parsed.quickSummary || fallback.quickSummary,
      whyThisAdvice: parsed.whyThisAdvice || '',
      whatToDoNow: Array.isArray(parsed.whatToDoNow) && parsed.whatToDoNow.length > 0
        ? parsed.whatToDoNow.map(String)
        : fallback.whatToDoNow,
      next7DaysPlan: Array.isArray(parsed.next7DaysPlan) ? parsed.next7DaysPlan.map(String) : [],
      warningSigns: Array.isArray(parsed.warningSigns) ? parsed.warningSigns.map(String) : [],
      confidenceLevel: ['High', 'Medium', 'Low'].includes(parsed.confidenceLevel)
        ? parsed.confidenceLevel
        : 'Medium',
      oneNextBestQuestion: parsed.oneNextBestQuestion || '',
    };
  } catch {
    // If JSON parse fails, try to build a plain-text response
    return {
      ...fallback,
      quickSummary: text.slice(0, 200).trim() || fallback.quickSummary,
    };
  }
};

// ─── Build prompt with conversation history ───────────────────────────────────

const buildPromptWithHistory = (currentMessage, language, history, weatherHint, fileMeta) => {
  const historyLines = (history || [])
    .slice(-12) // keep up to last 12 messages for better multi-turn continuity
    .map((m) => `${m.role === 'user' ? 'Farmer' : 'Assistant'}: ${m.text}`)
    .join('\n');

  const contextParts = [
    SYSTEM_PROMPT,
    historyLines ? `\n=== PREVIOUS CONVERSATION ===\n${historyLines}` : '',
    `Language setting: ${language || 'en'}`,
    weatherHint ? `Current weather context: ${weatherHint}` : '',
    fileMeta ? `Farmer uploaded file: ${fileMeta.originalname || fileMeta.filename} (${fileMeta.mimetype})` : '',
    `\n=== FARMER'S CURRENT QUESTION ===\n${currentMessage}`,
  ];

  return contextParts.filter(Boolean).join('\n');
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const generateAgricultureAssistantReply = async ({
  prompt,
  language = 'en',
  weatherHint,
  fileMeta,
  history = [],
}) => {
  const fullPrompt = buildPromptWithHistory(prompt, language, history, weatherHint, fileMeta);

  const result = await generateTextWithLlm({
    prompt: fullPrompt,
    temperature: 0.3,
    maxOutputTokens: 2048,
    logTag: 'AgriAssistant',
  });

  if (!result?.text) {
    console.warn('[AgriAssistant] LLM returned no text — using fallback');
    return getFallback(language);
  }

  return parseLlmResponse(result.text, language);
};
