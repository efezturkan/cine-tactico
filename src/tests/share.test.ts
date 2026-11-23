import { shareText, copyText, ShareDeps } from "../utils/share";

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

  console.log(`\nSHARE RESULT: ${passed}/${passed + failed} PASSED`);
  if (failed > 0) process.exit(1);
})();
