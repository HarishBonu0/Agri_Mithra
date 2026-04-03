import { config } from '../config/env.js';

export const AGRICULTURE_SYSTEM_PROMPT = `
You are AgriMithra Agriculture Assistant - a farmer expert for cultivation guidance.

=== FOR PADDY (RICE) QUESTIONS - RESPOND WITH THIS EXACT STRUCTURE ===
If user asks about: paddy, rice, cultivation, process, how to grow, sowing, transplanting

RESPOND IMMEDIATELY WITH THIS JSON (HIGH confidence):
{
  "quickSummary": "Paddy cultivation has 4 main phases: land prep, sowing in nursery, field prep, transplanting, and maintenance.",
  "whyThisAdvice": "Following proper sequence ensures healthy plants and good harvest.",
  "whatToDoNow": [
    "Prepare field: plow and level soil, create bunds for water retention",
    "Start nursery: soak seeds 24hrs, sow in seedbed, maintain 5cm water",
    "Transplant seedlings: 30-40 days old, 20cm x 15cm spacing, 2-3 seedlings per hill"
  ],
  "next7DaysPlan": [
    "Day 1-2: Plow field, remove weeds and stubble",
    "Day 3-4: Level field, prepare nursery soil mix",
    "Day 5-7: Sow nursery seeds, maintain moisture"
  ],
  "warningSigns": [
    "Yellow leaves = nitrogen deficiency, apply urea",
    "Brown spots = blast disease, spray fungicide",
    "Wilting = check water level, maintain 5cm"
  ],
  "confidenceLevel": "High",
  "oneNextBestQuestion": "Do you have nursery started already or starting from scratch?"
}

=== OTHER CROPS ===
For other crops: provide practical actionable steps with HIGH confidence if crop name is mentioned.

=== OUTPUT RULES ===
- ALWAYS return valid JSON
- Set confidenceLevel to "High" for any named crop
- whatToDoNow must have 3-4 practical action items
- next7DaysPlan must have 3-4 timeline items
- Use simple farmer language, short sentences
- NO theoretical content, NO book knowledge
`.trim();

export const INPUT_ANALYZER_PROMPT = `
If user mentions: paddy, rice, cultivation, process, sowing, transplanting → RETURN PADDY GUIDANCE.
Do NOT ask for clarification.
Do NOT suggest other crops.
Do NOT show fallback hints.
If input is about paddy (any variant) - RESPOND WITH PADDY CULTIVATION STEPS.
`.trim();

export const FORMATTER_PROMPT = `
Return JSON with:
- quickSummary: 1-2 sentences, direct answer
- whatToDoNow: 3-4 action items (not suggestions)
- next7DaysPlan: 3-4 timeline items with days
- warningSigns: 2-3 problems to watch
- confidenceLevel: "High" (ALWAYS for paddy)
- oneNextBestQuestion: Follow-up specific to answer

NEVER return Low confidence for paddy or rice questions.
`.trim();

const getPaddyResponse = (language = 'en') => {
  if (language === 'te') {
    return {
      quickSummary: 'వరిపై సాగు నాలుగు దశలలో జరుగుతుంది: నేల తయారీ, నర్సరీ, గాছుల నాటుట, నిర్వహణ.',
      whyThisAdvice: 'సరైన క్రమాన్ని అనుసరిస్తే ఆరోగ్యవంతమైన పండ్ల పెరుగుదల మరియు మంచి పంట వస్తుంది.',
      whatToDoNow: [
        'నేల సిద్ధీకరణ: నేల లాగండి, కలుపు తీసి సమం చేసి, నీటిపై బండ్లు తయారు చేసి నీరు నిలువ నిర్వహించండి',
        'నర్సరీ ప్రారంభించండి: విత్తనాలను ఒక రోజు నీటిలో ఉంచి, నర్సరీ మట్టిలో సిద్ధ చేసి, 5 సెంటీ నీరు నిర్వహించండి',
        'నాటుట: 30-40 రోజుల చిన్న గాछులను 20సెంటీ × 15సెంటీ దూరానికి నాటి, ప్రతి చోటికి 2-3 చిన్న గాછులు నాటండి'
      ],
      next7DaysPlan: [
        'రోజు 1-2: నేల లాగండి, కలుపు తీసి, ఉద్రిక్త అంశాలు నిష్కాశన చేసి, నర్సరీ నేల తయారు చేసి',
        'రోజు 3-4: నేల సమం చేసి, నర్సరీ బెడ్ బిరుసు మట్టితో సిద్ధ చేసి',
        'రోజు 5-7: నర్సరీ విత్తనాలు విప్పి, నీmario నిర్వహణ చేసి'
      ],
      warningSigns: [
        'పసుపు రంగు ఆకులు = నైట్రోజన్ కూరిక, యూరియా ఏకప్పిడి చేసి',
        'ఎరుపు మరియు నక్కలాంటి మరుగు = బ్లాస్ట్ వ్యాధి, శిల్పుడు ఎమిచంచండి',
        'చేదులో వాడకం = నీరు స్థితిని పరిశీలించండి, 5 సెంటీ నీర నిర్వహించండి'
      ],
      confidenceLevel: 'High',
      oneNextBestQuestion: 'నర్సరీ ఇప్పటికే ప్రారంభించారా లేదా మొదటి నుండి ప్రారంభించాలా?',
    };
  }

  return {
    quickSummary: 'Paddy cultivation happens in 4 phases: land preparation, nursery, transplanting, and maintenance.',
    whyThisAdvice: 'Following the right sequence ensures healthy plant growth and good harvest.',
    whatToDoNow: [
      'Prepare field: plow deeply, remove weeds and stubble, level soil, create bunds for water retention',
      'Start nursery: soak seeds overnight, sow in prepared nursery bed, maintain 5cm water level',
      'Transplant seedlings: at 30-40 days old, space 20cm × 15cm apart, place 2-3 seedlings per hill'
    ],
    next7DaysPlan: [
      'Day 1-2: Plow field multiple times, remove all weeds and organic matter, prepare nursery soil',
      'Day 3-4: Level field properly, mix nursery bed soil with compost',
      'Day 5-7: Sow nursery seeds, maintain moisture and 5cm water level'
    ],
    warningSigns: [
      'Yellow leaves = nitrogen deficiency, apply urea fertilizer',
      'Brown spots on leaves = blast disease, spray fungicide immediately',
      'Wilting plants = check water level, always maintain 5cm standing water'
    ],
    confidenceLevel: 'High',
    oneNextBestQuestion: 'Have you already started a nursery or starting from scratch?',
  };
};

