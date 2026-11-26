import { collectSnapshot, saveSnapshot, restoreIfEmpty, SnapshotBackend, StorageLike } from "../utils/durableStore";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
console.log("KALICI DEPO: WebView verisi silinirse seri ve Günlük Kadraj sonucu yedekten döner");

function makeStorage(seed: Record<string, string> = {}): StorageLike & { wipe(): void } {
  const m = new Map(Object.entries(seed));
  return {
    get length() { return m.size; },
    key: (i) => Array.from(m.keys())[i] ?? null,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    wipe: () => m.clear(),
  };
}
function makeBackend(): SnapshotBackend & { raw: string | null } {
  const b = { raw: null as string | null, read: async () => b.raw, write: async (v: string) => { b.raw = v; } };
  return b;
}

(async () => {
  const ls = makeStorage({ cinexox_player_profile: "{\"wins\":3}", cinexox_daily_result_v2: "{\"days\":{}}", other_app_key: "x" });
  const backend = makeBackend();

  assert(Object.keys(collectSnapshot(ls)).length === 2, "yalnızca cinexox_ anahtarları yedeklenir");
  await saveSnapshot(ls, backend);
  assert(backend.raw !== null && !backend.raw.includes("other_app_key"), "yabancı anahtar yedeğe girmez");

  assert((await restoreIfEmpty(ls, backend)) === false, "veri sağlamken geri yükleme yapılmaz");

  ls.wipe();
  await saveSnapshot(ls, backend);
  assert(backend.raw !== null && backend.raw.includes("cinexox_player_profile"), "boş localStorage sağlam yedeğin üstüne yazılmaz");

  assert((await restoreIfEmpty(ls, backend)) === true, "WebView verisi silinince yedekten geri yüklenir");
  assert(ls.getItem("cinexox_player_profile") === "{\"wins\":3}", "profil aynen döner");
  assert(ls.getItem("cinexox_daily_result_v2") !== null, "Günlük Kadraj sonucu geri döner (ikinci hak açılmaz)");

  const bad = makeBackend(); bad.raw = "{bozuk";
  assert((await restoreIfEmpty(makeStorage(), bad)) === false, "bozuk yedek oyunu çökertmez");
  const foreign = makeBackend(); foreign.raw = JSON.stringify({ evil_key: "1", cinexox_ok: "2" });
  const target = makeStorage();
  await restoreIfEmpty(target, foreign);
  assert(target.getItem("evil_key") === null && target.getItem("cinexox_ok") === "2", "yalnızca cinexox_ önekli anahtarlar geri yazılır");

  console.log(`\nDURABLE STORE RESULT: ${passed}/${passed + failed} PASSED`);
  if (failed > 0) process.exit(1);
})();
