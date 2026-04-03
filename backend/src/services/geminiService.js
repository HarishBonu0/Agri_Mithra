import axios from 'axios';

const FALLBACK = {
  explanation: 'A crop disease was detected. Please consult a local agronomist for accurate diagnosis.',
  solution:
    '1. Isolate affected plants from healthy ones.\n2. Remove and destroy visibly infected leaves or stems.\n3. Avoid overhead irrigation to limit moisture spread.\n4. Do not apply fertiliser until disease is identified.\n5. Consult your nearest Krishi Vigyan Kendra (KVK) for treatment guidance.',
  prevention:
    'Use certified disease-free seeds. Maintain proper plant spacing for airflow. Practice crop rotation every season. Monitor fields weekly for early symptoms.',
  risk: 'Medium',
};

const buildPrompt = (disease) =>
  `You are an agricultural expert advising small-scale Indian farmers.

A crop disease called "${disease}" has been detected in a field image.

Respond in plain text with exactly these 4 labeled sections:

EXPLANATION: (2-3 sentences explaining what this disease is, how it spreads, and which crops it affects)

SOLUTION: (3-5 numbered steps the farmer must take immediately, including safe chemical names and rates if applicable)

PREVENTION: (3-4 short prevention tips, comma-separated)

RISK: (one word only — Low, Medium, or High)`.trim();

const parseResponse = (text) => {
  const get = (label) => {
    const match = text.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i'));
    return match?.[1]?.trim() || null;
  };

  const rawRisk = get('RISK') || '';
  const risk = ['Low', 'Medium', 'High'].includes(rawRisk) ? rawRisk : 'Medium';

  return {
    explanation: get('EXPLANATION') || FALLBACK.explanation,
    solution: get('SOLUTION') || FALLBACK.solution,
    prevention: get('PREVENTION') || FALLBACK.prevention,
    risk,
  };
};

const generateCropAdvisory = async (disease) => {
  if (!disease) return FALLBACK;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[Gemini] API key not set — returning fallback');
    return FALLBACK;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: buildPrompt(disease) }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.warn('[Gemini] Empty response — returning fallback');
      return FALLBACK;
    }

    console.log(`[Gemini] Advisory generated for: ${disease}`);
    return parseResponse(text);
  } catch (err) {
    console.error('[Gemini] Error:', err.response?.data?.error?.message || err.message);
    return FALLBACK;
  }
};

export default generateCropAdvisory;