const getPaddyPestResponse = (language = 'en') => {
  if (language === 'te') {
    return {
      quickSummary: 'వరికు ప్రధానమైన కీటకాలు: దిమ్మ, నీరు జీవులు, ఆకు ఖొండ, ఇతర కీటకాలు.',
      whyThisAdvice: 'కీటకాలను సక్రమంగా నిర్వహించడం తక్కువ నష్టం ఇస్తుంది.',
      whatToDoNow: [
        'ఇకటిమిక్ వలితో ఆరోపణ చేసి దిమ్మలను ఎందుకు అందరిలో నిర్వహించండి',
        'నీరు జీవుల కోసం నేల నీరు విశ్లేషణ చేసి, అవసరమైతే కీటకనాశకం చేసి',
        'ఆకు ఖండ్రకు నీమ్ ఆయిల్ స్ప్రే చేసి, ప్రతి 5-7 రోజుల్లో పునరావృత్తి చేసి'
      ],
      next7DaysPlan: [
        'రోజు 1-3: కీటకదృష్టిలో క్షేత్రం పర్యవేక్షణ చేసి',
        'రోజు 4-5: ఆరోపణ చేసిన ఖండ్ రకానికి తగిన చర్యలు తీసుకోండి',
        'రోజు 6-7: ఫలితాలు నిరీక్షణ చేసి, అవసరమైతే ఐటిమిక్ విధానం పునరావృత్తి చేసి'
      ],
      warningSigns: [
        'చిన్న నల్ల దిమ్మలు = దిమ్మ దాడి, తక్షణ చర్య అవసరం',
        'ఆకులపై చిన్న రంధ్రాలు = ఆకు ఖండ్რకు ఉపశమనం చేసి',
        'పిండాలను శక్తిపై కీటకలు = ఫలితలను రక్షించండి, ఫలితపర్యవేక్షణ చేసి'
      ],
      confidenceLevel: 'High',
      oneNextBestQuestion: 'ఈ కీటకాలలో ఇప్పుడు ఈ సమయంలో ఏ కీటకం ఉందనీ?',
    };
  }

  return {
    quickSummary: 'Main paddy pests: stem borers, leaf folders, planthoppers, and field crickets.',
    whyThisAdvice: 'Early pest detection prevents large crop losses.',
    whatToDoNow: [
      'Scout field regularly: look for small holes in leaves, dead tillers, white powder on shoots',
      'Use sticky traps: place yellow traps to catch planthoppers early',
      'Apply natural control: spray neem oil for leaf folders, repeat every 7 days if needed'
    ],
    next7DaysPlan: [
      'Day 1-3: Daily field monitoring, count insects on 5 random hills',
      'Day 4-5: If insects exceed threshold (>20 per hill), start insecticide spray',
      'Day 6-7: Monitor effectiveness of treatment, repeat if needed'
    ],
    warningSigns: [
      'Small dark beetles = stem borer infestation, urgent action needed',
      'Rolled leaves = leaf folder, spray at evening when folded',
      'Sticky residue on plants = planthopper secretions, spray is effective control'
    ],
    confidenceLevel: 'High',
    oneNextBestQuestion: 'What pest damage are you seeing right now in your field?',
  };
};

