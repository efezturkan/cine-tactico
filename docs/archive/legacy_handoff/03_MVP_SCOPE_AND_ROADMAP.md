# 03 — MVP Scope & Delivery Roadmap

## 1. Scope philosophy

MVP means the smallest coherent product that proves both:
- people enjoy playing alone;
- people invite others or participate in shared competition.

It does not mean a clickable prototype with no real rules. Nor does it mean implementing every future idea.

## 2. Release plan

### Release 0 — Foundation / internal prototype
Goal: prove catalogue, rules and navigation before multiplayer complexity.

Include:
- responsive web app / PWA shell;
- Turkish UI;
- guest session;
- basic account sign-in;
- catalogue search;
- curated content ingestion;
- Daily Connections playable end-to-end;
- Solo Bracket playable end-to-end;
- result screen and share image/page;
- basic analytics events;
- admin-only content management (minimal).

Exit criteria:
- 20+ curated Connections puzzles tested;
- 10+ ready-made brackets/templates;
- no known wrong answers in acceptance set;
- core flows work on mobile Safari and Chrome;
- share links open correctly;
- analytics events verified.

### Release 1 — Public MVP
Goal: add real sharing and multiplayer participation.

Include:
- public tournament creation;
- curated templates;
- public/unlisted/private visibility;
- shareable tournament link;
- guest voting;
- one vote per participant per matchup;
- tournament progression and tie rules;
- creator management page;
- basic report tournament / report content;
- profile for registered creators;
- basic results and share card.

Exit criteria:
- a guest can create no tournament but can join and vote;
- creator can publish and share a tournament;
- duplicate votes are rejected;
- tie rules are deterministic;
- tournament results are reproducible from stored votes;
- creator cannot alter entrants after voting begins;
- basic abuse controls are active.

### Release 1.1 — Friend Grid Duel (asynchronous)
Goal: introduce skill-based direct competition without realtime complexity.

Include:
- invite-based 1v1;
- prevalidated 3x3 board;
- turn-based moves;
- answer validation;
- move history;
- turn notifications (in-app first; push/email optional);
- win/loss/draw result;
- rematch.

Release gate:
- content team can generate and validate boards with enough valid answers;
- answer validation tests cover aliases and ambiguity;
- server-authoritative state and idempotency implemented.

If these gates fail, do not delay Release 1. Ship Grid Duel in 1.1.

### Release 2 — Retention and creator improvements
Potential additions:
- Connections practice archive;
- daily streak;
- user-created custom bracket entries;
- tournament scheduling;
- creator room with live audience voting;
- OBS browser overlay;
- English localization;
- simple follows/friends;
- profile achievements.

Prioritize only after usage data.

### Release 3 — Competitive expansion
Potential additions:
- realtime Grid Battle;
- ranked rating;
- seasons;
- 2v2;
- Six Degrees;
- Casting;
- creator analytics;
- monetization.

## 3. MVP feature matrix

| Feature | R0 | R1 | R1.1 | Later |
|---|---:|---:|---:|---:|
| Guest session | ✓ | ✓ | ✓ | |
| Registration/sign-in | basic | ✓ | ✓ | |
| Catalogue search | ✓ | ✓ | ✓ | |
| Daily Connections | ✓ | ✓ | ✓ | |
| Solo Bracket | ✓ | ✓ | ✓ | |
| Public tournament creator | | ✓ | ✓ | |
| Guest tournament voting | | ✓ | ✓ | |
| Tournament share page | basic | ✓ | ✓ | |
| Creator profile | | basic | basic | |
| Async Grid Duel | | | ✓ | |
| Realtime Grid Battle | | | | ✓ |
| Six Degrees | | | | ✓ |
| Casting | | | | ✓ |
| Tier List editor | | | | ✓ |
| Live audience room | | | | ✓ |
| OBS overlay | | | | ✓ |
| Cards/economy | | | | experimental |
| 2v2 / clans / leagues | | | | experimental |

## 4. What is explicitly excluded from MVP

- Native iOS and Android applications;
- Twitch/YouTube chat API;
- realtime matchmaking;
- global leaderboard;
- ELO;
- coins, gems, energy and loot boxes;
- subscriptions and ads;
- AI-generated question content;
- reviews, comments and direct messages;
- user-uploaded posters;
- arbitrary custom text tournaments;
- advanced profile customization;
- social feed;
- multi-region deployment;
- Redis and microservices.

A mobile-first PWA is the recommended first client. If the project already has a stable native codebase, the coding agent must inspect it before proposing a rewrite. Do not assume a greenfield project without inspecting the repository.

## 5. Delivery stages and gates

### Stage A — Repository and product audit
- inspect current repo, branches, dependencies, routes, assets, tests and deployment;
- identify reusable code;
- report technical debt and security concerns;
- do not delete or rewrite before an audit;
- produce an implementation plan.

### Stage B — Data and content foundation
- decide licensed data provider;
- build canonical internal media/person/character entities;
- ingest a small curated dataset;
- support aliases and Turkish search;
- build admin validation tools;
- record source and license metadata.

### Stage C — Solo core
- PWA shell;
- guest identity;
- Connections engine;
- Solo Bracket engine;
- results and sharing;
- analytics.

### Stage D — Tournament multiplayer
- tournament creation;
- participant sessions;
- voting;
- deterministic bracket advancement;
- creator controls;
- reporting and rate limits.

### Stage E — Beta hardening
- device/browser testing;
- accessibility;
- analytics review;
- security review;
- content QA;
- performance and error monitoring.

### Stage F — Grid Duel 1.1
- prevalidated board generation;
- server-authoritative turns;
- answer validation;
- rematch and notification.

## 6. Prioritization method

Use:
- user value;
- validation value;
- implementation cost;
- content/licensing dependency;
- operational risk.

A feature is not prioritized because a competitor has it. It must support a validated user job or improve the core loop.

## 7. Launch metrics

North-star candidate: **weekly completed play sessions per active user**, with solo and multiplayer reported separately.

Core metrics:
- activation: first game started and completed;
- solo completion rate;
- tournament creation completion;
- tournament share rate;
- invite-to-join conversion;
- vote completion;
- tournament completion;
- D1/D7 retention;
- sessions per active user;
- median time-to-first-play;
- error and abandonment rate.

Do not set arbitrary industry benchmarks. Establish a baseline in closed beta, then set targets.
