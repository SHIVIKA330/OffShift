<a name="readme-top"></a>

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
  </p>

  <p>
    An AI-powered parametric insurance platform for India's 12 million gig delivery workers.<br/>
    <strong>Zero claim forms. Zero paperwork. Automatic UPI payout in 120 seconds.</strong>
    <br/><br/>
    <a href="https://offshift-9iok.onrender.com"><strong> LIVE DEMO</strong></a>
    ·
    <a href="https://offshift-9iok.onrender.com/debug/bot"><strong> Bot Simulator</strong></a>
    ·
    <a href="https://youtu.be/-H7DZOUcolM?si=UAGWT9GT7QqNVLQC"> View Demo phase 1 Video</a>
    ·
    <a href="https://www.youtube.com/watch?v=zkxA6ojrw6w"> View Demo phase 2 Video</a>
    .
    <a href="https://github.com/SHIVIKA330/OffShift/releases/download/v1.0.0/app-debug.apk"> App Demo (Try it on phone)</a>
    .
    <a href="./OffShift — Smart Income Shield _ Guidewire DEVTrails 2026.pdf"> View Presentation</a>
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
    <li><a href="#adversarial-defense">🛡️ Adversarial Defense & Anti-Spoofing Strategy</a></li>
    <li><a href="#tech-stack">Tech Stack</a></li>
    <li><a href="#platform-choice">Platform Choice Justification</a></li>
    <li><a href="#database-schema">Database Schema</a></li>
    <li><a href="#phase2-registration">Phase 2 — Registration Process</a></li>
    <li><a href="#phase2-policy">Phase 2 — Insurance Policy Management</a></li>
    <li><a href="#phase2-premium">Phase 2 — Dynamic Premium Calculation</a></li>
    <li><a href="#phase2-claims">Phase 2 — Claims Management & Automated Triggers</a></li>
    <li><a href="#phase3-fraud">Phase 3 — Advanced Fraud Detection</a></li>
    <li><a href="#phase3-payout">Phase 3 — Instant Payout System</a></li>
    <li><a href="#phase3-dashboard">Phase 3 — Intelligent Dashboards</a></li>
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

1.  **WhatsApp-First Onboarding** — 60-second signup. Phone number + UPI ID only. No app download. No documents.
2. **Weekly Micro-Premium Model** — Sachet-sized pricing (₹49/₹99/₹349) built around gig workers' weekly cash flows.
3.  **Kavach AI Engine** — Our proprietary XGBoost model prices risk to the pincode level, dynamically per rider.
4.  **Parametric Auto-Triggers** — IMD API, AQICN API, Downdetector, GPS cluster inactivity — objective data only. No subjective judgment.
5.  **120-Second UPI Auto-Payout** — Razorpay API sends money directly to the rider's UPI handle. Zero claim forms. Ever.

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

<!-- PHASE 2: REGISTRATION -->
## 📋 Phase 2 — Registration Process <a name="phase2-registration"></a>

Onboarding is **WhatsApp-native, zero-download, 60 seconds flat**. No app stores. No email. No KYC documents.

### Registration Flow

```
Rider texts "HI" → WhatsApp Business API
  → Dialogflow CX bot initiates conversational flow
  → Collects: Full Name, Pincode, Delivery Platform (Zomato/Swiggy/Both)
  → Collects: UPI ID (validated via Razorpay Contact API)
  → Auto-generates: Device Fingerprint (browser hash)
  → Kavach AI runs initial zone risk scoring
  → Rider profile created in Supabase `users` table
  → Welcome message + plan options sent instantly
```

### Multi-Channel Registration Support

| Channel | Method | Target Segment |
|---|---|---|
| **WhatsApp Bot** | Text "HI" to OffShift number | Primary — 95% of riders |
| **Web PWA** | `offshift.vercel.app/register` | Admin/insurer onboarding |
| **Voice (Hindi)** | Whisper-powered voice command on PWA | Low-literacy riders |

### Data Collected at Registration

