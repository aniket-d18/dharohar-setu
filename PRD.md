# Product Requirements Document (PRD)
## Dharohar Setu — Living Cultural Atlas of India

## 1. Product overview
Dharohar Setu is a community-driven, offline-first platform for documenting, verifying, and exploring India's living cultural heritage — oral traditions, folk songs, proverbs, dialects, craft knowledge, and festival practices — before they disappear with the generation that carries them. It combines crowd-sourced multimedia archiving, AI-assisted transcription/translation/summarization, a provenance-and-verification pipeline, and a geospatial cultural map, so a single recording made by a student with their grandmother becomes a permanent, searchable, trust-scored part of a national archive.

## 2. Problem statement
India has 197+ languages classified by UNESCO as vulnerable-to-critically-endangered, some down to a few hundred speakers (Great Andamanese, Toto, Nihali, Toda). Because these traditions live in speech and practice rather than text, they vanish permanently and silently when the last fluent elder or craftsperson dies. Government efforts (Bhasha Kosh, Bhashini, linguistic surveys) are slow, restricted mostly to the 22 scheduled languages, and built for professional linguists — not for a teenager with a phone and a curious grandmother. There is no simple, trustworthy, AI-assisted tool for ordinary families to capture this material and have it become part of a growing, verifiable, publicly explorable record.

## 3. Goals
- Sub-2-minute capture flow for a non-technical contributor, working offline in low-connectivity regions
- An archive that feels like a premium digital museum, not a research dataset dump
- Make cultural/linguistic urgency visible, specific, and geographically grounded
- A credible verification/provenance pipeline so trust in each record is explicit, not assumed
- Multi-modal capture: audio, video, image, and text — not audio-only
- AI as an assistive layer (transcription, translation, tagging, summarization, similarity detection) — never the source of truth
- Architecture that can plug into national infra (AI4Bharat, Bhashini, CIIL) later without a rewrite

## 4. Non-goals (out of scope for MVP)
- Payments, monetization, marketplace for artisans (roadmap)
- Guru-Shishya mentorship matching (roadmap)
- Full linguistic-research annotation tooling (IPA transcription, phoneme-level tagging)
- Native mobile apps (PWA, installable, offline-capable — not separate iOS/Android builds)
- Full knowledge-graph reasoning layer (roadmap; data model must not block it)

## 5. User personas
1. **Contributor** — student/family member capturing a relative's knowledge. Low technical skill assumed; motivated emotionally, not by data collection. Often on a low-end Android phone with patchy connectivity.
2. **Explorer** — browses out of curiosity, cultural pride, research interest, or diaspora nostalgia.
3. **Reviewer/Verifier** — community member fluent in a dialect or knowledgeable in a craft; corrects AI output and validates authenticity.
4. **Cultural Steward (new role)** — a local NGO, cultural body, or panchayat-linked volunteer who can bulk-endorse a region's contributions and flag high-priority endangered pockets.
5. **Researcher/Institution (future)** — exports verified, licensed data. Not built now, but data model and consent model must support future export.

## 6. Information architecture
- Home (landing + live impact stats)
- Capture (multi-modal: audio / video / image / text)
- Atlas (interactive map, primary navigation surface)
- Archive (browse/search/filter, list + grid view)
- Record detail view (museum-plaque style)
- Verification Console (reviewer queue)
- Endangered Heritage Dashboard (analytics, not just a map)
- Untranslatable Words & Micro-Traditions (discovery/shareable content)
- Contributor Profile & Leaderboard
- Cultural Steward Console (region-level moderation, future-facing but scaffolded)
- Offline Sync Manager (background, surfaced only as a status indicator)

## 7. Detailed feature specifications

### 7.1 Home
- Hero: cinematic full-bleed imagery, editorial typography, single strong headline, no stock-SaaS gradient
- Live counters (from DB, not hardcoded): total records, languages/dialects represented, verified records, contributors, regions covered
- "Fading fastest" ticker — auto-rotating call-out of 3–5 critically endangered languages/crafts pulled dynamically from the Language entity by urgency score
- Two primary CTAs: "Capture a memory" and "Explore the Atlas"
- Editorial "why this matters" section with a citation-backed urgency stat, linking into the Dashboard
- Featured record of the week (algorithmically selected: high engagement + high verification trust score)

