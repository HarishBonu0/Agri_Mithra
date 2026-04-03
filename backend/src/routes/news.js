import { Router } from 'express';
import { fetchAgricultureNews } from '../services/newsService.js';

const router = Router();

router.get('/live', async (req, res) => {
  try {
    const result = await fetchAgricultureNews();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch agriculture news',
      details: error?.message || 'Unknown error',
    });
  }
});

export default router;
