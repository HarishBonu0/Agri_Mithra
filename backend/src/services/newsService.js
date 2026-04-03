import axios from 'axios';
import { withRetry } from '../utils/retry.js';

const FALLBACK_NEWS = [
  { title: 'Government increases MSP for Kharif crops', summary: 'The government raised Minimum Support Prices for major Kharif crops to support farmer income.', category: 'Policy', source: 'AgriNews', url: '' },
  { title: 'New drought-resistant rice variety released', summary: 'Scientists developed a rice variety requiring 30% less water with higher yields in dry conditions.', category: 'Crops', source: 'AgriNews', url: '' },
  { title: 'Onion prices rise in major markets', summary: 'Onion prices increased due to lower supply from producing states. Farmers advised to plan accordingly.', category: 'Market', source: 'AgriNews', url: '' },
];

const buildSummaryPrompt = (articles) => `
Summarize these agriculture news articles for Indian farmers in simple English.
Respond ONLY with a valid JSON array (no markdown):
${JSON.stringify(articles.map((a) => ({ title: a.title, description: a.description || '' })), null, 2)}

Format: [{ "title": "...", "summary": "1-2 sentence farmer-friendly summary", "category": "Crops|Market|Policy|Technology|General" }]
`.trim();

const fetchAndSummarizeNews = async () => {
  const newsApiKey = process.env.NEWS_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  let rawArticles = [];
  if (newsApiKey) {
    try {
      const res = await withRetry(
        () => axios.get('https://newsapi.org/v2/everything', {
          params: { q: 'agriculture India farming crops', language: 'en', sortBy: 'publishedAt', pageSize: 6, apiKey: newsApiKey },
          timeout: 10000,
        }),
        { retries: 1, baseDelayMs: 500 }
      );
      rawArticles = res.data?.articles || [];
    } catch (err) {
      console.error('[News] NewsAPI error:', err.message);
    }
  } else {
    console.warn('[News] NEWS_API_KEY not set');
  }

  if (rawArticles.length === 0) {
    console.warn('[News] No articles — returning fallback');
    return FALLBACK_NEWS;
  }

  // Without Gemini, return raw articles directly
  if (!geminiApiKey) {
    return rawArticles.slice(0, 6).map((a) => ({
      title: a.title,
      summary: a.description || 'No summary available.',
      category: 'General',
      source: a.source?.name || '',
      url: a.url || '',
    }));
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
    const response = await withRetry(
      () => axios.post(
        url,
        {
          contents: [{ parts: [{ text: buildSummaryPrompt(rawArticles) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
      ),
      { retries: 1, baseDelayMs: 1000 }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');

    const cleaned = text.replace(/```json|```/g, '').trim();
    const summaries = JSON.parse(cleaned);

    return summaries.map((s, i) => ({
      title: s.title || rawArticles[i]?.title || '',
      summary: s.summary || '',
      category: s.category || 'General',
      source: rawArticles[i]?.source?.name || '',
      url: rawArticles[i]?.url || '',
    }));
  } catch (err) {
    console.error('[News] Gemini summarize error:', err.message);
    return rawArticles.slice(0, 6).map((a) => ({
      title: a.title,
      summary: a.description || 'No summary available.',
      category: 'General',
      source: a.source?.name || '',
      url: a.url || '',
    }));
  }
};

export default fetchAndSummarizeNews;
