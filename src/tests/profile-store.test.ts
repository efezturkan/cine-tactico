import { sanitizeStoredProfile, parseStoredProfile, serializeProfile, isNewerSchema, PROFILE_SCHEMA_VERSION } from "../utils/profileStore";

let passed = 0, failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) { passed++; console.log(`  ✓ PASS: ${msg}`); } else { failed++; console.error(`  ✗ FAIL: ${msg}`); }
}
console.log("YEREL PROFİL KAYDI: BOZUK VERİYE DAYANIKLI");

const good = { username: "Efe", wins: 3, losses: 2, reelsBalance: 355, dailyStreak: 4, lastStreakDateUtc: "2026-11-24", lastFiveMatches: ["W", "L", "W"], unlockedAvatars: ["a", "b"] };
const ok = sanitizeStoredProfile(good);
assert(ok.wins === 3 && ok.reelsBalance === 355 && ok.dailyStreak === 4 && ok.username === "Efe", "sağlam kayıt aynen alınır");

const evil = sanitizeStoredProfile({ wins: "abc", losses: -5, draws: NaN, reelsBalance: 1e30, dailyStreak: 2.9, username: "   ", lastStreakDateUtc: "yarın", lastFiveMatches: ["W", "X", 7, "L"], unlockedAvatars: [1, "ok"], matchHistory: "x", powerups: [1], isPro: "yes" });
assert(evil.wins === undefined && evil.losses === undefined && evil.draws === undefined, "yanlış türde ya da negatif sayılar alınmaz (NaN ekrana gelmez)");
assert(evil.reelsBalance === 1_000_000_000, "devasa sayı makul üst sınıra çekilir");
assert(evil.dailyStreak === 2, "ondalık tamsayıya iner");
assert(evil.username === undefined && evil.lastStreakDateUtc === undefined, "boş ad ve bozuk tarih alınmaz");
assert(JSON.stringify(evil.lastFiveMatches) === JSON.stringify(["W", "L"]) && JSON.stringify(evil.unlockedAvatars) === JSON.stringify(["ok"]), "diziler yalnızca geçerli öğeleri tutar");
assert(evil.matchHistory === undefined && evil.powerups === undefined && evil.isPro === undefined, "yanlış türdeki yapı alanları alınmaz");

const long = sanitizeStoredProfile({ username: "A".repeat(200) });
assert(long.username?.length === 24, "kullanıcı adı 24 karakterle sınırlı");

// Prototip kirletme ve bilinmeyen alanlar
const polluted = sanitizeStoredProfile(JSON.parse('{"__proto__":{"admin":true},"constructor":{"x":1},"hack":1,"wins":1}'));
assert(({} as Record<string, unknown>).admin === undefined && !("hack" in polluted) && polluted.wins === 1, "bilinmeyen alanlar ve __proto__ alınmaz");

// Biçim dayanıklılığı
assert(Object.keys(parseStoredProfile("{bozuk json")).length === 0, "bozuk JSON çökertmez, varsayılanlar kullanılır");
assert(Object.keys(parseStoredProfile(null)).length === 0 && Object.keys(parseStoredProfile("[1,2]")).length === 0 && Object.keys(parseStoredProfile("\"x\"")).length === 0, "boş, dizi ya da düz metin kayıt yok sayılır");
const newer = JSON.stringify({ wins: 9, schemaVersion: PROFILE_SCHEMA_VERSION + 1 });
assert(Object.keys(parseStoredProfile(newer)).length === 0, "daha yeni sürümün kaydı yarım yüklenmez (reddedilir)");

// Gidiş-dönüş
const full = { username: "Efe", wins: 5, dailyStreak: 2, reelsBalance: 100, lastFiveMatches: ["W"], unlockedAvatars: [] } as never;
const rt = parseStoredProfile(serializeProfile(full));
assert(rt.wins === 5 && rt.dailyStreak === 2 && rt.reelsBalance === 100 && rt.username === "Efe", "yaz-oku gidiş dönüşü alanları korur");
assert(JSON.parse(serializeProfile(full)).schemaVersion === PROFILE_SCHEMA_VERSION, "yazılan kayıt sürüm damgalıdır");

assert(isNewerSchema(newer) && !isNewerSchema(serializeProfile(full)) && !isNewerSchema(null) && !isNewerSchema("{bozuk"), "daha yeni sürüm kaydı tanınır (üzerine yazılmaz)");

console.log(`\nPROFILE STORE RESULT: ${passed}/${passed + failed} PASSED`);
if (failed > 0) process.exit(1);