### 7.2 Capture flow (expanded from "Record")
Four-step wizard, resumable (state persisted so a dropped connection doesn't lose progress), works fully offline via local queue:
1. **Consent** — plain-language explainer, visibility choice (Public / Community-only / Private / Steward-only), granular consent toggles (can this be used for AI training? for public export? attribute the speaker's name or keep anonymous?), required checkbox, versioned consent record stored against the entry for audit
2. **Metadata** — region (searchable, hierarchical: state → district → village, autocomplete + map-pin drop), dialect/language, category (Lullaby / Proverb / Story / Festival practice / Craft technique / Recipe / Ritual / Life-skill knowledge / Other), tags, speaker details (name/age optional, anonymize toggle)
3. **Capture** — media-type-aware:
   - Audio: in-browser MediaRecorder, live waveform, re-record, 5-min cap, noise-level warning
   - Video: for craft/ritual demonstrations, camera capture with duration cap, auto-generated thumbnail
   - Image: for artifacts, textiles, tools — with basic on-device compression before upload
   - Text: for proverbs/recipes typed directly, with native-script keyboard support
4. **Submit** — client-side compression, background upload with retry/resume, immediate local save to IndexedDB so nothing is lost if the tab closes, confirmation screen with shareable link and a "record another" shortcut

Edge cases: mic/camera permission denied (inline recovery instructions), upload failure mid-transfer (chunked resumable upload), silent/corrupt clips (waveform-based pre-submit warning), duplicate/near-duplicate detection (AI similarity check flags likely re-submissions of the same story for reviewer attention rather than blocking outright).

### 7.3 Atlas (interactive map — primary surface, not a secondary dashboard)
- India map, choropleth by cultural/linguistic vitality score per region (critical/vulnerable/safer), built on open GeoJSON boundaries
- Click a region → side panel: languages/crafts native to it, estimated speakers/practitioners remaining, average practitioner age, projected years-to-critical, linked archive records from that region
- Layer toggle: switch between "Language vitality," "Craft vitality," and "Contribution density" heatmaps
- Cluster view for zoomed-out states, pin view when zoomed to district level
- List-view fallback for accessibility and low-end devices

### 7.4 Archive (Browse)
- Grid/list toggle; card shows media-type icon, category tag, region, duration/length, verification badge
- Filters: region, category, media type, vitality status, verification status, date range
- Search: full-text over transcriptions/translations/tags, region, speaker name
- Sort: newest, most engaged, most in need of verification, nearest to "critical" threshold

### 7.5 Record detail view (museum-plaque styling)
- Media player (audio waveform / video / image viewer) appropriate to type
- AI-generated transcription (native script) + translation, explicitly labeled "AI draft" pending verification
- Provenance panel: contributor (or anonymous), date, consent scope, edit/verification history (evidence timeline — every correction is visible, not overwritten)
- Verification badge: Unverified → Community-verified → Steward-endorsed → Expert-reviewed
- "Flag an unusual word/technique" → feeds Untranslatable Words / Micro-Traditions pipeline
- Related records (same region/category, AI-suggested)
- Share → public link + auto-generated social card image

### 7.6 Verification Console
- Personalized queue (filtered to reviewer's declared region/dialect/craft expertise)
- Side-by-side: media playback + AI draft text, inline correct/edit/annotate
- Two-independent-reviewer agreement → Community-verified; disagreement → "disputed" state with both versions retained
- Steward accounts can fast-track endorse for their region
- Full edit history retained per record (append-only log, never destructive overwrite)
- Gamified queue prioritization: oldest-unverified and highest-urgency-region records surfaced first

### 7.7 Endangered Heritage Dashboard
- Beyond the map: trend charts (contributions over time per region), a "years-to-critical" projection table, a leaderboard of most-active preservation regions
- Downloadable/shareable urgency infographic per region (for outreach, judges, social media)

### 7.8 Untranslatable Words & Micro-Traditions
- Post-transcription AI pass flags words/phrases/techniques with no clean English/Hindi equivalent
- Card format: native script + phonetic spelling, literal breakdown, contextual explanation, source record link
- "Discovery of the day" featured on Home and shareable as an image card
- Searchable, browsable as its own mini-archive

### 7.9 Contributor Profile & Leaderboard
- Optional sign-in (email, phone OTP, or anonymous session with local recovery key)
- Stats: records contributed, verifications made, regions covered
- Lightweight badge system (e.g. "Voice Keeper," "Community Reviewer," "Regional Steward")
- Regional and national leaderboards (opt-in, anonymizable)
- Anonymous contribution remains fully supported

### 7.10 Cultural Steward Console (scaffolded, light in MVP)
- Region-scoped view of all records and reviewer activity
- Bulk-endorse, flag priority gaps ("no records yet from this critically endangered pocket")
- Not a full admin panel in MVP — read-mostly with lightweight moderation actions

### 7.11 Offline Sync
- All capture flows write to a local queue first; background sync pushes to server when connectivity returns
- Visible, unobtrusive sync status indicator (queued / syncing / synced / failed-retry)
- Conflict handling: last-write-wins on metadata edits, append-only on verification history (never lost)

## 8. Data model (entities)
- **Record**: id, media_type (audio/video/image/text), media_url, thumbnail_url, region_id, category, tags[], speaker_name (optional), speaker_age (optional), visibility, consent_scope, transcription_text, translation_text, summary_text, verification_status, contributor_id (nullable), similarity_hash, created_at, updated_at
- **Region**: id, name, parent_region_id (state→district→village hierarchy), geojson_ref, languages[], crafts[]
- **Language**: id, name, region_ids[], estimated_speakers, average_speaker_age, vitality_status, years_to_critical (projected)
- **Craft**: id, name, region_ids[], estimated_practitioners, vitality_status
- **Contributor**: id, display_name (optional), auth_method, points, badges[], is_steward (bool)
- **Verification**: id, record_id, reviewer_id, submitted_text, action (agree/edit/dispute), created_at
- **UntranslatableEntry**: id, record_id, term, script, phonetic, literal_meaning, explanation
- **ConsentRecord**: id, record_id, consent_version, scopes_granted[], timestamp
- **SyncQueueItem** (client-side only): local_id, payload, status, retry_count

## 9. Non-functional requirements
- Offline-first PWA: installable, service-worker cached shell, background sync for uploads
- Mobile-first responsive, tested against mid-range Android + low bandwidth (2G/3G simulation)
- Accessible: keyboard navigation, WCAG AA contrast, captions/text alternatives for all audio/video
- Performance: first meaningful paint under 3s on 4G; lazy-loaded media; map tiles loaded progressively
- Data integrity: append-only verification history, versioned consent, no destructive overwrites
- Graceful AI degradation: if transcription/translation service fails or is slow, record still saves with "processing" state and retries asynchronously
- Privacy: anonymization toggle enforced at the API layer, not just UI-hidden

## 10. Success criteria for the demo
- A first-time user completes a multi-modal capture end-to-end, unassisted, in under 2 minutes
- One full loop demoed live: offline capture → sync → AI draft → community verification → appears in Atlas with updated vitality stats
- Judges grasp the urgency within 10 seconds of opening the Atlas/Dashboard
- At least one "wow" AI moment live (untranslatable word detection, or auto-summary of a long story)

## 11. Future scope (mention, don't build)
- Voice-preservation/synthesis of an elder's voice, under a strict, revocable consent framework
- Marketplace for artisans linked to documented crafts
- Guru-Shishya mentorship matching between practitioners and learners
- Direct data-sharing partnership with AI4Bharat, Bhashini, or CIIL
- Full knowledge-graph layer connecting languages, crafts, regions, and rituals
- Native mobile apps, multi-language UI beyond English/Hindi
