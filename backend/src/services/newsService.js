import axios from 'axios';

const AGRI_KEYWORDS = [
  'agriculture',
  'agricultural',
  'farming',
  'farmer',
  'farmers',
  'crop',
  'crops',
  'harvest',
  'irrigation',
  'soil',
  'fertilizer',
  'pesticide',
  'seed',
  'mandi',
  'msp',
  'kharif',
  'rabi',
  'agri',
  'livestock',
  'dairy',
];

const categoryKeywords = {
  crops: ['crop', 'harvest', 'seed', 'yield', 'paddy', 'wheat', 'rice', 'maize'],
  market: ['price', 'market', 'mandi', 'export', 'import', 'commodity', 'trade'],
  policy: ['government', 'policy', 'scheme', 'subsidy', 'msp', 'ministry', 'insurance'],
  technology: ['technology', 'ai', 'drone', 'sensor', 'irrigation', 'startup', 'innovation'],
};

function inferCategory(text = '') {
  const normalized = text.toLowerCase();

  if (categoryKeywords.policy.some((keyword) => normalized.includes(keyword))) return 'policy';
  if (categoryKeywords.market.some((keyword) => normalized.includes(keyword))) return 'market';
  if (categoryKeywords.technology.some((keyword) => normalized.includes(keyword))) return 'technology';
  return 'crops';
}

function isAgricultureRelated(text = '') {
  const normalized = text.toLowerCase();
  return AGRI_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function normalizeArticles(payload) {
  const seen = new Set();
  const articles = Array.isArray(payload?.articles) ? payload.articles : [];

  return articles
    .filter((item) => item?.title && item?.url && item?.publishedAt)
    .filter((item) => {
      if (seen.has(item.url)) {
        return false;
      }
      seen.add(item.url);
      return true;
    })
    .map((item) => {
      const text = `${item.title ?? ''} ${item.description ?? ''} ${item.content ?? ''}`;
      return {
        title: item.title,
        summary: item.description || 'No summary available.',
        url: item.url,
        image: item.urlToImage,
        source: item.source?.name || 'Unknown source',
        publishedAt: item.publishedAt,
        category: inferCategory(text),
      };
    })
    .filter((item) => isAgricultureRelated(`${item.title} ${item.summary}`))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function fetchAgricultureNews() {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return {
      articles: [],
      fetchedCount: 0,
      matchedCount: 0,
    };
  }

  const keywordQuery = encodeURIComponent('(agriculture OR farming OR farmer OR crop OR agritech OR irrigation OR livestock)');
  const agricultureDomains = encodeURIComponent('agriculture.com,agriland.ie,farmprogress.com,agri-pulse.com,thecattlesite.com');

  const primaryUrl = `https://newsapi.org/v2/everything?q=${keywordQuery}&searchIn=title,description&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`;
  const domainUrl = `https://newsapi.org/v2/everything?domains=${agricultureDomains}&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`;

  const [primaryRes, domainRes] = await Promise.all([axios.get(primaryUrl), axios.get(domainUrl)]);

  const combinedArticles = [
    ...(primaryRes.data?.articles ?? []),
    ...(domainRes.data?.articles ?? []),
  ];

  const articles = normalizeArticles({ articles: combinedArticles });

  return {
    articles,
    fetchedCount: combinedArticles.length,
    matchedCount: articles.length,
  };
}
