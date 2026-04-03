import { Router } from 'express';
import { apSchemes } from '../data/apSchemes.js';

const router = Router();

const AGRICULTURE_WORDS = [
  'scheme',
  'schemes',
  'subsidy',
  'benefit',
  'benefits',
  'eligibility',
  'apply',
  'application',
  'farmer',
  'farmers',
  'agriculture',
  'agricultural',
  'crop',
  'crops',
  'irrigation',
  'drip',
  'sprinkler',
  'natural farming',
  'organic farming',
  'insurance',
  'rythu',
  'andhra pradesh',
  'ap ',
  'ap-',
];

const AP_WORDS = ['andhra pradesh', 'andhra', 'ap ', 'ap-', 'ysr', 'amaravati'];

const normalize = (value) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const isAgricultureQuestion = (question) => {
  const normalizedQuestion = normalize(question);
  return AGRICULTURE_WORDS.some((word) => normalizedQuestion.includes(word));
};

const isApQuestion = (question) => {
  const normalizedQuestion = normalize(question);
  return AP_WORDS.some((word) => normalizedQuestion.includes(word));
};

const scoreScheme = (question, scheme) => {
  const normalizedQuestion = normalize(question);
  const haystack = [scheme.name, scheme.summary, ...scheme.tags, ...scheme.eligibility, ...scheme.benefits, ...scheme.documents]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of normalizedQuestion.split(' ')) {
    if (!token) continue;
    if (haystack.includes(token)) {
      score += 1;
    }
  }

  for (const tag of scheme.tags) {
    if (normalizedQuestion.includes(tag.toLowerCase())) {
      score += 3;
    }
  }

  return score;
};

const pickRelevantSchemes = (question) => {
  return [...apSchemes]
    .map((scheme) => ({ scheme, score: scoreScheme(question, scheme) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.scheme);
};

const buildGrounding = (schemes) => {
  return schemes
    .map((scheme) => {
      return [
        `Name: ${scheme.name}`,
        `Summary: ${scheme.summary}`,
        `Eligibility: ${scheme.eligibility.join('; ')}`,
        `Benefits: ${scheme.benefits.join('; ')}`,
        `Documents: ${scheme.documents.join(', ')}`,
        `Apply: ${scheme.applyLink}`,
        `Source: ${scheme.source}`,
      ].join('\n');
    })
    .join('\n\n');
};

const askGemini = async ({ question, schemes }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      answer: 'Gemini API key is missing. Add it to backend/.env as GEMINI_API_KEY.',
    };
  }

  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const grounding = buildGrounding(schemes);

  const prompt = `You are an Andhra Pradesh agriculture scheme assistant.
Rules:
1. Answer only with Andhra Pradesh agriculture-related schemes.
2. Use only the grounded scheme facts below.
3. Do not invent schemes, benefits, eligibility, or application links.
4. If the question is outside Andhra Pradesh or not agriculture-related, refuse briefly.
5. If the grounded schemes do not answer the question, say you could not find a matching Andhra Pradesh scheme and ask the user to rephrase.

Grounded scheme facts:
${grounding}

User question:
${question}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  const answer = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('')?.trim();

  return {
    answer: answer || 'I could not generate a response from the Gemini API.',
  };
};

router.get('/', (_req, res) => {
  res.json({ state: 'Andhra Pradesh', count: apSchemes.length, schemes: apSchemes });
});

router.post('/chat', async (req, res) => {
  try {
    const question = String(req.body?.message || '').trim();

    if (!question) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (!isAgricultureQuestion(question) || !isApQuestion(question)) {
      return res.json({
        answer: 'I only answer agriculture scheme questions for Andhra Pradesh.',
        schemes: [],
        state: 'Andhra Pradesh',
      });
    }

    const relevantSchemes = pickRelevantSchemes(question);

    if (relevantSchemes.length === 0) {
      return res.json({
        answer: 'I could not find a matching Andhra Pradesh agriculture scheme for that question. Please rephrase or ask by scheme benefit, eligibility, or application process.',
        schemes: [],
        state: 'Andhra Pradesh',
      });
    }

    const result = await askGemini({ question, schemes: relevantSchemes });

    return res.json({
      answer: result.answer,
      schemes: relevantSchemes,
      state: 'Andhra Pradesh',
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to process scheme question',
    });
  }
});

export default router;
