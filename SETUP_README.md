<a name="readme-top"></a>

<div align="center">
  <h1>🛡️ OffShift — Smart Income Shield</h1>
  <h3><em>"When the storm hits — the money hits first."</em></h3>

  <p>
    <img src="https://img.shields.io/badge/DEVTrails_2026-Guidewire-blueviolet?style=for-the-badge" alt="DEVTrails 2026"/>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express"/>
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  </p>

  <p>
    An AI-powered parametric insurance platform for India's 12 million gig delivery workers.<br/>
    <strong>Zero claim forms. Zero paperwork. Automatic UPI payout in 120 seconds.</strong>
  </p>
</div>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js v18+** and **npm**
- A modern web browser

### Setup Instructions

1. **Clone the repository**
   ```sh
   git clone https://github.com/SHIVIKA330/OffShift.git
   cd OffShift
   ```

2. **Install Backend Dependencies**
   ```sh
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```sh
   cd ../frontend
   npm install
   ```

4. **Start the Backend** (Terminal 1)
   ```sh
   cd backend
   npx tsx src/index.ts
   ```
   The backend will start on `http://localhost:3001`

5. **Start the Frontend Dashboard** (Terminal 2)
   ```sh
   cd frontend
   npm run dev
   ```
   The dashboard will open on `http://localhost:5173`

6. **Open the WhatsApp Bot Simulator**
   Simply open `whatsapp-bot/index.html` in your browser — it works standalone, no server needed.

---

## 📂 Project Structure

```
offshift/
├── frontend/                # React + Vite Admin Dashboard
│   ├── src/
│   │   ├── App.tsx          # Complete dashboard with 7 pages
│   │   ├── api.ts           # API client & types
│   │   └── index.css        # Design system (dark theme + green accents)
│   └── index.html
│
├── backend/                 # Node.js + TypeScript Express API
│   ├── src/
│   │   ├── index.ts         # Express server + SSE events
│   │   ├── routes/
│   │   │   ├── riders.ts    # POST /register, GET /:id, GET /
│   │   │   ├── policies.ts  # POST /quote, POST /purchase, GET /:id
│   │   │   ├── claims.ts    # POST /trigger, GET /:id, GET /
│   │   │   └── webhooks.ts  # POST /weather, POST /outage
│   │   ├── services/
│   │   │   ├── weather.ts   # Mock IMD API + storm simulation
│   │   │   ├── outage.ts    # Mock Downdetector + GPS clusters
│   │   │   ├── payments.ts  # Mock Razorpay/PhonePe UPI
│   │   │   ├── kavach-score.ts  # XGBoost-style pricing engine
│   │   │   └── cron.ts      # Scheduled jobs + SSE broadcasting
│   │   ├── models/
│   │   │   └── types.ts     # TypeScript interfaces + SQL schema
│   │   └── data/
│   │       └── store.ts     # In-memory DB with 20 mock riders
│
├── whatsapp-bot/
│   └── index.html           # Interactive WhatsApp conversation simulator
│
├── ml/
│   └── kavach_pricing.ts    # XGBoost-style Kavach pricing engine
│
└── README.md
```

---

## 🎮 Demo Walkthrough

### 1. WhatsApp Bot — Rider Journey
Open `whatsapp-bot/index.html` to experience the full rider flow:
- **Register** — "Hi, I'm Rajesh from Okhla, my UPI is rajesh@ybl"
- **Rain Alert** — 48hr storm warning with Kavach pricing
- **Plan Selection** — Choose from 3 tiers with dynamic pricing
- **UPI Checkout** — Mock PhonePe payment flow
- **Policy Confirmed** — Covered in under 60 seconds
- **Auto Payout** — ₹500 sent instantly, zero forms filed

