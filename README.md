# 🎬 CINE-XOX (FİLMSEL)

> **Sinema Kültürü ve Taktiksel XOX Düellosu (Web & Mobile Native)**  
> Next.js 14, React 18, Tailwind CSS, TypeScript, Capacitor (iOS & Android) ve Supabase Realtime ile geliştirilmiş 3x3 sinefil strateji oyunu.

[![CI - Cine-XOX Quality Gate](https://github.com/efezturkan/cine-tactico/actions/workflows/ci.yml/badge.svg)](https://github.com/efezturkan/cine-tactico/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.6-119EFF?logo=capacitor)](https://capacitorjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🏛️ Mimari Katmanlar

Proje; temiz kod prensiplerine, katman ayrımına (Layered Clean Architecture) ve hem insan hem de yapay zeka coding agent'larının kolayca çalışabileceği tek sorumluluk ilkesine göre yapılandırılmıştır:

```text
CINE-XOX/
│
├── src/
│   ├── core/                      # 🧠 BAĞIMSIZ OYUN MOTORU (Pure TS, Sıfır UI/DB bağımlılığı)
│   │   ├── engine/                # rules.ts, validator.ts, bot-ai.ts, board-generator.ts
│   │   ├── types/                 # Temel oyun veri tipleri
│   │   └── index.ts
│   │
│   ├── data/                      # 🍿 OYUN İÇERİK VERİTABANLARI
│   │   ├── movies.ts              # Provenance & Wikidata doğrulanmış film arşivi
│   │   ├── boards.ts              # 13+ tematik tahta ve bot rakipler
│   │   └── actors.ts              # Takma ad ve alternatif isim tolerans kataloğu
│   │
│   ├── backend/                   # ☁️ BACKEND & ERİŞİM KATMANI
│   │   ├── supabase/              # client.ts (Güvenli istemci), types.ts (DB DTO'ları)
│   │   └── repositories/          # rooms.ts, matches.ts, profiles.ts, leaderboard.ts
│   │
│   ├── features/                  # 🎮 KULLANICI ÖZELLİKLERİ
│   │   ├── gameplay/              # useGameSession hook'u, HUD ve tahta bileşenleri
│   │   └── multiplayer/           # useRealtimeMatch hook'u, 1v1 oda ve eşleştirme
│   │
│   ├── components/                # 🧩 ORTAK UI BİLEŞENLERİ (Header, ErrorBoundary, Konsollar)
│   ├── utils/                     # 🔊 Ses (Web Audio) ve Dokunsal Geri Bildirim (Capacitor Haptics)
│   └── app/                       # 🌐 Next.js App Router (Layout ve Sayfalar)
│
├── supabase/                      # 🗄️ SUPABASE YAPILANDIRMASI
│   ├── schema.sql                 # Veritabanı tabloları ve Realtime yayını
│   └── migrations/                # Güvenlik ve RLS sertleştirme script'leri
│
├── ios/ & android/                # 📱 CAPACITOR NATIVE PROJELERİ
├── capacitor.config.ts            # Mobil paketleme konfigürasyonu
└── next.config.js                 # output: "export" statik derleme ayarı
```

---

## ⚡ Temel Özellikler

1. **Oyun Modları**:
   - **Klasik Düello (3x3)**: Yönetmen × Oyuncu, Tür × Dönem gibi kriterlerin kesişimine doğru filmi yerleştirerek 3'lü hat kurma.
   - **Ters Kadraj (Ortak Oyuncu)**: İki filmin kesişimindeki ortak aktörü bularak en çok kareyi mühürleme.
   - **Sinefil Konsept & Kült Arenası**: Plot twist, distopya, tek mekan gibi tematik zorluklar.
   - **Bot AI (Yapay Zeka)**: Kolay, Orta ve Usta seviyelerinde organik düşünme süreleri (`getBotThinkingDelay`) ve taktiksel bloklama/kazanma motoru.
   - **Online 1v1 Multiplayer**: Supabase Realtime Broadcast & Presence üzerinden oda kodlu canlı düello.
2. **Anti-Cheat & Eksen Güvenliği**:
   - 12 saniyelik Blitz Shot-Clock ile dış kaynak aramasını önleme.
   - Arama pencerelerinde en az 2 karakter zorunluluğu; tür veya yıl bazlı film listelemeyi engelleyen metadata sızıntı koruması.
   - Her tahtanın tüm 9 hücresinde en az 3 geçerli film/aktör bulunmasını garanti eden matematiksel çözülebilirlik kuralı.
3. **Cross-Platform Native (Capacitor)**:
   - Next.js statik çıktısı (`./out`), iOS ve Android yerel webview'larına gömülerek sıfır gecikmeli çevrimdışı çalışma ve native dokunsal titreşim (`@capacitor/haptics`) sunar.

---

## 🛠️ Kurulum ve Geliştirme

### Gereksinimler
- Node.js 18+ (Önerilen: v20 LTS)
- npm 9+

### Adımlar
```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Ortam değişkenlerini hazırlayın
cp .env.example .env.local
# .env.local dosyasındaki Supabase URL ve Anon Key'i doldurun

# 3. Geliştirme sunucusunu başlatın
npm run dev

# 4. Birim testlerini çalıştırın (38/38 Test)
npm test

# 5. TypeScript tip denetimini yapın
npx tsc --noEmit

# 6. Mobil ve prodüksiyon için statik derleme alın
npm run build
```

---

## 📱 Mobil Derleme (iOS & Android)

```bash
# Next.js statik çıktısını oluşturun ve Capacitor native projeleriyle senkronize edin
npm run build
npx cap sync

# iOS Xcode projesini açın
npx cap open ios

# Android Studio projesini açın
npx cap open android
```

---

## 🧪 Test Kapsamı

Test paketi `src/tests/game-engine.test.ts` üzerinden çalıştırılır ve şunları doğrular:
- 8 farklı kazanma çizgisi tespiti ve tam tahtada beraberlik (`DRAW`).
- 13 tematik tahtanın tamamında 9 hücrenin çözülebilirliği.
- Yapay zeka botunun zorluk derecelerine göre kazanma ve bloklama taktikleri.
- Mühürlü hücrelerin (`LOCKED_NEUTRAL`) korunumu.
- Türkçe karakter normalizasyonu ve Levenshtein mesafeli yazım toleransı.

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır. © 2026 Efe Öztürkan.
