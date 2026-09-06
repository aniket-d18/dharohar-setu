# 🏛️ DHAROHAR (धरोहर)
### Indigenous Cultural & Linguistic Heritage Preservation Platform
*Smart India Hackathon (SIH) 2026 Initiative*

[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-Modular%20Architecture-ea2849?style=flat&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL%20ORM-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Types-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Executive Summary

**Dharohar** is an AI-powered, community-driven digital archive designed to document, safeguard, and celebrate India's intangible and tangible cultural heritage. Built for scale, Dharohar captures folklore, endangered dialect oral histories, indigenous art forms, and architectural monuments across 36 Indian states and union territories.

### Core Capabilities
- **Geospatial Cultural Atlas**: Live interactive map tracking cultural records across all 36 Maharashtra districts and nationwide regions.
- **Multimodal Archival Engine**: Authentic photographic documentation and lossless audio recording with dialect transcription.
- **Endangered Untranslatables Lexicon**: Dedicated preservation of indigenous idioms and cultural expressions lacking direct English translations.
- **Role-Gated AI Verification**: Community crowdsourcing backed by automated AI evaluation and multi-tier expert verification (`CONTRIBUTOR`, `REVIEWER`, `STEWARD`, `EXPERT`, `ADMIN`).
- **Vernacular Multilingual Support**: Seamless on-the-fly localization across Hindi, Marathi, and English.

---

## 🏗️ Architecture & Industry Directory Structure

This repository follows standard **Enterprise Full-Stack Monorepo** conventions:

```text
SIH-2026-NEW/
├── prisma/                     # Database Layer (Prisma ORM)
│   ├── schema.prisma           # Relational schema (Records, Users, Audits, Ontologies)
│   ├── seed.js                 # Initial seed dataset with cultural classifications
│   └── migrations/             # Version-controlled database migrations
│
├── public/                     # Static Web Assets
│   ├── images/                 # Platform branding & cultural icons
│   ├── uploads/                # Authentic local uploads (Git-ignored for privacy)
│   └── data/                   # Static GeoJSON & reference boundaries
│
├── server/                     # Backend API (NestJS Modular Enterprise Architecture)
│   ├── main.ts                 # NestJS bootstrap entrypoint (Port 4000)
│   ├── app.module.ts           # Root application module orchestrator
│   ├── prisma.service.ts       # Central database connection lifecycle service
│   └── modules/                # Feature-based domain modules
│       ├── auth/               # JWT & Session-based authentication
│       ├── records/            # Archival record ingestion, querying & mutations
│       ├── verification/       # Multi-stage review workflows & audit logging
│       ├── regions-languages/  # Geospatial coordinates & dialect trees
│       ├── untranslatable/     # Indigenous phrasebook & semantic mappings
│       └── analytics/          # Preservation gap analysis & vitality scoring
│
├── src/                        # Frontend Application (Next.js 16 App Router)
│   ├── app/                    # App Router pages & server layout components
│   │   ├── layout.tsx          # Root shell with global navigation & providers
│   │   ├── page.tsx            # Landing page with live metric counters
│   │   ├── atlas/              # Interactive Leaflet geospatial atlas
│   │   ├── archive/            # Filterable cultural database with live search
│   │   ├── capture/            # Multimodal field recorder (Photo & Audio)
│   │   ├── verify/             # Verification queue for verified stewards
│   │   ├── untranslatable/     # Untranslatable expressions repository
│   │   └── record/[id]/        # Individual high-resolution record detail view
│   ├── components/             # Reusable, decoupled UI components
│   │   ├── AtlasMap.tsx        # Dynamic map rendering with district resolver
│   │   ├── RecordCard.tsx      # Cultural artifact card with audio plaques
│   │   ├── AudioRecorder.tsx   # Lossless in-browser voice capture
│   │   ├── PreservationGaps.tsx# Cultural blind-spot identification
│   │   └── Navbar.tsx          # Navigation header with vernacular language toggle
│   ├── context/                # React Context state providers (Auth, Language)
│   ├── hooks/                  # Custom React lifecycle & audio hooks
│   ├── lib/                    # API client configurations & shared utilities
│   ├── messages/               # Multilingual translation dictionaries (en, hi, mr)
│   └── utils/                  # Coordinate resolvers, formatters & helpers
│
├── .env.example                # Sanitized environment template (Safe for VCS)
├── .gitignore                  # Production exclusion rules for credentials & artifacts
├── package.json                # Project dependencies and workspace scripts
├── tsconfig.json               # Frontend TypeScript configuration
├── tsconfig.server.json        # Backend TypeScript configuration
└── PRD.md                      # Product Requirements & Feature Specifications
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.x or v20.x LTS
- **PostgreSQL**: v14+ or cloud instance (Supabase, Neon, or local)
- **npm** or **pnpm**

### 2. Environment Configuration
Copy the provided `.env.example` template:
```bash
cp .env.example .env
```
Fill in your database URL and secrets in `.env`:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/dharohar_db?schema=public"
JWT_SECRET="your-secure-jwt-secret"
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
PORT=4000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Database
```bash
# Push schema to database
npx prisma db push

# (Optional) Seed with baseline cultural taxonomy
node prisma/seed.js
```

### 5. Start Development Servers
Run the NestJS backend and Next.js frontend concurrently:

```bash
# Terminal 1: NestJS Backend (Runs on http://localhost:4000)
npm run server:dev

# Terminal 2: Next.js Frontend (Runs on http://localhost:3000)
npm run dev
```

---

## 🔒 Security & Data Privacy

- **Zero-Credential Exposure**: `.env` and all environment files are excluded via `.gitignore`.
- **Protected Static Uploads**: Real community media uploaded to `/public/uploads` is strictly ignored by Git to preserve local storage limits and personal privacy.
- **Role-Based Access Control (RBAC)**: All sensitive operational actions (record rejection, database deletion, verified seals) require authenticated roles (`ADMIN`, `REVIEWER`, `STEWARD`, `EXPERT`).

---

## 📜 License
This project is licensed under the MIT License. Developed for SIH 2026.