| Field | Source | Purpose |
|---|---|---|
| Name | Rider input | Identity |
| Phone | WhatsApp number (auto) | Auth + notifications |
| Pincode | Rider input | Zone risk scoring |
| UPI ID | Rider input (validated) | Instant payout destination |
| Platform | Rider selects | Outage trigger mapping |
| Device Fingerprint | Auto-generated browser hash | Fraud detection signal |
| Registration Timestamp | System | Temporal fraud analysis |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 2: POLICY MANAGEMENT -->
## 🛡️ Phase 2 — Insurance Policy Management <a name="phase2-policy"></a>

Policies are **sachet-sized, weekly, and rider-controlled**. No annual lock-ins. No hidden clauses.

### Policy Lifecycle

```
CREATION → ACTIVE → MONITORING → TRIGGERED → CLAIMED → EXPIRED/RENEWED
```

### Available Plans

| Plan | Duration | Base Premium | Max Payout | Coverage Scope |
|---|---|---|---|---|
| 🟢 **Shift Pass** | 24 hours | ₹49 | ₹500 | Heavy Rain + Heatwave |
| 🔵 **Weekly Pass** | 7 days | ₹99 | ₹1,500 | Weather + App Outages |
| 🟣 **Monthly Pro** | 30 days | ₹349 | ₹4,000 | All disruptions + Curfews + Strikes |

### Policy Management Features

- **Instant Activation:** Policy goes live the moment UPI payment is confirmed via Razorpay webhook
- **Auto-Renewal via WhatsApp:** Bot sends renewal reminder 6 hours before expiry with one-tap UPI link
- **Plan Upgrades:** Rider can upgrade mid-week (e.g., Shift Pass → Weekly Pass) — prorated billing
- **Coverage History:** Full history of all policies, triggers, and payouts accessible via WhatsApp command `"MY HISTORY"`
- **Family/Pod Coverage:** Riders can add dependents or form "Resilience Pods" of 5–10 riders for group discounts

### Policy State Machine

```
[CREATED] ──payment confirmed──→ [ACTIVE]
[ACTIVE]  ──duration expires───→ [EXPIRED] ──renewal──→ [ACTIVE]
[ACTIVE]  ──trigger event──────→ [TRIGGERED] ──payout──→ [CLAIMED]
[ACTIVE]  ──rider cancels──────→ [CANCELLED]
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 2: DYNAMIC PREMIUM -->
## 💰 Phase 2 — Dynamic Premium Calculation <a name="phase2-premium"></a>

Every rider gets a **personalized premium** — not a flat fee. Kavach AI adjusts ±₹10–₹30 from the base price using hyper-local risk factors.

### AI Integration: Dynamic Pricing Model

**The core innovation:** We use Machine Learning to adjust the Weekly premium based on hyper-local risk factors. This is NOT a lookup table — it's a trained gradient-boosted model that learns from historical weather patterns, rider behavior, and zone-specific claims data.

#### ML Model Architecture: Kavach Pricing Engine

| Attribute | Detail |
|---|---|
| **Algorithm** | XGBoost (Gradient Boosted Decision Trees) |
| **Library** | `scikit-learn` + `xgboost` (Python), inference also in JS via ONNX |
| **Input Features** | 10 hyper-local risk signals (see below) |
| **Output** | Personalized weekly premium in ₹39–₹149 range |
| **Training Data** | IMD historical rainfall (3 years, public), OpenWeatherMap API, AQICN historical, synthetic rider profiles |
| **Retraining Schedule** | Weekly, using latest 4 weeks of claims + weather data |
| **Inference Time** | <50ms per rider |

#### Feature Engineering — 10 Hyper-Local Risk Signals

```python
# Feature vector fed to XGBoost model for each rider
features = {
    'pincode_risk_score': 0.73,          # 3-year IMD historical payout ratio for pincode
    'day_of_week': 3,                     # Wednesday (mid-week = lower risk)
    'shift_hour': 18,                     # 6 PM start = evening monsoon window
    'imd_forecast_score': 0.85,          # High-confidence 24hr rain prediction
    'zone_payout_history': 0.41,         # 41% historical claim rate in this zone
    'hours_to_predicted_event': 6,       # Storm arriving in 6 hours
    'rider_shift_pattern': 1,            # Evening rider = higher rain exposure
    'aqi_7day_trend': 285,               # Rising AQI approaching hazardous
    'waterlogging_zone_flag': True,      # Pincode in known waterlogging area
    'rider_claim_frequency': 0.12,       # Rider's personal claim rate (low = discount)
}
# Output: premium = ₹67 (base ₹49 + ₹18 Okhla monsoon risk adjustment)
```

#### Model Training Pipeline

```
[IMD Historical Data] ──┐
[OpenWeatherMap API]  ──┤
[AQICN Historical]    ──┼──→ [Feature Extraction] ──→ [XGBoost Training]
[Rider Activity Logs] ──┤                                    │
[Claims History]      ──┘                                    ▼
                                                    [Trained Model .pkl]
                                                            │
                                                    [ONNX Export for JS]
                                                            │
                                                    [Real-Time Inference]
                                                    (POST /api/calculate-premium)
