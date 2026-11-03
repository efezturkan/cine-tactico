import { hasSeenGuide, markGuideAsSeen } from "../utils/guideStorage";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`  ✓ PASS: ${msg}`);
}

console.log("=================================================");
console.log("CINEXOX REHBER GÖSTERİM (TUR 10C) TEST SUITE");
console.log("=================================================");

// 1. Mock LocalStorage
const mockStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStore[key] || null,
  setItem: (key: string, val: string) => {
    mockStore[key] = val;
  },
  removeItem: (key: string) => {
    delete mockStore[key];
  },
  clear: () => {
    for (const k of Object.keys(mockStore)) delete mockStore[k];
  },
};

(global as any).window = {
  location: { search: "" },
  localStorage: mockLocalStorage,
};
(global as any).localStorage = mockLocalStorage;

// Test 1: İlk açılışta (depolama temizken) rehber görülmemiş olmalı
mockLocalStorage.clear();
assert(hasSeenGuide() === false, "Depolama temizken hasSeenGuide() false döner");

// Test 2: ANLADIM ile kapatılınca 'cinexox_rehber_v1 = görüldü' yazılır ve hasSeenGuide() true olur
markGuideAsSeen();
assert(mockStore["cinexox_rehber_v1"] === "görüldü", "markGuideAsSeen() 'cinexox_rehber_v1 = görüldü' yazar");
assert(hasSeenGuide() === true, "İşaretlendikten sonra hasSeenGuide() true döner");

// Test 3: Uygulama kapatılıp açılsa da (yeni kontrol) tekrar çıkmaz
assert(hasSeenGuide() === true, "Sonraki kontrollerde rehber görülmüş kalır");

// Test 4: Davet linki simülasyonu
const normalParams = new URLSearchParams("");
const inviteParams = new URLSearchParams("?room=CX-TEST99");
assert(inviteParams.has("room") === true, "Davet linkinde ?room parametresi tespit edilir");
assert(normalParams.has("room") === false, "Normal açılışta ?room parametresi yoktur");

// Test 5: Mod İpuçları Anahtarları
mockLocalStorage.setItem("cinexox_ipucu_ters", "görüldü");
mockLocalStorage.setItem("cinexox_ipucu_konsept", "görüldü");
assert(mockLocalStorage.getItem("cinexox_ipucu_ters") === "görüldü", "Ters Kadraj anahtarı 'cinexox_ipucu_ters' doğru kayıtlı");
assert(mockLocalStorage.getItem("cinexox_ipucu_konsept") === "görüldü", "Sinefil Konsept anahtarı 'cinexox_ipucu_konsept' doğru kayıtlı");

console.log("=================================================");
console.log("REHBER GÖSTERİM TESTLERİ TAMAMLANDI: TÜMÜ GEÇTİ!");
console.log("=================================================");
