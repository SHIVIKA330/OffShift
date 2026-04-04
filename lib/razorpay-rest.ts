/** Razorpay REST (no SDK) — avoids bundling axios/form-data in Next.js edge/server. */

function basicAuth(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
  }
  return Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export async function createOrderRazorpay(params: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth()}`,
    },
    body: JSON.stringify({
      amount: params.amountPaise,
      currency: "INR",
      receipt: params.receipt,
      notes: params.notes,
    }),
  });
  const data = (await res.json()) as {
    id?: string;
    amount?: number;
    currency?: string;
    error?: { description?: string };
  };
  if (!res.ok || !data.id) {
    throw new Error(data.error?.description ?? "Razorpay order failed");
  }
  return { id: data.id, amount: data.amount!, currency: data.currency ?? "INR" };
}

export async function fetchOrderRazorpay(orderId: string): Promise<{ amount: number }> {
  const res = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: `Basic ${basicAuth()}` },
  });
  const data = (await res.json()) as { amount?: number; error?: { description?: string } };
  if (!res.ok || data.amount == null) {
    throw new Error(data.error?.description ?? "Razorpay fetch order failed");
  }
  return { amount: data.amount };
}