```

### Dynamic Pricing Rules — How ML Adjusts Your Premium

| Risk Factor | Effect on Premium | Data Source | Example |
|---|---|---|---|
| Pincode in historically safe zone (no waterlogging) | **−₹2 to −₹5/week** | IMD flood maps | Rider in Vasant Kunj (no flooding history) saves ₹2/week |
| Storm predicted within 6 hours | **+₹8 to +₹15** | OpenWeatherMap forecast | Cyclone approaching = premium adjusts upward |
| Rider has zero claims in last 4 weeks | **−₹5 loyalty discount** | Supabase history | Long-term riders rewarded for low claims |
| AQI trending above 300 for 3+ days | **+₹10 pollution surcharge** | AQICN API | Delhi winter smog = higher AQI risk |
| Resilience Pod membership (5+ riders) | **−25% group discount** | Pod smart contract | Social incentive for group coverage |
| Predictive weather modelling shows clear week | **Extended coverage hours at same price** | ML forecast | Clear forecast = 168hrs coverage for price of 120hrs |
| Rider operates in known waterlogging zone | **+₹3 to +₹8/week** | IMD + municipal flood data | Okhla Industrial Area = higher water risk |
| Weekend shift (Sat/Sun peak hours) | **+₹2 surge adjustment** | Historical delivery data | Weekend rain during peak = maximum disruption |

#### Real-World Pricing Examples

```
Example 1 — Ravi (Okhla, Evening Rider, Monsoon Season):
  Base Weekly Pass:         ₹99
  + Okhla waterlogging:     +₹5 (known flood zone)
  + Evening shift risk:     +₹3 (6PM–10PM monsoon window)
  + IMD storm in 6 hours:   +₹12 (high forecast confidence)
  − Zero claims (4 weeks):  −₹5 (loyalty discount)
  ─────────────────────────────
  FINAL PREMIUM:            ₹114/week
  Coverage Hours:           168 hours (standard)

Example 2 — Priya (Vasant Kunj, Morning Rider, Clear Week):
  Base Weekly Pass:         ₹99
  − No waterlogging zone:   −₹2 (historically safe)
  − Morning shift (low):    −₹0 (no adjustment)
  − Clear week forecast:    −₹0 (but gets +24hr bonus coverage)
  − Zero claims (8 weeks):  −₹5 (loyalty discount)
  ─────────────────────────────
  FINAL PREMIUM:            ₹92/week
  Coverage Hours:           192 hours (+24hr bonus for clear forecast)

Example 3 — Amit (Gurugram, AQI Season):
  Base Monthly Pro:         ₹349
  + AQI trending 320:       +₹10 (pollution surcharge)
  + 3-day sustained hazard: +₹5 (extended exposure)
  − Pod member (8 riders):  −₹87 (25% group discount)
  ─────────────────────────────
  FINAL PREMIUM:            ₹277/month
