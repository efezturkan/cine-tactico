import { trackHiddenTime, shiftTurnStart, VisibilityDoc } from "../utils/visibilityPause";

let passed = 0, failed = 0;
function assert(c: boolean, m: string) { if (c) { passed++; console.log(`  ✓ PASS: ${m}`); } else { failed++; console.error(`  ✗ FAIL: ${m}`); } }

console.log("ARKA PLAN: SAYAÇ DURAKLATMA");
const mkDoc = () => {
  const l: Array<() => void> = [];
  const d: VisibilityDoc & { fire: () => void; n: number } = {
    hidden: false, n: 0,
    addEventListener: (_t, cb) => { l.push(cb); d.n++; },
    removeEventListener: (_t, cb) => { l.splice(l.indexOf(cb), 1); d.n--; },
    fire: () => l.slice().forEach(f => f()),
  };
  return d;
};

let t = 1000;
const doc = mkDoc();
const got: number[] = [];
const off = trackHiddenTime(ms => got.push(ms), doc, () => t);

doc.hidden = true; t = 2000; doc.fire();
doc.hidden = false; t = 22000; doc.fire();
assert(got.length === 1 && got[0] === 20000, "20 sn arka planda kalınca 20000 ms bildirilir (sayaç bu kadar geri alınır)");

doc.hidden = true; t = 30000; doc.fire();
doc.fire();
doc.hidden = false; t = 30500; doc.fire();
assert(got.length === 2 && got[1] === 500, "tekrarlanan gizlenme olayı süreyi iki kez saymaz");

doc.hidden = false; t = 40000; doc.fire();
assert(got.length === 2, "gizlenmeden gelen görünür olayı hiçbir şey bildirmez");

off();
assert(doc.n === 0, "temizlenince dinleyici kaldırılır (sızıntı yok)");
assert(typeof trackHiddenTime(() => {}, undefined) === "function", "document yoksa (SSR) çökmez");

// Tur başlangıcı kaydırma
assert(shiftTurnStart(1000, 20000, 25000) === 21000, "tur arka plandan önce başladıysa süre gizli süre kadar geri alınır (5 sn geçmişse 5 sn kalır)");
assert(shiftTurnStart(10000, 20000, 25000) === 25000, "tur arka plandayken (bot hamlesiyle) değiştiyse tam süre verilir, başlangıç geleceğe kaymaz");
const limit = 12, elapsed = (start: number, now: number) => Math.floor((now - start) / 1000);
assert(limit - elapsed(shiftTurnStart(10000, 20000, 25000), 25000) <= limit, "kalan süre hiçbir zaman limiti (12) aşmaz (eskiden 36 görünüyordu)");

console.log(`\nVISIBILITY RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
