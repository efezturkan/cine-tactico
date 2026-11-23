// Ses mimarisi: tüm sesler ana kanaldan (ses düzeyi + limiter) geçer, kaydırıcı kareyle eşlenir, perde değişkenliği sınırlı.
let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

// Sahte Web Audio: bağlantı grafiğini kaydeder
type FakeNode = { name: string; to: FakeNode[]; gain?: { value: number; setValueAtTime: () => void; exponentialRampToValueAtTime: () => void; linearRampToValueAtTime: () => void } };
const created: FakeNode[] = [];
const dest: FakeNode = { name: "destination", to: [] };
const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} });
function makeNode(name: string): any {
  const n: any = { name, to: [] as FakeNode[], connect(t: FakeNode) { n.to.push(t); return t; }, disconnect() {}, addEventListener() {}, start() {}, stop() {},
    gain: param(), frequency: param(), threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 0 }, attack: { value: 0 }, release: { value: 0 }, type: "sine" };
  created.push(n);
  return n;
}
class FakeCtx {
  state = "running";
  currentTime = 0;
  destination = dest;
  createGain() { return makeNode("gain"); }
  createOscillator() { return makeNode("osc"); }
  createDynamicsCompressor() { return makeNode("limiter"); }
  resume() { return Promise.resolve(); }
}
const store: Record<string, string> = {};
(globalThis as any).window = {
  AudioContext: FakeCtx,
  localStorage: { getItem: (k: string) => (k in store ? store[k] : null), setItem: (k: string, v: string) => { store[k] = v; } },
};

import { AudioService, volumeToGain, pitchVariation } from "../utils/audio";

console.log("SES MİMARİSİ");

// Kaydırıcı eşlemesi
assert(volumeToGain(0) === 0, "kaydırıcı 0 = sessiz");
assert(volumeToGain(1) === 1, "kaydırıcı 1 = tam");
assert(Math.abs(volumeToGain(0.5) - 0.25) < 1e-9, "kaydırıcı 0,5 = 0,25 kazanç (kare)");
assert(volumeToGain(NaN) === 1 && volumeToGain(5) === 1 && volumeToGain(-3) === 0, "bozuk değerler güvenle kırpılır");

// Perde değişkenliği sınırı ve çeşitlilik
let min = 9, max = 0, distinct = new Set<number>();
for (let i = 0; i < 2000; i++) { const v = pitchVariation(0.03); min = Math.min(min, v); max = Math.max(max, v); distinct.add(Math.round(v * 1e4)); }
assert(min >= 0.97 && max <= 1.03, `perde çarpanı 1 ± %3 içinde (${min.toFixed(3)}..${max.toFixed(3)})`);
assert(distinct.size > 50, "her çalışta farklı değerler üretiliyor");
assert(pitchVariation(0.05, () => 0.5) === 1, "orta zar = değişiklik yok");

// Ana kanal grafiği
const a = new AudioService();
a.playSelect(); a.playChessMove(); a.playTick(900); a.playError(); a.playClapperSnap(); a.playVictory(); a.playPowerup(); a.playSuccess(); a.playCombo(3);
const direct = created.filter(n => n.to.includes(dest));
assert(direct.length === 1 && direct[0].name === "limiter", "destination'a yalnızca limiter bağlı (tek çıkış)");
const masters = created.filter(n => n.name === "gain" && n.to.some(t => t.name === "limiter"));
assert(masters.length === 1, "tek bir ana kazanç düğümü limiter'a bağlı");
const perSound = created.filter(n => n.name === "gain" && n.to.includes(masters[0]));
assert(perSound.length >= 9, `her ses ana kanala bağlanıyor (${perSound.length} düğüm)`);
const bypass = created.filter(n => n.name === "gain" && n !== masters[0] && n.to.includes(dest));
assert(bypass.length === 0, "ana kanalı atlayan ses yok");
const lim = direct[0] as any;
assert(lim.threshold.value === -6 && lim.ratio.value === 20 && lim.knee.value === 0, "limiter ayarı: eşik -6 dB, oran 20:1, diz 0");

// Ses düzeyi ve kalıcılık
a.setVolume(0.5);
assert(Math.abs((masters[0] as any).gain.value - 0.25) < 1e-9, "setVolume ana kazancı günceller");
assert(store["cinexox_volume"] === "0.5", "ses düzeyi kaydedilir");
const b = new AudioService();
assert(b.getVolume() === 0.5, "yeni oturum kayıtlı düzeyi okur");
store["cinexox_volume"] = "garip";
assert(new AudioService().getVolume() === 1, "bozuk kayıt varsayılana düşer");

// Sessize alma çalışmaya devam eder
const before = created.length;
const m = new AudioService();
m.toggleMute();
m.playSelect();
assert(created.length === before, "sessizde yeni düğüm oluşmaz");

console.log(`\nAUDIO BUS RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
