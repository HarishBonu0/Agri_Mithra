import fetchAndSummarizeNews from '../services/newsService.js';

// GET /api/news
export const getNews = async (req, res) => {
  try {
    console.log('[News] Fetching agriculture news');
    const articles = await fetchAndSummarizeNews();

    return res.json({
      success: true,
      message: 'News fetched successfully',
      requestId: req.requestId,
      data: articles,
    });
  } catch (err) {
    console.error('[News] Controller error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};
