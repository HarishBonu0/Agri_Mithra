import axios from 'axios';
import { withRetry, createCircuitBreaker } from '../utils/retry.js';

const breaker = createCircuitBreaker({ threshold: 5, cooldownMs: 60_000 });

const FALLBACK_ADVISORY = {
  explanation: 'Unable to generate advisory at this time.',
  solution: 'Consult your local agricultural extension officer for guidance.',
  prevention: 'Maintain crop hygiene, use certified seeds, and monitor regularly.',
  riskLevel: 'Unknown',
  teluguTranslation: 'ప్రస్తుతం సలహా అందుబాటులో లేదు. స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.',
};

const buildPrompt = (diseaseLabel, confidence) => `
You are an agricultural expert helping Indian farmers. A crop disease has been detected.

Disease: ${diseaseLabel}
Confidence: ${confidence}%

Respond ONLY with a valid JSON object (no markdown, no extra text):
{
  "explanation": "Simple 1-2 sentence explanation of what this disease is and how it spreads.",
  "solution": "Practical treatment steps a farmer can take immediately.",
  "prevention": "How to prevent this disease in future crops.",
  "riskLevel": "Low" or "Medium" or "High",
  "teluguTranslation": "Brief Telugu translation of the explanation and solution."
}

Keep language simple. India farming context. Be concise.
`.trim();

const parseResponse = (text) => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return {
      explanation: parsed.explanation || FALLBACK_ADVISORY.explanation,
      solution: parsed.solution || FALLBACK_ADVISORY.solution,
      prevention: parsed.prevention || FALLBACK_ADVISORY.prevention,
      riskLevel: ['Low', 'Medium', 'High'].includes(parsed.riskLevel) ? parsed.riskLevel : 'Unknown',
      teluguTranslation: parsed.teluguTranslation || FALLBACK_ADVISORY.teluguTranslation,
    };
  } catch {
    return FALLBACK_ADVISORY;
  }
};

const generateCropAdvisory = async ({ diseaseLabel, confidence }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[Gemini] API key not set — returning fallback');
    return FALLBACK_ADVISORY;
  }

  if (!diseaseLabel || diseaseLabel === 'Unknown') {
    return {
      ...FALLBACK_ADVISORY,
      explanation: 'No disease was detected in this image.',
      teluguTranslation: 'చిత్రంలో ఏ వ్యాధి గుర్తించబడలేదు.',
    };
  }

  if (breaker.isOpen()) {
    console.warn('[Gemini] Circuit open — returning fallback');
    return FALLBACK_ADVISORY;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await withRetry(
      () => axios.post(
        url,
        {
          contents: [{ parts: [{ text: buildPrompt(diseaseLabel, confidence) }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      ),
      { retries: 1, baseDelayMs: 1000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) { console.warn('[Gemini] Empty response'); return FALLBACK_ADVISORY; }

    breaker.recordSuccess();
    console.log('[Gemini] Advisory generated for:', diseaseLabel);
    return parseResponse(text);
  } catch (err) {
    breaker.recordFailure();
    console.error('[Gemini] Error:', err.response?.data?.error?.message || err.message);
    return FALLBACK_ADVISORY;
  }
};

export default generateCropAdvisory;
