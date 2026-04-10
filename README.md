# SALTY Retreats — Lead Magnet App

Interactive lead-capture application with flight search, trip planning quiz, AI itinerary builder, and cost comparison tools. Built with Next.js 15, React 19, Zustand, and Vitest.

## Tech Stack

- **Framework:** Next.js 15.1.0 (App Router)
- **State:** Zustand 5.0
- **Forms:** React Hook Form + Zod validation
- **Animation:** Motion 12.34 (formerly Framer Motion)
- **Styling:** Tailwind CSS 4.0, clsx + tailwind-merge
- **Testing:** Vitest + React Testing Library + jsdom
- **Storage:** Upstash Redis (KV)
- **AI:** Anthropic Claude (primary) + OpenAI (fallback)
- **TypeScript:** 5.7 (strict mode)
- **Node:** >=22.0.0 <23.0.0

## Getting Started

```bash
npm install
cp .env.example .env.local   # Fill in required values
npm run dev                   # http://localhost:3000
```

## Environment Variables

See `.env.example` for the full list. Key groups:

- **Flight data:** `SERPAPI_KEY` (flight search, 250 free/month)
- **AI:** `ANTHROPIC_API_KEY` (planner chat), `OPENAI_API_KEY` (fallback)
- **CRM:** `GHL_API_KEY`, `GHL_LOCATION_ID`, pipeline/stage IDs (GoHighLevel V1 + V2)
- **Storage:** `KV_REST_API_URL`, `KV_REST_API_TOKEN` (Upstash Redis)
- **Cron:** `CRON_SECRET` (Vercel cron auth)

## Page Routes

| Route | Purpose |
|---|---|
| `/` | Hero / entry point |
| `/quiz` | Discovery quiz (preferences, travel style) |
| `/quiz/results` | Quiz results with recommendations |
| `/flights` | Flight search + results |
| `/planner` | AI-powered itinerary builder |
| `/plan/[id]` | View saved itinerary |
| `/compare` | DIY vs. SALTY cost comparison |

## API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/leads/capture` | Lead form submission → GHL CRM |
| POST | `/api/leads/send-flights` | Email flight itinerary to lead |
| POST | `/api/leads/share-flights` | Generate shareable flight link |
| POST | `/api/leads/share-comparison` | Generate shareable comparison link |
| GET | `/api/links/verify` | Verify shared link tokens |
| GET | `/api/diy-link-status` | Check DIY retreat link status |
| GET | `/api/flights/search` | SerpAPI flight search proxy |
| POST | `/api/plans` | Save / retrieve itineraries |
| POST | `/api/planner/chat` | AI planner recommendations |
| GET | `/api/unsplash` | Image search proxy |
| GET | `/api/cron/verify-diy-links` | Cron: verify expiring links |

## Testing

```bash
npm test              # Watch mode
npm run test:ci       # Single run (CI)
npm run test:coverage # Coverage report
```

**20 test files** covering API routes, Zustand stores, components, and pages. Coverage scope: `lib/`, `stores/`, `app/api/`, `components/`.

## Project Structure

```
src/
├── app/              Page routes + API routes
│   ├── quiz/         Discovery quiz flow
│   ├── flights/      Flight search
│   ├── planner/      AI itinerary builder
│   ├── plan/         Saved plan viewer
│   ├── compare/      Cost comparison
│   └── api/          13 API routes (each with __tests__/)
├── components/       React components
├── lib/              Shared utilities
├── stores/           Zustand state stores
├── types/            TypeScript definitions
├── data/             Static data files
└── test/             Test setup + utilities
```
