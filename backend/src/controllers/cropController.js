import CropAnalysis from '../models/CropAnalysis.js';
import analyzeWithRoboflow from '../services/roboflowService.js';
import generateCropAdvisory, { detectDiseaseWithGemini } from '../services/geminiService.js';
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
    let diagnosis = {
      diseaseLabel: 'Unknown crop condition',
      confidence: 0,
      diagnosisStatus: 'unknown',
      topPredictions: [],
      modelVersion: '',
      raw: {},
    };
    let detectionError = '';
    let geminiDetectionError = '';
    try {
      const result = await analyzeWithRoboflow(filePath);
      diagnosis = {
        diseaseLabel: result.diseaseLabel || diagnosis.diseaseLabel,
        confidence: Number.isFinite(result.confidence) ? result.confidence : 0,
        diagnosisStatus: result.diagnosisStatus || diagnosis.diagnosisStatus,
        topPredictions: Array.isArray(result.topPredictions) ? result.topPredictions : [],
        modelVersion: result.modelVersion || '',
        raw: result.raw || {},
      };
    } catch (err) {
      console.error('[Roboflow] Detection failed:', err.message);
      detectionError = err.message || 'Detection failed';
    }

    // Step 1B: Gemini Vision fallback — predict disease from image when Roboflow fails/uncertain
    if (diagnosis.diagnosisStatus !== 'confirmed') {
      try {
        const geminiDiagnosis = await detectDiseaseWithGemini({ imagePath: filePath });
        if (geminiDiagnosis && (geminiDiagnosis.confidence >= diagnosis.confidence || diagnosis.diagnosisStatus === 'unknown')) {
          diagnosis = {
            diseaseLabel: geminiDiagnosis.diseaseLabel || diagnosis.diseaseLabel,
            confidence: Number.isFinite(geminiDiagnosis.confidence) ? geminiDiagnosis.confidence : diagnosis.confidence,
            diagnosisStatus: geminiDiagnosis.diagnosisStatus || diagnosis.diagnosisStatus,
            topPredictions: Array.isArray(geminiDiagnosis.topPredictions) ? geminiDiagnosis.topPredictions : diagnosis.topPredictions,
            modelVersion: `${geminiDiagnosis.provider || 'ai'}-vision:${geminiDiagnosis.model || 'unknown'}`,
            raw: {
              ...diagnosis.raw,
              geminiFallback: {
                notes: geminiDiagnosis.notes || '',
                provider: geminiDiagnosis.provider || 'gemini',
                model: geminiDiagnosis.model || '',
              },
            },
          };
          detectionError = '';
        }
      } catch (err) {
        console.error('[GeminiVision] Detection fallback failed:', err.message);
        geminiDetectionError = err.message || 'Gemini fallback failed';
      }
    }

    // Step 2: Gemini — generate advisory
    const advisory = await generateCropAdvisory({
      diseaseLabel: diagnosis.diseaseLabel,
      diagnosisStatus: diagnosis.diagnosisStatus,
      confidence: diagnosis.confidence,
      topPredictions: diagnosis.topPredictions,
    });

    // Step 3: Build the final response payload
    const data = {
      disease: diagnosis.diseaseLabel,
      confidence: Number(diagnosis.confidence.toFixed(1)),
      diagnosisStatus: diagnosis.diagnosisStatus,
      topPredictions: diagnosis.topPredictions,
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

    if (diagnosis.diagnosisStatus === 'unknown') {
      const warnings = [detectionError, geminiDetectionError].filter(Boolean).join(' | ');
      if (warnings) {
        data.importantNote = `${advisory.disclaimer} Detection warning: ${warnings}`;
      }
    }

    // Respond immediately — do not block on DB
    res.status(200).json({ success: true, data });

    // Step 4: Persist to DB asynchronously (failure does NOT affect API response)
    CropAnalysis.create({
      user: req.user.userId,
      imagePath: req.file.filename,
      diseaseLabel: diagnosis.diseaseLabel,
      confidence: Number(diagnosis.confidence.toFixed(1)),
      diagnosisStatus: diagnosis.diagnosisStatus,
      topPredictions: diagnosis.topPredictions,
      modelVersion: diagnosis.modelVersion,
      roboflowRaw: diagnosis.raw,
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
        .select('diseaseLabel confidence diagnosisStatus topPredictions explanation immediateActions weeklyPlan preventionChecklist lossReductionPlan warningSigns pesticideOptions teluguTranslation disclaimer imagePath createdAt'),
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
