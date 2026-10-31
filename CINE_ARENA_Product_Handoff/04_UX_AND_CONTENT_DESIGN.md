# 04 — UX, Navigation & Content Design

## 1. Platform decision

Recommended first release: **one mobile-first responsive web application with PWA support**.

Why:
- tournament links need to open instantly;
- guest voting should not require app installation;
- creators benefit from a web editor;
- one frontend reduces cost and complexity;
- the same app works on desktop for creators and mobile for players.

Do not build a separate native app before validating retention and usage. If native distribution becomes necessary, reuse backend and game rules.

## 2. Information architecture

Bottom navigation on mobile:

1. **Home** — continue, daily challenge, featured tournament.
2. **Play** — solo and multiplayer modes.
3. **Create** — create a tournament.
4. **Profile** — personal results and created tournaments.

Desktop can use a compact top navigation.

Avoid a feed, store, inbox and social graph in MVP.

## 3. Home screen

Priority order:
1. “Continue” or “Play today’s Connections”.
2. “Challenge a friend” / “Join with code”.
3. Featured tournament.
4. Create tournament.
5. Recent result (signed-in users only).

The home screen must not become a catalogue dashboard.

## 4. Play screen

Separate sections visually:

### Solo
- Daily Connections
- Solo Movie Bracket

### Multiplayer
- Join a tournament
- Challenge a friend (Grid Duel when released)
- Create a tournament

Each card must explain the game in one short sentence and show expected duration.

## 5. Connections screens

1. Intro: puzzle title, date, rules.
2. Board: 4x4 selectable items.
3. Selection state: exactly four items selected before submit.
4. Feedback: correct group or remaining mistakes.
5. Result: groups, time, mistakes, share result.

Interaction:
- tap to select/deselect;
- keyboard accessibility on desktop;
- avoid drag-only interaction;
- clear focus and selected states;
- no hidden gesture.

## 6. Bracket screens

1. Template gallery.
2. Bracket detail and entrant list.
3. Matchup: two large title cards.
4. Progress indicator.
5. Winner / completed bracket.
6. Share result.

On mobile, show one matchup at a time. Do not force a tiny full bracket view.

## 7. Tournament creator

MVP steps:
1. Select a template or start from catalogue.
2. Choose 8 or 16 entrants.
3. Preview and reorder seeds.
4. Set title, short description, visibility and voting rule.
5. Publish.
6. Copy/share link.

MVP creator controls:
- close/pause voting;
- view participants and votes;
- share link;
- end tournament if creator chooses before all rounds complete, with clear state.

Not in MVP:
- custom backgrounds;
- sponsor branding;
- custom CSS;
- chat;
- advanced analytics;
- multiple moderators;
- arbitrary uploaded images.

## 8. Tournament participant experience

- link opens directly to tournament page;
- rules and closing time visible;
- no account required to vote;
- clear indication of whether vote can be changed;
- show current round and next state;
- do not expose private participant data;
- after voting, invite the participant to create an account to save activity, but do not block the vote.

## 9. Grid Duel screens (1.1)

- match lobby;
- board;
- current turn and opponent status;
- row/column criteria;
- answer search;
- confirmation before submitting;
- accepted/rejected reason;
- match result and rematch.

Do not show ambiguous “wrong answer” feedback if the data may be incomplete. Provide reason codes such as `NOT_IN_CATALOGUE`, `DOES_NOT_MATCH_ROW`, `DOES_NOT_MATCH_COLUMN`, `ALREADY_USED`.

## 10. Visual direction

Mood:
- cinematic, dark-neutral base;
- bright but restrained accent;
- strong title/poster imagery;
- high-contrast typography;
- clean cards and large tap targets;
- motion used to communicate selection, advancement and result.

Avoid:
- cluttered dashboard;
- neon overload;
- fake cinema film grain everywhere;
- excessive gradients;
- dense stats on the home screen;
- poster-only interfaces where text becomes inaccessible.

The design must remain usable if poster images are unavailable.

## 11. Design system minimum

Define:
- spacing scale;
- typography scale;
- semantic colors;
- button sizes;
- card styles;
- selected/disabled/error/success states;
- modal and toast patterns;
- responsive breakpoints;
- focus states;
- loading skeletons;
- empty/error states.

## 12. Share design

Every completed solo game and tournament must have:
- a stable public result URL where visibility permits;
- a compact share card;
- title and winner/result;
- product branding;
- no personal data unless user opts in;
- social preview metadata.

Never rely on a screenshot as the only share format.
