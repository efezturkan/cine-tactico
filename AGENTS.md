# Cine-XOX Studio

This repo is a **cinephile tactical XOX** game (Cine-XOX / FİLMSEL / cine-tactico), not a Unity hypercasual template.

Stack: Next.js 14 static export, React 18, TypeScript, Tailwind, Capacitor 8 (iOS/Android), Supabase Realtime.

You are the studio. Stay small: one mechanic at a time, spec before code, tests after engine changes.

## Constitution

1. `MASTER_SPECIFICATION_v3.md` wins on rules. Do not reintroduce cell stealing.
2. `docs/design/DESIGN.md` (CineXOX Tasarım Anayasası) wins on UI, aesthetics, feel, and language. Read before UI work.
3. Offline bot must keep working without network. Do not add same-phone pass-and-play.
4. Multiplayer uses the same `src/core` engine as single player.
5. Cosmetics never grant competitive advantage.
6. No IMDb/TMDb licensed fields or poster CDNs. Provenance lives on movie data.
7. Do not rebuild the reel modal, shot clock, or board structure (3x3 cells + criteria header row/column).

## Where to work

| Change | Path |
|---|---|
| Rules, win check, golden reel, deadlock | `src/core/engine/` |
| Types | `src/core/types/` |
| Boards, movies, actors | `src/data/` |
| Session UI | `src/features/gameplay/` |
| Rooms / realtime | `src/features/multiplayer/` |
| Profile, shop, quests | `src/features/profile/` |
| Shared chrome | `src/components/` |
| Tests | `src/tests/` |
| Schema / RLS | `supabase/` |

## Session start

Read `project.yaml`, then `docs/product/MVP_SCOPE.md`. Skills: `cine-core`, `cine-content`. Feel and store rules live in `.cursor/rules/mvp-ship.mdc`.

## Done means

- `npx tsc --noEmit` clean for TS edits
- `npm test` green after engine, data, or anti-cheat edits
- Do not expand scope into ads/IAP unless asked
- iOS simulator is a bundled build, not live: after UI changes run `npm run ios:sim` (web build → `cap sync` → Xcode build → install → launch). Never run `next build` while `next dev` runs (shared `.next`).
