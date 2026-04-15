export type PayoutTier = 'bronze' | 'silver' | 'gold';

export interface TierConfig {
  tier: PayoutTier;
  label: string;
  emoji: string;
  minOrders: number;
  maxOrders: number | null;
  payoutAmount: number;
  color: string;
  description: string;
}

export const TIER_CONFIG: Record<PayoutTier, TierConfig> = {
  bronze: {
    tier: 'bronze',
    label: 'Bronze',
    emoji: '🥉',
    minOrders: 0,
    maxOrders: 7,
    payoutAmount: 400,
    color: '#CD7F32',
    description: 'Part-time workers, new joiners',
  },
  silver: {
    tier: 'silver',
    label: 'Silver',
    emoji: '🥈',
    minOrders: 8,
    maxOrders: 14,
    payoutAmount: 600,
    color: '#C0C0C0',
    description: 'Full-time standard workers',
  },
  gold: {
    tier: 'gold',
    label: 'Gold',
    emoji: '🥇',
    minOrders: 15,
    maxOrders: null,
    payoutAmount: 900,
    color: '#FFD700',
    description: 'High-volume professional riders',
  },
};

export function calculateTier(avgDailyOrders: number): PayoutTier {
  if (avgDailyOrders >= 15) return 'gold';
  if (avgDailyOrders >= 8) return 'silver';
  return 'bronze';
}

export function getPayoutAmount(tier: PayoutTier): number {
  return TIER_CONFIG[tier].payoutAmount;
}

// Seasonal multiplier: 1.4x during Delhi monsoon (Jun–Sep), 1.2x during winter fog (Dec–Feb)
export function getSeasonalMultiplier(): number {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return 1.4; // monsoon
  if (month === 12 || month <= 2) return 1.2; // winter fog
  return 1.0;
}
