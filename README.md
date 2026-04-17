# OffShift — Smart Parametric Income Shield
### *"Protection for your path. Automatic income insurance for India's gig fleet."*

[![LIVE DEMO](https://img.shields.io/badge/LIVE-DEMO-emerald?style=for-the-badge)](https://offshift-9iok.onrender.com/)
[![DEVTrails 2026](https://img.shields.io/badge/DEVTrails_2026-Guidewire-blueviolet?style=for-the-badge)](https://github.com/SHIVIKA330/OffShift)

**OffShift** is a high-fidelity parametric insurance platform designed for India's 12 million gig workers. By replacing subjective claim forms with objective data triggers, OffShift provides instant, zero-touch financial protection against weather disruptions, air pollution, and platform outages.

---

## 🚀 Key Product Features

### 1. Web-Native Onboarding Wizard
A 6-step, mobile-optimized experience that guides workers from registration to coverage in under 2 minutes.
- **Micro-Zone Identification**: Hyper-local risk assessment based on the worker's primary operational zone.
- **Platform Integration**: Supports Zomato, Swiggy, Uber, Ola, and other major gig platforms.
- **Risk-Based Pricing**: Real-time premium calculation using the **Kavach v2.4** engine.

### 2. Intelligent Worker Dashboard
A real-time control center for gig workers to manage their protection.
- **Live Protection Status**: Visual indicators of active coverage and remaining duration.
- **Incident SOS**: One-tap automated claim dispatch for covered perils.
- **Simulation Mode**: A safe environment for workers to test and understand trigger conditions.

### 3. Kavach Actuarial Model
A transparent look into the financial sustainability of the insurance pool.
- **BCR Tracking**: Maintaining a 0.65 Benefit-Cost Ratio for long-term viability.
- **Stress Testing**: Proving insolvency resistance against 14-day monsoon and 30-day severe AQI events.
- **Historical Analysis**: Pricing derived from 7 years of IMD/CPCB historical weather patterns.

### 4. Regulatory Trust Engine
Built-in compliance with India's evolving digital landscape.
- **DPDP Act 2023**: Explicit consent gates for GPS and platform data sharing.
- **SS Code 2020**: Automated eligibility thresholding (90/120-day rule) to gate welfare availability.
- **IRDAI Standards**: Objective triggers from independent data sources (IMD, CPCB) to eliminate "adverse selection."

---

## 🛠️ Technical Architecture

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Modern, SEO-optimized web experience |
| **Styling** | Vanilla CSS + Tailwind | Premium, high-fidelity UI design |
| **Backend** | Supabase (PostgreSQL) | Real-time data, Auth, and Edge Functions |
| **Payments** | Razorpay | Secure premium collection and instant UPI payouts |
| **Data Oracles** | IMD, CPCB, Open-Meteo | Verifiable, independent trigger sources |
| **Fraud Detection** | AI-Enhanced Behavioral Analysis | Catching GPS spoofing and multi-account fraud |

---

## 🛡️ Regulatory Compliance Checklist

OffShift is engineered to meet the highest standards of the **Guidewire DEVTrails** "Insurance Sense" criteria:

- [x] **Objective Triggers**: AQI > 300, Rain > 65mm/hr, Heat > 45°C.
- [x] **Automatic Payout**: Trigger fires → GPS verified → UPI transfer in < 120 seconds.
- [x] **Sustainability**: BCR 0.65 target with shown liquidity reserves.
- [x] **Fraud Detection**: GPS vs Platform login cross-check (Requirement #5).
- [x] **Anti-Adverse Selection**: Strict 48-hour enrollment lock-out before predicted events.

---

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Account
- Razorpay API Keys (Test Mode)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/SHIVIKA330/OffShift.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (\`.env.local\`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_key
   RAZORPAY_KEY_ID=your_id
   RAZORPAY_KEY_SECRET=your_secret
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 👥 Contributors
- **OffShift Team** — Part of the Guidewire DEVTrails 2026 Innovation Cohort.

---

*“OffShift: Because when the storm hits, the money should hit first.”*
