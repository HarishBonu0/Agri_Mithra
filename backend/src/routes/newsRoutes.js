import { Router } from 'express';
import { getHeadlines, getNews } from '../controllers/newsController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.get('/headlines', getHeadlines);
router.get('/', protect, getNews);

export default router;
