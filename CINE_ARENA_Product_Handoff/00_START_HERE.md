# CINE ARENA — Coding Agent Handoff

**Document set:** Product & implementation baseline  
**Version:** 1.0  
**Status:** Ready for technical discovery and implementation planning  
**Product codename:** CINE ARENA (working title; trademark/domain clearance not completed)  
**Date:** 30 October 2026

## What this project is

CINE ARENA is a lightweight, social game platform built around films, series, actors, directors, characters and cinema culture. It combines:

1. **Single-player play** — short, repeatable puzzles and personal challenges.
2. **Multiplayer competition** — head-to-head play and shared tournaments.
3. **Creator/community play** — users create and share film/series tournaments that others can join through a link.

It is not intended to become a full film social network, streaming guide, review database or collectible-card economy in its first release.

## Product principle

> Simple as fuck: one clear action per screen, fast time-to-fun, minimal setup, reusable game engines, no feature for feature's sake.

Build the smallest coherent product that supports both solo play and multiplayer participation. Keep the architecture extensible, but do not implement speculative infrastructure.

## Read in this order

1. `01_PRODUCT_VISION_AND_PRINCIPLES.md` — vision, audience, positioning and non-goals.
2. `02_GAME_DESIGN.md` — single-player and multiplayer modes, rules and loops.
3. `03_MVP_SCOPE_AND_ROADMAP.md` — exact release scope and implementation stages.
4. `04_UX_AND_CONTENT_DESIGN.md` — navigation, screen flows, content and design direction.
5. `05_TECHNICAL_BLUEPRINT.md` — recommended architecture, data model and APIs.
6. `06_MARKET_AND_COMPETITIVE_LANDSCAPE.md` — competitor findings and positioning.
7. `07_RISK_REGISTER_AND_ACCEPTANCE.md` — risks, mitigations and acceptance criteria.
8. `08_CODING_AGENT_BRIEF.md` — execution instructions for the coding agent.
9. `09_DECISIONS_AND_OPEN_ASSUMPTIONS.md` — decisions already made and items requiring validation.

## Non-negotiable implementation rules

- Do not silently expand scope.
- Do not build every mode in this document in the MVP. The roadmap explicitly separates MVP, post-MVP and later ideas.
- Do not invent film facts, cast relationships, aliases, ratings, release dates or user counts.
- Do not treat TMDB or IMDb data/images as automatically cleared for commercial use. Licensing must be resolved before public commercial launch.
- Keep game rules server-authoritative where scores, rankings or shared results matter.
- Guest participation must be possible for public share links wherever practical. Ask for account creation only when saving progress, creating persistent content or using social features.
- Use one responsive application first. Do not build separate mobile and web products before validation.
- Prefer a managed backend and simple deployment. No Redis, Kubernetes, microservices or custom realtime infrastructure unless measured need proves it.
- All game modes must have deterministic rules, test fixtures and a content validation path.
- Accessibility, loading, empty, error and reconnect states are product requirements, not polish.
- Keep Turkish as the launch language, but design data and UI for English localization.
- Use the product name as a placeholder. Do not spend time on branding or logo exploration before product validation.

## MVP in one sentence

A user can play a short solo cinema puzzle, create or join a shareable film/series knockout tournament, and challenge a friend to a simple asynchronous or live match without needing a complicated account setup. 


## Definition of success

The first release is successful if real users can:
- understand the product without explanation;
- finish a solo game;
- create and share a tournament;
- join a shared tournament from a link;
- complete a multiplayer challenge;
- return for another session.

Do not use downloads or registrations alone as proof of product-market fit. Measure completed games, repeat play, shares and invited-player conversion.

Attention: the game will be a resmble of the play which is called XOX also called and known as "tick tack toe". U can search on ınternet or ask me everythıng