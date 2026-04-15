import { PayoutTier, getPayoutAmount } from './tiers';

export interface PayoutCalculation {
  payoutAmount: number;
  isProportional: boolean;
  loginHours: number;
  disruptedHours: number;
  calculation: string;
}

export function calculateProportionalPayout(
  tier: PayoutTier,
  loginHours: number,
  disruptedHours: number,
  useProportional: boolean = true
): PayoutCalculation {
  const maxPayout = getPayoutAmount(tier);

  if (!useProportional || loginHours === 0) {
    return {
      payoutAmount: maxPayout,
      isProportional: false,
      loginHours,
      disruptedHours,
      calculation: `Full tier payout: ₹${maxPayout}`,
    };
  }

  // NichePay formula: (daily_wage ÷ login_hours) × disrupted_hours
  // We treat maxPayout as the "daily wage" equivalent for the tier
  const hourlyRate = maxPayout / loginHours;
  const proportionalPayout = Math.min(Math.round(hourlyRate * disruptedHours), maxPayout);

  return {
    payoutAmount: proportionalPayout,
    isProportional: true,
    loginHours,
    disruptedHours,
    calculation: `(₹${maxPayout} ÷ ${loginHours}hrs) × ${disruptedHours}hrs disrupted = ₹${proportionalPayout}`,
  };
}
