<a name="readme-top"></a>

<div align="center">
  <a href="https://github.com/SHIVIKA330/OffShift">
    <img src="offshift_static_minimal.png" alt="OffShift Logo" width="400">
  </a>

  <h1>OffShift — Smart Income Shield</h1>
  <h3><em>"When the storm hits — the money hits first."</em></h3>

  <p>
    <img src="https://img.shields.io/badge/DEVTrails_2026-Guidewire-blueviolet?style=for-the-badge" alt="DEVTrails 2026"/>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"/>
    <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="scikit-learn"/>
    <img src="https://img.shields.io/badge/Infrastructure_Cost-₹0-success?style=for-the-badge" alt="Zero Cost"/>
  </p>

  <p>
    An AI-powered parametric insurance platform for India's 12 million gig delivery workers.<br/>
    <strong>Zero claim forms. Zero paperwork. Automatic UPI payout in 120 seconds.</strong>
    <br/><br/>
    <a href="./km_20260319_720p_60f_20260319_232546.mp4">📱 View Demo</a>
    ·
    <a href="./OffShift — Smart Income Shield _ Guidewire DEVTrails 2026.pdf">📊 View Presentation</a>
    ·
    <a href="https://github.com/SHIVIKA330/OffShift/issues"> Report Bug</a>
  </p>
</div>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary> Table of Contents</summary>
  <ol>
    <li><a href="#the-problem">The Problem — 12 Million Workers, Zero Protection</a></li>
    <li><a href="#who-we-build-for">Who We Build For — Persona Stories</a></li>
    <li><a href="#the-solution">The Solution — Smart Income Shield</a></li>
    <li><a href="#how-it-works">How It Works — End-to-End Workflow</a></li>
    <li><a href="#premium-model">The Weekly Premium Model</a></li>
    <li><a href="#ai-ml">AI/ML Integration — Kavach Engine</a></li>
    <li><a href="#adversarial-defense"> Adversarial Defense & Anti-Spoofing Strategy</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#platform-choice">Platform Choice Justification</a></li>
    <li><a href="#database-schema">Database Schema</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#roadmap">Development Roadmap</a></li>
    <li><a href="#contributors">Team & Contributors</a></li>
  </ol>
</details>

---

<!-- THE PROBLEM -->
## The Problem — 12 Million Workers, Zero Protection <a name="the-problem"></a>

India has **12 million gig delivery workers**. Every single one of them is exposed to income loss from events completely beyond their control — and not a single parametric income protection product exists for this segment today.

| Reality | The Number |
|---|---|
| Gig delivery workers in India | 12,000,000 |
| Monthly income lost during monsoon/heatwave | 20–30% |
| Time to resolve a traditional insurance claim | 3 weeks |
| Number of documents required for a standard claim | 10 PDFs |
| Actual payout received for disruption under existing plans | ₹500 in 3 months |
| Parametric income protection products available for gig workers | **0** |

**The disruptions we cover:**
-  **Heavy Rain** — IMD Red Alert (rainfall > 65mm/hr)
-  **Extreme Heat** — Temperature exceeding 45°C
-  **Severe Air Pollution** — AQI > 300 (hazardous to health)
-  **App Outages** — Zomato/Swiggy platform failures on peak nights
-  **Curfews & Strikes** — Government-issued movement restrictions

These aren't edge cases. For a delivery rider in Delhi, **these are monthly occurrences.**

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- WHO WE BUILD FOR -->
##  Who We Build For — Persona Stories <a name="who-we-build-for"></a>

### Primary Persona: Ravi Kumar

Ravi is 31 years old. Full-time Zomato rider, Okhla Industrial Zone, New Delhi. He's been on the road for 4 years. He wakes up at 7am, logs on by 8, and rarely stops before 8pm. On a good day, he makes ₹800. That money feeds his wife and six-year-old daughter.

When the Delhi monsoon hits — and it always hits — Ravi parks under a flyover and waits. He can't deliver. He can't earn. The platform doesn't compensate him. He's tried insurance before — once. The form asked for documents he didn't have. The claim was rejected after 3 weeks without explanation. He never tried again.

