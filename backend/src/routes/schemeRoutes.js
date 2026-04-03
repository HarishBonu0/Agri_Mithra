import { Router } from 'express';
import { findSchemes } from '../controllers/schemeController.js';
import protect from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/', protect, aiLimiter, findSchemes);

export default router;
