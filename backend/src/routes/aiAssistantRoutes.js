import { Router } from 'express';
import { chatWithAssistant, sttFallback, ttsProxy } from '../controllers/aiAssistantController.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/chat', aiLimiter, uploadSingle, chatWithAssistant);
router.post('/stt', aiLimiter, sttFallback);
router.post('/tts', aiLimiter, ttsProxy);

export default router;
