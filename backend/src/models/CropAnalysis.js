import mongoose from 'mongoose';

const cropAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    diseaseLabel: { type: String, default: 'Unknown' },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    roboflowRaw: { type: mongoose.Schema.Types.Mixed, default: {} },
    explanation: { type: String, default: '' },
    solution: { type: String, default: '' },
    prevention: { type: String, default: '' },
    riskLevel: {
      type: String,
      default: 'Unknown',
      enum: ['Low', 'Medium', 'High', 'Unknown'],
    },
    teluguTranslation: { type: String, default: '' },
  },
  { timestamps: true }
);

// Compound index — optimizes the history query (user + latest first)
cropAnalysisSchema.index({ user: 1, createdAt: -1 });

const CropAnalysis = mongoose.model('CropAnalysis', cropAnalysisSchema);
export default CropAnalysis;
