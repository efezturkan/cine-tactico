# CINE-TACTICO — MASTER MVP TO STORE LAUNCH EXECUTION PLAN

**Document:** CT-LAUNCH-MASTER  
**Version:** 3.0  
**Date:** 31 October 2026  
**Objective:** Existing Project → Verified Mobile MVP → Real Device Testing → App Store & Google Play Release  
**Primary Agent:** Antigravity  
**Human Owner:** Project Owner  
**Budget Philosophy:** Minimum viable expenditure. No unnecessary subscriptions, paid services, infrastructure or tooling.

---

# 0. EXECUTION MANDATE

You are the technical lead, mobile integration engineer, QA engineer and release engineer responsible for preparing the existing Cine-Tactico project for its first public mobile release.

Your responsibility is NOT to redesign the game, create a new application, expand its feature set or replace its existing architecture without justification.

Your responsibility is to take the existing codebase, understand it, identify what is incomplete, make the minimum necessary changes, test the actual product and prepare production-ready iOS and Android builds.

The final objective is:

1. A functioning mobile game.
2. A stable and tested MVP.
3. An Android App Bundle ready for Google Play.
4. An iOS archive ready for App Store Connect.
5. Completed store listing and compliance materials.
6. A documented release and maintenance procedure.

## 0.1 Absolute rules

These rules override all other instructions.

- Never start a new project when an existing project is available.
- Never replace working code just because you prefer another implementation.
- Never rewrite the application in React Native, Flutter or another framework.
- Never migrate the backend without a demonstrated technical necessity.
- Never introduce a paid service or subscription without explicit owner approval.
- Never purchase a domain, API, plugin, license or third-party service.
- Never introduce advertisements, IAP, subscriptions or other monetization features into the MVP unless they already exist and have been explicitly approved.
- Never invent game mechanics, scoring rules, game modes or business requirements.
- Never use mock data as evidence that a production feature works.
- Never hardcode API secrets, private keys, signing credentials or passwords.
- Never delete existing data, migrations, assets or functionality without documented justification and approval.
- Never silently disable an existing feature to make a test pass.
- Never mark a task complete without verifiable evidence.
- Never claim that a build works without actually building it.
- Never claim that an application is store-approved before the relevant platform has approved it.

## 0.2 Decision hierarchy

When making decisions, follow this order:

1. Existing working project behavior.
2. Existing project documentation and established architecture.
3. This execution plan.
4. Official Apple, Google, Capacitor and relevant API documentation.
5. Minimum-risk engineering judgment.

If something is unknown, investigate it.  
If something cannot be verified, mark it UNKNOWN.  
If a requirement cannot be fulfilled, mark it BLOCKED.  
Do not silently turn UNKNOWN or BLOCKED into DONE.

## 0.3 Execution style

Work in controlled phases.

Each phase must have:
- Objective.
- Tasks.
- Expected deliverables.
- Tests.
- Acceptance criteria.
- Completion report.

Do not proceed to the next phase if a critical acceptance criterion fails.  
You may continue independent, non-destructive work while another item is blocked, but you must never bypass a release-critical gate.  
Do not repeatedly ask the owner questions about matters that can be discovered from the repository, official documentation or existing configuration.  
Ask the owner only when a real business, financial, legal or irreversible decision is required.

---

# 1. PRODUCT SCOPE FREEZE

Before touching the code, establish exactly what Cine-Tactico currently is.  
The existing game is the source of truth.  
Do not change its identity or gameplay while preparing the mobile MVP.

## 1.1 MVP feature inventory

Inspect and classify every existing feature:
- Main menu and navigation.
- Quick Play.
- AI opponent and difficulty selection.
- Matchmaking or match initialization.
- 3x3 game board.
- Movie selection and rating comparison.
- Turn management.
- 20-second shot clock.
- AI decision and response.
- Victory and defeat screens.
- Joker inventory.
- Time Freeze (+15 seconds).
- Hint.
- Bomb.
- Surrender and match termination.
- Career statistics and win/loss records.
- Pass & Play, if implemented.
- Existing player profiles and local persistence.
- Existing multiplayer features, if implemented.
- TMDB integration and movie catalogue.
- Existing sound, animation and visual feedback.

Status labels: `DONE`, `PARTIAL`, `BROKEN`, `MISSING`, `NOT MVP`, `BLOCKED`.

## 1.2 MVP definition

Priorities:
- **P0 — Release critical:** App opens, navigation, core loop, AI opponent, movie selection, timer, game termination, result persistence, zero critical crashes, zero blocking UI issues, store compliance.
- **P1 — Existing supporting features:** Joker functionality, profile/stats, sound/haptic, offline support, existing extra modes.
- **P2 — Post-launch:** New modes, advanced multiplayer, social, leaderboards, achievements, monetization expansion, new cosmetic systems, major UI redesign. (Frozen, must not delay MVP).

## Locked Decisions:
1. İlk sürümde para kazanma sistemini (IAP, reklam SDK, rewarded ads) ertele.
2. Multiplayer kapsamını büyütme (mevcut yerel/simüle mekanizmayı koru).
3. Capacitor'a geçmeden önce Next.js uyumluluk denetimini tamamla.
4. Gerçek cihaz testi olmadan yayınlama.
5. TMDB ticari kullanım lisansını unutma; non-commercial attribution ve logo kurallarını tam uygula.
