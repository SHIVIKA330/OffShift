/**
 * Razorpay Payouts (RazorpayX) — REST API integration.
 *
 * Settlement flow:
 *  1. Create Contact (worker)
 *  2. Create Fund Account (UPI VPA or bank account)
 *  3. Create Payout (transfer money)
 *
 * Docs: https://razorpay.com/docs/api/x/payouts/
 */

function payoutAuth(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }
  return Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

const RZP_BASE = "https://api.razorpay.com/v1";

// ───────────── 1. CONTACTS ─────────────

export type RzpContact = {
  id: string;
  name: string;
  contact: string;
  type: string;
};

export async function createContact(params: {
  name: string;
  phone: string;
  type?: string;
  reference_id?: string;
}): Promise<RzpContact> {
  const res = await fetch(`${RZP_BASE}/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${payoutAuth()}`,
    },
    body: JSON.stringify({
      name: params.name,
      contact: params.phone,
      type: params.type ?? "worker",
      reference_id: params.reference_id,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.description ?? "Contact creation failed");
  }
  return data as RzpContact;
}

// ───────────── 2. FUND ACCOUNTS ─────────────

export type RzpFundAccount = {
  id: string;
  contact_id: string;
  account_type: string;
};

/** Create a UPI Fund Account linked to a Contact */
export async function createFundAccountUPI(params: {
  contact_id: string;
  vpa: string; // e.g. "rider@upi"
}): Promise<RzpFundAccount> {
  const res = await fetch(`${RZP_BASE}/fund_accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${payoutAuth()}`,
    },
    body: JSON.stringify({
      contact_id: params.contact_id,
      account_type: "vpa",
      vpa: { address: params.vpa },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.description ?? "UPI Fund Account creation failed");
  }
  return data as RzpFundAccount;
}

/** Create a Bank Account Fund Account (IMPS-compatible) */
export async function createFundAccountBank(params: {
  contact_id: string;
  name: string;
  ifsc: string;
  account_number: string;
}): Promise<RzpFundAccount> {
  const res = await fetch(`${RZP_BASE}/fund_accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${payoutAuth()}`,
    },
    body: JSON.stringify({
      contact_id: params.contact_id,
      account_type: "bank_account",
      bank_account: {
        name: params.name,
        ifsc: params.ifsc,
        account_number: params.account_number,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.description ?? "Bank Fund Account creation failed");
  }
  return data as RzpFundAccount;
}

// ───────────── 3. PAYOUTS ─────────────

export type RzpPayout = {
  id: string;
  entity: string;
  fund_account_id: string;
  amount: number;
  currency: string;
  status: string;
  mode: string;
  reference_id?: string;
  utr?: string;
};

/**
 * Create a payout to a fund account.
 *
 * @param mode — "UPI" for instant UPI, "IMPS" for IMPS bank transfer, "NEFT"/"RTGS" for bulk.
 */
export async function createPayout(params: {
  fund_account_id: string;
  amount_paise: number;
  mode: "UPI" | "IMPS" | "NEFT" | "RTGS";
  purpose?: string;
  reference_id?: string;
  narration?: string;
}): Promise<RzpPayout> {
  const accountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER;

  const res = await fetch(`${RZP_BASE}/payouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${payoutAuth()}`,
      ...(accountNumber ? { "X-Payout-Idempotency": params.reference_id ?? "" } : {}),
    },
    body: JSON.stringify({
      account_number: accountNumber ?? "demo_account",
      fund_account_id: params.fund_account_id,
      amount: params.amount_paise,
      currency: "INR",
      mode: params.mode,
      purpose: params.purpose ?? "payout",
      queue_if_low_balance: true,
      reference_id: params.reference_id,
      narration: params.narration ?? "OffShift Kavach Payout",
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.description ?? "Payout creation failed");
  }
  return data as RzpPayout;
}

/** Fetch a payout by ID to check status */
export async function fetchPayoutStatus(payoutId: string): Promise<RzpPayout> {
  const res = await fetch(`${RZP_BASE}/payouts/${payoutId}`, {
    headers: { Authorization: `Basic ${payoutAuth()}` },
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data?.error?.description ?? "Payout fetch failed");
  }
  return data as RzpPayout;
}
