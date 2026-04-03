import axios from 'axios';
import { withRetry } from '../utils/retry.js';

const FALLBACK_SCHEMES = [
  {
    name: 'PM-KISAN',
    description: 'Direct income support of ₹6,000/year to small and marginal farmers.',
    eligibility: 'Farmers with less than 2 hectares of land.',
    benefit: '₹6,000 per year in three installments.',
    applyAt: 'pmkisan.gov.in',
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme protecting farmers from natural calamities.',
    eligibility: 'All farmers growing notified crops.',
    benefit: 'Insurance coverage for crop loss due to drought, flood, and pest attacks.',
    applyAt: 'pmfby.gov.in',
  },
];

const buildPrompt = ({ land, crop, income, state }) => `
You are an Indian agricultural scheme advisor helping farmers find government benefits.

Farmer details:
- Land: ${land} acres
- Crop: ${crop}
- Annual income: ₹${income}
- State: ${state || 'India (general)'}

List 3-5 relevant government schemes this farmer qualifies for.
Respond ONLY with a valid JSON array (no markdown):
[
  {
    "name": "Scheme name",
    "description": "One sentence about the scheme.",
    "eligibility": "Who qualifies.",
    "benefit": "What the farmer gets.",
    "applyAt": "Website or office."
  }
]
`.trim();

const generateSchemes = async ({ land, crop, income, state }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { console.warn('[Schemes] GEMINI_API_KEY not set'); return FALLBACK_SCHEMES; }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await withRetry(
      () => axios.post(
        url,
        {
          contents: [{ parts: [{ text: buildPrompt({ land, crop, income, state }) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      ),
      { retries: 1, baseDelayMs: 1000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return FALLBACK_SCHEMES;

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : FALLBACK_SCHEMES;
  } catch (err) {
    console.error('[Schemes] Gemini error:', err.response?.data?.error?.message || err.message);
    return FALLBACK_SCHEMES;
  }
};

export default generateSchemes;
