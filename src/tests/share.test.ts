import { shareText, copyText, ShareDeps } from "../utils/share";
import { buildDuelSharePayload } from "../utils/dailyShare";
import type { CellAnswer } from "../core";

let passed = 0, failed = 0;
function assert(c: boolean, m: string) { if (c) { passed++; console.log(`  ✓ PASS: ${m}`); } else { failed++; console.error(`  ✗ FAIL: ${m}`); } }

(async () => {
  console.log("PAYLAŞIM VE PANO");
  const log: string[] = [];
  const mk = (o: Partial<ShareDeps>): ShareDeps => ({
    isNative: () => false,
    nativeShare: async () => { log.push("native"); },
    webShare: undefined,
    copy: async () => { log.push("copy"); },
    ...o,
  });

  log.length = 0;
  assert(await shareText("t", "x", mk({ isNative: () => true })) === "shared" && log.join() === "native", "iOS/Android: yerel paylaşım sayfası kullanılır, pano kullanılmaz");

  log.length = 0;
  assert(await shareText("t", "x", mk({ isNative: () => true, nativeShare: async () => { throw new Error("Share canceled"); } })) === "cancelled" && !log.includes("copy"), "kullanıcı sayfayı kapatınca iptal sayılır, pano kopyalanmaz");

  log.length = 0;
  assert(await shareText("t", "x", mk({ isNative: () => true, nativeShare: async () => { throw new Error("plugin not implemented"); } })) === "copied" && log.join() === "copy", "yerel paylaşım bozulursa panoya düşer");

  log.length = 0;
  assert(await shareText("t", "x", mk({ webShare: async () => { log.push("web"); } })) === "shared" && log.join() === "web", "tarayıcıda web paylaşımı kullanılır");

  const abort = Object.assign(new Error("The user aborted"), { name: "AbortError" });
  log.length = 0;
  assert(await shareText("t", "x", mk({ webShare: async () => { throw abort; } })) === "cancelled" && !log.includes("copy"), "web paylaşımı iptali pano tetiklemez");

  log.length = 0;
  assert(await shareText("t", "x", mk({})) === "copied", "paylaşım yoksa panoya kopyalanır");
  assert(await shareText("t", "x", mk({ copy: undefined })) === "failed", "ne paylaşım ne pano varsa 'failed' döner, çökmez");
  assert(await shareText("t", "x", mk({ copy: async () => { throw new Error("denied"); } })) === "failed", "pano reddedilirse 'failed'");

  assert(await copyText("x", mk({})) === true, "copyText başarılı");
  assert(await copyText("x", mk({ copy: async () => { throw new Error("no"); } })) === false, "copyText reddedilince false");
  assert(await copyText("x", mk({ copy: undefined })) === false, "pano API'si yoksa false");

  // Duel share payload verification (spoiler-free 3x3 + localized outcome + URL)
  const mockMovie = { id: "m_test", title: "Secret Answer Film", year: 2010, director: "Dir", cast: [], genres: [], hasOscar: false };
  const sampleCells: (CellAnswer | null)[] = Array(9).fill(null);
  sampleCells[0] = { movie: mockMovie, answeredBy: "X", timestamp: 1, pointsEarned: 15, rarityScore: 5 };
  sampleCells[1] = { movie: mockMovie, answeredBy: "X", timestamp: 2, pointsEarned: 15, rarityScore: 5 };
  sampleCells[2] = { movie: mockMovie, answeredBy: "X", timestamp: 3, pointsEarned: 15, rarityScore: 5 };
  sampleCells[4] = { movie: mockMovie, answeredBy: "O", timestamp: 4, pointsEarned: 10, rarityScore: 0 };

  const duelEn = buildDuelSharePayload({
    cells: sampleCells,
    winner: "X",
    boardTitle: "Auteur Wars",
    opponentName: "TarantinoCult",
    rarityScore: 15,
    locale: "en",
    siteUrl: "https://crosscutgame.vercel.app",
  });
  assert(
    duelEn.text.includes("3–1 vs TarantinoCult") &&
      duelEn.text.includes("Scene's yours!") &&
      duelEn.text.includes("https://crosscutgame.vercel.app") &&
      !duelEn.text.includes("Secret Answer Film"),
    "Duel share payload (EN) formats 3x3 grid, score, opponent, URL, and leaks zero movie titles"
  );

  const duelTr = buildDuelSharePayload({
    cells: sampleCells,
    winner: "O",
    boardTitle: "Auteur Savaşları",
    opponentName: "TarantinoKult",
    rarityScore: 12,
    locale: "tr",
    siteUrl: "https://crosscutgame.vercel.app",
  });
  assert(
    duelTr.text.includes("3–1 vs TarantinoKult") &&
      duelTr.text.includes("Bu çekim olmadı.") &&
      !duelTr.text.includes("Secret Answer Film"),
    "Duel share payload (TR) formats localized Turkish summary without spoilers"
  );

  console.log(`\nSHARE RESULT: ${passed}/${passed + failed} PASSED`);
  if (failed > 0) process.exit(1);
})();
