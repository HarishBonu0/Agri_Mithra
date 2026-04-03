import { Router } from 'express';
import { getNews } from '../controllers/newsController.js';
import protect from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getNews);

export default router;
