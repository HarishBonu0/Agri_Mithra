import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { generateTextWithLlm } from './llmService.js';

const buildFallback = ({ diseaseLabel, diagnosisStatus = 'unknown', topPredictions = [], confidence = 0 }) => {
  const normalizedLabel = diseaseLabel || 'Unknown crop condition';
  const d = normalizedLabel.toLowerCase();
  const isUnknown = diagnosisStatus === 'unknown';
  const alternatives = (topPredictions || [])
    .slice(1, 3)
    .map((p) => p?.label)
    .filter(Boolean)
    .join(', ');

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
    diseaseLabel: normalizedLabel,
    whatIsHappening: isUnknown
      ? `The photo does not give a high-confidence disease match. Most likely class is ${normalizedLabel}${alternatives ? `, with close alternatives: ${alternatives}` : ''}.`
      : `Symptoms indicate ${normalizedLabel} and can spread quickly if moisture remains on leaves.`,
    whyItHappens: isUnknown
      ? 'This usually happens when the image is blurry/zoomed out, crop class is outside model training data, or symptoms are at very early stage.'
      : 'Usually linked to high humidity, prolonged leaf wetness, poor airflow, and delayed removal of infected leaves.',
    immediateActions: isUnknown
      ? [
          'Upload 2 to 3 clear close-up photos of affected leaves from different plants.',
          'Include one full-plant photo and one underside-leaf photo in daylight.',
          'Avoid spraying mixed chemicals until diagnosis is confirmed.',
          'Keep infected area separate and monitor spread daily.',
        ]
      : [
          'Remove clearly infected leaves and keep them outside the field (do not leave nearby).',
          'Stop overhead irrigation for 2 to 3 days; irrigate at root zone only.',
          'Separate badly affected plants where possible to reduce spread.',
          'Start a protective spray program based on label instructions.',
        ],
    weeklyPlan: isUnknown
      ? [
          'Day 1: collect better images and mark affected rows.',
          'Day 2 to 3: check if lesions spread to new leaves.',
          'Day 4 to 5: if spread increases, consult local agri officer with photos.',
          'Day 6 to 7: repeat scan with new photos before chemical escalation.',
        ]
      : [
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
      isUnknown
        ? `Model confidence is low (${Number(confidence).toFixed(1)}%). Confirm with clearer photos or local agriculture officer before final spray decision.`
        : 'Final spray decision should follow the product label and local agriculture officer advice based on crop stage and local conditions.',
  };
};

const buildPrompt = ({ diseaseLabel, diagnosisStatus, confidence, topPredictions }) =>
  `You are an agriculture field advisor for Indian farmers.

Detected disease label: "${diseaseLabel}".
Diagnosis status: "${diagnosisStatus}".
Top prediction confidence: "${Number(confidence).toFixed(1)}%".
Top alternatives: ${JSON.stringify((topPredictions || []).slice(0, 3))}.

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
- If diagnosisStatus is unknown or low_confidence, add conservative next steps and ask for better images.
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

const GEMINI_VISION_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-1.5-flash',
].filter(Boolean);

const OPENROUTER_VISION_MODELS = [
  process.env.OPENROUTER_VISION_MODEL,
  process.env.OPENROUTER_MODEL,
  'google/gemini-2.0-flash-001',
  'openai/gpt-4o-mini',
].filter(Boolean);

const extToMime = (filePath) => {
  const ext = path.extname(filePath || '').toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
};

const parseDiseaseJson = (text) => {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const topPredictions = Array.isArray(parsed.topPredictions)
    ? parsed.topPredictions
        .map((item) => ({
          label: String(item?.label || '').trim(),
          confidence: Math.max(0, Math.min(100, Number(item?.confidence || 0))),
        }))
        .filter((item) => item.label)
    : [];

  const confidence = Number(parsed.confidence || topPredictions[0]?.confidence || 0);
  const normalizedConfidence = Math.max(0, Math.min(100, Number.isFinite(confidence) ? confidence : 0));

  let diagnosisStatus = String(parsed.diagnosisStatus || '').toLowerCase();
  if (!['confirmed', 'low_confidence', 'unknown'].includes(diagnosisStatus)) {
    if (normalizedConfidence >= 65) diagnosisStatus = 'confirmed';
    else if (normalizedConfidence >= 35) diagnosisStatus = 'low_confidence';
    else diagnosisStatus = 'unknown';
  }

  return {
    diseaseLabel: String(parsed.diseaseLabel || topPredictions[0]?.label || 'Unknown crop condition').trim(),
    confidence: normalizedConfidence,
    diagnosisStatus,
    topPredictions: topPredictions.slice(0, 5),
    notes: String(parsed.notes || '').trim(),
  };
};

export const detectDiseaseWithGemini = async ({ imagePath }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!imagePath || !fs.existsSync(imagePath)) {
    throw new Error('Image file not found for Gemini disease detection fallback');
  }

  const base64Image = fs.readFileSync(imagePath).toString('base64');
  const mimeType = extToMime(imagePath);

  const prompt = `You are a plant pathology assistant.
