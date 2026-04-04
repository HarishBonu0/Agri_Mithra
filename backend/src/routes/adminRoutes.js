import { Router } from 'express';
import mongoose from 'mongoose';
import protect from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import CropAnalysis from '../models/CropAnalysis.js';

const router = Router();

const ADMIN_PHONE = '9182392500';

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

router.get('/overview', protect, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        requestId: req.requestId,
      });
    }

    const today = startOfToday();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersToday,
      usersLast7Days,
      totalAnalyses,
      analysesToday,
      recentUsers,
      recentAnalyses,
      diagnosisBreakdown,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      CropAnalysis.countDocuments({}),
      CropAnalysis.countDocuments({ createdAt: { $gte: today } }),
      User.find({}, 'name phone createdAt').sort({ createdAt: -1 }).limit(8),
      CropAnalysis.find({}, 'diseaseLabel diagnosisStatus confidence createdAt user')
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .limit(12),
      CropAnalysis.aggregate([
        { $group: { _id: '$diagnosisStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const adminUsers = await User.countDocuments({
      $or: [{ phone: ADMIN_PHONE }, { phone: `+91${ADMIN_PHONE}` }],
    });

    const statusCounts = {
      confirmed: 0,
      low_confidence: 0,
      unknown: 0,
    };

    for (const row of diagnosisBreakdown) {
      if (row?._id in statusCounts) {
        statusCounts[row._id] = row.count;
      }
    }

    return res.json({
      success: true,
      requestId: req.requestId,
      generatedAt: new Date().toISOString(),
      system: {
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      },
      users: {
        total: totalUsers,
        admins: adminUsers,
        today: usersToday,
        last7Days: usersLast7Days,
        recent: recentUsers.map((u) => ({
          id: String(u._id),
          name: u.name,
          phone: u.phone,
          createdAt: u.createdAt,
        })),
      },
      cropAnalyses: {
        total: totalAnalyses,
        today: analysesToday,
        diagnosisStatus: statusCounts,
        recent: recentAnalyses.map((a) => ({
          id: String(a._id),
          diseaseLabel: a.diseaseLabel,
          diagnosisStatus: a.diagnosisStatus,
          confidence: a.confidence,
          createdAt: a.createdAt,
          user: a.user
            ? {
                id: String(a.user._id),
                name: a.user.name,
                phone: a.user.phone,
              }
            : null,
        })),
      },
      activities: {
        latestUserSignupAt: recentUsers[0]?.createdAt || null,
        latestAnalysisAt: recentAnalyses[0]?.createdAt || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to load admin overview',
      requestId: req.requestId,
    });
  }
});

export default router;
