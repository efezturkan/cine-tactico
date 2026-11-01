import fs from "fs";
import path from "path";
import crypto from "crypto";
import { assetResolver, AssetResolver } from "../utils/assetResolver";
import { ASSET_MANIFEST, auditAssetManifest, isValidAssetManifestItem } from "../data/assets";
import { AssetManifestItem, Criterion } from "../core";

console.log("=================================================");
console.log("CINEXOX ASSET INFRASTRUCTURE & RESOLVER TEST SUITE");
console.log("=================================================");

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${msg}`);
}

// 1. Mevcut asset bulunduğunda doğru kayıt dönüyor
const resolvedLeo = assetResolver.resolve("act_dicaprio", "portrait", "person");
assert(resolvedLeo.isAvailable === true, "Doğrulanmış aktör (DiCaprio) isAvailable: true döner");
assert(resolvedLeo.asset?.id === "ast_act_dicaprio_portrait", "Doğru manifest ID eşleşir");
assert(resolvedLeo.asset?.license === "CC BY 4.0", "Doğru lisans bilgisi eşleşir");
assert(resolvedLeo.asset?.author === "Raph_PH", "Doğru yazar bilgisi eşleşir");
assert(Boolean(resolvedLeo.src), "Yerel görsel yolu (src) mevcuttur");

// 2. Asset bulunamadığında fallback dönüyor (5 Pilot Film dahil)
const pilotFilms = ["m_inception", "m_dark_knight", "m_pulp_fiction", "m_fight_club", "m_oppenheimer"];
pilotFilms.forEach((filmId) => {
  const resolved = assetResolver.resolve(filmId, "poster", "movie");
  assert(resolved.isAvailable === false, `Telifli film afişi (${filmId}) uydurulmaz, isAvailable: false döner`);
  assert(resolved.asset === null, `Telifli film (${filmId}) için asset: null döner`);
  assert(resolved.src === undefined, `Telifli film (${filmId}) için src: undefined döner`);
  assert(Boolean(resolved.fallbackText), `Telifli film (${filmId}) için sinematik fallback metni hazırdır`);
});

// 3. Yanlış entity type eşleşmiyor
const mismatchEntity = assetResolver.resolve("act_dicaprio", "portrait", "movie");
assert(mismatchEntity.isAvailable === false, "Kişi kimliği 'movie' entityType ile arandığında reddedilir");
assert(mismatchEntity.asset === null, "Kişi-film tür uyuşmazlığında asset null döner");

// 4. Yanlış asset type eşleşmiyor
const mismatchAssetType = assetResolver.resolve("act_dicaprio", "poster", "person");
assert(mismatchAssetType.isAvailable === false, "Aktör için 'poster' arandığında (yalnızca portrait varken) reddedilir");

// 5. Aynı entity için farklı asset türleri karışmıyor
const testManifest: AssetManifestItem[] = [
  {
    id: "test_portrait",
    entityType: "person",
    entityId: "act_test",
    assetType: "portrait",
    localPath: "/test-portrait.webp",
    source: "Commons",
    license: "CC0",
    author: "TestAuthor",
    attribution: "Test Attribution",
  },
  {
    id: "test_backdrop",
    entityType: "person",
    entityId: "act_test",
    assetType: "backdrop",
    localPath: "/test-backdrop.webp",
    source: "Commons",
    license: "CC0",
    author: "TestAuthor",
    attribution: "Test Attribution",
  },
];
const customResolver = new AssetResolver(testManifest);
const resolvedPortrait = customResolver.resolve("act_test", "portrait");
const resolvedBackdrop = customResolver.resolve("act_test", "backdrop");
assert(resolvedPortrait.asset?.id === "test_portrait", "Aynı entity için portrait doğru ayrışır");
assert(resolvedBackdrop.asset?.id === "test_backdrop", "Aynı entity için backdrop doğru ayrışır");

// 6. Eksik lisans metadata'sı olan kayıt aktif manifest'e giremiyor
const invalidItemMissingLicense: AssetManifestItem = {
  id: "invalid_1",
  entityType: "person",
  entityId: "act_invalid",
  assetType: "portrait",
  source: "Web",
  license: "", // Boş lisans
  author: "Unknown",
  attribution: "",
};
assert(!isValidAssetManifestItem(invalidItemMissingLicense), "Lisansı boş olan kayıt validator tarafından reddedilir");

const invalidItemMissingAuthor: AssetManifestItem = {
  id: "invalid_2",
  entityType: "person",
  entityId: "act_invalid",
  assetType: "portrait",
  source: "Web",
  license: "CC BY 4.0",
  author: "", // Boş yazar
  attribution: "Attrib",
};
assert(!isValidAssetManifestItem(invalidItemMissingAuthor), "Yazarı boş olan kayıt validator tarafından reddedilir");

// 7. Aktif ASSET_MANIFEST içindeki 11 pilot öğenin fiziksel dosya ve lisans doğrulaması
assert(ASSET_MANIFEST.length === 11, "Pilot manifest tam 11 doğrulanmış portre içerir (10 Aktör + 1 Yönetmen)");

ASSET_MANIFEST.forEach((item) => {
  assert(isValidAssetManifestItem(item), `Manifest öğesi (${item.id}) lisans, yazar ve atıf kurallarını eksiksiz sağlar`);
  
  if (item.localPath) {
    const fullDiskPath = path.join(process.cwd(), "public", item.localPath.replace(/^\//, ""));
    assert(fs.existsSync(fullDiskPath), `Fiziksel dosya diskte mevcuttur: ${item.localPath}`);
  }
});

// 8. Phase 4: Data-Driven Resolution Tests (Scale & General Entity Resolution)
console.log("\n--- Phase 4: Data-Driven UI Resolution Tests ---");

// A. resolveForMovie
const movieRes = assetResolver.resolveForMovie({ id: "m_inception" });
assert(!movieRes.isAvailable, "m_inception afişi manifestte yoksa isAvailable: false döner");
assert(movieRes.fallbackText === "IN", "m_inception için sinematik baş harf fallback üretilir");

// B. resolveForActor (EntityId, Tam İsim, Alias ve Bilinmeyen Aktör)
const leoById = assetResolver.resolveForActor("act_dicaprio");
assert(leoById.isAvailable && leoById.src === "/assets/portraits/act_dicaprio.jpg", "ID ile aktör portresi çözülür");

const leoByName = assetResolver.resolveForActor("Leonardo DiCaprio");
assert(leoByName.isAvailable && leoByName.src === "/assets/portraits/act_dicaprio.jpg", "Tam isim ile aktör portresi çözülür");

const leoByAlias = assetResolver.resolveForActor("Leo DiCaprio");
assert(leoByAlias.isAvailable && leoByAlias.src === "/assets/portraits/act_dicaprio.jpg", "Takma ad (alias) ile aktör portresi çözülür");

const unknownActor = assetResolver.resolveForActor("Bilinmeyen Aktör 123");
assert(!unknownActor.isAvailable, "Manifestte/Veritabanında olmayan aktör isAvailable: false döner");
assert(unknownActor.fallbackText === "BA", "Bilinmeyen aktör için baş harf fallback üretilir");

// C. resolveForDirector
const nolanByName = assetResolver.resolveForDirector("Christopher Nolan");
assert(nolanByName.isAvailable && nolanByName.src === "/assets/portraits/dir_nolan.jpg", "Yönetmen ismi ile portre çözülür");

const unknownDirector = assetResolver.resolveForDirector("Bilinmeyen Yönetmen");
assert(!unknownDirector.isAvailable, "Bilinmeyen yönetmen isAvailable: false döner");
assert(unknownDirector.fallbackText === "BY", "Bilinmeyen yönetmen için baş harf fallback üretilir");

// D. resolveForCriterion
const critActor: Criterion = { type: "ACTOR", label: "Christian Bale", value: "Christian Bale" };
const critActorRes = assetResolver.resolveForCriterion(critActor);
assert(critActorRes.isAvailable && critActorRes.src === "/assets/portraits/act_bale.jpg", "Kriter üzerinden aktör görseli çözülür");

const critDirector: Criterion = { type: "DIRECTOR", label: "Christopher Nolan", value: "Christopher Nolan" };
const critDirectorRes = assetResolver.resolveForCriterion(critDirector);
assert(critDirectorRes.isAvailable && critDirectorRes.src === "/assets/portraits/dir_nolan.jpg", "Kriter üzerinden yönetmen görseli çözülür");

const critAward: Criterion = { type: "AWARD", label: "Oscar Kazandı", value: "OSCAR" };
const critAwardRes = assetResolver.resolveForCriterion(critAward);
assert(!critAwardRes.isAvailable, "Görseli olmayan kriter (AWARD) fail-silent fallback döner");

// E. 1.000+ Ölçeklenebilirlik Testi: UI kodu değişmeden yeni manifest kaydını otomatik çözme
const dynamicCatalogManifest: AssetManifestItem[] = [
  ...ASSET_MANIFEST,
  {
    id: "ast_m_future_1001_poster",
    entityType: "movie",
    entityId: "m_future_1001",
    assetType: "poster",
    localPath: "/assets/posters/m_future_1001.jpg",
    source: "Wikimedia Commons",
    license: "CC BY-SA 4.0",
    author: "Future Artist",
    attribution: "Future Artist / CC BY-SA 4.0",
    modified: false,
    checksum: "999999999999",
  },
  {
    id: "ast_act_future_2001_portrait",
    entityType: "person",
    entityId: "act_future_2001",
    assetType: "portrait",
    localPath: "/assets/portraits/act_future_2001.jpg",
    source: "Wikimedia Commons",
    license: "CC BY 4.0",
    author: "Future Photographer",
    attribution: "Future Photographer / CC BY 4.0",
    modified: false,
    checksum: "888888888888",
  },
];

const dynamicResolver = new AssetResolver(dynamicCatalogManifest);
const futureMovieRes = dynamicResolver.resolveForMovie({ id: "m_future_1001" });
assert(futureMovieRes.isAvailable && futureMovieRes.src === "/assets/posters/m_future_1001.jpg", "Ölçeklenebilirlik: Yeni eklenen film manifest kaydı UI koduna dokunmadan çözülür");

const futureActorRes = dynamicResolver.resolveForActor("act_future_2001");
assert(futureActorRes.isAvailable && futureActorRes.src === "/assets/portraits/act_future_2001.jpg", "Ölçeklenebilirlik: Yeni eklenen aktör manifest kaydı UI koduna dokunmadan çözülür");

console.log("\n--- Phase 5 & 6: Packaged catalog audit ---");
assert(auditAssetManifest(ASSET_MANIFEST).length === 0, "Paket manifestinde mükerrer kayıt, uzak adres veya eksik lisans yok");

const remoteOnly = new AssetResolver([
  {
    id: "remote",
    entityType: "person",
    entityId: "act_remote",
    assetType: "portrait",
    localPath: "https://example.com/a.jpg",
    source: "Web",
    license: "CC0",
    author: "Nobody",
    attribution: "none",
  },
]);
assert(!remoteOnly.resolve("act_remote", "portrait", "person").isAvailable, "Uzak URL paket görseli sayılmaz");

ASSET_MANIFEST.forEach((item) => {
  const fullDiskPath = path.join(process.cwd(), "public", item.localPath!.replace(/^\//, ""));
  const bytes = fs.readFileSync(fullDiskPath);
  assert(bytes[0] === 0xff && bytes[1] === 0xd8, `${item.id} jpeg başlığı sağlam`);
  assert(bytes.length < 100_000, `${item.id} küçük portre (${bytes.length} bayt)`);
  const sum = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  assert(sum === item.checksum, `${item.id} checksum dosyayla eşleşir`);
  assert(item.width === 160 && item.height === 160 && item.format === "jpeg", `${item.id} 160 jpeg`);
});

console.log("=================================================");
console.log("ASSET INFRASTRUCTURE SUMMARY: ALL TESTS PASSED!");
console.log("=================================================");
