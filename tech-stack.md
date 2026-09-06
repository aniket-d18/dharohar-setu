# Tech stack — Dharohar Setu

## Frontend
- **Framework**: Next.js (React) — App Router, PWA-capable, good SSR/SSG for the public Archive/Atlas pages (SEO + fast first paint)
- **Styling**: Tailwind CSS + a small custom design-token layer for the museum/editorial theme (fonts, colors, spacing)
- **Animation**: Framer Motion — hero transitions, card reveals, verification-queue interactions
- **State/data**: React Query (TanStack Query) for server state + caching; Zustand for lightweight local UI state
- **Offline**: Service worker via `next-pwa`, IndexedDB (via `idb`) for the local capture queue and offline record cache
- **Map**: Leaflet + open India GeoJSON (state/district boundaries), clustering via `leaflet.markercluster`
- **Media**: MediaRecorder API (audio/video capture), Wavesurfer.js for waveform display/scrubbing, `browser-image-compression` for client-side image compression before upload

## Backend
- **Runtime**: Node.js (NestJS or Express — NestJS preferred for structure at this scope: modules for records, verification, regions, auth)
- **API style**: REST for CRUD, with a couple of WebSocket channels (Socket.IO) for live verification-queue updates and live home-page counters
- **Auth**: email/OTP + anonymous session tokens (JWT), roles: contributor / reviewer / steward
- **Background jobs**: BullMQ (Redis-backed) for async AI processing (transcription/translation/summarization/similarity) and resumable upload finalization

## Data layer
- **Primary DB**: PostgreSQL (via Supabase or self-hosted) — relational fit for Record/Region/Language/Verification/Consent entities
- **File/media storage**: Supabase Storage or S3-compatible bucket for audio/video/image files, with signed upload URLs for direct client → storage upload
- **Search**: Postgres full-text search (tsvector) for MVP; can graduate to Meilisearch/Typesense later without a data-model change
- **Client-side cache**: IndexedDB for offline queue and recently viewed records

## AI/ML services
- **Speech-to-text**: Whisper (self-hosted or API) as the default; architecture leaves a slot to swap in AI4Bharat/Bhashini models later for Indian-language accuracy
- **Translation**: NLLB or Bhashini API for regional-language → English/Hindi translation
- **Summarization & untranslatable-word detection**: LLM API (e.g. Claude/GPT) prompted against the transcription/translation pair
- **Similarity/duplicate detection**: sentence-embedding similarity (e.g. `sentence-transformers`) run as a background job on new submissions

## Infrastructure
- **Hosting (frontend)**: Vercel (pairs naturally with Next.js, handles PWA/edge caching well)
- **Hosting (backend)**: Railway/Render for the Node API + Redis + worker processes
- **CI/CD**: GitHub Actions — lint/test/build on PR, auto-deploy on merge to main
- **Monitoring**: Sentry for error tracking, simple uptime checks on API/health endpoint

## Why this stack (vs. the earlier plain HTML/CSS/JS version)
- Framework (Next.js) is expected/standard for a 3rd-year SIH-level build and gives you SSR, routing, and PWA tooling for free instead of hand-rolling it
- Offline-first requirement in the PRD needs a real service-worker + IndexedDB strategy — not realistic to bolt onto plain multi-page HTML cleanly
- Background AI jobs (transcription, translation, similarity) need a queue (BullMQ/Redis), which implies a real backend, not `localStorage`-only
- Everything here still ships as a single deployable web app first; a future native/mobile wrapper (Capacitor) or full separation is possible later without re-architecting

## Deliverables expected from build
- Working deployed site (Vercel link) + local run instructions
- README: setup, environment variables, file/module structure, what's mocked vs live (e.g. if AI calls are stubbed for the demo)
- Seed script populating sample Regions/Languages/Records so the Atlas and Archive aren't empty on first run
