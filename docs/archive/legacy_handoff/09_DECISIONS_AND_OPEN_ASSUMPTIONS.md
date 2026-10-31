# 09 — Decisions & Open Assumptions

## 1. Product decisions locked for the handoff

| Decision | Current decision | Reason |
|---|---|---|
| Product format | Hybrid: solo + multiplayer | User explicitly wants both |
| First client | Mobile-first responsive web/PWA | One codebase, share links, creator editing, guest voting |
| Core product pillars | Play, Versus, Create, lightweight Community | Clear scope |
| Solo MVP | Daily Connections + Solo Bracket | Fast, low infrastructure, repeatable |
| Multiplayer MVP | Shared async Tournament voting | Low-friction, viral and creator-friendly |
| Friend challenge | Async Grid Duel in release 1.1 | Supports skill-based PvP without realtime complexity |
| Guest participation | Yes for solo and public tournament voting | Reduce friction |
| Accounts | Required for persistent creator ownership/history | Avoid blocking casual participation |
| Realtime | Not required for MVP | Avoid unnecessary complexity |
| Monetization | Not in MVP | Validate engagement first |
| Data | Provider-neutral internal catalogue | Licensing and provider risk |
| Language | Turkish-first, English-ready | Local relevance and future expansion |
| Product name | CINE ARENA working title | No brand clearance |

## 2. Important scope interpretation

“Hybrid” does not mean every game mode launches together.

Hybrid means the first coherent product supports:
- solo play;
- multiplayer participation;
- creator-generated shared competition.

The MVP is deliberately staged:
- R0: solo games and foundations;
- R1: public tournament creation/voting;
- R1.1: async friend Grid Duel.

This is the smallest credible way to serve both solo and multiplayer users without building realtime infrastructure prematurely.

## 3. Assumptions to validate

1. Users want a daily cinema puzzle enough to return.
2. Users will share film brackets with friends.
3. Guest users will vote without creating accounts.
4. Creators will use a cinema-specific tournament editor.
5. Turkish cinema and TV content can attract a meaningful local audience.
6. A mobile-first web app is acceptable before native apps exist.
7. The selected data provider can be licensed at a sustainable cost.

## 4. Open operational decisions

These should be resolved before public launch, not guessed by the coding agent:
- final product name and domain;
- legal entity and privacy policy owner;
- commercial catalogue and image licence;
- initial content reviewer/operator;
- moderation response process;
- deployment and billing account;
- analytics provider and retention policy;
- whether public tournament votes can be changed before close (default recommendation: yes, until close);
- exact tie-break policy (default recommendation: higher seed advances);
- tournament duration (default recommendation: creator chooses from preset windows).

## 5. Recommended defaults

Unless product owner changes them:
- Turkish is the initial UI language.
- English-ready architecture from day one.
- Public tournament participants can vote as guests.
- Guest votes use server-issued opaque sessions and rate limiting.
- Votes can be changed until the matchup closes.
- Higher seed wins a tie, disclosed in rules.
- 8 or 16 entrants for MVP.
- No custom image uploads in MVP.
- No free-text custom entries in public tournaments initially.
- No ELO or ranked ladder in MVP.
- No forced ads.
- No paid advantages.
- PWA first; native apps after validation.

## 6. Product owner validation questions

The following are not blockers for the coding agent's repository audit, but should be answered before the relevant implementation stage:
1. Is the launch audience Turkey-first, or global from day one?
2. Should tournament voting be one shared community bracket or should each participant build a personal bracket? This handoff recommends one shared community bracket for MVP.
3. Should public tournaments be indexed/discoverable, or only accessible by link at first? Recommendation: link-first, with a small curated discovery page later.
4. Should custom text entries be allowed? Recommendation: no in MVP, to reduce moderation and content-rights risk.
5. Which data provider and image licence can the project afford?
