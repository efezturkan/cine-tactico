# CINE-TACTICO — MASTER PROGRESS TRACKER

**Document:** MASTER-PROGRESS.md  
**Last Updated:** 31 October 2026  
**Current Phase:** PHASE 4 — Privacy, Legal & Store Compliance Completed  
**Gate Status:** PHASE 4 Passed (Privacy Policy TR/EN published, /privacy route compiled, local data reset wired, 27/27 tests PASS)  

---

## 1. Phase Gates Summary

| Phase | Description | Gate Requirement | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0** | Repository & Architecture Audit | Baseline Report (`PHASE-00-BASELINE.md`) | **DONE** | Codebase audited, test passing (27/27), clean build (171 kB), baseline committed (`7bcf24f`) |
| **Phase 1 (Data)** | Data & Licensing Feasibility Audit | `CINE-TACTICO-PHASE-1-DATA-FEASIBILITY.md` | **DONE** | 100 kayıt, 97/100 Wikidata eşleşme, lisans matrisi tamamlandı |
| **Phase 2** | Data Normalization & UI Decoupling | `CINE-TACTICO-PHASE-2-IMPLEMENTATION.md` | **DONE** | 97 unique records with verified Wikidata QIDs, 0 dead cells, IMDb purged from UI, typographic cards active, 27/27 tests PASS, build clean |
| **Phase 3A** | Capacitor Compatibility Preflight | `CINE-TACTICO-PHASE-3A-CAPACITOR-PREFLIGHT.md` | **DONE** | Compatibility verified, READY WITH CONDITIONS decision issued |
| **Phase 3B** | Capacitor Integration & Native Builds | `CINE-TACTICO-PHASE-3B-CAPACITOR-INTEGRATION.md` | **DONE** | Capacitor 8.6.0, iOS Simulator build SUCCEEDED with Xcode 26.6, Taptic Engine haptics integrated |
| **Phase 3C** | Simulator & Physical QA | `CINE-TACTICO-PHASE-3C-SIMULATOR-QA.md` | **DONE** | iPhone 16e simulator booted & running (PID:41011), zero tap-delay, overscroll disabled, screenshots captured |
| **Phase 4A** | Privacy & Store Compliance Audit | `CINE-TACTICO-PHASE-4A-PRIVACY-AUDIT.md` | **DONE** | READ-ONLY audit complete, zero data collection confirmed, no user accounts |
| **Phase 4B** | Privacy Policy & Data Control Assets | `CINE-TACTICO-PHASE-4B-PRIVACY-IMPLEMENTATION.md` | **DONE** | Privacy policies (TR/EN), `/privacy` route, local reset button, Xcode build SUCCEEDED |
| **Phase 5** | Store Account & Financial Prep | Owner store accounts & budget ready | **BLOCKED** | Owner action required ($25 Google, $99 Apple) |
| **Phase 6** | Google Play Closed Testing | 12 testers opted-in for 14 days | **BLOCKED** | Awaiting Play Console account & APK/AAB |
| **Phase 7** | Apple TestFlight & App Store | TestFlight build approved & reviewed | **NOT STARTED** | Awaiting Apple Developer account |
| **Phase 8** | Android Production Build | Valid signed AAB (API 36+) | **NOT STARTED** | Pending Phase 1 & 6 |
| **Phase 9** | iOS Production Build | Valid signed `.xcarchive` | **NOT STARTED** | Pending Phase 1 & 7 |
| **Phase 10** | Final Regression & Release Candidate | Release Candidate Report (`v1.0.0-rc1`) | **NOT STARTED** | Pre-launch freeze |
| **Phase 11** | Initial Launch & Monitoring | Live store listing & runbook | **NOT STARTED** | Final phase |

---

## 2. Granular Task Inventory

| Item ID | Task Description | Phase | Status | Verifiable Evidence |
| :--- | :--- | :--- | :--- | :--- |
| T0-01 | Repository structure & dependencies inspection | 0 | **DONE** | `package.json`, Next.js 14.2.15, zero backend deps |
| T0-02 | Static export & Capacitor compatibility check | 0 | **DONE** | 100% client-side React App Router, static page generation |
| T0-03 | Baseline test suite execution | 0 | **DONE** | `npx tsx src/tests/game-engine.test.ts` (27/27 pass) |
| T0-04 | Production build execution | 0 | **DONE** | `npm run build` succeeds (171 kB First Load JS) |
| T0-05 | Compile `PHASE-00-BASELINE.md` | 0 | **DONE** | Complete audit in `docs/launch/PHASE-00-BASELINE.md` |
| T1-01 | Install Capacitor core & CLI dependencies | 1 | **NOT STARTED** | Awaiting Phase 0 gate approval |
| T1-02 | Configure `capacitor.config.ts` & app IDs | 1 | **NOT STARTED** | Reverse-domain ID selection pending |
| T1-03 | Add `@capacitor/ios` and `@capacitor/android` | 1 | **NOT STARTED** | Awaiting Phase 0 gate approval |
| T1-04 | Safe Area Insets & viewport hardening | 1 | **NOT STARTED** | `env(safe-area-inset-top)` / bottom |
| T1-05 | Native Haptics integration (`@capacitor/haptics` fallback) | 1 | **NOT STARTED** | `src/utils/haptics.ts` update |
| T2-01 | 3x3 Grid & Rules verification | 2 | **DONE** | 27 engine tests verified |
| T2-02 | Movie catalog & TMDB data verification | 2 | **DONE** | Local dataset with 50+ movies, verified |
| T2-03 | Shot clock timer & backgrounding safety | 2 | **DONE** | Verified in `useXoxGame.ts` |
| T2-04 | Joker inventory & double spend prevention | 2 | **DONE** | 4 jokers wired and isolated |
| T3-01 | Automated simulation run (10,000 game states) | 3 | **NOT STARTED** | Script to be executed in Phase 3 |
| T3-02 | Physical Android device verification | 3 | **NOT VERIFIED** | Requires physical Android device |
| T3-03 | Physical iOS device verification | 3 | **NOT VERIFIED** | Requires physical iOS device |
| T4-01 | Secret audit (API keys, service roles) | 4 | **DONE** | Zero secrets exposed, zero backend keys required |
| T4-02 | Account deletion / Local profile reset | 4 | **NOT STARTED** | Reset button needed in `ProfileModal.tsx` |
| T4-03 | TMDB branding & attribution notice | 4 | **NOT STARTED** | Official logo and disclaimer text needed |
| T4-04 | Privacy Policy markdown & web URL | 4 | **NOT STARTED** | Draft prepared, GitHub Pages pending |
| T5-01 | Owner Google Play Developer Account setup | 5 | **BLOCKED** | Owner action ($25) |
| T5-02 | Owner Apple Developer Program setup | 5 | **BLOCKED** | Owner action ($99/year) |
| T6-01 | Google 12 tester recruitment (16-18 buffer) | 6 | **BLOCKED** | Owner action |
| T6-02 | Google 14-day continuous closed test run | 6 | **NOT STARTED** | Follows T6-01 |
| T7-01 | TestFlight archive upload & internal testing | 7 | **NOT STARTED** | Follows Phase 1 & 5 |
| T8-01 | Signed AAB generation (Target API 36+) | 8 | **NOT STARTED** | Production build |
| T9-01 | Signed `.xcarchive` generation | 9 | **NOT STARTED** | Production build |
| T10-01 | Release Candidate Report (`v1.0.0-rc1`) | 10 | **NOT STARTED** | Pre-launch checklist |
| T11-01 | App Store & Google Play submission | 11 | **NOT STARTED** | Final submission |
