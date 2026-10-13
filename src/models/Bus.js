import mongoose from 'mongoose';

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true, trim: true },
  routeName: { type: String, required: true, trim: true },
  startPoint: { type: String, required: true, trim: true },
  endPoint: { type: String, required: true, trim: true },
  stops: [{ type: String, trim: true }],
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Bus', busSchema);
