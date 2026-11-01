---
name: cine-core
description: Changes Cine-XOX game rules, win detection, golden reel, bot AI, validation, or shot-clock logic. Use when editing src/core or game-engine tests.
---

# Core loop

Work only in `src/core/**` plus `src/tests/game-engine.test.ts` (and anti-cheat tests if search/validation changes).

Order:

1. Quote the spec clause you are implementing (line win, lock, golden reel, rarity, reuse ban, ters kadraj scoring).
2. Change the pure function. Keep UI out.
3. Add a failing-then-passing test for the edge case.
4. Run `npm test`.

Bot AI (`bot-ai.ts`) may block wins and take wins. Thinking delay stays; do not make the bot omniscient on the first frame.