**In a typical July, Ravi loses 7-9 working days to rain. That's ₹5,600–₹7,200 gone. With zero safety net.**

| Detail | Ravi's Reality |
|---|---|
| Employment Type | Full-time, self-employed |
| Platform | Zomato, Okhla Zone |
| Daily Earnings | ₹800/day |
| Daily Hours | 10–12 hours |
| Device | Entry-level Android, WhatsApp, PhonePe |
| Insurance Experience | Never successfully claimed |
| Monthly Income Loss (Monsoon) | 20–30% (~₹4,800–₹7,200) |

**OffShift for Ravi:** He texts "HI" to our WhatsApp number once. 60 seconds later, he has ₹99/week coverage. The next time it rains — really rains — he gets a WhatsApp notification and ₹1,500 appears in his PhonePe. He didn't fill a single form.





<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- THE SOLUTION -->
##  The Solution — Smart Income Shield <a name="the-solution"></a>

OffShift is a **parametric insurance engine** — payouts are triggered by objective, external data conditions, never by self-reported claims. Five pillars underpin the entire system:

1. ** WhatsApp-First Onboarding** — 60-second signup. Phone number + UPI ID only. No app download. No documents.
2. ** Weekly Micro-Premium Model** — Sachet-sized pricing (₹49/₹99/₹349) built around gig workers' weekly cash flows.
3. ** Kavach AI Engine** — Our proprietary XGBoost model prices risk to the pincode level, dynamically per rider.
4. ** Parametric Auto-Triggers** — IMD API, AQICN API, Downdetector, GPS cluster inactivity — objective data only. No subjective judgment.
5. ** 120-Second UPI Auto-Payout** — Razorpay API sends money directly to the rider's UPI handle. Zero claim forms. Ever.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- HOW IT WORKS -->
##  How It Works — End-to-End Workflow <a name="how-it-works"></a>

