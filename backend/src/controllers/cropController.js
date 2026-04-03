import CropAnalysis from '../models/CropAnalysis.js';
import analyzeWithRoboflow from '../services/roboflowService.js';
import generateCropAdvisory from '../services/geminiService.js';
import { cleanupFile } from '../middleware/uploadMiddleware.js';

// POST /api/crop/analyze
export const analyzeCrop = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
        requestId: req.requestId,
      });
    }

    console.log(`[Crop] Analyzing: ${req.file.filename} for user ${req.user.userId}`);

    // Step 1: Roboflow detection (graceful fallback)
    let diseaseLabel = 'Unknown';
    let confidence = 0;
    let roboflowRaw = {};

    try {
      const result = await analyzeWithRoboflow(req.file.path);
      diseaseLabel = result.diseaseLabel;
      confidence = result.confidence;
      roboflowRaw = result.raw;
    } catch (rfErr) {
      console.error('[Roboflow] Error:', rfErr.message);
    }

    // Step 2: Gemini advisory (always returns, never throws)
    const advisory = await generateCropAdvisory({ diseaseLabel, confidence });

    // Step 3: Persist to DB
    const analysis = await CropAnalysis.create({
      user: req.user.userId,
      imagePath: req.file.filename,
      diseaseLabel,
      confidence,
      roboflowRaw,
      explanation: advisory.explanation,
      solution: advisory.solution,
      prevention: advisory.prevention,
      riskLevel: advisory.riskLevel,
      teluguTranslation: advisory.teluguTranslation,
    });

    return res.status(201).json({
      success: true,
      message: 'Analysis complete',
      requestId: req.requestId,
      data: {
        id: analysis._id,
        diseaseLabel: analysis.diseaseLabel,
        confidence: analysis.confidence,
        imagePath: analysis.imagePath,
        explanation: analysis.explanation,
        solution: analysis.solution,
        prevention: analysis.prevention,
        riskLevel: analysis.riskLevel,
        teluguTranslation: analysis.teluguTranslation,
        createdAt: analysis.createdAt,
      },
    });
  } catch (err) {
    // Cleanup uploaded file if DB save or something else failed
    cleanupFile(filePath);
    console.error('[Crop] analyzeCrop error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during analysis',
      requestId: req.requestId,
    });
  }
};

// GET /api/crop/history
export const getCropHistory = async (req, res) => {
  try {
    const analyses = await CropAnalysis.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-roboflowRaw -__v');

    return res.json({
      success: true,
      message: 'History fetched',
      requestId: req.requestId,
      data: analyses,
    });
  } catch (err) {
    console.error('[Crop] getCropHistory error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};
