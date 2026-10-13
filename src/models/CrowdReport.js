import mongoose from 'mongoose';

const crowdReportSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
  stopName: { type: String, required: true, trim: true },
  crowdLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  note: { type: String, trim: true, maxlength: 180, default: '' },
  reportedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

export default mongoose.model('CrowdReport', crowdReportSchema);