```
STEP 1: ONBOARDING (60 seconds)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rider texts "HI" to OffShift WhatsApp
  → Dialogflow CX bot collects: name, pincode, UPI ID
  → Kavach AI scores zone risk for that pincode
  → Personalized weekly premium generated (₹39–₹79 range)
  → Rider pays via PhonePe UPI deep link
  → Coverage ACTIVE  — all within 60 seconds

STEP 2: MONITORING (Every 15 Minutes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Node.js cron job runs every 15 minutes:
  → Polls IMD Weather API for Red Alerts by pincode
  → Polls AQICN API for pollution levels by zone
  → Monitors Downdetector for Zomato/Swiggy outage spikes
  → Cross-references rider GPS cluster inactivity from Supabase

STEP 3: PARAMETRIC TRIGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Condition met if:
  → Rainfall > 65mm/hr (IMD Red Alert)  OR
  → Temperature > 45°C               OR
  → AQI > 300                         OR
  → Downdetector spike + 50 riders GPS-inactive in same 5km zone

  → Trigger event logged to Supabase
  → Kavach Trust Score calculated per rider
  → Payout queue initiated

STEP 4: PAYOUT (Trust-Scored, Tiered)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Trust Score > 0.75  →  Razorpay UPI payout in 120 seconds 
Trust Score 0.40-0.75  →  1 WhatsApp message → payout in 3 mins
Trust Score < 0.40  →  15-min admin hold → auto-release if confirmed
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PREMIUM MODEL -->
##  The Weekly Premium Model <a name="premium-model"></a>

Traditional insurance charges ₹2,000–₹5,000/year for plans that exclude gig workers entirely. OffShift charges for what the rider actually needs, when they need it.

| Plan | Price | Duration | Max Payout | Coverage |
|---|---|---|---|---|
|  **Shift Pass** | ₹49 | 24 hours | ₹500 | Heavy Rain, Heatwave |
|  **Weekly Pass** | ₹99 | 7 days | ₹1,500 | Weather + App Outages |
|  **Monthly Pro** | ₹349 | 30 days | ₹4,000 | All disruptions + Curfews |

### Dynamic Pricing via Kavach AI
The weekly base premium is adjusted ±₹10 based on 4 real-time signals:

1. **Historical rainfall frequency** for rider's pincode (last 3 years of IMD data)
2. **Rider shift pattern** — a morning rider in Okhla vs an evening rider in Gurugram face different risk profiles
3. **Weather forecast lead time** — if a storm is coming in 6 hours, the premium adjusts upward
4. **Zone-level historical payout ratio** — pincodes with high historical claims share higher collective risk

This means Ravi in monsoon-prone Okhla pays a contextually accurate premium — not a generic flat fee designed for someone in Rajasthan.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- AI/ML -->
##  AI/ML Integration — The Kavach Engine <a name="ai-ml"></a>

Kavach is our AI core. It is not a black box — it is three distinct, purpose-built models, each solving a specific problem.

---

### Model 1 — Kavach Pricing Engine (XGBoost)

**Purpose:** Generate a personalized, risk-appropriate weekly premium per rider per pincode.

| Attribute | Detail |
|---|---|
| Algorithm | XGBoost (Gradient Boosted Trees) |
| Library | `scikit-learn` + `xgboost` (open source, free) |
| Input Features | pincode, day of week, shift hour, IMD forecast score, historical payout ratio for zone, rider shift pattern baseline, hours until predicted event |
| Output | Dynamic weekly premium in ₹39–₹79 range |
| Training Data | IMD historical rainfall records (public), OpenWeatherMap Historical API, synthetic rider activity data |

```python
# Kavach Pricing Engine — Simplified Feature Vector
features = {
    'pincode_risk_score': 0.73,       # 3-year historical IMD payout ratio
    'day_of_week': 3,                  # Wednesday
    'shift_hour': 18,                  # 6pm start
    'imd_forecast_score': 0.85,       # High confidence 24hr rain forecast
    'zone_historical_payout_rate': 0.41,  # 41% of events in this zone triggered payout
    'hours_to_event': 6,               # Storm predicted in 6 hours
    'rider_morning_vs_evening': 1,     # Evening rider = higher rain exposure
}
# Model output → premium = ₹67 (base ₹49 + ₹18 risk adjustment for Okhla, July)
```

---

### Model 2 — Outage Validator (Isolation Forest)

**Purpose:** Distinguish a genuine platform outage from riders simply going offline on purpose.

| Attribute | Detail |
|---|---|
| Algorithm | Isolation Forest (Anomaly Detection) |
| Library | `scikit-learn` (free) |
| Input | GPS ping frequency per rider cluster, Downdetector scrape data, time-of-day baseline activity patterns |
| Output | Binary — `REAL_OUTAGE` or `FALSE_OFFLINE` |
| Threshold | 50+ riders in the same 5km zone showing simultaneous inactivity required |

A genuine app outage creates a sharp, correlated inactivity spike across a geographic cluster — a statistical anomaly the Isolation Forest excels at detecting. Riders individually going offline creates no such spatial correlation.

---

### Model 3 — Fraud Detection & Trust Scoring

**Purpose:** Score every rider's claim with a Trust Weight from 0.0 to 1.0 using 6 independent behavioral signals.

| Signal | Data Source | What It Catches |
|---|---|---|
| GPS vs Cell Tower Match | OpenCelliD API (free) | Spoofed GPS location |
| Accelerometer Micro-Pattern | Browser DeviceMotion API (free) | Spoofer sitting at home vs rider in storm |
| App Activity Fingerprint | Last Zomato/Swiggy session timestamp | Was rider actually on-shift before the event? |
| Historical Shift Pattern Deviation | Supabase 4-week baseline | Rider claiming in zone they've never worked |
| Subscription Timing vs Alert Gap | Trigger event timestamp | Subscribed after Red Alert went public? |
| Device Fingerprint Uniqueness | Browser fingerprint hash | Same device used for multiple accounts |

```python
# Trust Score Calculation — Weighted Average
trust_score = (
    0.25 * gps_cell_tower_match +      # Highest weight — hardest to fake
    0.20 * accelerometer_score +
    0.20 * app_activity_score +
    0.15 * shift_pattern_score +
    0.10 * subscription_timing_score +
    0.10 * device_fingerprint_score
)
# Output: 0.0 (certain fraud) to 1.0 (certain genuine)
```

**Payout tiers based on Trust Score:**
- `> 0.75` → Instant UPI payout in 120 seconds
- `0.40 – 0.75` → Single WhatsApp soft-verify → payout in 3 mins
- `< 0.40` → 15-minute hold → auto-release if confirmed independently

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- ADVERSARIAL DEFENSE -->
##  Adversarial Defense & Anti-Spoofing Strategy <a name="adversarial-defense"></a>

> **The Market Crash Scenario:** A coordinated syndicate of 500 riders uses GPS-spoofing apps to fake their location inside a Red Alert weather zone — while sitting safely at home — triggering mass false payouts and draining the liquidity pool.
>
> *Simple GPS verification is dead. Our defense goes 6 layers deeper.*

---

### The Attack Surface

Our parametric model's biggest vulnerability is **location fraud at scale**. A genuine stranded rider and a GPS-spoofed rider look identical on a map. They look completely different across 5 behavioral dimensions and 1 mathematical mechanism. Here is exactly how we catch them.

---

### 6-Layer Defense Architecture

**Layer 1 — Cell Tower Triangulation**

GPS coordinates can be fabricated in software. Physical cell tower connections cannot be faked without being physically present. Every rider's reported GPS location is cross-referenced against their actual connected cell tower ID, retrieved via the **OpenCelliD API** (free, global coverage). A rider claiming to be in Okhla but connected to a cell tower in Dwarka is flagged instantly. Cost: ₹0.

**Layer 2 — Accelerometer Micro-Pattern Analysis**

A rider genuinely parked in heavy rain — even completely stationary — experiences ambient micro-vibrations: passing vehicles, raindrops on the bike, wind. A person sitting on a sofa at home registers a near-zero, flat accelerometer reading. We score physical plausibility using the **browser DeviceMotion API** (free, no permissions beyond HTTPS). Spoofers at home produce a telltale flat line. Flagged.

**Layer 3 — Shift History Behavioral Baseline**

Kavach AI builds a **4-week activity baseline per rider** stored in Supabase: which pincodes they work in, what hours, which days of the week. A rider who has never made a single delivery in Connaught Place suddenly claiming a payout there during a Red Alert is a statistical anomaly with near-zero false positive risk. Flagged instantly.

**Layer 4 — Temporal Subscription Analysis**

Genuine riders subscribe before disruptions happen. Opportunist fraudsters subscribe *during* active Red Alerts. Any subscription placed within **10 minutes of a publicly announced Red Alert** is automatically moved to a **Pending Verification** queue — never instant payout. This alone eliminates reactive fraud with zero tech cost.

**Layer 5 — Fraud Ring Detection (Isolation Forest)**

Coordinated ring fraud leaves unmistakable statistical signatures that individual fraud cannot:

| Ring Fraud Signal | Normal Behavior | Fraud Ring Signature |
|---|---|---|
| Subscription timing | Spread over days/weeks | 50+ subscriptions within 60 minutes of alert |
| Device fingerprints | Unique devices, varied models | Multiple accounts sharing same `device_id` hash |
| Cell tower overlap | Riders spread across zone | Unnatural cluster hitting the same 1–2 towers |
| UPI receiver patterns | Diverse payout accounts | Multiple accounts routing to same UPI handle |
| Accelerometer variance | High (environmental vibration) | Near-zero across entire group |

When **3 or more** of these signals fire simultaneously across a cluster of riders, our Isolation Forest model raises a ** Syndicate Alert** — freezing payouts for that cluster and routing them to the admin dashboard for a 15-minute human review.

**Layer 6 — Weighted Quorum Trust Voting**

This is the mathematical kill-shot for coordinated spoofing.

Our anti-fraud layer already requires **50+ riders in a 5km zone** to confirm an outage. We upgrade this: each rider's confirmation carries a **Trust Weight (0.0–1.0)** based on their behavioral Trust Score. The payout only fires when the **weighted quorum** crosses a threshold — not a raw count.

```
Scenario A — 500 Spoofed Riders:
500 riders × Trust Weight 0.1 = 50 weighted votes
Payout threshold: NOT MET 

