/**
 * OffShift — Webhook Routes (Weather & Outage triggers)
 */

import { Router, Request, Response } from 'express';
import { simulateStorm, clearSimulation, getAllAlerts, checkRainRadar, simulateHeatwave } from '../services/weather';
import { simulateOutage, clearOutageSimulation, getAllPlatformStatus, checkPlatformOutage } from '../services/outage';
import { simulateCurfew, clearCurfewSimulation } from '../services/curfew';
import { simulateHazardousAQI, clearAQISimulation } from '../services/aqi';
import { rainRadarCron, outageWatcherCron, curfewWatcherCron, aqiWatcherCron } from '../services/cron';

const router = Router();

// POST /api/webhooks/weather — Trigger weather alert (simulated IMD webhook)
router.post('/weather', async (req: Request, res: Response) => {
  try {
    const { pincodes, rainfall_mm, action } = req.body;

    if (action === 'clear') {
      clearSimulation();
      return res.json({
        success: true,
        data: { message: 'Weather simulation cleared' },
        timestamp: new Date().toISOString(),
      });
    }

    const targetPincodes = pincodes || ['110020', '122001', '201301', '110045'];
    const rainfall = rainfall_mm || 75;

    // Simulate the storm
    simulateStorm(targetPincodes, rainfall);

    // Run the rain radar cron to process claims
    const cronResult = await rainRadarCron();

    res.json({
      success: true,
      data: {
        message: `⛈️ Storm simulated! Red Alert triggered for ${targetPincodes.length} pincodes`,
        pincodes: targetPincodes,
        rainfall_mm: rainfall,
        claims_triggered: cronResult.claims_triggered,
        results: cronResult.results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Weather webhook processing failed', timestamp: new Date().toISOString() });
  }
});

// POST /api/webhooks/outage — Trigger platform outage (simulated Downdetector webhook)
router.post('/outage', async (req: Request, res: Response) => {
  try {
    const { platform, pincodes, action } = req.body;

    if (action === 'clear') {
      clearOutageSimulation(platform);
      return res.json({
        success: true,
        data: { message: 'Outage simulation cleared' },
        timestamp: new Date().toISOString(),
      });
    }

    const targetPlatform = platform || 'zomato';

    // Simulate the outage
    simulateOutage(targetPlatform, pincodes);

    // Run the outage watcher to process claims
    const cronResult = await outageWatcherCron();

    res.json({
      success: true,
      data: {
        message: `📱 ${targetPlatform.toUpperCase()} outage simulated!`,
        platform: targetPlatform,
        claims_triggered: cronResult.claims_triggered,
        results: cronResult.results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Outage webhook processing failed', timestamp: new Date().toISOString() });
  }
});

// POST /api/webhooks/heatwave — Trigger heatwave alert (simulated IMD webhook)
router.post('/heatwave', async (req: Request, res: Response) => {
  try {
    const { pincodes, temperature_c, action } = req.body;

    if (action === 'clear') {
      clearSimulation();
      return res.json({
        success: true,
        data: { message: 'Heatwave simulation cleared' },
        timestamp: new Date().toISOString(),
      });
    }

    const targetPincodes = pincodes || ['110020', '122001', '201301', '110045'];
    const temp = temperature_c || 48.5;

    simulateHeatwave(targetPincodes, temp);
    const cronResult = await rainRadarCron(); // Shares the weather cron

    res.json({
      success: true,
      data: {
        message: `🔥 Heatwave simulated! Red Alert triggered for ${targetPincodes.length} pincodes`,
        pincodes: targetPincodes,
        temperature_c: temp,
        claims_triggered: cronResult.claims_triggered,
        results: cronResult.results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Heatwave webhook processing failed', timestamp: new Date().toISOString() });
  }
});

// POST /api/webhooks/curfew — Trigger Section 144 Curfew
router.post('/curfew', async (req: Request, res: Response) => {
  try {
    const { pincodes, action } = req.body;

    if (action === 'clear') {
      clearCurfewSimulation();
      return res.json({
        success: true,
        data: { message: 'Curfew simulation cleared' },
        timestamp: new Date().toISOString(),
      });
    }

    const targetPincodes = pincodes || ['110020', '110019', '110017'];
    
    simulateCurfew(targetPincodes);
    const cronResult = await curfewWatcherCron();

    res.json({
      success: true,
      data: {
        message: `⛔ Section 144 Curfew simulated for ${targetPincodes.length} pincodes`,
        pincodes: targetPincodes,
        claims_triggered: cronResult.claims_triggered,
        results: cronResult.results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Curfew webhook processing failed', timestamp: new Date().toISOString() });
  }
});

// POST /api/webhooks/aqi — Trigger Hazardous AQI
router.post('/aqi', async (req: Request, res: Response) => {
  try {
    const { pincodes, action } = req.body;

    if (action === 'clear') {
      clearAQISimulation();
      return res.json({
        success: true,
        data: { message: 'AQI simulation cleared' },
        timestamp: new Date().toISOString(),
      });
    }

    const targetPincodes = pincodes || ['110020', '122001'];
    
    simulateHazardousAQI(targetPincodes);
    const cronResult = await aqiWatcherCron();

    res.json({
      success: true,
      data: {
        message: `💨 Hazardous AQI simulated for ${targetPincodes.length} pincodes`,
        pincodes: targetPincodes,
        claims_triggered: cronResult.claims_triggered,
        results: cronResult.results,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'AQI webhook processing failed', timestamp: new Date().toISOString() });
  }
});

// GET /api/webhooks/weather/status — Get weather status across all pincodes
router.get('/weather/status', (_req: Request, res: Response) => {
  const alerts = getAllAlerts();
  res.json({
    success: true,
    data: alerts,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/webhooks/weather/forecast/:pincode — Get 48hr forecast for pincode
router.get('/weather/forecast/:pincode', (req: Request, res: Response) => {
  const forecast = checkRainRadar(req.params.pincode);
  res.json({
    success: true,
    data: forecast,
    timestamp: new Date().toISOString(),
  });
});

// GET /api/webhooks/outage/status — Get platform status
router.get('/outage/status', (_req: Request, res: Response) => {
  const status = getAllPlatformStatus();
  res.json({
    success: true,
    data: status,
    timestamp: new Date().toISOString(),
  });
});

export default router;