### 2. Admin Dashboard
Open `http://localhost:5173` for the full admin console:
- **Overview** — Total riders, active policies, claims, payouts, loss ratio
- **Live Map** — Delhi NCR pincode heatmap with weather status
- **Riders Table** — All 20 riders with Kavach scores, trust scores, policies
- **Claims Feed** — Real-time claim processing with status tracking
- **Weather Panel** — IMD alerts per pincode with severity levels
- **Outage Monitor** — Zomato/Swiggy platform status + affected pincodes
- **Analytics** — Revenue charts, conversion funnel, claims breakdown

### 3. Simulate Events
Click the sidebar buttons to trigger:
- **⛈️ Simulate Storm** — Triggers IMD Red Alert, processes all eligible claims
- **🔴 Simulate Zomato ↓** — Simulates Zomato outage
- **🟠 Simulate Swiggy ↓** — Simulates Swiggy outage
- **☀️ Clear Simulations** — Reset all alerts

Real-time toast notifications show claims being processed and paid in the top-right corner.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/riders/register` | Register a new rider |
| GET | `/api/riders/:id` | Get rider profile + policies |
| GET | `/api/riders` | List all riders |
| POST | `/api/policies/quote` | Get Kavach-scored quote |
| POST | `/api/policies/purchase` | Purchase a policy (mock UPI) |
| GET | `/api/policies/:id` | Get policy details |
| POST | `/api/claims/trigger` | Auto-trigger pending claims |
| GET | `/api/claims/:id` | Get claim status |
| GET | `/api/claims` | List all claims |
| POST | `/api/webhooks/weather` | Simulate weather alert |
| POST | `/api/webhooks/outage` | Simulate platform outage |
| GET | `/api/webhooks/weather/status` | All pincode weather status |
| GET | `/api/webhooks/outage/status` | Platform outage status |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/events` | SSE real-time events stream |
| GET | `/api/health` | Health check |

---

## 🧠 Kavach Risk Score Engine

The Kavach engine uses XGBoost-style gradient boosted tree simulation:

**Input Features:**
- Pincode base risk (3-year historical data)
- Waterlogging/flood zone flags
- Weather forecast severity (0-1)
- Shift pattern risk (morning/evening/night)
- Platform outage frequency
- Claim frequency & loyalty score

**Output:**
- Risk Score (0-100)
- Dynamic premiums for all 3 tiers
- Trust Score (0-1) for payout tier routing

**Pricing Tiers:**
| Plan | Price Range | Max Payout | Duration |
|------|------------|------------|----------|
| Shift Pass | ₹19-₹49 | ₹500 | 24 hours |
| Weekly Pass | ₹79-₹149 | ₹1,500 | 7 days |
| Monthly Pro | ₹249-₹449 | ₹4,000 | 30 days |

---

## 👥 Mock Riders (20 Profiles)

Pre-seeded with realistic Delhi NCR data:
- Rajesh Kumar (Okhla, Zomato), Amit Sharma (Gurgaon, Swiggy)
- Priya Singh (Noida, Zomato), Suresh Yadav (Dwarka, Swiggy)
- And 16 more across all major pincodes

Pincodes: 110020 (Okhla), 122001 (Gurgaon), 201301 (Noida), 110045 (Dwarka), 110017 (Hauz Khas), 122018 (Cyber City), etc.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite + TypeScript | Admin Dashboard |
| Backend | Node.js + Express + TypeScript | API Server |
| Database | In-memory (mocking Supabase) | Data Store |
| ML | XGBoost-style TypeScript | Kavach Pricing Engine |
| Payments | Mock Razorpay/PhonePe | UPI Collection & Payout |
| Weather | Mock IMD API | Rain/Storm Alerts |
| Outage | Mock Downdetector | Platform Status |
| WhatsApp | Standalone HTML/JS | Conversation Simulator |
| Real-time | Server-Sent Events (SSE) | Live Dashboard Updates |

---

## 🏆 Built for Guidewire DEVTrails 2026

By the OffShift Team — Shivika, Tejika, Nomita, Yuvika, Love
