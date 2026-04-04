import { randomUUID } from "crypto";

import { createServiceRoleClient } from "@/lib/supabase-service";

/**
 * Mock UPI settlement — Razorpay payouts need a linked account in production.
 * Generates a test transaction id; optional Razorpay signature verify elsewhere for orders.
 */
export async function executeMockPayout(
  claimId: string,
  _amountInr: number
): Promise<{ success: boolean; txnId: string }> {
  const txnId = `rzp_test_${randomUUID().replace(/-/g, "").slice(0, 24)}`;

  const supabase = createServiceRoleClient();
  await supabase
    .from("claims")
    .update({ status: "PAYOUT_INITIATED", payout_txn_id: txnId })
    .eq("id", claimId);

  return { success: true, txnId };
}
