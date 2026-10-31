# 08 — Coding Agent Brief

You are implementing CINE ARENA based on this document set. Your job is to inspect the existing project, propose a staged plan, and implement only the agreed stage.

## 1. First response required from the agent

Before changing code:
1. inspect the repository structure;
2. identify framework, runtime, package manager and deployment;
3. inspect routes, components, database schema, auth, assets and tests;
4. identify incomplete, duplicated or dead code;
5. identify security issues and secrets exposure;
6. identify what can be reused;
7. report a concise audit and proposed plan.

Do not delete files, reset databases, rewrite the app or change the stack before this audit.

## 2. Product rules

- Read all project documents.
- `03_MVP_SCOPE_AND_ROADMAP.md` is the authority for feature scope.
- `02_GAME_DESIGN.md` is the authority for gameplay rules.
- `05_TECHNICAL_BLUEPRINT.md` is the recommended technical baseline.
- If documents conflict, stop and report the conflict. Do not guess.
- Do not add features because they seem useful.
- Do not invent sample film data and present it as verified production content.
- Seed data must be clearly marked as demo data.
- No commercial data/image source may be assumed licensed.

## 3. Implementation approach

Work in small, reviewable stages:
1. audit;
2. architecture and schema proposal;
3. data/content foundation;
4. solo gameplay;
5. tournament creation and voting;
6. beta hardening;
7. async Grid Duel.

At the end of each stage:
- list files changed;
- explain behavior added;
- list migrations;
- list tests added and results;
- list known issues;
- list manual verification steps;
- do not begin the next stage without approval.

## 4. Engineering requirements

- TypeScript strict mode where feasible.
- Keep domain logic out of UI components.
- Server-authoritative validation for all competitive state.
- Validate all input schemas.
- Use database constraints for uniqueness and invariants.
- Use transactions for state transitions.
- Use idempotency for retryable mutations.
- Use RLS and test policies.
- Avoid client-side secrets.
- Keep external data provider behind an adapter.
- Add tests for rules and edge cases.
- Use accessible controls and semantic HTML.
- Design loading, error, empty and offline states.
- Do not overabstract simple features.

## 5. Required tests

### Connections
- valid group accepted;
- invalid group rejected;
- duplicate item rejected;
- wrong puzzle/session rejected;
- exhausted mistakes prevents further moves;
- completed session cannot be modified;
- repeated request is idempotent.

### Bracket
- creator authorization;
- entrant count and duplicate validation;
- vote eligibility;
- duplicate vote rejection;
- vote change policy;
- closed matchup rejection;
- deterministic tie;
- deterministic advancement;
- creator cannot edit entrants after voting begins;
- concurrent votes do not corrupt totals.

### Grid Duel (when implemented)
- wrong turn rejected;
- occupied cell rejected;
- invalid answer rejected with reason;
- alias maps to canonical entity;
- reused answer rejected;
- duplicate request idempotent;
- win/draw calculation correct;
- reconnect returns canonical state.

## 6. Definition of done

A feature is not done when it merely renders.

It is done when:
- its user flow works end-to-end;
- validation and authorization work;
- edge cases are tested;
- analytics are emitted;
- error states are handled;
- mobile and desktop layouts are usable;
- no critical console/server errors remain;
- documentation is updated.

## 7. Agent must not

- introduce Redis, Socket.IO, Kubernetes or microservices without measured need;
- build native apps as part of the first stage;
- add coins, gems, energy, loot boxes or paid power-ups;
- add AI-generated questions without human review;
- use scraped copyrighted posters or images;
- fabricate user counts, ratings or film facts;
- implement ELO before enough competitive match volume exists;
- turn the product into a film review/social network;
- change game rules without updating tests and documentation.

## 8. Deliverables from the agent

At each stage provide:
- implementation summary;
- architecture/schema changes;
- migration instructions;
- test report;
- known risks;
- screenshots or short demo where useful;
- next-stage proposal.

The agent should optimize for a maintainable, working MVP, not maximum code volume.
