<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/SHIVIKA330/OffShift">
    <img src="https://img.icons8.com/color/96/000000/space-shuttle.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center"> OffShift: Zero-G Gig Economy Insurance</h3>

  <p align="center">
    Coverage so light and flexible, it feels weightless.
    <br />
    <a href="https://github.com/SHIVIKA330/OffShift"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/SHIVIKA330/OffShift">View Demo</a>
    ·
    <a href="https://github.com/SHIVIKA330/OffShift/issues">Report Bug</a>
    ·
    <a href="https://github.com/SHIVIKA330/OffShift/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#problem-statement">The Problem</a></li>
        <li><a href="#unique-features">Unique Features</a></li>
        <li><a href="#built-with">Built With (Tech Stack)</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Hey! Welcome to the repo for **OffShift**. We're proudly building this platform for the **DEVTrails 2026 Hackathon**. 🏆

As 3rd-year CS students, we noticed a massive gap in how modern labor works versus how traditional insurance operates. We decided to build a platform that actually respects the gig worker. 

### The Problem

The "gig economy" (delivery riders, freelance drivers, task-based workers) is booming. However, insurance companies still treat these workers like 9-to-5 employees with strict, expensive, and heavy 24/7 policies. 

If a delivery rider only works for 4 hours a day on weekends, why are they paying full-time premiums? Furthermore, the claims process involves mountains of PDF paperwork, manual verifications, and weeks of waiting—time these workers cannot afford to lose. Traditional insurance is fundamentally broken for the modern, fast-paced "gig" lifecycle.

### The Solution: "Zero-G" Coverage

We built **OffShift** to provide "Zero-G" insurance—coverage so flexible, algorithmic, and lightweight that it feels completely frictionless. OffShift is an on-demand, mobile-first micro-insurance platform that adapts directly to the worker's shift using API-driven embedded insurance middleware.

### Unique Features (What makes us stand out!)

Here is how OffShift completely redefines gig insurance for Users, Agents, and Companies:

#### 1. The Power of "The Toggle" (User Experience)
At the core of the worker's app is a massive, visually satisfying toggle button. 
* **Frictionless Activation:** You flip it ON when your shift starts (e.g., accepting a Zomato order). You flip it OFF when you're done. 
* **Micro-Pricing:** You *only* pay for the exact hours/minutes you are exposed to risk. The premium is calculated dynamically in real-time on your screen.

#### 2. "Sense" Telematics & Gamification (Behavioral Risk)
Why punish bad drivers when you can reward good ones? 
* **Sensor Integration:** We utilize the native mobile gyroscope and GPS to track speed and breaking habits safely in the background.
* **Unlockable Rewards:** We gamify the experience. Maintain a "Safe Driver" streak for 15 hours and automatically unlock a 20% discount coupon applied directly to your future micro-premiums.

#### 3. Instant Parametric UPI Claims (Smart Contracts)
The old way of filing a claim using a 40-page PDF is dead.
* **Smart Triggers:** If a telematics algorithm detects a severe impact and is mutually backed by a hospital API or gig platform (like an SOS button press), a "Parametric Smart Contract" is triggered.
* **Instant Payout:** The pre-determined claim amount is blasted directly into the gig worker's pre-registered **UPI Wallet** via instant API transfer, skipping human adjusters entirely for micro-claims.

#### 4. API-First Fleet Middleware (Company/Agent Dashboard)
We aren't just a consumer app; we are an infrastructure play.
* **Embedded Insurance:** Using our Node.js microservices, massive gig platforms like Urban Company or Uber can plug our "Toggle" API directly into their own partner apps.
* **Broker Command Center:** Agents get access to a powerful data-dense dashboard to upload CSVs, bulk auto-KYC fleets, and monitor active worker heatmaps in real-time.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With (Tech Stack)

We carefully selected our tech stack to prioritize rapid prototyping, blazing-fast performance, and a stunning "dark mode" aesthetic suitable for a hackathon timeline.