Analyze this crop leaf/plant image and return ONLY valid JSON:
{
  "diseaseLabel": "most likely disease or deficiency name",
  "confidence": 0,
  "diagnosisStatus": "confirmed|low_confidence|unknown",
  "topPredictions": [
    { "label": "name", "confidence": 0 }
  ],
  "notes": "short explanation"
}
Rules:
- confidence range: 0 to 100
- include 3 to 5 topPredictions when possible
- if image quality is poor or diagnosis is unclear, set diagnosisStatus to unknown
- no markdown`;

  const errors = [];

  if (apiKey) {
    for (const model of GEMINI_VISION_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 600 },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 25000 }
        );

        const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          console.warn(`[GeminiVision] Empty response from ${model}`);
          continue;
        }

        const parsed = parseDiseaseJson(text);
        console.log(`[GeminiVision] Disease fallback from ${model}: ${parsed.diseaseLabel} (${parsed.confidence.toFixed(1)}%)`);
        return { ...parsed, model, provider: 'gemini' };
      } catch (err) {
        const message = err?.response?.data?.error?.message || err.message;
        console.error(`[GeminiVision] ${model} failed: ${message}`);
        errors.push(`Gemini(${model}): ${message}`);
      }
    }
  } else {
    errors.push('Gemini: GEMINI_API_KEY is not configured');
  }

  if (openRouterKey) {
    for (const model of OPENROUTER_VISION_MODELS) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
                ],
              },
            ],
            temperature: 0.1,
            max_tokens: 600,
          },
          {
            headers: {
              Authorization: `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              ...(process.env.OPENROUTER_SITE_URL ? { 'HTTP-Referer': process.env.OPENROUTER_SITE_URL } : {}),
              ...(process.env.OPENROUTER_APP_NAME ? { 'X-Title': process.env.OPENROUTER_APP_NAME } : {}),
            },
            timeout: 25000,
          }
        );

        const text = response?.data?.choices?.[0]?.message?.content;
        const normalizedText = typeof text === 'string'
          ? text
          : Array.isArray(text)
            ? text.map((p) => p?.text || '').join('\n')
            : '';
        if (!normalizedText) {
          console.warn(`[OpenRouterVision] Empty response from ${model}`);
          continue;
        }

        const parsed = parseDiseaseJson(normalizedText);
        console.log(`[OpenRouterVision] Disease fallback from ${model}: ${parsed.diseaseLabel} (${parsed.confidence.toFixed(1)}%)`);
        return { ...parsed, model, provider: 'openrouter' };
      } catch (err) {
        const message = err?.response?.data?.error?.message || err.message;
        console.error(`[OpenRouterVision] ${model} failed: ${message}`);
        errors.push(`OpenRouter(${model}): ${message}`);
      }
    }
  } else {
    errors.push('OpenRouter: OPENROUTER_API_KEY is not configured');
  }

  throw new Error(`AI fallback disease detection failed. ${errors.join(' | ')}`);
};

const generateCropAdvisory = async ({ diseaseLabel, diagnosisStatus, confidence, topPredictions }) => {
  const fallback = buildFallback({ diseaseLabel, diagnosisStatus, confidence, topPredictions });
  const result = await generateTextWithLlm({
    prompt: buildPrompt({ diseaseLabel, diagnosisStatus, confidence, topPredictions }),
    temperature: 0.2,
    maxOutputTokens: 1200,
    logTag: 'CropAdvisory',
  });

  if (result?.text) {
    return parseGeminiJson(result.text, fallback);
  }

  return fallback;
};

export default generateCropAdvisory;
