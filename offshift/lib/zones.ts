/** Ward-level zones — Delhi NCR (Phase 2) */

export const ZONE_OPTIONS = [
  { value: "okhla", label: "Okhla" },
  { value: "gurugram", label: "Gurugram" },
  { value: "noida", label: "Noida" },
  { value: "lajpat_nagar", label: "Lajpat Nagar" },
  { value: "rohini", label: "Rohini" },
  { value: "dwarka", label: "Dwarka" },
] as const;

export type ZoneSlug = (typeof ZONE_OPTIONS)[number]["value"];

export const ZONE_COORDS: Record<
  ZoneSlug,
  { lat: number; lng: number; label: string }
> = {
  okhla: { lat: 28.5236, lng: 77.3012, label: "Okhla" },
  gurugram: { lat: 28.4595, lng: 77.0266, label: "Gurugram" },
  noida: { lat: 28.5355, lng: 77.391, label: "Noida" },
  lajpat_nagar: { lat: 28.5677, lng: 77.2433, label: "Lajpat Nagar" },
  rohini: { lat: 28.7495, lng: 77.1183, label: "Rohini" },
  dwarka: { lat: 28.5921, lng: 77.046, label: "Dwarka" },
};

export function normalizeZone(z: string): ZoneSlug | null {
  const k = z.toLowerCase().replace(/\s+/g, "_");
  if (k in ZONE_COORDS) return k as ZoneSlug;
  return null;
}
