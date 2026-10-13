import { Router } from 'express';
import mongoose from 'mongoose';
import Bus from '../models/Bus.js';
import CrowdReport from '../models/CrowdReport.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { busId, stopName, crowdLevel, note = '' } = req.body || {};
    if (!mongoose.isValidObjectId(busId)) {
      return res.status(400).json({ message: 'Choose a valid bus.' });
    }
    if (!stopName || typeof stopName !== 'string' || stopName.trim().length > 100) {
      return res.status(400).json({ message: 'Enter a valid stop name (up to 100 characters).' });
    }
    if (!['Low', 'Medium', 'High'].includes(crowdLevel)) {
      return res.status(400).json({ message: 'Crowd level must be Low, Medium, or High.' });
    }
    if (typeof note !== 'string' || note.length > 180) {
      return res.status(400).json({ message: 'Note must be 180 characters or fewer.' });
    }
    const bus = await Bus.findById(busId);
    if (!bus || !bus.active) return res.status(404).json({ message: 'Bus not found.' });

    const report = await CrowdReport.create({
      bus: bus._id, stopName: stopName.trim(), crowdLevel, note: note.trim()
    });
    const result = await report.toObject();
    req.io.emit('crowd:updated', { busId: String(bus._id), report: result });
    res.status(201).json({ message: 'Crowd report submitted.', report: result });
  } catch (error) { next(error); }
});

export default router;