Scenario B — 50 Genuine Riders:
50 riders × Trust Weight 0.9 = 45 weighted votes  
Payout threshold: MET  — payout fires
```

**500 GPS-spoofed accounts cannot collectively generate enough trusted signal to trigger a payout. This is mathematically unsolvable for fraudsters without physical presence.**

---

### UX Balance — Never Punish Honest Riders

The hardest design problem: a genuine rider in a storm may have weak GPS signal, low accelerometer readings (sheltering under a bridge), or a new account with no behavioral baseline. Here is our **3-Tier Response System** — not a binary approve/reject:

| Tier | Trust Score | Action | Experience |
|---|---|---|---|
|  **Auto-Approve** | > 0.75 | UPI payout in 120 seconds | Zero friction — 85%+ of genuine riders |
|  **Soft Verify** | 0.40 – 0.75 | 1 WhatsApp message: *"Reply YES to confirm you're on shift"* | Payout in 3 minutes after reply |
|  **Hold & Review** | < 0.40 | 15-minute admin review; auto-release if IMD + cell tower confirm disruption independently | WhatsApp update sent; no penalty, no rejection |

> **The Golden Rule:** We NEVER deny a claim based on a single signal. Denial requires **3+ independent signals** pointing to fraud. When in doubt — we pay.
>
> A ₹500 false positive costs us less than destroying the trust of 10 genuine riders forever.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- TECH STACK -->
##  Tech Stack <a name="tech-stack"></a>

Every component is free or open-source. Total infrastructure cost: **₹0**.

| Layer | Technology | Purpose | Cost |
|---|---|---|---|
| **Bot Interface** | WhatsApp Business API (sandbox) + Dialogflow CX | Rider onboarding & soft-verify flow | Free |
| **Frontend** | React + Vite + Tailwind CSS | Admin analytics dashboard | Free |
| **Backend** | Node.js (TypeScript) + Express.js | API server, cron jobs, webhook handlers | Free |
| **Hosting** | Vercel (frontend) + AWS Lambda free tier (backend) | Production hosting | Free |
| **Database** | Supabase (PostgreSQL) | All persistent data + real-time subscriptions | Free tier |
| **Cache** | Upstash Redis (free tier) | Active storm event state, rate limiting | Free |
| **ML Models** | Python + scikit-learn + XGBoost | Kavach Pricing Engine, Isolation Forest | Open source |
| **Weather Oracle** | IMD API + OpenWeatherMap free tier | Rainfall, temperature triggers | Free |
| **AQI Oracle** | AQICN API (free tier) | Pollution level triggers | Free |
| **Outage Oracle** | Downdetector scraper + GPS cluster analysis | App outage validation | Free |
| **Payments** | Razorpay test mode + PhonePe UPI sandbox | Automated UPI payouts | Free (sandbox) |
| **Auth** | Supabase Auth | Rider & admin authentication | Free |
| **Cell Tower** | OpenCelliD API | Anti-spoofing triangulation | Free |
| **Motion Data** | Browser DeviceMotion API | Accelerometer fraud signal | Free (browser) |
| **Fraud Detection** | scikit-learn Isolation Forest | Ring fraud detection | Open source |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PLATFORM CHOICE -->
##  Platform Choice Justification <a name="platform-choice"></a>

### Why WhatsApp — Not a Native App

The single most important product decision we made.

| Factor | Native App | WhatsApp (Our Choice) |
|---|---|---|
| Adoption barrier | Download required, ~50MB | Zero — already installed |
| Device compatibility | Requires Android 8+ | Works on ₹5,000 phones from 2019 |
| Notification reliability | Depends on battery optimization | WhatsApp messages always delivered |
| UPI payment flow | Deep link integration needed | Native UPI links work inside WhatsApp |
| Time to first interaction | 5–10 minutes (download + signup) | 60 seconds |
| Battery impact | Constant background drain | None |

**95% of delivery riders already use WhatsApp daily.** Meeting them where they already are — not asking them to change their behavior — is the only way a ₹49 product gets adopted at scale.

### Why a React Web Dashboard for Admin

- Real-time Supabase subscriptions work natively in browser — no iOS/Android deployment required
- Lightweight, instant deployment to Vercel — no app store approval delays
- Works on any device for the insurance operations team
- Admin users are not the same constraints as field riders

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- DATABASE SCHEMA -->
##  Database Schema <a name="database-schema"></a>

All data is stored in Supabase (PostgreSQL) with Row-Level Security (RLS) enforced at the database level.

```sql
-- Riders (Insured Workers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pincode TEXT NOT NULL,
  upi_id TEXT NOT NULL,
  trust_score FLOAT DEFAULT 0.5,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insurance Policies / Plans
CREATE TABLE policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- 'Shift Pass', 'Weekly Pass', 'Monthly Pro'
  duration_hours INTEGER NOT NULL,       -- 24, 168, 720
  base_premium_inr INTEGER NOT NULL,     -- 49, 99, 349
  max_payout_inr INTEGER NOT NULL,       -- 500, 1500, 4000
  coverage_types TEXT[] NOT NULL        -- ['rain', 'heat', 'aqi', 'outage', 'curfew']
);

