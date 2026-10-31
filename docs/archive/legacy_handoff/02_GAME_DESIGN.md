# 02 — Game Design Document

## 1. The two game worlds

The product must deliberately separate **Single Player** and **Multiplayer** in navigation, rules, scoring and analytics. They share the content catalogue and visual language, but they are not the same mode with a different button.

### Single Player
Purpose: instant entertainment, practice, daily habit and personal progress.

Characteristics:
- no opponent required;
- starts immediately;
- predictable difficulty;
- personal score and streaks;
- daily content can be identical for everyone;
- no waiting for another user;
- a solo result is not presented as a multiplayer ranking.

### Multiplayer
Purpose: social competition, challenge, audience participation and sharing.

Characteristics:
- clear opponent or shared participant group;
- match/tournament state is authoritative;
- invite/share links;
- fair rules and anti-abuse controls;
- results can be public or private;
- multiplayer rating is separate from solo score.

## 2. MVP mode selection

### MVP Single Player: two modes

#### SP-01 — Daily Connections
A 4x4 board with 16 film/series-related items. The player groups the 16 items into four sets of four based on a hidden connection.

Possible group themes:
- same actor;
- same director;
- same franchise/universe;
- same genre or subgenre;
- same decade;
- same production or country;
- shared character or cast connection.

Rules:
- player selects four items and submits a group;
- correct group is locked and revealed;
- incorrect submission consumes one mistake;
- default maximum mistakes: 4;
- completion shows time, mistakes and a shareable result;
- one curated puzzle per day for the initial version;
- optional practice archive only if content capacity permits.

Important:
- every puzzle must have one intended solution;
- group themes and answers must be reviewed;
- avoid obscure connections that require specialist knowledge;
- do not rely on fuzzy interpretation for correctness.

Why it is in MVP:
- clear, fast solo loop;
- daily return reason;
- no realtime infrastructure;
- can be shared without requiring competitive matchmaking.

#### SP-02 — Solo Movie Bracket
A user chooses a ready-made bracket (e.g. 16 sci-fi films) or starts a quick bracket from a curated set. They choose between two titles until the bracket is complete.

Rules:
- MVP bracket size: 8 or 16 entries; default 16 only when content is available;
- single-elimination;
- each matchup shows two title cards;
- user chooses one;
- selected title advances;
- final result shows winner and full bracket;
- allow restart;
- save result only when logged in; guest result can be shared in-session.

Why it is in MVP:
- reuses the same comparison and bracket engine as multiplayer tournaments;
- directly supports the product's shareable identity;
- low technical complexity compared with realtime PvP.

### MVP Multiplayer: two modes

#### MP-01 — Shared Tournament / Async Versus
This is the primary social/viral multiplayer mode.

A creator selects a tournament template or creates a bracket, then shares a link. Participants vote through the bracket. The product collects votes and advances the winner according to the tournament rules.

MVP decision:
- use **one shared tournament result**, not separate private brackets for every participant;
- each participant casts one vote per matchup;
- votes can be changed until the matchup closes, if the creator has enabled this;
- default is fixed close time or creator-controlled manual advancement;
- public tournaments can accept guest votes with a session token;
- account is required to create persistent tournaments and manage them;
- creator can set public/unlisted/private visibility.

Tournament resolution:
- each matchup advances the title with the most valid votes;
- tie handling must be explicit: creator tie-break, predefined seed order, or extended voting. MVP default: tie-break by higher seed, with the rule visible before voting;
- one participant/session gets one active vote per matchup;
- server enforces uniqueness and closing times;
- creator cannot edit entrants after the first vote;
- creator cannot alter results manually except through a clearly logged administrative correction.

Tournament templates:
- curated system templates;
- user-created from catalogue;
- custom text entries can be deferred until data rights and moderation are understood.

#### MP-02 — Friend Challenge: Grid Duel (asynchronous first)
A compact 3x3 film/series knowledge grid. Two players compete to fill cells with valid answers.

