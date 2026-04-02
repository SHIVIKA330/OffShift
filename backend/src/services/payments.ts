/**
 * OffShift — Payment Service
 * Mock Razorpay/PhonePe UPI integration
 */

import { v4 as uuid } from 'uuid';

export interface PaymentCollectResult {
  success: boolean;
  txn_id: string;
  amount: number;
  rider_upi: string;
  policy_id: string;
  method: 'UPI';
  gateway: 'Razorpay';
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
}

export interface PaymentDisburseResult {
  success: boolean;
  txn_id: string;
  amount: number;
  rider_upi: string;
  claim_id: string;
  method: 'UPI';
  gateway: 'Razorpay';
  status: 'completed' | 'pending' | 'failed';
  disbursed_at: Date;
  processing_time_ms: number;
}

// Transaction log (in-memory)
const transactionLog: Array<PaymentCollectResult | PaymentDisburseResult> = [];

/**
 * Collect premium payment from rider via UPI
 * Mock Razorpay collect request
 */
export async function collectPremium(
  rider_upi: string,
  amount: number,
  policy_id: string
): Promise<PaymentCollectResult> {
  console.log(`💰 Payment Gateway: Collecting ₹${amount} from ${rider_upi} for policy ${policy_id}`);

  // Simulate UPI processing delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  const result: PaymentCollectResult = {
    success: true,
    txn_id: `TXN_RZP_${Date.now()}_${uuid().substring(0, 8)}`,
    amount,
    rider_upi,
    policy_id,
    method: 'UPI',
    gateway: 'Razorpay',
    status: 'completed',
    timestamp: new Date(),
  };

  transactionLog.push(result);
  console.log(`✅ Payment collected: ${result.txn_id} — ₹${amount} from ${rider_upi}`);

  return result;
}

/**
 * Disburse claim payout to rider via UPI
 * Simulates the <120 second auto-payout
 */
export async function disburseClaim(
  rider_upi: string,
  amount: number,
  claim_id: string
): Promise<PaymentDisburseResult> {
  console.log(`🚀 Payment Gateway: Disbursing ₹${amount} to ${rider_upi} for claim ${claim_id}`);
  
  const startTime = Date.now();

  // Simulate UPI payout processing (1-3 seconds for mock)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const processingTime = Date.now() - startTime;

  const result: PaymentDisburseResult = {
    success: true,
    txn_id: `TXN_RZP_PAYOUT_${Date.now()}_${uuid().substring(0, 8)}`,
    amount,
    rider_upi,
    claim_id,
    method: 'UPI',
    gateway: 'Razorpay',
    status: 'completed',
    disbursed_at: new Date(),
    processing_time_ms: processingTime,
  };

  transactionLog.push(result);
  console.log(`🎉 Payout complete: ₹${amount} → ${rider_upi} (${processingTime}ms) — Txn: ${result.txn_id}`);

  return result;
}

/**
 * Get all transaction history
 */
export function getTransactionLog(): Array<PaymentCollectResult | PaymentDisburseResult> {
  return [...transactionLog];
}

/**
 * Get transaction by ID
 */
export function getTransaction(txn_id: string): (PaymentCollectResult | PaymentDisburseResult) | undefined {
  return transactionLog.find(t => t.txn_id === txn_id);
}
