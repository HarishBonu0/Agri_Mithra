import generateSchemes from '../services/schemeService.js';

// POST /api/schemes
export const findSchemes = async (req, res) => {
  try {
    const { land, crop, income, state } = req.body;

    if (!land || !crop || !income) {
      return res.status(400).json({
        success: false,
        message: 'land, crop, and income are required',
        requestId: req.requestId,
      });
    }

    const landNum = parseFloat(land);
    const incomeNum = parseFloat(income);
    if (isNaN(landNum) || landNum <= 0) {
      return res.status(422).json({ success: false, message: 'land must be a positive number', requestId: req.requestId });
    }
    if (isNaN(incomeNum) || incomeNum < 0) {
      return res.status(422).json({ success: false, message: 'income must be a non-negative number', requestId: req.requestId });
    }

    console.log(`[Schemes] crop=${crop}, land=${landNum}ac, state=${state || 'N/A'}`);
    const schemes = await generateSchemes({ land: landNum, crop: crop.trim(), income: incomeNum, state: state?.trim() });

    return res.json({
      success: true,
      message: 'Schemes fetched successfully',
      requestId: req.requestId,
      data: schemes,
    });
  } catch (err) {
    console.error('[Schemes] Controller error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error', requestId: req.requestId });
  }
};