-- Active Coverage Sessions
CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  policy_id UUID REFERENCES policies(id),
  kavach_premium_inr INTEGER NOT NULL,   -- Dynamic AI-adjusted premium
  start_time TIMESTAMPTZ DEFAULT now(),
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active'           -- 'active', 'expired', 'claimed'
);

-- Trigger Events (Parametric Conditions)
CREATE TABLE trigger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,             -- 'rain', 'heat', 'aqi', 'outage', 'curfew'
  pincode TEXT NOT NULL,
  severity_value FLOAT NOT NULL,        -- 74.2mm/hr, 47°C, AQI 340, etc.
  triggered_at TIMESTAMPTZ DEFAULT now(),
  source_api TEXT NOT NULL,             -- 'IMD', 'AQICN', 'Downdetector'
  resolved BOOLEAN DEFAULT false
);

-- Claims / Payouts
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_id UUID REFERENCES active_sessions(id),
  trigger_event_id UUID REFERENCES trigger_events(id),
  amount_inr INTEGER NOT NULL,
  trust_score_at_claim FLOAT NOT NULL,
  tier INTEGER NOT NULL,                -- 1 (auto), 2 (soft verify), 3 (hold)
  status TEXT DEFAULT 'pending',        -- 'pending', 'paid', 'rejected', 'review'
  razorpay_payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ
);
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- GETTING STARTED -->
##  Getting Started <a name="getting-started"></a>

