# 05 — Technical Blueprint

## 1. Technical approach

The implementation should optimize for speed, reliability and maintainability, not theoretical scale.

### Recommended baseline
- Frontend: Next.js + TypeScript.
- UI: a small reusable component system; choose one styling approach and keep it consistent.
- Backend/database/auth: Supabase (PostgreSQL, Auth, Storage, Realtime only where needed).
- Hosting: managed Next.js hosting compatible with the selected deployment target.
- Analytics: PostHog or a lightweight alternative.
- Error monitoring: Sentry or equivalent.
- PWA: manifest, icons, install prompt only where appropriate.

If the existing repository uses a viable stack, audit it and retain it unless there is a clear technical reason to change. Do not rewrite solely to match this recommendation.

## 2. Architecture

Use a modular monolith:
- one application;
- one PostgreSQL database;
- domain modules with clear boundaries;
- server-side game logic;
- no microservices.

Modules:
1. Identity & profiles
2. Media catalogue
3. Content validation
4. Solo game engine
5. Bracket/tournament engine
6. Multiplayer match engine
7. Sharing
8. Moderation/admin
9. Analytics

## 3. Domain model

### Catalogue
- `media` — film, series, episode if needed later;
- `people` — actors, directors, writers and other crew;
- `characters` — fictional roles;
- `media_people` — role/department relationship;
- `media_characters` — character appearances;
- `genres`;
- `media_genres`;
- `aliases` — localized/alternate names;
- `external_ids` — provider identifiers;
- `content_sources` — provider, license, attribution and import metadata.

Avoid creating every possible table up front. Episode-level data can wait unless a game requires it.

### Solo
- `daily_puzzles`;
- `puzzle_items`;
- `puzzle_groups`;
- `solo_sessions`;
- `solo_results`.

Puzzle definitions must be versioned and immutable once published.

### Brackets and tournaments
- `tournaments`;
- `tournament_entries`;
- `tournament_rounds`;
- `tournament_matches`;
- `tournament_participants`;
- `tournament_votes`;
- `tournament_events`.

Separate the tournament definition from each participant's vote. A tournament is one shared competition, not an array of client-side results.

### Grid Duel
- `matches`;
- `match_participants`;
- `match_boards`;
- `board_cells`;
- `match_moves`;
- `valid_answers`;
- `match_events`.

Use a content snapshot or stable references plus a ruleset version so historical results remain interpretable.

### User and operations
- `profiles`;
- `guest_sessions` or equivalent anonymous identity;
- `reports`;
- `moderation_actions`;
- `audit_logs`;
- `analytics_events` only if not handled by external analytics.

## 4. Data provider and licensing

Do not assume TMDB, IMDb or another catalogue can be used commercially without permission.

Before production:
- identify data provider;
- review commercial terms;
- confirm poster/backdrop image rights;
- confirm attribution requirements;
- confirm caching and storage rights;
- confirm deletion/update obligations;
- record licence and source in `content_sources`.

The internal schema must be provider-neutral. External IDs should map into internal canonical IDs.

If licensing is unresolved, use:
- a small manually curated dataset with rights-cleared assets;
- text-only entries where permitted;
- placeholders instead of unlicensed posters.

## 5. Search and normalization

Requirements:
- Turkish and English aliases;
- case-insensitive search;
- Turkish dotted/dotless I normalization;
- Unicode normalization;
- diacritic-tolerant matching where appropriate;
- entity type filters (film, series, person, character);
- duplicate prevention;
- exact match prioritized over fuzzy match.

PostgreSQL options:
- `unaccent`;
- `pg_trgm`;
- full-text search;
- GIN indexes.

Do not accept fuzzy matches as proof of a game answer. Search ranking and answer validation are separate concerns.

## 6. Game engines

### Connections engine
Input: immutable puzzle definition and submitted item IDs.
Server checks:
- exactly four unique items;
- items belong to current puzzle;
- group matches one intended group;
- session is active;
- remaining mistakes > 0.
Output:
- correct group and state, or mistake count and state.
Use deterministic puzzle IDs and ruleset versions.

### Bracket engine
Input: tournament ID, matchup ID, selected entry, participant identity.
Server checks:
- tournament active;
- matchup open;
- participant eligible;
- entry belongs to matchup;
- vote not duplicated;
- vote change policy;
- deadline.
Tournament advancement is computed server-side from stored votes.
Tie rule must be deterministic and visible.

### Grid Duel engine
Input: match ID, cell ID, answer entity ID, idempotency key.
Server checks:
- match active;
- correct player's turn;
- cell unclaimed;
- answer is valid for both criteria;
- answer not used elsewhere;
- turn state and win condition.
Never trust client-provided score or winner.

## 7. API surface (illustrative)

Use server actions or route handlers consistent with the chosen framework. These are logical operations, not a requirement to expose public REST endpoints.

- `GET /api/catalogue/search?q=&type=`
- `GET /api/daily-puzzle`
- `POST /api/solo-sessions`
- `POST /api/solo-sessions/:id/submit`
- `POST /api/tournaments`
- `GET /api/tournaments/:slug`
- `POST /api/tournaments/:id/votes`
- `POST /api/tournaments/:id/publish`
- `POST /api/matches`
- `POST /api/matches/:id/moves`
- `GET /api/matches/:id`

All mutation endpoints require validation, authorization/guest session checks, rate limits and idempotency where duplicate submission is possible.

## 8. Authentication and guest model

Guest:
- can play daily solo puzzle;
- can play a solo bracket;
- can open and vote in public tournaments;
- can join an invite match if the product's anti-abuse policy permits.

Account:
- required to create persistent tournaments;
- required to keep profile and history across devices;
- required for creator management;
- required for future ranked competition.

Guest identity must be protected against trivial duplicate voting. Use a server-issued opaque session token, secure cookie and rate limiting. Do not claim that IP address alone guarantees one person/one vote.

## 9. Security and privacy

- Row Level Security on Supabase tables.
- No service-role key in client bundles.
- Validate all writes on server.
- Rate limit guest voting and match actions.
- Protect creator-only operations.
- Use opaque public slugs, not sequential IDs.
- Do not expose email or private profile fields.
- Minimize collected personal data.
- Add account deletion and data export process before public scale.
- Log moderation and administrative corrections.
- Avoid storing unnecessary location, contacts or device identifiers.

## 10. Realtime and infrastructure

MVP:
- no realtime infrastructure required for shared tournaments; poll or refresh state at sensible intervals;
- Supabase Realtime may be used for small live updates if it materially improves the experience;
- async Grid Duel does not require sockets.

Do not add:
- Redis;
- Socket.IO;
- Kubernetes;
- microservices;
- custom matchmaking service;
- event streaming platform.

Add infrastructure only after measuring a bottleneck.

## 11. Content operations

A minimal admin tool is required for:
- importing/updating catalogue entries;
- reviewing aliases;
- creating/editing Connections puzzles;
- creating curated bracket templates;
- validating Grid Duel boards;
- disabling inaccurate content;
- reviewing reports.

Every competitive content item must have:
- source/provenance;
- reviewed status;
- locale;
- difficulty or category where relevant;
- last-reviewed timestamp;
- reviewer/admin ID where appropriate.

## 12. Observability

Track:
- game start/end;
- puzzle completion;
- mistakes;
- bracket created/published;
- share clicked;
- invite opened;
- participant joined;
- vote cast/changed;
- tournament completed;
- match created/move submitted/match completed;
- errors and rejected submissions.

Do not log raw sensitive data or unnecessary free-text inputs.
