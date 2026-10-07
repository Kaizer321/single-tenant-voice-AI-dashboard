# Apex Plumbing Voice AI Desk - Single-Tenant Voice Call Dashboard

A production-ready, single-tenant call dashboard for voice AI phone agents. Built for real business deployment with Retell AI voice handling, Google Calendar appointment booking, and real-time lead analytics.

---

## 🏗️ Architecture & Single-Tenant Design

- **One Deployment = One Business**: No multi-tenant complexity, tenant switching, or platform admin clutter.
- **Centralized Configuration**: All client-specific branding (business name, logo, timezone, contact number, Retell agent ID, Google Calendar ID, accent color) live in **ONE config file**: [`src/config/business.ts`](file:///d:/voice%20ai/src/config/business.ts) + environment variables.
- **Database Schema**: Database migrations live in [`supabase/migrations/20261006000000_initial_schema.sql`](file:///d:/voice%20ai/supabase/migrations/20261006000000_initial_schema.sql).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, TanStack Query
- **Backend & Database**: Supabase (Postgres, Auth, Edge Functions, Realtime)
- **Voice AI Platform**: Retell AI (Webhooks + Custom Functions)
- **Calendar Integration**: Google Calendar API (OAuth 2.0 Server-Side Refresh)

---

## 🚀 Quickstart Guide (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- Supabase CLI (optional for local edge function testing)

### 2. Installation
```bash
git clone <repository-url>
cd voice-ai
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ENABLE_DEV=true

# Business Config Overrides
VITE_BUSINESS_NAME="Apex Plumbing & Heating"
VITE_BUSINESS_TAGLINE="24/7 Professional Voice AI Desk"
VITE_BUSINESS_TIMEZONE="America/New_York"
VITE_BUSINESS_PHONE="+1 (555) 234-5678"
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 Developer Sandbox & Webhook Simulator

When `VITE_ENABLE_DEV=true` is set, you can access the Retell Webhook Simulator without placing a live phone call:
1. Open the dashboard and click the **"Dev Simulator Mode"** badge in the sidebar, or navigate directly to `http://localhost:5173/#/dev/simulator`.
2. Click any of the 5 simulation buttons:
   - **Simulate Booked Emergency Call** (Emergency pipe leak booked for tomorrow 2 PM)
   - **Simulate Qualified Unbooked Lead** (Water heater quote request)
   - **Simulate Callback Request** (Commercial boiler maintenance)
   - **Simulate Spam / Robocall** (Solar panel robocall)
   - **Simulate Dropped / Failed Call** (Network disconnect)
3. Observe live updates across KPI cards, call table rows, and follow-up queues in real time!

---

## 📋 Checklist: Deploying for a NEW Client Business

Deploying this dashboard for a new client business takes **under 15 minutes**:

1. **Create Supabase Project**:
   - Create a new project in the [Supabase Dashboard](https://database.new).
   - In SQL Editor, execute `supabase/migrations/20261006000000_initial_schema.sql`.

2. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy retell-webhook --project-ref <your-project-ref>
   supabase functions deploy book-appointment --project-ref <your-project-ref>
   ```

3. **Set Secrets in Supabase**:
   ```bash
   supabase secrets set --project-ref <your-project-ref> \
     RETELL_WEBHOOK_SECRET="your_retell_webhook_secret" \
     GOOGLE_CLIENT_ID="your_google_client_id" \
     GOOGLE_CLIENT_SECRET="your_google_client_secret" \
     GOOGLE_REFRESH_TOKEN="your_google_refresh_token" \
     GOOGLE_CALENDAR_ID="primary"
   ```

4. **Configure Business Branding**:
   Update `src/config/business.ts` or set Vercel environment variables:
   - `VITE_BUSINESS_NAME`: Client's Business Name
   - `VITE_BUSINESS_TAGLINE`: Tagline / Subtitle
   - `VITE_BUSINESS_PHONE`: Client's Phone Number
   - `VITE_BUSINESS_TIMEZONE`: e.g. `America/New_York`

5. **Deploy Frontend to Vercel**:
   - Import the repository in Vercel.
   - Set environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BUSINESS_NAME`).
   - Click **Deploy**.

---

## 🎙️ Retell AI Agent Configuration Guide

### 1. Custom Extraction Fields (Post-Call Analysis)
In your Retell AI Dashboard under **Agent Configuration → Post-Call Extraction**, configure the following custom fields:

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `first_name` | String | Caller's first name |
| `last_name` | String | Caller's last name |
| `address` | String | Service location street address |
| `service` | String | Requested service (e.g., Drain Hydro-jetting) |
| `appointment_datetime` | String | ISO 8601 string (e.g. `2026-10-08T14:00:00-04:00`) |
| `booking_status` | Enum (`booked`, `not_booked`, `pending`) | Status of calendar appointment |
| `is_qualified` | Boolean | `true` if lead has valid intent & service area |
| `callback_requested` | Boolean | `true` if caller explicitly asked for human callback |
| `call_type` | Enum (`genuine`, `spam`, `wrong_number`) | Call classification |

### 2. Webhook URL Setup
Set your Retell AI Webhook URL to:
```
https://<your-supabase-project-ref>.supabase.co/functions/v1/retell-webhook
```

### 3. Custom Function Setup (`book-appointment`)
In Retell AI, add a Custom Function for live in-call booking:
- **Function Name**: `book_appointment`
- **URL**: `https://<your-supabase-project-ref>.supabase.co/functions/v1/book-appointment`
- **Method**: `POST`
- **Parameters Schema**:
  ```json
  {
    "type": "object",
    "properties": {
      "customer_name": { "type": "string" },
      "customer_phone": { "type": "string" },
      "address": { "type": "string" },
      "service": { "type": "string" },
      "requested_start_time": { "type": "string" }
    },
    "required": ["customer_name", "service", "requested_start_time"]
  }
  ```

---

## 📅 Google Calendar OAuth Setup Guide

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a Project and enable the **Google Calendar API**.
3. Go to **APIs & Services → OAuth consent screen**, select **External**, and add scope `https://www.googleapis.com/auth/calendar.events`.
4. Go to **Credentials → Create Credentials → OAuth client ID** (Web application).
5. Use the [Google OAuth2 Playground](https://developers.google.com/oauthplayground) to authorize the scope and exchange the authorization code for a `GOOGLE_REFRESH_TOKEN`.
6. Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` to Supabase Edge Function Secrets.

---

## 🧪 Manual End-to-End Verification Protocol

To verify the end-to-end journey for a new deployment:

1. **Step 1: Place Test Call**:
   Call the assigned Retell AI phone number.
2. **Step 2: Voice Qualification & Booking**:
   Tell the agent: *"I have a bursting pipe at 123 Main St, please book me for tomorrow at 2:00 PM."*
3. **Step 3: Check Google Calendar**:
   Verify that a new event titled `"Emergency Pipe Repair - <Your Name>"` appears on the client's Google Calendar at 2:00 PM.
4. **Step 4: Verify Dashboard Realtime Update**:
   - Open the client's dashboard.
   - Confirm **Total Calls**, **Answered Calls**, **Qualified Leads**, and **Appointments Booked** increment automatically without refreshing the page.
   - Click the call in **Call History** to inspect full transcript, executive summary, and linked calendar event details.

---

## 📄 License

MIT License. Designed for single-tenant commercial deployments.
