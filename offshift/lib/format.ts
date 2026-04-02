const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return INR.format(Math.round(amount));
}

export function formatInrWithSymbol(amount: number): string {
  return formatInr(amount).replace("₹", "₹");
}

/** Display as ₹1,500 (Indian grouping) */
export function formatRupees(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(amount))}`;
}
