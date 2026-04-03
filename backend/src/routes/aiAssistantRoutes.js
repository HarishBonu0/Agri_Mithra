import { Router } from 'express';
import { chatWithAssistant, sttFallback, ttsFallback } from '../controllers/aiAssistantController.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/chat', aiLimiter, uploadSingle, chatWithAssistant);
router.post('/stt', aiLimiter, sttFallback);
router.post('/tts', aiLimiter, ttsFallback);

export default router;
