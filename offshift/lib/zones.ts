/** Consolidated State/City-level zones — All India (Phase 3) */

export const ZONE_STATES = [
  {
    state: "Delhi NCR",
    cities: [
      { value: "delhi_new", label: "New Delhi" },
      { value: "okhla", label: "Okhla" },
      { value: "gurugram", label: "Gurugram" },
      { value: "noida", label: "Noida" }
    ]
  },
  {
    state: "Maharashtra",
    cities: [
      { value: "mumbai", label: "Mumbai" },
      { value: "pune", label: "Pune" },
      { value: "nagpur", label: "Nagpur" }
    ]
  },
  {
    state: "Karnataka",
    cities: [
      { value: "bengaluru", label: "Bengaluru" },
      { value: "mysuru", label: "Mysuru" },
      { value: "mangalore", label: "Mangaluru" }
    ]
  },
  {
    state: "Tamil Nadu",
    cities: [
      { value: "chennai", label: "Chennai" },
      { value: "coimbatore", label: "Coimbatore" },
      { value: "madurai", label: "Madurai" }
    ]
  },
  {
    state: "West Bengal",
    cities: [
      { value: "kolkata", label: "Kolkata" },
      { value: "howrah", label: "Howrah" }
    ]
  },
  {
    state: "Telangana & AP",
    cities: [
      { value: "hyderabad", label: "Hyderabad" },
      { value: "visakhapatnam", label: "Visakhapatnam" }
    ]
  },
  {
    state: "Gujarat",
    cities: [
      { value: "ahmedabad", label: "Ahmedabad" },
      { value: "surat", label: "Surat" },
      { value: "vadodara", label: "Vadodara" }
    ]
  },
  {
    state: "Rajasthan",
    cities: [
      { value: "jaipur", label: "Jaipur" },
      { value: "jodhpur", label: "Jodhpur" }
    ]
  },
  {
    state: "Uttar Pradesh",
    cities: [
      { value: "lucknow", label: "Lucknow" },
      { value: "kanpur", label: "Kanpur" }
    ]
  },
  {
    state: "Kerala",
    cities: [
      { value: "kochi", label: "Kochi" },
      { value: "thiruvananthapuram", label: "Thiruvananthapuram" }
    ]
  },
  {
    state: "Punjab & Haryana",
    cities: [
      { value: "chandigarh", label: "Chandigarh" },
      { value: "ludhiana", label: "Ludhiana" }
    ]
  }
];

export type ZoneSlug = 
  | "delhi_new" | "okhla" | "gurugram" | "noida"
  | "mumbai" | "pune" | "nagpur"
  | "bengaluru" | "mysuru" | "mangalore"
  | "chennai" | "coimbatore" | "madurai"
  | "kolkata" | "howrah"
  | "hyderabad" | "visakhapatnam"
  | "ahmedabad" | "surat" | "vadodara"
  | "jaipur" | "jodhpur"
  | "lucknow" | "kanpur"
  | "kochi" | "thiruvananthapuram"
  | "chandigarh" | "ludhiana";

export const ZONE_COORDS: Record<ZoneSlug, { lat: number; lng: number; label: string }> = {
  // Delhi
  delhi_new: { lat: 28.6139, lng: 77.2090, label: "New Delhi" },
  okhla: { lat: 28.5236, lng: 77.3012, label: "Okhla" },
  gurugram: { lat: 28.4595, lng: 77.0266, label: "Gurugram" },
  noida: { lat: 28.5355, lng: 77.3910, label: "Noida" },
  
  // Maharashtra
  mumbai: { lat: 19.0760, lng: 72.8777, label: "Mumbai" },
  pune: { lat: 18.5204, lng: 73.8567, label: "Pune" },
  nagpur: { lat: 21.1458, lng: 79.0882, label: "Nagpur" },

  // Karnataka
  bengaluru: { lat: 12.9716, lng: 77.5946, label: "Bengaluru" },
  mysuru: { lat: 12.2958, lng: 76.6394, label: "Mysuru" },
  mangalore: { lat: 12.9141, lng: 74.8560, label: "Mangaluru" },

  // Tamil Nadu
  chennai: { lat: 13.0827, lng: 80.2707, label: "Chennai" },
  coimbatore: { lat: 11.0168, lng: 76.9558, label: "Coimbatore" },
  madurai: { lat: 9.9252, lng: 78.1198, label: "Madurai" },

  // West Bengal
  kolkata: { lat: 22.5726, lng: 88.3639, label: "Kolkata" },
  howrah: { lat: 22.5958, lng: 88.3110, label: "Howrah" },

  // Telangana & AP
  hyderabad: { lat: 17.3850, lng: 78.4867, label: "Hyderabad" },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, label: "Visakhapatnam" },

  // Gujarat
  ahmedabad: { lat: 23.0225, lng: 72.5714, label: "Ahmedabad" },
  surat: { lat: 21.1702, lng: 72.8311, label: "Surat" },
  vadodara: { lat: 22.3072, lng: 73.1812, label: "Vadodara" },

  // Rajasthan
  jaipur: { lat: 26.9124, lng: 75.7873, label: "Jaipur" },
  jodhpur: { lat: 26.2389, lng: 73.0243, label: "Jodhpur" },

  // UP
  lucknow: { lat: 26.8467, lng: 80.9462, label: "Lucknow" },
  kanpur: { lat: 26.4499, lng: 80.3319, label: "Kanpur" },

  // Kerala
  kochi: { lat: 9.9312, lng: 76.2673, label: "Kochi" },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366, label: "Thiruvananthapuram" },

  // Punjab/Haryana
  chandigarh: { lat: 30.7333, lng: 76.7794, label: "Chandigarh" },
  ludhiana: { lat: 30.9010, lng: 75.8573, label: "Ludhiana" },
};

export const ZONE_OPTIONS = ZONE_STATES.flatMap((s) => s.cities);

export function normalizeZone(z: string): ZoneSlug | null {
  const k = z.toLowerCase().replace(/\s+/g, "_");
  if (k in ZONE_COORDS) return k as ZoneSlug;
  return null;
}
