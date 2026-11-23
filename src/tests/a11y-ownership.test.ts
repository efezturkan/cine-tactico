// Renk körlüğü sözleşmesi: hücre sahipliği YALNIZCA renkle anlaşılmamalı.
// XoxBoard korumalı olduğundan işaret CSS ile aria-label sonekinden gelir; bu test o sözleşmeyi korur.
import { readFileSync } from "fs";
import { join } from "path";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
const root = join(__dirname, "..", "..");
const css = readFileSync(join(root, "src/app/globals.css"), "utf8");
const board = readFileSync(process.env.XOX_SRC ?? join(root, "src/features/gameplay/components/XoxBoard.tsx"), "utf8");
const mini = readFileSync(join(root, "src/components/ui/MiniKadrajPreview.tsx"), "utf8");

console.log("ERİŞİLEBİLİRLİK: HÜCRE SAHİPLİĞİ RENKTEN BAĞIMSIZ");

assert(/\$\{cellData\.answeredBy\}\)`/.test(board), "XoxBoard aria-label'ı '(X)' / '(O)' sonekiyle bitiyor (CSS sözleşmesi)");
assert(/button\[aria-label\$="\(X\)"\]::after[\s\S]*?content:\s*"X"/.test(css), "CSS: (X) hücreye 'X' harfi ekliyor");
assert(/button\[aria-label\$="\(O\)"\]::after[\s\S]*?content:\s*"O"/.test(css), "CSS: (O) hücreye 'O' harfi ekliyor");
assert(!/\(NEUTRAL\)/.test(css), "kilitli sahipsiz karelere harf konmuyor (kilit simgesi + SAHİPSİZ metni var)");
assert(/pointer-events:\s*none/.test(css.split('$="(X)"]::after')[0].slice(-400) + css.split('$="(X)"]::after')[1].slice(0, 400)), "işaret dokunmayı engellemiyor");
assert(/font-family:\s*var\(--font-sans\)/.test(css.slice(css.indexOf('$="(X)"]::after'))), "harf sans yazı tipinde (mono'da O sıfıra benzer)");
assert(/answeredBy === "O" \? "!rounded-full"/.test(mini), "mini kadraj: O yuvarlak, X kare (renk dışı ipucu)");
assert(/answeredBy === "X"\) bg = "#D9A441"/.test(mini) && /answeredBy === "O"\) bg = "#4FA3C7"/.test(mini), "marka renkleri korunuyor (altın X, mavi O)");
assert(/isLockedNeutral/.test(board) && /Lock/.test(board), "kilitli kare kilit simgesi gösteriyor");

console.log(`\nA11Y OWNERSHIP RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
