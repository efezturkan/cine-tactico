import { ErrorBoundary } from "../components/ErrorBoundary";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}

console.log("HATA KURTARMA: ilk dokunuş veriyi silmez, tekrarlayan hata son çare olarak siler");

function makeStorage(seed: Record<string, string>) {
  const m = new Map(Object.entries(seed));
  return {
    get length() { return m.size; },
    key: (i: number) => Array.from(m.keys())[i] ?? null,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    has: (k: string) => m.has(k),
  };
}

const local = makeStorage({ cinexox_profile: "{}", cinexox_daily_result_v1: "{\"days\":{}}" });
const session = makeStorage({});
const win = { location: { href: "/x" } };
Object.assign(globalThis, { window: win, localStorage: local, sessionStorage: session });

const boundary = new ErrorBoundary({ children: null }) as unknown as { handleReset: () => void };

boundary.handleReset();
assert(local.has("cinexox_profile") && local.has("cinexox_daily_result_v1"), "1. dokunuş: profil ve Günlük Kadraj sonucu korunur");
assert(win.location.href === "/", "1. dokunuş: uygulama yeniden yüklenir");

boundary.handleReset();
assert(local.has("cinexox_profile"), "2. dokunuş: veri hâlâ korunur");

boundary.handleReset();
assert(!local.has("cinexox_profile") && !local.has("cinexox_daily_result_v1"), "3. ardışık hata: bozuk kayıt şüphesiyle yerel veri silinir");

console.log(`\nERROR RECOVERY RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
