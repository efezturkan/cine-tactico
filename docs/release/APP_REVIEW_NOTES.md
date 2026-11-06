# App Review Notes for Cine-XOX

**App Name:** Cine-XOX  
**Bundle ID:** `com.cinetactico.game`  
**Version:** 1.0.0 (Build 1)  
**Platform:** iPhone (iOS 15.0+), portrait  
**Primary Category:** Games (Subcategories: Trivia / Strategy)  
**Recommended Age Rating:** 4+ (All Questionnaire Items: "No" / "None" — factual film trivia only, no violence, no profanity, no gambling, no unrestricted web browser, no free-form user chat)

---

### Dear Apple App Review Team,

Thank you for reviewing **Cine-XOX**!

Cine-XOX is an original cinematic tactical board game combining 3×3 intersection film trivia with Tic-Tac-Toe strategic placement, dynamic 12-second shot clocks, and fully offline autonomous AI gameplay.

To help you experience the core game value in the shortest possible time, this guide is divided into:
- **Part 1:** Quick Core Loop (Playable in under 1 minute, no sign-up required)
- **Part 2:** Additional Feature Verification (Offline Mode, Daily XOX, Account Deletion, Licenses & Attributions, Multiplayer Room, Language Switch)
- **Part 3:** Asset, Licensing & Privacy Verification (Guidelines 5.1.1(v) & 5.2)

---

## PART 1: QUICK CORE VALUE EXPERIENCE (< 60 SECONDS)

### Instant Play vs Autonomous AI Bot (No Sign-Up Required)
1. Launch **Cine-XOX**.
2. The app operates immediately with a local/anonymous guest session. **No registration, email address, phone number, or password is required to play.**
3. On the home lobby (**"Gişe"**), tap the primary gold button: **"DÜELLOYA GİR" / "ENTER DUEL"** (or open the **"Vizyondakiler" / "Now Showing"** tab and pick a mode).
4. A **"Rakibini Seç" / "Choose Your Opponent"** sheet lists three offline AI opponents (Easy, Medium, Hard) with rating and play style. Tap any one; the match starts after a short countdown. These are on-device bots, not other users.
5. **How to play a move:**
   - Tap any unoccupied cell on the 3×3 board.
   - Each cell represents the intersection of a **Row criterion** (e.g., *Christopher Nolan*) and a **Column criterion** (e.g., *Sci-Fi* or *Leonardo DiCaprio*).
   - In the search modal, type at least 2 characters (e.g., *"Inception"* or *"Oppenheimer"*), or tap the hint button if needed.
   - Tap a valid movie from the list to seal the cell with your mark (**X**).
6. **Observe the Bot & Tactical Rules:**
   - Notice the **12-second shot clock** ticking down on each turn.
   - The AI Bot immediately calculates a counter-move and marks a cell with (**O**), attempting to block your lines.
   - **Win condition:** First player to form a 3-in-a-row line (horizontal, vertical, or diagonal) wins immediately. If a cell becomes mathematically impossible or all 9 cells fill without a line, the engine resolves via Golden Reel / Tie-break rules.

---

## PART 2: ADDITIONAL TEST FLOWS & COMPLIANCE VERIFICATION

### Flow 1: Offline / Airplane Mode Verification (Guideline 4.2)
1. Turn on **Airplane Mode** on your iOS test device (disable both Wi-Fi and Cellular data).
2. Launch or return to Cine-XOX.
3. Start a game against the AI Bot via **"DÜELLOYA GİR" / "ENTER DUEL"** or play **"Günün XOX'u" / "Daily XOX"**.
4. **Behavior:** The entire curated movie/actor verification graph, daily board generator, and AI bot engine are bundled locally and run 100% client-side without internet access.

### Flow 2: Daily Challenge Flow ("Günün XOX'u" / "Daily XOX")
1. On the home lobby, tap the **"Günün XOX'u" / "Daily XOX"** card (or the **Flame / Streak icon** in the top bar).
2. The daily 3×3 board is deterministically selected for the current UTC date.
3. Complete the match to record your daily streak locally and generate a shareable scorecard.

### Flow 3: Data & Account (Guideline 5.1.1)
Version 1.0 has **no accounts, no sign-in, and no server communication**. All data (nickname, avatar, bot match history) stays on the device. Profile > "Reset Local Data" erases it; uninstalling removes everything.

### Flow 4: In-App Creative Commons Licenses & Attributions (Guideline 5.2)
1. On the home lobby, tap the **Settings (Gear icon)** at the top right.
2. Tap **"Lisanslar & Görsel Atıfları" / "Licenses & Attributions"**.
3. **Behavior:** Expands the full attribution list for all 11 Wikimedia Commons portraits bundled in the app, displaying each work's title, author, clickable Wikimedia Commons source URL, clickable Creative Commons license URL (`CC BY 2.0`, `CC BY-SA 2.0`, `CC BY-SA 3.0`, `CC BY 4.0`, `CC BY-SA 4.0`), and the modification notice (*cropped and resized to 160×160 pixels*).

### Flow 5: Language Switching (TR / EN)
1. Open **Settings (Gear icon)** at the top right of the lobby.
2. Next to **"Dil / Language"**, tap **TR** or **EN**.
3. **Behavior:** All UI menus, board titles, criteria labels, bot rank titles, Settings panels, and Account Deletion dialogs switch immediately between Turkish and English.

### Flow 6: Online Multiplayer
Not included in version 1.0. It is disabled behind a feature flag and will be announced in a future update.

---

## PART 3: ASSET & INTELLECTUAL PROPERTY SUMMARY (GUIDELINE 5.2)

- **Zero Copyrighted Posters:** Cine-XOX bundles **0 movie posters** or studio promotional stills, and connects to **0 external image CDNs** (no IMDb/TMDb poster URLs). All movies are rendered using typographic cards and vector icons.
- **11 Open-Licensed Portraits:** All 11 actor/director portraits in `/assets/portraits/` are verified open-licensed works from **Wikimedia Commons** (`CC BY 2.0`, `CC BY-SA 2.0`, `CC BY-SA 3.0`, `CC BY 4.0`, `CC BY-SA 4.0`), attributed both in `public/assets/portraits/pilot_manifest.json` and in-app under **Settings → Licenses & Attributions**.
- **Factual Trivia Metadata:** Film titles, release years, directors, and cast intersections are factual historical metadata cross-referenced with public Wikidata Q-IDs.

---

## CONTACT INFORMATION

If you have any questions during review:
- **Lead Developer:** Efe Öztürkan
- **Email:** `efezturkan@gmail.com`

Thank you for your time and review!
