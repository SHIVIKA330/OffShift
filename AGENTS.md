# OffShift Platform Architecture & Guidelines

## Overview
**OffShift — Smart Income Shield** is an AI-powered parametric insurance platform designed for gig workers in India. It triggers automatic payouts without claim forms based on real-world events (like heavy rain or extreme heat).

## Stack
- **Frontend**: React + Vite + Tailwind CSS (in `frontend/` directory)
- **Backend**: Node.js + Express.js (in `backend/` directory)
- **Database**: Supabase (PostgreSQL)
- **Bots**: WhatsApp Business API + Dialogflow (in `whatsapp-bot/` directory)
- **ML / AI**: Python + scikit-learn + XGBoost (in `ml/` directory)

## Agent Instructions
- **Context**: All features should be designed knowing that the end-users are gig workers using low-end mobile devices in low-connectivity areas (the primary interface is WhatsApp). The admin dashboard is for insurance operations teams.
- **Code Style**: Maintain clean, modular code. Prioritize performance and mobile responsiveness for any web interfaces.
- **Tools**: For database interactions, assume Supabase SDK. For ML models, assume they are deployed and exposed via endpoints to the backend.

## Directories
- `frontend/`: React based admin analytics dashboard and web PWA.
- `backend/`: Node API handling cron jobs (checking IMD, AQI), webhooks, and payout integration (Razorpay).
- `whatsapp-bot/`: Conversational flows.
- `ml/`: Kavach Pricing Engine, Trust Scorer, Anomaly Detection.
