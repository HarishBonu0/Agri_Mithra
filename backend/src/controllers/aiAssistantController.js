import { generateAgricultureAssistantReply } from '../services/aiAssistantService.js';

const parseJsonSafe = (value, fallback = {}) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const chatWithAssistant = async (req, res) => {
  try {
    const body = req.body || {};
    const message = body.message || '';
    const prompt = body.prompt || message;
    const language = body.language || 'en';
    const weatherHint = body.weatherHint || '';
    const analysis = parseJsonSafe(body.analysis, {});

    if (!message && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'message is required',
        requestId: req.requestId,
      });
    }

    const fileMeta = req.file
      ? {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        }
      : null;

    const reply = await generateAgricultureAssistantReply({
      prompt,
      language,
      weatherHint,
      fileMeta,
      analysis,
    });

    return res.json({
      success: true,
      requestId: req.requestId,
      data: reply,
    });
  } catch (err) {
    console.error('[AI Assistant] chat error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to process AI request',
      requestId: req.requestId,
    });
  }
};

export const sttFallback = async (_req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Backend STT not configured',
  });
};

export const ttsFallback = async (_req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Backend TTS not configured',
  });
};
