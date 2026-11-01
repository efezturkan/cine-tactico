---
name: cine-content
description: Adds or audits movies, boards, actors, aliases, and axis solvability for Cine-XOX. Use when expanding the catalog, themes, or answer pools.
---

# Content

1. Read `docs/architecture/DATA_GOVERNANCE.md` before adding titles.
2. Edit `src/data/movies.ts`, `boards.ts`, and/or `actors.ts`.
3. Each new cell intersection must have ≥ 3 valid answers.
4. Record provenance. No IMDb/TMDb scrape, no poster URLs from those CDNs.
5. Run `npm test` (board solvability + anti-cheat).

Theme pool for Sinefil Konsept is the 14 cult themes in the master spec. Do not invent a 15th theme unless asked.