### Prerequisites

- Node.js v18+ and npm
- Python 3.9+ (for ML models)
- Supabase account (free)
- WhatsApp Business API sandbox (Twilio or Meta sandbox)

```sh
npm install npm@latest -g
```

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/SHIVIKA330/OffShift.git
   cd OffShift
   ```

2. Install Node.js dependencies
   ```sh
   npm install
   ```

3. Install Python ML dependencies
   ```sh
   pip install scikit-learn xgboost pandas numpy
   ```

4. Configure environment variables — create a `.env` file:
   ```env
   # Supabase
   VITE_SUPABASE_URL='YOUR_SUPABASE_PROJECT_URL'
   VITE_SUPABASE_ANON_KEY='YOUR_SUPABASE_ANON_KEY'

   # Razorpay UPI Payouts
   RAZORPAY_KEY_ID='YOUR_RAZORPAY_KEY'
   RAZORPAY_KEY_SECRET='YOUR_RAZORPAY_SECRET'

   # WhatsApp / Twilio
   TWILIO_ACCOUNT_SID='YOUR_TWILIO_SID'
   TWILIO_AUTH_TOKEN='YOUR_TWILIO_TOKEN'
   TWILIO_WHATSAPP_FROM='whatsapp:+14155238886'

   # Weather & AQI Oracles
   OPENWEATHER_API_KEY='YOUR_OWM_KEY'
   AQICN_API_KEY='YOUR_AQICN_KEY'
   OPENCELLID_API_KEY='YOUR_OPENCELLID_KEY'
   ```

5. Start the development server
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- ROADMAP -->
##  Development Roadmap <a name="roadmap"></a>

###  Phase 1 — Ideation & Foundation (March 4–20, COMPLETE)
- [x] README & architecture fully documented
- [x] Supabase DB schemas designed (users, policies, sessions, claims, trigger_events)
- [x] WhatsApp onboarding bot flow wireframed (`index.html` prototype)
- [x] Adversarial defense & anti-spoofing strategy documented in full
- [x] Tech stack selected — all free/open-source
- [x] Kavach AI architecture designed (XGBoost + Isolation Forest)

###  Phase 2 — Automation & Protection (March 21 – April 4)
- [ ] WhatsApp sandbox bot live — Dialogflow CX + Twilio integration
- [ ] Node.js cron job polling IMD + AQICN APIs every 15 minutes
- [ ] Kavach XGBoost model trained on IMD historical data + synthetic riders
- [ ] Razorpay UPI test mode integrated — automated payout flow end-to-end
- [ ] Rider registration + policy management UI live on Vercel
- [ ] Dynamic premium calculation working end-to-end

###  Phase 3 — Scale & Optimize (April 5–17)
- [ ] Isolation Forest fraud ring detection deployed
- [ ] 6-signal Trust Score engine live
- [ ] Weighted quorum anti-spoofing active in production
- [ ] Admin analytics dashboard with real-time Supabase data feeds
- [ ] Rider dashboard: active coverage status, payout history
- [ ] 50-rider alpha test in Okhla/Gurugram during actual monsoon rainfall
- [ ] Full 5-minute demo video with live simulated disruption

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- CONTRIBUTORS -->
##  Team & Contributors <a name="contributors"></a>

Built with purpose and late nights by the OffShift team for **Guidewire DEVTrails 2026**.

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/SHIVIKA330">
        <img src="https://github.com/SHIVIKA330.png" width="80" height="80" style="border-radius: 50%;" alt="Shivika">
        <br/>
        <sub><b>Shivika</b></sub>
        <br/>
        <sub>@SHIVIKA330</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/TejikaSingh02">
        <img src="https://github.com/TejikaSingh02.png" width="80" height="80" style="border-radius: 50%;" alt="Tejika">
        <br/>
        <sub><b>Tejika</b></sub>
        <br/>
        <sub>@TejikaSingh02</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/nomita1303">
        <img src="https://github.com/nomita1303.png" width="80" height="80" style="border-radius: 50%;" alt="Nomita">
        <br/>
        <sub><b>Nomita</b></sub>
        <br/>
        <sub>@nomita1303</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/yuvi194">
        <img src="https://github.com/yuvi194.png" width="80" height="80" style="border-radius: 50%;" alt="Yuvika">
        <br/>
        <sub><b>Yuvika</b></sub>
        <br/>
        <sub>@yuvi194</sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/love123-code">
        <img src="https://github.com/love123-code.png" width="80" height="80" style="border-radius: 50%;" alt="Love">
        <br/>
        <sub><b>Love</b></sub>
        <br/>
        <sub>@love123-code</sub>
      </a>
    </td>
  </tr>
</table>

<br/>

<div align="center">

**OffShift Team — DEVTrails 2026 — shivikaj47@gmail.com**

Project (try out link): [https://v0-off-shift-projects.vercel.app/](https://v0-off-shift-projects.vercel.app/)

---

> *Every other platform asks WHERE you are.*
> *OffShift asks WHO you are, HOW you move, WHEN you subscribed,*
> *and WHETHER your behavior matches 4 weeks of your own history.*
>
> **GPS tells us your location. Kavach tells us your truth.**

*Built for the riders who keep cities moving — even when the sky falls.*

</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & BADGES -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite.js]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[TailwindCSS.com]: https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[Node.js]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/
[Supabase.com]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Express.js]: https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/
