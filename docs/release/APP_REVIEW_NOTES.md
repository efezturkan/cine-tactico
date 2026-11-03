# App Review Notes for Cine-XOX

**App Name:** Cine-XOX  
**Bundle ID:** `com.cinetactico.game`  
**Version:** 1.0.0 (Build 1)  
**Platform:** iOS / iPadOS (Universal)  
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
3. On the home lobby (**"Gişe"**), tap the primary gold button: **"DÜELLOYA GİR" / "ENTER DUEL"** (or select any mode card such as **"Klasik Düello" / "Classic Duel"**, **"Ters Köşe"**, or **"Konsept"**).
4. You are immediately placed into a 3×3 match against the offline AI Cinephile Bot.
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

### Flow 3: Guideline 5.1.1(v) Account & Data Deletion
1. From the home screen, tap the bottom navigation tab: **"Profil" / "Profile"** (or tap your profile badge in the top bar).
2. Scroll down to the **"Veri ve Gizlilik" / "Data & Privacy"** section near the bottom of the Profile view.
3. Two distinct controls are provided:
   - **"Yerel Sıfırla" / "Reset Local":** Clears local device storage (`localStorage` match history, ambience settings, and UI hints) while keeping any server profile intact.
   - **"Hesabı Sil" / "Delete Account":** Opens the destructive confirmation modal. Tap **"Hesabı Kalıcı Olarak Sil" / "Permanently Delete Account"**.
4. **Behavior of Account Deletion:**
   - Executes the server-side `public.delete_user_account()` RPC (`SECURITY DEFINER`), which permanently deletes the caller's `auth.users` record, `public.profiles` row (`ON DELETE CASCADE`), waiting/abandoned `public.game_rooms`, and `public.room_moves` (`ON DELETE CASCADE`), while unlinking (`ON DELETE SET NULL`) the user's UUID from completed `public.match_sessions` records so opponents' match histories are not broken.
   - Signs out the active Supabase session, purges all local `cinexox_*`, `cinetactico_*`, and `sb-*` storage keys, and reloads the app into a clean initial state.

### Flow 4: In-App Creative Commons Licenses & Attributions (Guideline 5.2)
1. On the home lobby, tap the **Settings (Gear icon)** at the top right.
2. Tap **"Lisanslar & Görsel Atıfları" / "Licenses & Attributions"**.
3. **Behavior:** Expands the full attribution list for all 11 Wikimedia Commons portraits bundled in the app, displaying each work's title, author, clickable Wikimedia Commons source URL, clickable Creative Commons license URL (`CC BY 2.0`, `CC BY-SA 2.0`, `CC BY-SA 3.0`, `CC BY 4.0`, `CC BY-SA 4.0`), and the modification notice (*cropped and resized to 160×160 pixels*).

### Flow 5: Language Switching (TR / EN)
1. Open **Settings (Gear icon)** at the top right of the lobby.
2. Next to **"Dil / Language"**, tap **TR** or **EN**.
3. **Behavior:** All UI menus, board titles, criteria labels, bot rank titles, Settings panels, and Account Deletion dialogs switch immediately between Turkish and English.

### Flow 6: Real-Time Multiplayer Room (Network-Dependent — Requires 2 Devices)
> **Note for Reviewers:** Custom Room multiplayer synchronization requires an active internet connection and two concurrent sessions (e.g., two devices, or one iOS device and `https://cine-tactico.vercel.app/`).
1. On **Device A**:
   - Tap **"Özel Oda" / "Custom Room"** on the lobby (or **"Gösterim"** in the bottom bar).
   - Tap **"Oda Oluştur" / "Create Room"** to generate a room code (e.g., `TRNY-4821`).
2. On **Device B**:
   - Open **"Özel Oda" / "Custom Room"**, enter the room code, and join.
3. **Behavior:** Both players synchronize turns and board state over Supabase Realtime and the server-authoritative `public.submit_move()` RPC.

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