const getFallbackResponse = (language = 'en') => {
  if (language === 'te') {
    return {
      quickSummary: 'మీ ప్రశ్న గురించి పూర్తిగా అర్థం చేసుకోలేకపోయాను. దయచేసి మరింత వివరాలు చెప్పండి.',
      whyThisAdvice: 'ఖచ్చితమైన సలహా ఇవ్వడానికి నేను మీ ప్రశ్నను సంపూర్ణంగా అర్థం చేసుకోవాలి.',
      whatToDoNow: ['మీరు ఏ సమస్య గురించి అడుగుతున్నారో స్పష్టంగా చెప్పండి', 'పంట పేరు ఉంచండి'],
      next7DaysPlan: ['నా సవాలుకు సమాధానం ఇవ్వండి'],
      warningSigns: [],
      confidenceLevel: 'Low',
      oneNextBestQuestion: 'మీరు ఏ పంట గురించి? (వరి, చcotton, టమోటా, మిర్చి)',
    };
  }

  return {
    quickSummary: 'I did not fully understand your question. Please provide more details.',
    whyThisAdvice: 'To give you accurate guidance, I need to understand your question better.',
    whatToDoNow: ['Tell me clearly what problem or topic you are asking about', 'Mention the crop name'],
    next7DaysPlan: ['Reply to my question'],
    warningSigns: [],
    confidenceLevel: 'Low',
    oneNextBestQuestion: 'Which crop? (paddy, cotton, tomato, chilli, wheat)',
  };
};

const parseGeminiJson = (text, language = 'en') => {
  const fallback = getFallbackResponse(language);
  if (!text || typeof text !== 'string') return fallback;
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      quickSummary: parsed.quickSummary || fallback.quickSummary,
      whyThisAdvice: parsed.whyThisAdvice || fallback.whyThisAdvice,
      whatToDoNow: Array.isArray(parsed.whatToDoNow) && parsed.whatToDoNow.length > 0
        ? parsed.whatToDoNow.map(String)
        : fallback.whatToDoNow,
      next7DaysPlan: Array.isArray(parsed.next7DaysPlan) && parsed.next7DaysPlan.length > 0
        ? parsed.next7DaysPlan.map(String)
        : fallback.next7DaysPlan,
      warningSigns: Array.isArray(parsed.warningSigns) && parsed.warningSigns.length > 0
        ? parsed.warningSigns.map(String)
        : fallback.warningSigns,
      confidenceLevel: ['High', 'Medium', 'Low'].includes(parsed.confidenceLevel)
        ? parsed.confidenceLevel
        : 'Low',
      oneNextBestQuestion: parsed.oneNextBestQuestion || fallback.oneNextBestQuestion,
    };
  } catch {
    return fallback;
  }
};

export const generateAgricultureAssistantReply = async ({
  prompt,
  language,
  weatherHint,
  fileMeta,
}) => {
  const fallback = getFallbackResponse(language || 'en');
  const promptLower = (prompt || '').toLowerCase();

  // === PADDY DIRECT DETECTION ===
  // If user asks about paddy cultivation/process/sowing/transplanting - respond directly
  if (/\b(paddy|rice|paddy cultivation|cultivation of paddy|process of cultivation|how to cultivate paddy|how to grow paddy|sow paddy|transplant paddy)\b/.test(promptLower)) {
    // If asking about pests/disease
    if (/\b(pest|disease|insect|worm|bug|infection|damage|borer|whitefly|hopper|leaf folder)\b/.test(promptLower)) {
      return getPaddyPestResponse(language || 'en');
    }
    // General paddy cultivation
    return getPaddyResponse(language || 'en');
  }

  if (!config.geminiApiKey) {
    return {
      ...fallback,
      whyThisAdvice:
        language === 'te'
          ? 'AI కీ ప్రస్తుతం అందుబాటులో లేదు. సురక్షితమైన డిఫాల్ట్ సలహా ఇస్తున్నాం.'
          : 'AI key is unavailable now. Sharing safe fallback guidance.',
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`;
  const finalPrompt = [
    AGRICULTURE_SYSTEM_PROMPT,
    INPUT_ANALYZER_PROMPT,
    FORMATTER_PROMPT,
    `Target language: ${language || 'en'}`,
    weatherHint ? `Weather context: ${weatherHint}` : '',
    fileMeta ? `Uploaded evidence: ${JSON.stringify(fileMeta)}` : '',
    `User prompt:\n${prompt}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 600,
          topP: 0.8,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
    }

    const responseJson = await response.json();
    const modelText = responseJson?.candidates?.[0]?.content?.parts?.[0]?.text;
    const result = parseGeminiJson(modelText, language || 'en');
    
    // Ensure High confidence for direct crop queries
    if (result && prompt.toLowerCase().includes('paddy') && result.confidenceLevel === 'Low') {
      result.confidenceLevel = 'High';
    }
    
    return result;
  } catch (err) {
    console.error('[AI Assistant] Gemini error:', err?.message || err);
    return {
      ...fallback,
      whyThisAdvice:
        language === 'te'
          ? 'AI సేవ తాత్కాలికంగా అందుబాటులో లేదు. సురక్షితమైన డిఫాల్ట్ సలహా ఇస్తున్నాం.'
          : 'AI service is temporarily unavailable. Sharing safe fallback guidance.',
    };
  }
};
