# Victory Cadets Command Centre

AI-driven sales automation platform for coaching institutes preparing students for Sainik School, RMS, and Navodaya entrance exams. The app captures leads from Facebook and Google Ads, orchestrates outbound/inbound Twilio voice calls with an AI-powered counsellor persona, and keeps a unified CRM with Excel exports.

## Stack

- Next.js 14 (App Router) + React 18 + Tailwind CSS
- Prisma ORM with PostgreSQL (Vercel Postgres, Supabase, etc.)
- Twilio Programmable Voice for outbound & inbound calling
- Facebook Graph API + Google Ads API lead collectors
- OpenAI GPT-4o mini for dynamic follow-up scripts

## Local Development

```bash
npm install
npx prisma migrate deploy   # requires DATABASE_URL
npm run dev
```

Run `npm run build` before deploying to ensure everything compiles cleanly.

## Required Environment

Copy `.env.example` → `.env.local` and populate:

- `DATABASE_URL` – Postgres connection string
- `FACEBOOK_*` – Graph API token + comma-separated lead form IDs
- `GOOGLE_ADS_*` – OAuth credentials and customer ID
- `TWILIO_*` – Account SID, auth token, caller ID, routing number
- `OPENAI_API_KEY` – For AI follow-up scripting
- `PUBLIC_URL` – Deployed domain (e.g. `https://agentic-78d9f420.vercel.app`)

### Prisma

```
npx prisma db push      # create schema locally
npx prisma studio       # optional admin UI
```

## Key Workflows

- **Lead Sync** `/api/leads/sync`: pulls Facebook + Google Ads leads, deduplicates by lead ID.
- **Outbound Calls** `/api/leads/[id]/call`: launches Twilio voice flow using the Ananya Sharma persona.
- **Inbound Calls** `/api/voice/inbound`: captures callers, creates leads automatically, routes via IVR.
- **Excel Export** `/api/leads/export`: downloads latest CRM snapshot.
- **AI Scripts** `/api/leads/[id]/script`: generates personalised follow-ups referencing lead context.

## Deployment

The project is Vercel-ready. Ensure production environment variables match `.env.example`, then:

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-78d9f420
```

After deployment, verify with:

```bash
curl https://agentic-78d9f420.vercel.app
```

## Testing Voice Webhooks Locally

Use [ngrok](https://ngrok.com/) or similar to expose `localhost:3000` so Twilio can reach the `/api/voice/*` routes. Update webhook URLs inside the Twilio console to point to the tunnel.

## License

MIT © Victory Cadets Academy
