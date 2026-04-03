import CropAnalysis from '../models/CropAnalysis.js';
import analyzeWithRoboflow from '../services/roboflowService.js';
import generateCropAdvisory from '../services/geminiService.js';
import { cleanupFile } from '../middleware/uploadMiddleware.js';

// ─── POST /api/crop/analyze ───────────────────────────────────────────────────

export const analyzeCrop = async (req, res) => {
  const filePath = req.file?.path;
  const startTime = Date.now();

  try {
    // Guard: no file uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    // Step 1: Roboflow — detect disease
    let disease = 'Leaf infection';
    try {
      const result = await analyzeWithRoboflow(filePath);
      disease = result.disease;
    } catch (err) {
      console.error('[Roboflow] Detection failed:', err.message);
      // continue with fallback disease label
    }

    // Step 2: Gemini — generate advisory
    const advisory = await generateCropAdvisory({ diseaseLabel: disease });

    // Step 3: Build the final response payload
    const data = {
      disease,
      whatIsHappening: advisory.whatIsHappening,
      whyItHappens: advisory.whyItHappens,
      doThisNow: advisory.immediateActions,
      next7DaysPlan: advisory.weeklyPlan,
      preventNextTime: advisory.preventionChecklist,
      saveYourYield: advisory.lossReductionPlan,
      pesticideOptions: advisory.pesticideOptions,
      warningSigns: advisory.warningSigns,
      localLanguageAdvice: advisory.teluguSummary,
      importantNote: advisory.disclaimer,

      // Backward-compatible fields for existing clients
      explanation: advisory.whatIsHappening,
      solution: advisory.immediateActions?.join('\n') || '',
      prevention: advisory.preventionChecklist?.join(', ') || '',
    };

    // Respond immediately — do not block on DB
    res.status(200).json({ success: true, data });

    // Step 4: Persist to DB asynchronously (failure does NOT affect API response)
    CropAnalysis.create({
      user: req.user.userId,
      imagePath: req.file.filename,
      diseaseLabel: disease,
      explanation: advisory.whatIsHappening,
      immediateActions: advisory.immediateActions,
      weeklyPlan: advisory.weeklyPlan,
      preventionChecklist: advisory.preventionChecklist,
      solution: advisory.immediateActions?.join('\n') || '',
      prevention: advisory.preventionChecklist?.join(', ') || '',
      riskLevel: 'Unknown',
      teluguTranslation: advisory.teluguSummary,
      disclaimer: advisory.disclaimer,
      lossReductionPlan: advisory.lossReductionPlan,
      warningSigns: advisory.warningSigns,
      pesticideOptions: advisory.pesticideOptions,
    }).catch((err) => console.error('[DB] Save failed (non-fatal):', err.message));

    console.log(`[Analyze] Completed in ${Date.now() - startTime}ms for user=${req.user.userId}`);

  } catch (err) {
    cleanupFile(filePath);
    console.error('[Analyze] Fatal error:', err.message);
    // Only send error if headers not already sent
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: 'Server error during analysis' });
    }
  }
};

// ─── GET /api/crop/history ────────────────────────────────────────────────────

export const getCropHistory = async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const rawPage = parseInt(req.query.page, 10);

    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20;
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      CropAnalysis.find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('diseaseLabel explanation immediateActions weeklyPlan preventionChecklist lossReductionPlan warningSigns pesticideOptions teluguTranslation disclaimer imagePath createdAt'),
      CropAnalysis.countDocuments({ user: req.user.userId }),
    ]);

    return res.json({
      success: true,
      pagination: { total, page, limit, hasNext: skip + analyses.length < total },
      data: analyses,
    });
  } catch (err) {
    console.error('[History] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
