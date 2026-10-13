import { Router } from 'express';
import Bus from '../models/Bus.js';
import CrowdReport from '../models/CrowdReport.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = { active: true };
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { busNumber: regex }, { routeName: regex },
        { startPoint: regex }, { endPoint: regex }, { stops: regex }
      ];
    }
    const buses = await Bus.find(filter).sort({ busNumber: 1 }).lean();
    const ids = buses.map(bus => bus._id);
    const reports = await CrowdReport.aggregate([
      { $match: { bus: { $in: ids }, reportedAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } } },
      { $sort: { reportedAt: -1 } },
      { $group: {
        _id: '$bus',
        latestLevel: { $first: '$crowdLevel' },
        latestAt: { $first: '$reportedAt' },
        reportCount: { $sum: 1 },
        recentLevels: { $push: '$crowdLevel' }
      }}
    ]);
    const reportMap = new Map(reports.map(r => [String(r._id), r]));
    res.json(buses.map(bus => ({
      ...bus,
      crowd: reportMap.get(String(bus._id)) || null
    })));
  } catch (error) { next(error); }
});

router.get('/:id/reports', async (req, res, next) => {
  try {
    const reports = await CrowdReport.find({ bus: req.params.id })
      .sort({ reportedAt: -1 }).limit(20).lean();
    res.json(reports);
  } catch (error) { next(error); }
});

export default router;