MVP implementation should begin as **asynchronous turn-based**, not high-frequency realtime:
- player A makes a move;
- player B receives the next turn;
- each cell can be claimed once;
- answer must match a valid content relationship;
- match ends when the board is full or a winning line is achieved;
- winner is determined by rules, not client-side claims;
- invite link or friend code creates the match.

Grid rule:
Each row and column describes a criterion. A cell is the intersection of one row and one column. The player must submit a film/person/character that satisfies both conditions.
Example:
- Row: “Films starring [actor]”
- Column: “Directed by [director]”
A valid answer must satisfy both conditions.

Important design warning:
This mode is only viable when the data supports enough unambiguous answers. Do not launch arbitrary intersections. Generate and pre-validate boards from known relationships.

MVP simplification:
- one board format;
- one answer entity type per board;
- no jokers;
- no 2v2;
- no real-time clock;
- no stealing/locking squares;
- no ranked ELO until match volume is sufficient.

If content validation is not ready, ship MP-02 in the next release rather than ship unreliable answers. This is a release gate, not a reason to fake data.

## 3. Post-MVP modes (not MVP)

### SP-03 — Casting / Who Am I?
Guess a film, actor, character or series from progressive hints. Use curated, fact-checked questions.

### SP-04 — Six Degrees
Connect one actor to another through shared productions. Requires a reliable graph and path validation.

### SP-05 — Blind Ranking
Place titles into ranked slots without seeing future options. Great short-form social content, but not required initially.

### MP-03 — Live Grid Battle
Realtime version of Grid Duel with timers, reconnection, server-authoritative turns and matchmaking.

### MP-04 — Live Audience Room
A creator opens a room; audience joins via QR/link and votes on pairings. Initial implementation can use web polling; native chat integrations are later.

### MP-05 — 2v2 / Battle Royale
Only after 1v1 and async usage are proven.

## 4. Later / experimental modes

- Hex territory control;
- Fantasy Studio / card draft;
- Box Office Bluff;
- Tactipong-style pass-the-cast;
- collectible cards and franchise completion;
- clans, seasons and leagues.

Do not create database tables or UI for these before validation.

## 5. Shared game rules and systems

### Game state
Every game instance has:
- unique ID;
- mode and ruleset version;
- content snapshot or immutable references;
- status;
- creator/participants;
- created/started/ended timestamps;
- outcome;
- event log.

### Scoring
- Solo: time, mistakes, completion and daily streak. Do not create a universal solo rating.
- Tournament: vote count and bracket outcome. Do not equate a single vote to objective film quality.
- Grid Duel: win/loss/draw. Keep unranked initially.
- Separate personal stats from competitive rating.

### Fairness
- server validates all moves and votes;
- client cannot submit a winner or arbitrary score;
- idempotency key for vote/move submission;
- duplicate votes/moves rejected;
- close times enforced server-side;
- game rules versioned;
- audit log for corrections and moderation.

### Content integrity
- Every question and answer has provenance;
- all alias variants normalized;
- Turkish characters and diacritics handled;
- alternate titles and localized names supported;
- ambiguous names require entity disambiguation;
- no LLM-only validation in competitive modes.

## 6. Game loops

### Solo loop
Home → choose Daily / Solo → play → result → share or play another → optional sign-in to save progress.

### Multiplayer challenge loop
Open invite link → see game rules → guest join → play turn → wait for opponent → result → rematch/share.

### Tournament creator loop
Create → choose template → edit entrants → preview bracket → publish → share link → participants vote → bracket resolves → result page → share.

### Tournament participant loop
Open link → view title and rules → vote → see current state → return when next round opens → final result.

## 7. Content templates for launch

Initial curated categories:
- Sci-fi films;
- animation films;
- thriller films;
- comedy films;
- horror films;
- Turkish films;
- Turkish TV series;
- international TV series;
- directors;
- actors;
- iconic characters.

Do not launch a category until it has enough verified entries for all supported bracket sizes and search results.
