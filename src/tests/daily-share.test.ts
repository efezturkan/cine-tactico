import { summarizeDailyShare } from "../utils/dailyShare";
import type { CellAnswer } from "../core";
import { en } from "../i18n/en";
import { tr } from "../i18n/tr";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const cell = (by: "X" | "O" | "NEUTRAL", locked = false): CellAnswer =>
  ({ movie: { id: "m" + Math.random(), title: "T", year: 2000, director: "D", cast: [], genres: [], hasOscar: false }, answeredBy: by, timestamp: 0, isLockedNeutral: locked } as CellAnswer);

console.log("GÜNLÜK PAYLAŞIM: SAHİBE GÖRE SONUÇ");

// Gerçek senaryo (21 Kasım kaydı): 9 kare dolu, hat yok, Altın Makara'yı oyuncu kazandı.
// Oyuncu 1 kare, bot 3, 3 kilitli, 2 boş değil: toplam dolu 9 olsun: X1 O3 kilit2 + 3 daha O
const board: (CellAnswer | null)[] = [cell("O"), cell("X"), null, null, cell("NEUTRAL", true), null, cell("O"), cell("NEUTRAL", true), null];
const s = summarizeDailyShare(board, "X");
assert(s.mine === 1 && s.theirs === 2 && s.locked === 2, "kareler sahibine göre sayılır (senin 1, botun 2, kilitli 2)");
assert((s.emojiGrid.match(/🟨/g) ?? []).length === 1, "ızgarada yalnızca senin karelerin 🟨");
assert((s.emojiGrid.match(/🟦/g) ?? []).length === 2, "botun kareleri 🟦");
assert((s.emojiGrid.match(/⬛/g) ?? []).length === 6, "boş ve kilitli kareler ⬛");
assert(s.emojiGrid.trim().split("\n").length === 3, "ızgara 3 satır");
assert(s.headline === "Sahne senin!" && s.won, "kazanınca başlık 'Sahne senin!'");
assert(s.resultLine === "Sonuç: 1/9 Kare · Sahne senin!", "paylaşım satırı gerçek kare sayısını söyler");

// Eski hata: 9 kare dolu olunca "Tam kadraj / Kusursuz" ilan ediliyordu
const full: (CellAnswer | null)[] = [cell("O"), cell("O"), cell("X"), cell("X"), cell("O"), cell("O"), cell("X"), cell("O"), cell("O")];
const l = summarizeDailyShare(full, "O");
assert(l.mine === 3 && l.headline === "Bu çekim olmadı." && !l.won, "bot kazandıysa 9 kare dolu olsa da kayıp (eskiden 'Tam kadraj!' çıkardı)");
assert(!l.resultLine.includes("Sahne senin"), "kayıpta zafer metni yok");
assert(!/Kusursuz|Tam kadraj/.test(l.headline + l.subline + l.resultLine), "'Kusursuz' / 'Tam kadraj' artık hiçbir sonuçta çıkmaz");

// Sonuç bilinmiyorsa iddia yok
const u = summarizeDailyShare(full, undefined);
assert(u.headline === "3/9 Kare" && !u.won, "kazanan bilinmiyorsa yalnızca kare sayısı");
const d = summarizeDailyShare(full, "DRAW");
assert(d.headline === "3/9 Kare", "DRAW da zafer ya da kayıp iddia etmez");
assert(summarizeDailyShare(Array(9).fill(null), null).emojiGrid.replace(/[⬛ \n]/g, "") === "", "boş tahta: tamamı ⬛");

// Yerelleştirme: kart, uygulamanın diliyle yazılır
const en1 = summarizeDailyShare(board, "X", en.dailyCard);
assert(en1.headline === "Scene's yours!" && en1.resultLine === "Result: 1/9 Frames · Scene's yours!", "EN: kazanma kartı İngilizce");
assert(summarizeDailyShare(full, "O", en.dailyCard).headline === "Not this take.", "EN: kayıp başlığı İngilizce");
assert(!/[ığşçöüİĞŞÇÖÜ]|Kare|Sahne|Sonuç|Yarın/.test(en1.headline + en1.subline + en1.resultLine), "EN kartında Türkçe metin kalmadı");
assert(summarizeDailyShare(board, "X").headline === tr.dailyCard.headlineWon, "dil verilmezse Türkçe (eski davranış)");
assert(Object.keys(en.dailyCard).join() === Object.keys(tr.dailyCard).join(), "TR ve EN kart anahtarları aynı");

console.log(`\nDAILY SHARE RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