```

### Premium Calculation API

```
POST /api/calculate-premium
Body: { "rider_id": "uuid", "plan_type": "weekly", "pincode": "110020" }
Response: {
  "base_premium": 99,
  "risk_adjustments": [
    { "factor": "waterlogging_zone", "adjustment": +5, "source": "IMD flood map" },
    { "factor": "evening_shift", "adjustment": +3, "source": "rider shift pattern" },
    { "factor": "storm_forecast_6hr", "adjustment": +12, "source": "OpenWeatherMap" },
    { "factor": "loyalty_4_weeks", "adjustment": -5, "source": "claims history" }
  ],
  "total_risk_adjustment": +15,
  "final_premium": 114,
  "coverage_hours": 168,
  "bonus_hours": 0,
  "model_confidence": 0.87,
  "risk_factors": ["waterlogging_zone", "evening_shift", "forecast_rain_6hr"]
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 2: CLAIMS MANAGEMENT -->
## ⚡ Phase 2 — Claims Management & Automated Triggers <a name="phase2-claims"></a>

**Zero-touch. Zero-form. 120 seconds from trigger to UPI deposit.**

The entire claims process is **fully automated** — riders never fill a form, upload a document, or speak to an agent.

### 5 Automated Parametric Triggers (Public/Mock APIs)

We monitor **5 independent data sources** via cron jobs running every 15 minutes. Each trigger uses a **public API** (or mock equivalent for demo) to objectively identify disruptions that cause income loss:

| # | Trigger | Threshold | Public API | Endpoint | Verification Method |
|---|---|---|---|---|---|
| 1 | 🌧️ **Heavy Rainfall** | >65mm/hr (IMD Red Alert) | **IMD Weather API** + OpenWeatherMap | `api.openweathermap.org/data/2.5/weather?q={pincode}` | Cross-verified: IMD confirms OWM reading |
| 2 | 🔥 **Extreme Heat** | >45°C sustained 3+ hrs | **OpenWeatherMap API** | `api.openweathermap.org/data/2.5/forecast?q={pincode}` | 3-hour rolling average check |
| 3 | 💨 **Hazardous AQI** | AQI >300 (Hazardous) | **AQICN API** (aqicn.org) | `api.waqi.info/feed/{city}/?token={key}` | 3-hour sustained reading required |
| 4 | 📱 **App Outage** | Spike + 50 riders GPS-inactive | **Downdetector Scraper** + GPS cluster | Custom scraper on `downdetector.in/status/zomato` | Isolation Forest anomaly detection |
| 5 | 🚫 **Curfew/Strike** | Govt notification + news | **NewsAPI** | `newsapi.org/v2/everything?q=curfew+{city}` | Admin dashboard manual confirmation |

### Trigger API Integration Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TRIGGER MONITOR (Node.js Cron)                   │
│                    Runs every 15 minutes                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ IMD Weather  │  │ OpenWeather │  │  AQICN API  │                 │
│  │   API        │  │  Map API    │  │             │                 │
│  │ (Rainfall)   │  │ (Temp)      │  │ (AQI)       │                 │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘                 │
│         │                 │                 │                        │
│  ┌──────┴─────────────────┴─────────────────┴──────┐                │
│  │           THRESHOLD COMPARATOR                    │               │
│  │  Rain >65mm? │ Temp >45°C? │ AQI >300?           │               │
│  └──────────────────────┬────────────────────────────┘               │
│                         │ YES                                        │
│  ┌──────────────────────▼────────────────────────────┐               │
│  │           TRIGGER EVENT LOGGER                     │              │
│  │  → Log event type, pincode, severity, timestamp    │              │
│  │  → Query active riders in affected zone            │              │
│  └──────────────────────┬────────────────────────────┘               │
│                         │                                            │
│  ┌──────────────────────▼────────────────────────────┐               │
│  │           KAVACH TRUST SCORER                      │              │
│  │  → 6-signal behavioral analysis per rider          │              │
│  │  → Output: Trust Score 0.0 – 1.0                   │              │
│  └──────────────────────┬────────────────────────────┘               │
│                         │                                            │
│  ┌──────────────────────▼────────────────────────────┐               │
│  │           TIERED PAYOUT ENGINE                     │              │
│  │  Score >0.75  → Razorpay UPI instant (120 sec)     │              │
│  │  Score 0.40–0.75 → WhatsApp soft-verify (3 min)    │              │
│  │  Score <0.40  → Admin hold + auto-release (15 min) │              │
│  └───────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Mock API Response Formats

Each oracle returns standardized data for the trigger monitor to evaluate:

```json
// Weather Oracle Response (IMD + OpenWeatherMap)
{
  "pincode": "110020",
  "rainfall_mm_hr": 74.2,
  "temperature_c": 32,
  "alert_level": "RED",
  "source": "IMD",
  "cross_verified": true,
  "timestamp": "2026-07-15T16:00:00+05:30"
}

// AQI Oracle Response (AQICN)
{
  "pincode": "110020",
  "aqi": 342,
  "dominant_pollutant": "PM2.5",
  "sustained_hours": 4,
  "alert_level": "HAZARDOUS",
  "source": "AQICN",
  "timestamp": "2026-11-10T08:00:00+05:30"
}

// Outage Oracle Response (Downdetector + GPS)
{
  "platform": "Zomato",
  "outage_score": 87,
  "reports_last_30min": 1240,
  "riders_inactive_5km_cluster": 63,
  "anomaly_detected": true,
  "source": "Downdetector",
  "timestamp": "2026-08-20T20:30:00+05:30"
}
```

### Disruptions That Cause Income Loss — Trigger Mapping

| Disruption | How It Causes Income Loss | How We Detect It | Avg. Daily Loss |
|---|---|---|---|
| **Monsoon Flooding** | Roads impassable, no deliveries for 6–12 hours | IMD Red Alert >65mm/hr | ₹400–₹800 |
| **Extreme Heatwave** | Govt advisory to stay indoors, platforms reduce orders | Temp >45°C for 3+ hrs | ₹300–₹600 |
| **Toxic Air Quality** | Health risk, reduced outdoor activity, fewer orders | AQI >300 sustained | ₹200–₹500 |
| **App Platform Crash** | Cannot receive/complete orders despite good weather | Downdetector spike + GPS cluster | ₹500–₹1,000 |
| **Curfew/Bandh/Strike** | Movement restrictions, complete shutdown | News API + admin flag | ₹800 (full day) |

### Seamless Zero-Touch Claim UX — The Best Experience for Riders

**Design Philosophy:** The best claim process is one the rider doesn't even know happened. Money appears in their UPI before they realize they've lost income.

#### Why Zero-Touch Beats Traditional Claims

| Step | Traditional Insurance | OffShift (Zero-Touch) |
|---|---|---|
| Claim initiation | Rider fills 3-page form | **Automatic** — system detects event |
| Evidence submission | Upload 5+ documents, photos | **None** — API data is the evidence |
| Human review | Agent reviews in 3–7 business days | **AI Trust Score** in <1 second |
| Approval | Email after weeks of back-and-forth | **Instant** for 85%+ of riders |
| Payout | Bank transfer in 15–30 days | **UPI in 120 seconds** |
| Notifications | "Your claim is under review" emails | WhatsApp: "₹500 deposited. Stay safe." |

#### The Rider Journey During a Claim (Ravi's Story)

```
🕐 3:45 PM — Ravi is delivering orders in Okhla, Delhi
🌧️ 4:00 PM — Heavy rain starts, roads flooding rapidly
📡 4:00 PM — OffShift cron detects IMD Red Alert for pincode 110020
            (rainfall: 74.2mm/hr > 65mm threshold)
🔍 4:00 PM — System queries: "Which riders have active coverage in 110020?"
            → Ravi has Weekly Pass (active until March 25)
🧠 4:00 PM — Kavach Trust Score calculated for Ravi:
            GPS-Cell Tower Match:  0.95 (genuine location)
            Accelerometer:        0.88 (outdoor vibration detected)
            Shift History:        0.92 (regular Okhla rider)
            Subscription Timing:  0.90 (subscribed 3 days ago)
            Device Fingerprint:   1.00 (unique device)
            App Activity:         0.85 (last Zomato delivery 12 min ago)
            ─────────────────────────────────
            TRUST SCORE:          0.91 → TIER 1 (Auto-Approve)
💰 4:01 PM — Razorpay UPI payout initiated: ₹1,500 → rajesh@ybl
📱 4:02 PM — WhatsApp message delivered:
            "Hi Ravi 👋
             🛡️ Your OffShift Weekly Shield just activated.

             ₹1,500 deposited to rajesh@ybl
             Reason: IMD Red Alert — Heavy Rain in Okhla (74.2mm/hr)
             Ref: TXN_RZP_20260715_001

             Stay safe. Your income is protected. 💪"

⏱️ TOTAL TIME: 120 seconds
📝 FORMS FILLED: 0
📞 CALLS MADE: 0
📧 EMAILS SENT: 0
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 3: ADVANCED FRAUD DETECTION -->
## 🔍 Phase 3 — Advanced Fraud Detection <a name="phase3-fraud"></a>

Beyond the 6-layer defense documented above, Phase 3 deploys **delivery-specific fraud catching** mechanisms. We don't just track where they are; we track *how they work*.

### Delivery-Specific Behavioral Analysis

We analyze the **temporal relationship** between delivery platform signals and claim triggers. A fraudster sitting at home lacks the "Order Lifecycle" telemetry that a genuine rider possesses.

| Signal | Genuine Rider | Bad Actor (Spoofer) |
|---|---|---|
| **GPS Jitter** | Natural drift (3-5m) due to weather/buildings | Unnaturally static or "perfect" paths |
| **Order Proximity** | Last delivery drop-off within 2km of claim zone | Last delivery in a completely different city/zone |
| **App Telemetry** | Active "Online" status on Zomato/Swiggy | "Offline" status or no recent order pings |
| **Motion Profile** | Accelerometer shows bike vibration/walking | Near-zero movement (sitting on a couch) |

### Catching Fake Weather Claims via Historical Cross-Validation

Every claim is cross-referenced against **three independent weather oracles**. If two oracles (e.g., IMD and OpenWeatherMap) report "Dry" while the rider claims "Heavy Rain," the claim is flagged.

```python
# Advanced Historical Cross-Validation Logic
def validate_weather_claim(rider_pincode, event_timestamp):
    # 1. Check Historical IMD Gridded Data (Primary Oracle)
    imd_rainfall = fetch_imd_pincode_data(rider_pincode, event_timestamp)
    
    # 2. Cross-Ref with OpenWeatherMap Historical API (Secondary Oracle)
    owm_rainfall = fetch_owm_historical(rider_pincode, event_timestamp)
    
    # 3. Analyze Cluster Behavior (The Social Oracle)
    # If 50 riders in the same 2km radius are NOT claiming, but 1 is...
    active_claims_in_vicinity = count_active_claims(rider_pincode, radius="2km")
    
    if (imd_rainfall < THRESHOLD) and (owm_rainfall < THRESHOLD):
        if active_claims_in_vicinity < QUORUM_MIN:
            return "FLAG_FOR_REVIEW" # High probability of fraud
            
    return "AUTO_APPROVE"
```

### Fraud Ring Detection (Isolation Forest)

We use **Isolation Forest (Anomaly Detection)** to identify coordinated fraud rings. Coordinated groups leave a "Cluster Signature" that individual users do not.

| Ring Signal | Normal Population | Fraud Ring Signature |
|---|---|---|
| **Subscription Timing** | Spread over days/weeks | 50+ subscriptions within 10 mins of an alert |
| **Device Fingerprints** | 1 Device : 1 User | 5+ Users sharing the same `device_id` hash |
| **Cell Tower Overlap** | Riders spread across the zone | 100% overlap on a single tower (impossible in storms) |
| **UPI Routing** | Each rider has a unique UPI | Multiple rider accounts routing to 1-2 UPI handles |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 3: INSTANT PAYOUT SYSTEM -->
## 💸 Phase 3 — Instant Payout System (Simulated) <a name="phase3-payout"></a>

We demonstrate the "Moment of Truth" — when the payout hits the worker's account in real-time. For the demo, we integrate with **Mock Payment Gateways** to simulate the entire fund-flow.

### Simulated Fund-Flow (Razorpay / Stripe / UPI)

| Gateway | Mode | Purpose in Demo |
|---|---|---|
| **Razorpay Payouts** | Test Mode | Simulates bulk UPI payouts to 500+ riders simultaneously. |
| **Stripe Sandbox** | Test API | Demonstrates international scalability for gig workers globally. |
| **UPI Simulator** | Mock API | Visualizes the "Notification Pop-up" on a simulated worker's phone. |

### The "Moment of Truth" Workflow

1.  **Trigger Confirmation**: IMD API confirms Red Alert status.
2.  **Fund Disbursement**: Backend calls `razorpay.payouts.create()` using `rzp_test` keys.
3.  **Instant Credit**: Funds are moved from the OffShift Liquidity Pool to the Rider's UPI VPA.
4.  **Verification**: Webhook confirms success; Rider receives an automated WhatsApp receipt.

```javascript
// Razorpay Instant Payout Simulation (Node.js)
const payout = await razorpay.payouts.create({
  account_number: "781022331100", // OffShift Escrow
  fund_account_id: rider.fund_id,
  amount: 150000, // ₹1,500.00
  currency: "INR",
  mode: "UPI",
  purpose: "payout",
  reference_id: `CLAIM_${claim.id}`,
});
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 3: INTELLIGENT DASHBOARDS -->
## 📊 Phase 3 — Intelligent Dashboards <a name="phase3-dashboard"></a>

We provide two distinct views: one for the frontline worker (Shield Status) and one for the insurer (Risk & Liquidity).

### 🧑‍🚀 For Workers: The "Shield" View
A mobile-first, haptic dashboard built for the road.

*   **Earnings Protected**: Total lifetime payouts received (The "Peace of Mind" metric).
*   **Active Weekly Coverage**: A real-time countdown of seconds remaining on the current "Rain Shield."
*   **Claim History**: One-tap access to every past disruption event and its payout status.
*   **Trust Score**: A gamified "Kavach Score" — workers with high scores get faster payouts and lower premiums.

### 🏢 For Insurers: The "Nebula" Admin Console
A dark-mode, high-performance dashboard for risk managers.

*   **Loss Ratios**: Real-time tracking of premiums collected vs. claims paid (The "Solvency" metric).
*   **Syndicate Alerts**: Instant flags when the Isolation Forest detects coordinated fraud clusters.
*   **Predictive Analytics**: **"The Week Ahead"** — predicting next week's likely weather/disruption claims based on LSTM models.
*   **Zone Heatmaps**: Visualizing rainfall patterns across Delhi/NCR in real-time, mapped against rider density.

#### Next-Week Disruptive Claim Prediction (ML)

```python
# Predictive Analytics for Insurer Dashboard
def predict_next_week_claims(pincode):
    features = [historical_payouts, forecast_intensity, active_policies]
    # Predicts likely liquidity drain for the coming 7 days
    predicted_payout_volume = model.predict(features) 
    
    return {
        "pincode": pincode,
        "likely_disruption": "Heavy Rain (Tuesday)",
        "projected_payout": "₹4,50,000",
        "liquidity_risk": "MEDIUM"
    }
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

### 🔧 Phase 2 — Automation & Protection (March 21 – April 4)
**Theme: "Protect Your Worker"**
- [x] **Registration Process:** WhatsApp sandbox bot live — Dialogflow CX + Twilio integration
- [x] **Registration Process:** Multi-channel onboarding (WhatsApp + Web PWA + Voice Hindi)
- [x] **Insurance Policy Management:** Policy lifecycle engine (create → active → triggered → claimed → expired)
- [x] **Insurance Policy Management:** Plan selection, instant activation via UPI, auto-renewal reminders
- [x] **Dynamic Premium Calculation:** Kavach XGBoost model trained on IMD historical data + synthetic riders
- [x] **Dynamic Premium Calculation:** Hyper-local risk pricing (pincode-level, ±₹10–₹30 adjustment)
- [x] **Dynamic Premium Calculation:** Zone waterlogging discount (₹2 less/week for safe zones)
- [x] **Dynamic Premium Calculation:** Extended coverage hours via predictive weather modelling
- [x] **Claims Management:** Node.js cron job polling IMD + AQICN + Downdetector every 15 minutes
- [x] **Claims Management:** 5 automated parametric triggers (Rain, Heat, AQI, App Outage, Curfew)
- [x] **Claims Management:** Trust-scored tiered payout (auto/soft-verify/hold)
- [x] **Claims Management:** Razorpay UPI test mode — automated 120-second payout flow
- [x] **Claims Management:** Zero-touch WhatsApp claim notification + receipt
- [x] **2-Minute Demo Video:** Screen recording of registration → coverage → trigger → payout flow

### 🚀 Phase 3 — Scale & Optimize (April 5–17)
**Theme: "Perfect for Your Worker"**
- [x] **Advanced Fraud Detection:** GPS spoofing detection (cell tower + accelerometer + jitter analysis)
- [x] **Advanced Fraud Detection:** Fake weather claims caught via historical cross-validation
- [x] **Advanced Fraud Detection:** Isolation Forest fraud ring detection deployed
- [x] **Advanced Fraud Detection:** 6-signal Trust Score engine live
- [x] **Advanced Fraud Detection:** Weighted quorum anti-spoofing (500 spoofers can't trigger payout)
- [x] **Instant Payout System:** Razorpay test mode full integration with webhook confirmations
- [x] **Instant Payout System:** PhonePe sandbox for premium UPI collection
- [x] **Instant Payout System:** Simulated disruption → automated AI claim approval → instant payout demo
- [x] **Worker Dashboard:** Earnings protected, active weekly coverage, claim history, trust score
- [x] **Admin Dashboard (Nebula):** Loss ratios, predictive analytics, weather heatmap, fraud alerts
- [x] **Admin Dashboard (Nebula):** Next-week claim prediction engine with ML forecasting
- [x] **Admin Dashboard (Nebula):** Revenue analytics, payout queue, Syndicate Alert management
- [x] **5-Minute Demo Video:** Full walkthrough with simulated rainstorm → AI claim → payout
- [x] **Final Pitch Deck:** PDF covering persona, AI/fraud architecture, Weekly pricing viability

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

<!-- PHASE 3 / HACKATHON EVALUATION  -->
## 🏆 Phase 3 Architecture & Hackathon Evaluation <a name="hackathon-evaluation"></a>

### Phase 3 Architecture
- `POST /api/demo/trigger-weather` - IMD Simulation Event
- `POST /api/demo/trigger-outage` - Zomato Platform Disruption Event  
- `POST /api/demo/concurrent-disruption` - Rain + Outage Combination
- `POST /api/demo/gps-spoof` - Static Spoofed Coordinate Simulation
- `POST /api/demo/fraud-test` - ML Temporal Anomaly Validation
- `POST /api/demo/zone-crossing` - Mobility Engine Cross-Zone Resolver
- `POST /api/demo/eligibility-check` - 90-Day Engagement Verification

### Dataset Sources
We processed ~2500 consecutive daily records representing the IMD Red Alert timeline in Delhi NCR to derive actuarial viability.
**Generate synthetic data:**
\`\`\`bash
curl "https://archive-api.open-meteo.com/v1/archive?latitude=28.6139&longitude=77.2090&start_date=2018-01-01&end_date=2024-12-31&daily=precipitation_sum&timezone=Asia%2FKolkata" > data/delhi_weather_2018_2024.json
\`\`\`

### Regulatory Compliance
**IRDAI (Insurance Regulatory and Development Authority of India):** We prove parameter accuracy and financial sustainability by correlating historical trigger likelihood against loss ratios, locking our theoretical risk below the 70% threshold (verified dynamically on [Actuarial Proof](/actuarial)). 
**SS Code 2020 (Social Security):** OffShift respects unorganized sector mandates by forcing a 90-day platform engagement history gate. Short-term shift passes bypass this, but comprehensive Monthly coverage mandates proof-of-work (verified in [Eligibility Check](/api/eligibility/check)).
**DPDP Act 2023 (Digital Data Protection):** Compliant, isolated consent gathering. Location streams cannot be monitored invisibly. IP hashes log cryptographic affirmations in multi-step wizard logic (verified on [Consent Flow](/onboard/consent)).

### ⚖️ Judge Quick Links
- **Live site:** [https://offshift-9iok.onrender.com](https://offshift-9iok.onrender.com)
- **Demo admin panel:** [/admin/demo](/admin/demo) *(DEMO_MODE=true)*
- **Compliance checklist:** [/admin/compliance](/admin/compliance)
- **Actuarial proof:** [/actuarial](/actuarial)
- **Consent flow:** [/onboard/consent](/onboard/consent)

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

Project (live site): [https://offshift-9iok.onrender.com/](https://offshift-9iok.onrender.com/)

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
