# 07 — Risk Register & Acceptance Criteria

## 1. Highest risks

| Risk | Severity | Likelihood | Mitigation / release gate |
|---|---|---|---|
| Catalogue licensing and poster rights | Critical | Medium-high | Resolve commercial rights before public monetized launch; provider-neutral schema; rights-cleared fallback |
| Incorrect or ambiguous trivia answers | Critical | High | Curated content, provenance, reviewer status, immutable puzzle versions, automated tests |
| Scope creep | High | High | MVP feature matrix; no unapproved features; stage gates |
| Weak retention | High | High | Measure completion and D1/D7; improve core loop before adding modes |
| No network effect at launch | High | Medium-high | Guest-first links, curated templates, seed creator partnerships |
| Duplicate/abusive tournament votes | High | Medium | Session tokens, rate limits, idempotency, abuse monitoring; do not promise perfect one-person-one-vote |
| Multiplayer state desync | High | Medium | Server-authoritative state, transaction boundaries, event log, retry-safe APIs |
| Grid board has no valid answers | High | High | Prevalidate all cells; only generate from verified intersections; defer release if content insufficient |
| Turkish search/alias failures | Medium-high | Medium | Unicode normalization, aliases, language tests, manual review |
| Low-quality user-generated content | Medium-high | Medium | Reports, visibility controls, moderation queue, rate limits |
| Data provider changes terms | High | Medium | Provider abstraction, source metadata, migration strategy |
| Privacy/security issue | Critical | Medium | RLS, server validation, minimal data, security review |
| Competitors copy or already own feature | Medium | High | Differentiate through execution, local content, creator workflow and distribution |

## 2. Licensing gate

Before public commercial release, document:
- provider and exact plan;
- commercial-use permission;
- poster/backdrop permission;
- attribution requirements;
- caching/storage limits;
- allowed derivatives;
- takedown/deletion obligations;
- cost and rate limits.

TMDB is not automatically free for commercial use. IMDb's public datasets are not a general commercial data licence. Do not use either source as though all assets and records are cleared.

## 3. Content quality gate

For Connections:
- each puzzle has 16 unique items;
- four groups of four;
- each item belongs to exactly one intended group;
- group definitions are unambiguous;
- no duplicate or accidental alternate solution;
- Turkish/English labels reviewed;
- solution explanation available after completion.

For brackets:
- entrants are valid catalogue records or approved custom text entries;
- duplicate entrants rejected;
- minimum/maximum size enforced;
- seeded bracket deterministic;
- tie policy visible;
- result reproducible.

For Grid Duel:
- every cell has enough valid answers;
- answer IDs map to canonical entities;
- aliases do not create false positives;
- duplicate answer rules enforced;
- board has no impossible intersections;
- board generation test suite passes.

## 4. Security acceptance

- no privileged service key in browser;
- all writes validated server-side;
- RLS enabled and tested;
- creator-only actions require ownership;
- guest tokens are unguessable and protected;
- rate limiting on votes, submissions and search;
- idempotency for vote and move submissions;
- audit trail for admin changes;
- no private user data in public pages;
- account deletion procedure documented.

## 5. UX acceptance

- first-time user can start a solo game without account;
- public tournament can be opened and voted on without install;
- every mode explains rules before play;
- loading, empty, error and offline states are designed;
- tap targets are mobile-friendly;
- keyboard navigation works for desktop;
- screen-reader labels exist for interactive controls;
- image failure does not block play;
- share URL and social preview work.

## 6. Analytics acceptance

Events:
- `session_started`
- `solo_game_started`
- `solo_game_completed`
- `connections_mistake`
- `bracket_started`
- `bracket_completed`
- `tournament_created`
- `tournament_published`
- `tournament_link_shared`
- `tournament_opened`
- `tournament_vote_cast`
- `tournament_completed`
- `grid_match_created`
- `grid_match_joined`
- `grid_move_submitted`
- `grid_match_completed`
- `account_created`

Every event should include mode, locale, platform and relevant content ID, but no unnecessary personal data.

## 7. Beta release checklist

- [ ] Repository audit completed
- [ ] Licensing decision documented
- [ ] Catalogue source metadata implemented
- [ ] 20+ reviewed Connections puzzles
- [ ] 10+ reviewed bracket templates
- [ ] Core flows tested on iOS Safari, Android Chrome and desktop Chrome
- [ ] Guest session and account flows tested
- [ ] RLS and authorization tests pass
- [ ] Duplicate vote and retry tests pass
- [ ] Content report flow works
- [ ] Analytics verified
- [ ] Error monitoring active
- [ ] Backup and restore procedure known
- [ ] Privacy policy and terms reviewed by appropriate counsel
- [ ] No critical/high unresolved security issue