#### **Frontend Ecosystem**
* [![React][React.js]][React-url] - The industry standard. We chose React for its component-based architecture allowing us to perfectly isolate our complex "Toggle" logic.
* [![Vite][Vite.js]][Vite-url] - Next.js is great, but Vite provides the ultimate lightning-fast Hot Module Replacement (HMR) for incredibly fast SPA rendering during hackathons.
* [![TailwindCSS][TailwindCSS.com]][TailwindCSS-url] - We heavily rely on Tailwind for rapid styling, focusing heavily on glassmorphism, neo-brutalism, and ultra-high contrast dark modes without writing custom CSS files.

#### **Backend Ecosystem**
* [![Node.js][Node.js]][Node-url] - Our primary runtime for handling real-time API requests and writing our parametric claim webhooks.
* [![Express.js][Express.js]][Express-url] - Lightweight and unopinionated framework to scaffold our RESTful architecture.

#### **Database & Auth**
* [![Supabase][Supabase.com]][Supabase-url] - Supabase (PostgreSQL) is the absolute MVP of our stack. It gives us out-of-the-box secure authentication, row-level security policies (RLS), and real-time database subscriptions (vital for syncing the mobile App toggle with the Agent Dashboard dashboard instantly).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running, follow these simple example steps.

### Prerequisites

Make sure you have Node.js and npm installed on your machine.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Get your Supabase API Keys at [https://supabase.com](https://supabase.com)
2. Clone the repo
   ```sh
   git clone https://github.com/SHIVIKA330/OffShift.git
   ```
3. Install NPM packages
   ```sh
   cd offshift
   npm install
   ```
4. Enter your API in `.env`
   ```env
   VITE_SUPABASE_URL='ENTER YOUR SUPABASE URL'
   VITE_SUPABASE_ANON_KEY='ENTER YOUR SUPABASE ANON KEY'
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

Right now, we are wrapping up **Phase 1: Foundation**. We've mapped out the DB schemas, our API routes, and got the repository skeleton ready. 

### Database Schema (Supabase)
* `users`: The gig workers (id, name, upi_id, driving_score)
* `policies`: The available bundles (id, name, hourly_rate)
* `active_sessions`: The "Toggle" states (id, user_id, start_time, end_time, total_premium)
* `claims`: Handled via smart-contract/admin override.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] Phase 1: Foundation (Architecture & DB Schemas)
- [ ] Phase 2: Core UX (The Mobile Toggle & Agent UI)
- [ ] Phase 3: Logic (Telematics integration & Micro-premiums)
- [ ] Phase 4: Innovation (Smart Claims & UPI Integrations)
- [ ] Phase 5: Polish & Pitch Preparation

See the [open issues](https://github.com/SHIVIKA330/OffShift/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<table align="left">
  <tr>
    <td align="center">
      <a href="https://github.com/SHIVIKA330">
        <img src="https://github.com/SHIVIKA330.png" width="60" height="60" style="border-radius: 50%;" alt="Shivika"><br />
        <sub><b>Shivika</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/TejikaSingh02">
        <img src="https://github.com/TejikaSingh02.png" width="60" height="60" style="border-radius: 50%;" alt="Tejika"><br />
        <sub><b>Tejika</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/nomita1303">
        <img src="https://github.com/nomita1303.png" width="60" height="60" style="border-radius: 50%;" alt="Nomita"><br />
        <sub><b>Nomita</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/yuvi194">
        <img src="https://github.com/yuvi194.png" width="60" height="60" style="border-radius: 50%;" alt="Yuvika"><br />
        <sub><b>Yuvika</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/love123-code">
        <img src="https://github.com/love123-code.png" width="60" height="60" style="border-radius: 50%;" alt="Love"><br />
        <sub><b>Love</b></sub>
      </a>
    </td>
  </tr>
</table>

<br clear="both" />

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## Contact

OffShift Team - DEVTrails 2026 - shivikaj47@gmail.com

Project Link: [https://github.com/SHIVIKA330/OffShift](https://github.com/SHIVIKA330/OffShift)

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
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
