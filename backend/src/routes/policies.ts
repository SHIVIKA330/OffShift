/**
 * OffShift — Policy Routes
 */

import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data/store';
import { getKavachScoreForRider } from '../services/kavach-score';
import { collectPremium } from '../services/payments';
import { Policy, PlanType } from '../models/types';

const router = Router();

const PLAN_CONFIG: Record<PlanType, { duration_hours: number; base_premium: number; max_payout: number }> = {
  shift_pass: { duration_hours: 24, base_premium: 49, max_payout: 500 },
  weekly_pass: { duration_hours: 168, base_premium: 99, max_payout: 1500 },
  monthly_pro: { duration_hours: 720, base_premium: 349, max_payout: 4000 },
};

// POST /api/policies/quote — Get dynamic Kavach Score quote
router.post('/quote', (req: Request, res: Response) => {
  try {
    const { rider_id, weather_forecast_score } = req.body;

    const rider = db.getRider(rider_id);
    if (!rider) {
      return res.status(404).json({ success: false, error: 'Rider not found', timestamp: new Date().toISOString() });
    }

    const kavachResult = getKavachScoreForRider(rider, weather_forecast_score || 0.5);

    res.json({
      success: true,
      data: {
        rider_id: rider.id,
        rider_name: rider.name,
        pincode: rider.pincode,
        kavach_score: kavachResult,
        plans: {
          shift_pass: {
            premium: kavachResult.premium_24hr,
            max_payout: 500,
            duration: kavachResult.bonus_hours > 0 ? `24 + ${kavachResult.bonus_hours} Bonus Hours` : '24 hours',
            covers: ['Heavy Rain', 'Heatwave'],
            bonus_hours: kavachResult.bonus_hours,
          },
          weekly_pass: {
            premium: kavachResult.premium_7day,
            max_payout: 1500,
            duration: '7 days',
            covers: ['Weather', 'App Outages'],
          },
          monthly_pro: {
            premium: kavachResult.premium_30day,
            max_payout: 4000,
            duration: '30 days',
            covers: ['All Disruptions', 'Curfews', 'Strikes'],
          },
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', timestamp: new Date().toISOString() });
  }
});

// POST /api/policies/purchase — Purchase a policy
router.post('/purchase', async (req: Request, res: Response) => {
  try {
    const { rider_id, plan_type } = req.body;

    const rider = db.getRider(rider_id);
    if (!rider) {
      return res.status(404).json({ success: false, error: 'Rider not found', timestamp: new Date().toISOString() });
    }

    const planConfig = PLAN_CONFIG[plan_type as PlanType];
    if (!planConfig) {
      return res.status(400).json({ success: false, error: 'Invalid plan type. Use: shift_pass, weekly_pass, or monthly_pro', timestamp: new Date().toISOString() });
    }

    // Get dynamic premium
    const kavachResult = getKavachScoreForRider(rider);
    const premiums: Record<PlanType, number> = {
      shift_pass: kavachResult.premium_24hr,
      weekly_pass: kavachResult.premium_7day,
      monthly_pro: kavachResult.premium_30day,
    };
    const premium = premiums[plan_type as PlanType];

    // Mock UPI payment
    const payment = await collectPremium(rider.upi_id, premium, `policy-${uuid().substring(0, 8)}`);

    if (!payment.success) {
      return res.status(402).json({ success: false, error: 'Payment failed', timestamp: new Date().toISOString() });
    }

    // Create policy
    const now = new Date();
    const bonus_hours = plan_type === 'shift_pass' ? (kavachResult.bonus_hours || 0) : 0;
    const policy: Policy = {
      id: `p-${uuid().substring(0, 8)}`,
      rider_id: rider.id,
      plan_type: plan_type as PlanType,
      premium_paid: premium,
      max_payout: planConfig.max_payout,
      start_date: now,
      end_date: new Date(now.getTime() + (planConfig.duration_hours + bonus_hours) * 3600000),
      status: 'active',
      covers_weather: true,
      covers_outage: plan_type !== 'shift_pass',
      bonus_hours: bonus_hours,
      created_at: now,
    };

    db.addPolicy(policy);

    console.log(`🛡️ Policy purchased: ${rider.name} — ${plan_type} (₹${premium}) — Valid until ${policy.end_date.toLocaleDateString()}`);

    res.status(201).json({
      success: true,
      data: {
        policy,
        payment: {
          txn_id: payment.txn_id,
          amount: premium,
          method: 'UPI',
        },
        rider_name: rider.name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error', timestamp: new Date().toISOString() });
  }
});

// GET /api/policies/:id — Get policy details
router.get('/:id', (req: Request, res: Response) => {
  const policy = db.getPolicy(req.params.id);
  
  if (!policy) {
    return res.status(404).json({ success: false, error: 'Policy not found', timestamp: new Date().toISOString() });
  }

  const rider = db.getRider(policy.rider_id);
  const claims = db.claims.filter(c => c.policy_id === policy.id);

  res.json({
    success: true,
    data: {
      policy,
      rider: rider || null,
      claims,
    },
    timestamp: new Date().toISOString(),
  });
});

// GET /api/policies — List all policies
router.get('/', (_req: Request, res: Response) => {
  const policies = db.policies.map(p => {
    const rider = db.getRider(p.rider_id);
    return { ...p, rider_name: rider?.name || 'Unknown' };
  });

  res.json({
    success: true,
    data: policies,
    total: policies.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
