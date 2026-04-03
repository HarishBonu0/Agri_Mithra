import axios from 'axios';

const buildFallback = (diseaseLabel) => {
  const d = (diseaseLabel || 'Leaf infection').toLowerCase();

  let pesticideOptions = [
    {
      name: 'Mancozeb 75% WP',
      useWhen: 'Early fungal leaf spots and blight symptoms',
      dosage: '2 to 2.5 g per liter of water',
      timing: 'Spray in morning/evening, repeat after 7 days if needed',
      safety: 'Wear gloves and mask. Do not spray during high wind or before rain.',
    },
    {
      name: 'Copper Oxychloride 50% WP',
      useWhen: 'Bacterial/fungal leaf lesions and wet weather outbreaks',
      dosage: '2.5 to 3 g per liter of water',
      timing: 'Spray at first visible spread, then monitor every 5 to 7 days',
      safety: 'Avoid over-spraying. Keep children and livestock away during spray.',
    },
  ];

  if (d.includes('powdery') || d.includes('mildew')) {
    pesticideOptions = [
      {
        name: 'Wettable Sulphur 80% WP',
        useWhen: 'Powdery mildew white patches',
        dosage: '2 g per liter of water',
        timing: 'Spray at first signs and repeat in 7 days if needed',
        safety: 'Do not spray in very hot afternoon. Use mask and gloves.',
      },
      {
        name: 'Hexaconazole 5% EC',
        useWhen: 'Moderate to severe powdery mildew spread',
        dosage: '1 ml per liter of water',
        timing: 'One spray, then reassess after 5 to 7 days',
        safety: 'Follow label waiting period before harvest.',
      },
    ];
  }

  return {
    diseaseLabel: diseaseLabel || 'Leaf infection',
    whatIsHappening: `Symptoms indicate ${diseaseLabel || 'a possible leaf infection'} that can spread quickly if moisture remains on leaves.`,
    whyItHappens: 'Usually linked to high humidity, prolonged leaf wetness, poor airflow, and delayed removal of infected leaves.',
    immediateActions: [
      'Remove clearly infected leaves and keep them outside the field (do not leave nearby).',
      'Stop overhead irrigation for 2 to 3 days; irrigate at root zone only.',
      'Separate badly affected plants where possible to reduce spread.',
      'Start a protective spray program based on label instructions.',
    ],
    weeklyPlan: [
      'Day 1: sanitation and first spray application.',
      'Day 2 to 3: monitor new spots on lower and middle leaves.',
      'Day 4 to 5: remove newly infected leaves, maintain drainage.',
      'Day 6 to 7: decide second spray only if spread continues.',
    ],
    preventionChecklist: [
      'Use disease-free seeds/seedlings from trusted source.',
      'Maintain proper spacing for airflow between plants.',
      'Use balanced fertilizer; avoid excess nitrogen.',
      'Scout crop every 3 to 4 days in humid weather.',
    ],
    lossReductionPlan: [
      'Prioritize treatment in healthy-to-mild zones first to protect yield.',
      'Avoid unnecessary sprays; target only where spread is active.',
      'Maintain moisture balance to reduce stress-related yield drop.',
      'Harvest mature unaffected produce on time to prevent additional losses.',
    ],
    warningSigns: [
      'Rapid increase in spots within 48 hours',
      'Wilting of new leaves despite irrigation',
      'Stem lesions or fruit infection starting',
    ],
    pesticideOptions,
    teluguSummary:
      'ఆకులపై వ్యాధి వ్యాపిస్తోంది. వెంటనే బాధిత ఆకులను తొలగించండి, పై నుంచి నీరు పోయడం ఆపండి, సరైన మందును లేబుల్ ప్రకారం పిచికారీ చేయండి. 7 రోజుల పాటు రోజువారీ పర్యవేక్షణ చేయండి.',
    disclaimer:
      'Final spray decision should follow the product label and local agriculture officer advice based on crop stage and local conditions.',
  };
};

const buildPrompt = (diseaseLabel) =>
  `You are an agriculture field advisor for Indian farmers.

Detected disease label: "${diseaseLabel}".

Return ONLY valid JSON with this exact schema:
{
  "whatIsHappening": "string, simple and clear",
  "whyItHappens": "string",
  "immediateActions": ["step1", "step2", "step3", "step4"],
  "weeklyPlan": ["day-wise step"],
  "preventionChecklist": ["tip1", "tip2", "tip3"],
  "lossReductionPlan": ["action1", "action2", "action3"],
  "warningSigns": ["sign1", "sign2"],
  "pesticideOptions": [
    {
      "name": "product or active ingredient",
      "useWhen": "when to use",
      "dosage": "dose per liter or per acre",
      "timing": "best time/frequency",
      "safety": "short safety instruction"
    }
  ],
  "teluguSummary": "short Telugu summary",
  "disclaimer": "short caution statement"
}

Rules:
- Use practical, non-technical farmer language.
- Give step-by-step actionable instructions.
- Mention safe pesticide options where appropriate.
- No confidence, probability, ML, or model terms.
- No markdown.`.trim();

const parseGeminiJson = (text, fallback) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    const pickList = (key, defaultList = []) =>
      Array.isArray(parsed[key]) ? parsed[key].filter((x) => typeof x === 'string' && x.trim()) : defaultList;

    const pesticideOptions = Array.isArray(parsed.pesticideOptions)
      ? parsed.pesticideOptions
          .map((p) => ({
            name: p?.name || '',
            useWhen: p?.useWhen || '',
            dosage: p?.dosage || '',
            timing: p?.timing || '',
            safety: p?.safety || '',
          }))
          .filter((p) => p.name)
      : fallback.pesticideOptions;

    return {
      ...fallback,
      whatIsHappening: parsed.whatIsHappening || fallback.whatIsHappening,
      whyItHappens: parsed.whyItHappens || fallback.whyItHappens,
      immediateActions: pickList('immediateActions', fallback.immediateActions),
      weeklyPlan: pickList('weeklyPlan', fallback.weeklyPlan),
      preventionChecklist: pickList('preventionChecklist', fallback.preventionChecklist),
      lossReductionPlan: pickList('lossReductionPlan', fallback.lossReductionPlan),
      warningSigns: pickList('warningSigns', fallback.warningSigns),
      pesticideOptions,
      teluguSummary: parsed.teluguSummary || fallback.teluguSummary,
      disclaimer: parsed.disclaimer || fallback.disclaimer,
    };
  } catch {
    return fallback;
  }
};

const generateCropAdvisory = async ({ diseaseLabel }) => {
  const fallback = buildFallback(diseaseLabel);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] API key not set — returning fallback');
    return fallback;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: buildPrompt(diseaseLabel) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1200 },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.warn('[Gemini] Empty response — returning fallback');
      return fallback;
    }

    console.log(`[Gemini] Detailed advisory generated for: ${diseaseLabel}`);
    return parseGeminiJson(text, fallback);
  } catch (err) {
    console.error('[Gemini] Error:', err.response?.data?.error?.message || err.message);
    return fallback;
  }
};

export default generateCropAdvisory;
