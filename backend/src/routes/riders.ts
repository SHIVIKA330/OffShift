/**
 * OffShift — Rider Routes
 */

import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data/store';
import { getKavachScoreForRider } from '../services/kavach-score';
import { Rider } from '../models/types';

const router = Router();

// POST /api/riders/register — Register a new rider
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, phone, pincode, platform, upi_id, shift_pattern } = req.body;

    if (!name || !phone || !pincode || !platform || !upi_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phone, pincode, platform, upi_id',
        timestamp: new Date().toISOString(),
      });
    }

    // Check for existing rider
    const existing = db.getRiderByPhone(phone);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Rider already registered with this phone number',
        data: existing,
        timestamp: new Date().toISOString(),
      });
    }

    const rider: Rider = {
      id: `r-${uuid().substring(0, 8)}`,
      name,
      phone,
      pincode,
      platform,
      upi_id,
      kavach_score: 50,
      trust_score: 0.5,
      days_active: 0,
      shift_pattern: shift_pattern || 'mixed',
      created_at: new Date(),
    };

    // Calculate initial Kavach score
    const kavachResult = getKavachScoreForRider(rider);
    rider.kavach_score = kavachResult.riskScore;
    rider.trust_score = kavachResult.trust_score;

    db.addRider(rider);

    console.log(`✅ New rider registered: ${rider.name} (${rider.pincode}, ${rider.platform}) — Kavach Score: ${rider.kavach_score}`);

    res.status(201).json({
      success: true,
      data: {
        rider,
        kavach_score: kavachResult,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/riders/:id — Get rider profile + active policies
router.get('/:id', (req: Request, res: Response) => {
  const rider = db.getRider(req.params.id);
  
  if (!rider) {
    return res.status(404).json({
      success: false,
      error: 'Rider not found',
      timestamp: new Date().toISOString(),
    });
  }

  const activePolicies = db.getActivePoliciesForRider(rider.id);
  const claims = db.claims.filter(c => c.rider_id === rider.id);

  res.json({
    success: true,
    data: {
      rider,
      active_policies: activePolicies,
      claims_history: claims,
      total_payouts: claims.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount_paid, 0),
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/riders — List all riders
router.get('/', (_req: Request, res: Response) => {
  const riders = db.riders.map(rider => {
    const activePolicies = db.getActivePoliciesForRider(rider.id);
    const claims = db.claims.filter(c => c.rider_id === rider.id);
    const lastPayout = claims.filter(c => c.status === 'paid').sort((a, b) => (b.paid_at?.getTime() || 0) - (a.paid_at?.getTime() || 0))[0];

    return {
      ...rider,
      active_policy: activePolicies[0] || null,
      total_claims: claims.length,
      last_payout: lastPayout ? { amount: lastPayout.amount_paid, date: lastPayout.paid_at } : null,
    };
  });

  res.json({
    success: true,
    data: riders,
    total: riders.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
