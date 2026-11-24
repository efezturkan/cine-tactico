import { summarizeDailyShare } from "../utils/dailyShare";
import { createLockedNeutralCell } from "../core";
import type { CellAnswer } from "../core";
import { en } from "../i18n/en";
import { tr } from "../i18n/tr";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const cell = (by: "X" | "O", i: number): CellAnswer =>
  ({ movie: { id: "m" + i, title: "T", year: 2000, director: "D", cast: [], genres: [], hasOscar: false }, answeredBy: by, timestamp: 0 } as CellAnswer);
/** n kare senin (X), kalanı kilitli: Günlük'te biten tahta */
const finished = (n: number): (CellAnswer | null)[] => Array.from({ length: 9 }, (_, i) => (i < n ? cell("X", i) : createLockedNeutralCell(i)));

console.log("GÜNLÜK PAYLAŞIM: KADEME, DİL, ÖDÜL");

const expectTr: Record<number, string> = { 0: "Bu çekim olmadı.", 2: "Bu çekim olmadı.", 3: "Yarım çekim.", 4: "Yarım çekim.", 5: "Sahne senin!", 6: "Sahne senin!", 7: "Başrol sensin!", 8: "Başrol sensin!", 9: "Kusursuz Kadraj!" };
for (const n of [0, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const s = summarizeDailyShare(finished(n), n >= 5 ? "X" : "O");
  assert(s.headline === expectTr[n] && s.mine === n, `${n}/9 → "${expectTr[n]}"`);
}

const six = summarizeDailyShare(finished(6), "X");
assert(six.won && six.resultLine === "Sonuç: 6/9 Kare · Sahne senin!", "paylaşım satırı gerçek kare sayısını ve kademeyi söyler");
assert((six.emojiGrid.match(/🟨/g) ?? []).length === 6 && (six.emojiGrid.match(/⬛/g) ?? []).length === 3, "ızgarada kazanılan kareler 🟨, kilitliler ⬛");
assert(six.emojiGrid.trim().split("\n").length === 3, "ızgara 3 satır");
assert(six.rewardReels === 20 && summarizeDailyShare(finished(9), "X").rewardReels === 50 && summarizeDailyShare(finished(0), "O").rewardReels === 5, "ödül kademeyle artar (9/9: 50, 6/9: 20, 0/9: 5 Makara)");
assert(summarizeDailyShare(finished(9), "X").tier === "PERFECT", "9/9 kademesi PERFECT");

// Kazanan bilinmiyorsa iddia yok
const u = summarizeDailyShare(finished(3), undefined);
assert(u.headline === "3/9 Kare" && !u.won && u.tier === null && u.rewardReels === 0, "kazanan bilinmiyorsa yalnızca kare sayısı, ödül yok");
assert(summarizeDailyShare(finished(3), "DRAW").tier === null, "DRAW kademe ya da ödül iddia etmez");
assert(summarizeDailyShare(Array(9).fill(null), null).emojiGrid.replace(/[⬛ \n]/g, "") === "", "boş tahta: tamamı ⬛");

// Eski hata: başkasının kareleri oyuncunun sayılıyordu. Rakip (O) kareleri hiçbir kademeye katkı yapmaz.
const mixed: (CellAnswer | null)[] = Array.from({ length: 9 }, (_, i) => (i < 3 ? cell("X", i) : cell("O", i)));
const m = summarizeDailyShare(mixed, "O");
assert(m.mine === 3 && m.tier === "HALF" && !/Kusursuz/.test(m.headline), "dolu 9 kare olsa da yalnızca senin karelerin sayılır (eski 'Tam kadraj' hatası yok)");

// Yerelleştirme
const e9 = summarizeDailyShare(finished(9), "X", en.dailyCard);
assert(e9.headline === "Perfect Reel!" && e9.resultLine === "Result: 9/9 Frames · Perfect Reel!", "EN: kusursuz kart İngilizce");
assert(summarizeDailyShare(finished(5), "X", en.dailyCard).headline === "Scene's yours!", "EN: çoğunluk başlığı");
assert(!/[ığşçöüİĞŞÇÖÜ]|Kare|Sahne|Sonuç|Yarın|Makara/.test(e9.headline + e9.subline + e9.resultLine), "EN kartında Türkçe metin kalmadı");
assert(summarizeDailyShare(finished(5), "X").headline === tr.dailyCard.tierWin, "dil verilmezse Türkçe");
assert(Object.keys(en.dailyCard).join() === Object.keys(tr.dailyCard).join(), "TR ve EN kart anahtarları aynı");

console.log(`\nDAILY SHARE RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
