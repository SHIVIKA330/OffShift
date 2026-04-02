/**
 * OffShift — Claims Routes
 */

import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import { autoClaimProcessor } from '../services/cron';

const router = Router();

// POST /api/claims/trigger — Auto-trigger a claim payout for eligible policies
router.post('/trigger', async (req: Request, res: Response) => {
  try {
    console.log('⚡ Manual claim trigger initiated...');
    const result = await autoClaimProcessor();

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Claim processing failed', timestamp: new Date().toISOString() });
  }
});

// GET /api/claims/:id — Get claim status
router.get('/:id', (req: Request, res: Response) => {
  const claim = db.getClaim(req.params.id);
  
  if (!claim) {
    return res.status(404).json({ success: false, error: 'Claim not found', timestamp: new Date().toISOString() });
  }

  const rider = db.getRider(claim.rider_id);
  const policy = db.getPolicy(claim.policy_id);

  res.json({
    success: true,
    data: {
      claim,
      rider: rider || null,
      policy: policy || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/claims — List all claims
router.get('/', (_req: Request, res: Response) => {
  const claims = db.claims.map(c => {
    const rider = db.getRider(c.rider_id);
    const policy = db.getPolicy(c.policy_id);
    return {
      ...c,
      rider_name: rider?.name || 'Unknown',
      rider_upi: rider?.upi_id || '',
      plan_type: policy?.plan_type || '',
    };
  }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

  res.json({
    success: true,
    data: claims,
    total: claims.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
