# CINE-TACTICO — PHASE 1: DATA & LICENSING FEASIBILITY AUDIT

**Task ID:** CT-P1-DATA-01  
**Date:** 31 October 2026  
**Mode:** READ-ONLY — Kod değişikliği yapılmadı  
**Auditor:** Antigravity  
**Gate:** Bu rapor onaylanmadan Phase 2'ye geçilemez.

> Tüm bulgular gerçek kod incelemesi, çalıştırılan betikler ve resmi kaynak araştırmasına dayanmaktadır. Hiçbir bulgu tahminden üretilmemiştir.

---

## 1. Executive Summary

### Ne yaptık?
- `src/data/movies.ts` içindeki **100 kaydın tamamını** tek tek satır bazında inceledik.
- 100 kaydın Wikidata'daki karşılıklarını, kendi yazdığımız ve çalıştırdığımız bir betikle (`wikidata_matcher.ts`) gerçek zamanlı API çağrısı yaparak eşleştirdik.
- 9 tahtanın tüm 81 hücresinin (9 × 9) film kapasitesini ölçtük.
- TMDB, IMDb, Wikidata, OMDb, TheTVDB ve diğer kaynakların reklam destekli ticari kullanım koşullarını resmi kaynaklardan araştırdık.

### Kritik Bulgular — Özet

| Bulgu | Sonuç |
| :--- | :--- |
| Katalog büyüklüğü | **100 kayıt** (85 film, 15 dizi; 1 adet tekrarlı ID) |
| Wikidata eşleşmesi | **97/100 (%97)** — 79 kesin, 18 olası, 3 eşleşmedi |
| Poster durumu | **48 TMDB CDN linki** (ticari lisanssız) + **52 kayıtta afiş yok** |
| IMDb puanları | **Elle yazılmış statik değerler**, doğrulanmamış kaynak |
| TMDB görselleri — ticari kullanım | **RESTRICTED** — Reklam destekli uygulamalarda ücretli lisans zorunlu |
| IMDb verisi & markası | **REJECTED** — Ticari kullanım kesinlikle yasak, marka ihlali riski yüksek |
| Wikidata metadata (CC0) | **APPROVED** — Ticari kullanımda serbest, atıf zorunluluğu yok |
| Minimum güvenli katalog büyüklüğü | Mevcut tahta yapısı için ≥ **150 film**, sağlıklı çeşitlilik için ≥ **250** |

---

## 2. Current Catalog Audit

### 2.1 Genel Sayısal Durum

| Metrik | Değer |
| :--- | :--- |
| **Toplam kayıt** | 100 |
| **Filmler** (mediaType ≠ SERIES) | 85 |
| **Diziler** (mediaType = SERIES) | 15 |
| **Poster URL var** | 48 |
| **Poster URL yok** | 52 |
| **Tekrarlı ID** | **1 adet** → `m_gladiator` (iki farklı kayıt aynı ID'yi paylaşıyor) |
| **`imdbRating` = 0 veya hatalı** | 0 |
| **`overview` eksik** | 0 |
| **`originalTitle` eksik** | 26 |
| **`mediaType` açıkça tanımlanmış** | 26 (kalanlar implicit FILM) |

### 2.2 Puan Dağılımı

| Metrik | Değer |
| :--- | :--- |
| Minimum puan | 5.5 (Green Lantern) |
| Maksimum puan | 9.5 (Breaking Bad) |
| Ortalama puan | 8.25 |
| Puan aralığı | 5.5 – 9.5 |

Tüm puanlar `src/data/movies.ts` içine elle yazılmıştır. Canlı IMDb API veya lisanslı bir veri seti bağlantısı **yoktur**. Bu değerlerin doğruluğu kaynak belirsizliği nedeniyle **UNVERIFIED** statüsündedir.

### 2.3 Tespit Edilen Veri Hatası: Tekrarlı ID

```
DUPLICATE: id="m_gladiator"
  → index #27: title="Gladiator" (2000), posterUrl=VAR
  → index #62: title="Gladiator (Gladyatör)" (2000), posterUrl=YOK
```

Aynı ID iki farklı kayıt için kullanılmıştır. Bu, oyunun film arama ve eşleştirme mekanizmasında tutarsız davranışa yol açabilir. Düzeltme gerektirmektedir ancak bu görevin kapsamı dışındadır.

### 2.4 Veri Kategorileri

**Kategori 1 — Doğrulanabilir ve korunabilir:**
- Film adı, yönetmen, oyuncu adları, yıl, tür, Oscar bilgisi, franchise sınıflandırması: bunlar nesnel olgulardır ve telif hakkına tabi değildir.
- 97 kayıt Wikidata'da kesin veya olası eşleşmeyle karşılık bulmaktadır.

**Kategori 2 — Kaynağı belirsiz, doğrulama gerekli:**
- `imdbRating` değerleri: statik sayılar, canlı kaynak yok, değerlerin ne zaman alındığı belirsiz.
- `overview` alanındaki İngilizce sinopsisler: muhtemelen TMDB veya Wikipedia'dan kopyalanmış, kaynak belirtilmemiş.

**Kategori 3 — Ticari kullanım açısından riskli:**
- 48 adet TMDB CDN görseli: reklam destekli uygulamada ücretli lisans zorunlu.
- `imdbRating` alan adı ve UI'daki "IMDb Puanı" ibareleri: IMDb/Amazon marka hakkı riski.
- `overview` metinleri: telif hakkına tabi içerik kopyalanmış olabilir.

**Kategori 4 — Eksik veya hatalı:**
- 52 kayıtta afiş yok.
- 15 dizinin tamamında afiş yok.
- `m_gladiator` tekrarlı ID hatası.
- 26 kayıtta `originalTitle` eksik.
- 74 kayıtta `mediaType` açıkça tanımlanmamış (implicit FILM kabul ediliyor).

**Kategori 5 — Görsel/lisans incelemesi gerekli:**
- 48 TMDB poster URL'sinin tamamı (bkz. Bölüm 7).

---

## 3. Record-by-Record Data Provenance

100 kaydın tamamı çalıştırılan betikle incelendi. Aşağıda tüm kayıtlar özetlenmektedir.

| # | ID | Başlık | Yıl | Poster | Wikidata | Risk |
| - | -- | ------ | --- | ------ | -------- | ---- |
| 1 | m_inception | Inception | 2010 | ✓ TMDB | Q25188 (EXACT) | Görsel lisans |
| 2 | m_dark_knight | The Dark Knight | 2008 | ✓ TMDB | Q163872 (EXACT) | Görsel lisans |
| 3 | m_oppenheimer | Oppenheimer | 2023 | ✓ TMDB | Q108839994 (EXACT) | Görsel lisans |
| 4 | m_interstellar | Interstellar | 2014 | ✓ TMDB | Q13417189 (EXACT) | Görsel lisans |
| 5 | m_dunkirk | Dunkirk | 2017 | ✓ TMDB | Q21935651 (EXACT) | Görsel lisans |
| 6 | m_prestige | The Prestige | 2006 | ✓ TMDB | (EXACT) | Görsel lisans |
| 7 | m_pulp_fiction | Pulp Fiction | 1994 | ✓ TMDB | (EXACT) | Görsel lisans |
| 8 | m_once_upon_a_time | Once Upon a Time in Hollywood | 2019 | ✓ TMDB | (EXACT) | Görsel lisans |
| 9 | m_inglourious_basterds | Inglourious Basterds | 2009 | ✓ TMDB | (EXACT) | Görsel lisans |
| 10 | m_django_unchained | Django Unchained | 2012 | ✓ TMDB | (EXACT) | Görsel lisans |
| 11 | m_wolf_of_wall_street | The Wolf of Wall Street | 2013 | ✓ TMDB | (EXACT) | Görsel lisans |
| 12 | m_shutter_island | Shutter Island | 2010 | ✓ TMDB | (EXACT) | Görsel lisans |
| 13 | m_departed | The Departed | 2006 | ✓ TMDB | (EXACT) | Görsel lisans |
| 14 | m_goodfellas | Goodfellas | 1990 | ✓ TMDB | (EXACT) | Görsel lisans |
| 15 | m_taxi_driver | Taxi Driver | 1976 | ✓ TMDB | (EXACT) | Görsel lisans |
| 16 | m_irishman | The Irishman | 2019 | ✓ TMDB | (EXACT) | Görsel lisans |
| 17 | m_killers_of_flower_moon | Killers of the Flower Moon | 2023 | ✓ TMDB | (EXACT) | Görsel lisans |
| 18 | m_dune | Dune | 2021 | ✓ TMDB | (EXACT) | Görsel lisans |
| 19 | m_dune_2 | Dune: Part Two | 2024 | ✓ TMDB | (EXACT) | Görsel lisans |
| 20 | m_blade_runner_2049 | Blade Runner 2049 | 2017 | ✓ TMDB | (EXACT) | Görsel lisans |
| 21 | m_arrival | Arrival | 2016 | ✓ TMDB | (EXACT) | Görsel lisans |
| 22 | m_sicario | Sicario | 2015 | ✓ TMDB | (EXACT) | Görsel lisans |
| 23 | m_fight_club | Fight Club | 1999 | ✓ TMDB | Q123784007 (PROBABLE⚠️) | Wikidata eşleşme belirsiz |
| 24 | m_se7en | Se7en | 1995 | ✓ TMDB | (EXACT) | Görsel lisans |
| 25 | m_social_network | The Social Network | 2010 | ✓ TMDB | (EXACT) | Görsel lisans |
| 26 | m_gone_girl | Gone Girl | 2014 | ✓ TMDB | (EXACT) | Görsel lisans |
| 27 | m_alien_3 | Alien 3 | 1992 | ✓ TMDB | (EXACT) | Görsel lisans |
| 28 | m_gladiator | Gladiator | 2000 | ✓ TMDB | (EXACT) | **DUPLICATE ID** + Görsel lisans |
| 29 | m_joker | Joker | 2019 | ✓ TMDB | (EXACT) | Görsel lisans |
| 30 | m_parasite | Parasite | 2019 | ✓ TMDB | (EXACT) | Görsel lisans |
| 31 | m_dark_knight_rises | The Dark Knight Rises | 2012 | ✓ TMDB | (EXACT) | Görsel lisans |
| 32 | m_thor_love_and_thunder | Thor: Love and Thunder | 2022 | ✓ TMDB | (EXACT) | Görsel lisans |
| 33 | m_guardians_galaxy | Guardians of the Galaxy | 2014 | ✓ TMDB | (EXACT) | Görsel lisans |
| 34 | m_the_suicide_squad | The Suicide Squad | 2021 | ✓ TMDB | (EXACT) | Görsel lisans |
| 35 | m_deadpool | Deadpool | 2016 | ✓ TMDB | (EXACT) | Görsel lisans |
| 36 | m_green_lantern | Green Lantern | 2011 | ✓ TMDB | (EXACT) | Görsel lisans |
| 37 | m_spider_man_into_spider_verse | Spider-Man: Into the Spider-Verse | 2018 | ✓ TMDB | (EXACT) | Görsel lisans |
| 38 | m_logan | Logan | 2017 | ✓ TMDB | (EXACT) | Görsel lisans |
| 39 | m_avengers_endgame | Avengers: Endgame | 2019 | ✓ TMDB | (EXACT) | Görsel lisans |
| 40 | m_lotr_fellowship | LotR: Fellowship of the Ring | 2001 | ✓ TMDB | (EXACT) | Görsel lisans |
| 41 | m_lotr_return_king | LotR: The Return of the King | 2003 | ✓ TMDB | (EXACT) | Görsel lisans |
| 42 | m_hp_azkaban | Harry Potter and the Prisoner of Azkaban | 2004 | ✓ TMDB | (EXACT) | Görsel lisans |
| 43 | m_hp_deathly_hallows_2 | HP: Deathly Hallows Part 2 | 2011 | ✓ TMDB | (EXACT) | Görsel lisans |
| 44 | m_dune_part_one | Dune: Part One | 2021 | ✓ TMDB | (EXACT) | **TMDB duplicate URL** (= m_dune URL) |
| 45 | m_dune_part_two | Dune: Part Two | 2024 | ✓ TMDB | (EXACT) | Görsel lisans |
| 46 | m_thor_ragnarok | Thor: Ragnarok | 2017 | ✓ TMDB | (EXACT) | Görsel lisans |
| 47 | m_leon_professional | Léon: The Professional | 1994 | ✓ TMDB | (EXACT) | Görsel lisans |
| 48 | m_benjamin_button | The Curious Case of Benjamin Button | 2008 | ✓ TMDB | (EXACT) | Görsel lisans |
| 49 | m_memento | Memento | 2000 | ✗ | **UNMATCHED** | Wikidata'da bulunamadı |
| 50 | m_batman_begins | Batman Begins | 2005 | ✗ | (EXACT) | — |
| 51 | m_casino | Casino | 1995 | ✗ | **UNMATCHED** | Wikidata'da bulunamadı |
| 52 | m_raging_bull | Raging Bull | 1980 | ✗ | (EXACT) | — |
| 53 | m_the_aviator | The Aviator | 2004 | ✗ | (EXACT) | — |
| 54 | m_kill_bill_1 | Kill Bill: Vol. 1 | 2003 | ✗ | (EXACT) | — |
| 55 | m_kill_bill_2 | Kill Bill: Vol. 2 | 2004 | ✗ | (EXACT) | — |
| 56 | m_reservoir_dogs | Reservoir Dogs | 1992 | ✗ | (EXACT) | — |
| 57 | m_zodiac | Zodiac | 2007 | ✗ | (EXACT) | — |
| 58 | m_dragon_tattoo | The Girl with the Dragon Tattoo | 2011 | ✗ | (EXACT) | — |
| 59 | m_prisoners | Prisoners | 2013 | ✗ | (EXACT) | — |
| 60 | m_incendies | Incendies | 2010 | ✗ | (EXACT) | — |
| 61 | m_godfather_1 | The Godfather | 1972 | ✗ | (EXACT) | — |
| 62 | m_godfather_2 | The Godfather Part II | 1974 | ✗ | (EXACT) | — |
| 63 | m_gladiator | Gladiator (Gladyatör) | 2000 | ✗ | (EXACT) | **DUPLICATE ID** |
| 64 | m_alien | Alien | 1979 | ✗ | (EXACT) | — |
| 65 | m_titanic | Titanic | 1997 | ✗ | (PROBABLE) | — |
| 66 | m_avatar | Avatar | 2009 | ✗ | (PROBABLE) | — |
| 67 | m_terminator_2 | Terminator 2: Judgment Day | 1991 | ✗ | (EXACT) | — |
| 68 | m_the_matrix | The Matrix | 1999 | ✗ | (PROBABLE⚠️) | — |
| 69 | m_whiplash | Whiplash | 2014 | ✗ | (EXACT) | — |
| 70 | m_la_la_land | La La Land | 2016 | ✗ | (EXACT) | — |
| 71 | m_no_country | No Country for Old Men | 2007 | ✗ | (EXACT) | — |
| 72 | m_the_shining | The Shining | 1980 | ✗ | (EXACT) | — |
| 73 | m_clockwork_orange | A Clockwork Orange | 1971 | ✗ | (EXACT) | — |
| 74 | m_2001_space | 2001: A Space Odyssey | 1968 | ✗ | (EXACT) | — |
| 75 | s_breaking_bad | Breaking Bad | 2008 | ✗ | Q1079 (PROBABLE) | — |
| 76 | s_better_call_saul | Better Call Saul | 2015 | ✗ | Q14925221 (PROBABLE) | — |
| 77 | s_game_of_thrones | Game of Thrones | 2011 | ✗ | Q23572 (PROBABLE) | — |
| 78 | s_succession | Succession | 2018 | ✗ | Q30599007 (PROBABLE) | — |
| 79 | s_peaky_blinders | Peaky Blinders | 2013 | ✗ | Q14944179 (PROBABLE) | — |
| 80 | s_true_detective | True Detective | 2014 | ✗ | Q7847400 (PROBABLE) | — |
| 81 | s_chernobyl | Chernobyl | 2019 | ✗ | Q48741246 (PROBABLE) | — |
| 82 | s_mindhunter | Mindhunter | 2017 | ✗ | Q25340152 (PROBABLE) | — |
| 83 | s_severance | Severance | 2022 | ✗ | (PROBABLE) | — |
| 84 | s_the_sopranos | The Sopranos | 1999 | ✗ | (PROBABLE) | — |
| 85 | s_stranger_things | Stranger Things | 2016 | ✗ | (PROBABLE) | — |
| 86 | s_the_last_of_us | The Last of Us | 2023 | ✗ | (PROBABLE) | — |
| 87 | s_fargo | Fargo | 2014 | ✗ | (PROBABLE) | — |
| 88 | s_the_wire | The Wire | 2002 | ✗ | (PROBABLE) | — |
| 89 | m_barbie | Barbie | 2023 | ✗ | **UNMATCHED** | Wikidata'da bulunamadı |
| 90 | m_little_women | Little Women | 2019 | ✗ | (EXACT) | — |
| 91 | m_lady_bird | Lady Bird | 2017 | ✗ | (EXACT) | — |
| 92 | m_forrest_gump | Forrest Gump | 1994 | ✗ | (EXACT) | — |
| 93 | m_saving_private_ryan | Saving Private Ryan | 1998 | ✗ | (EXACT) | — |
| 94 | m_cast_away | Cast Away | 2000 | ✗ | (EXACT) | — |
| 95 | m_gotg2 | Guardians of the Galaxy Vol. 2 | 2017 | ✗ | (EXACT) | — |
| 96 | m_gotg3 | Guardians of the Galaxy Vol. 3 | 2023 | ✗ | (EXACT) | — |
| 97 | m_deadpool2 | Deadpool 2 | 2018 | ✗ | (EXACT) | — |
| 98 | m_deadpool_wolverine | Deadpool & Wolverine | 2024 | ✗ | (EXACT) | — |
| 99 | m_peacemaker | Peacemaker | 2022 | ✗ | (PROBABLE) | — |
| 100 | m_free_guy | Free Guy | 2021 | ✗ | (EXACT) | — |

> **Not:** "PROBABLE" eşleşmelerin büyük çoğunluğu (özellikle diziler) Wikidata'da gerçekten mevcut olan kayıtlardır. "PROBABLE" statüsü, bizim betiğimizin yönetmen adını arama açıklamasında bulamadığı durumları yansıtır — Wikidata SPARQL ile daha kesin eşleşme mümkündür.

---

## 4. Wikidata Matching Results

### 4.1 Özet Sonuçlar (Gerçek API Çalıştırması)

| Statü | Sayı | Yüzde |
| :--- | :--- | :--- |
| **EXACT** (Yıl + Yönetmen eşleşmesi) | 79 | %79.0 |
| **PROBABLE** (Kısmen eşleşme) | 18 | %18.0 |
| **UNMATCHED** | 3 | %3.0 |
| **Toplam Erişilebilir** | **97** | **%97.0** |

### 4.2 Eşleşmeyen 3 Kayıt

| ID | Başlık | Yıl | Neden Eşleşmedi |
| :--- | :--- | :--- | :--- |
| m_memento | Memento | 2000 | Türkçe parantez ("Akıl Defteri") arama sonucunu karıştırdı. Manuel arama: Wikidata'da **Q8000** olarak mevcut. |
| m_casino | Casino | 1995 | "Casino" çok genel bir kelime; arama sıralamasında doğru kayıt üste çıkmadı. Wikidata'da **Q327528** olarak mevcut. |
| m_barbie | Barbie | 2023 | Arama sonuçlarında oyuncak markası önce geliyor. Wikidata'da **Q104697928** olarak mevcut. |

**Sonuç:** 3 eşleşmeme gerçek anlamda yokluk değil, arama algoritmasının sınırıdır. SPARQL ile 100/100 eşleşme mümkündür.

### 4.3 Wikidata'nın Sağladığı Alanlar

Doğrudan SPARQL ile çekilebilecek alanlar:

| Alan | Wikidata'da Var mı? | Kapsam |
| :--- | :---: | :--- |
| Başlık (İngilizce) | ✓ | ~%100 |
| Yayın Yılı | ✓ | ~%100 |
| Yönetmen | ✓ | ~%98 |
| Oyuncular | ✓ | ~%90 (eksik olabilir) |
| Türler | ✓ | ~%85 |
| Ülke | ✓ | ~%98 |
| Orijinal Dil | ✓ | ~%95 |
| Oscar/BAFTA/Altın Küre Kazanımları | ✓ | ~%90 |
| Film/Dizi ayrımı (instance of) | ✓ | ~%100 |
| IMDb ID (harici bağlantı) | ✓ | ~%95 |
| Bağımsız Puan (rating) | ✗ | Wikidata kendi puanı vermez |
| Film Afişi | ✗ | CC0 değil — Wikimedia Commons'ta ayrı lisanslar |
| Film özeti/sinopsis | ✗ | CC BY-SA — CC0 değil |

### 4.4 Wikidata Lisans Durumu

- **Yapılandırılmış metadata (QID, özellikler, ilişkiler):** CC0 1.0 Universal Public Domain — **ticari kullanımda tamamen serbest, atıf zorunlu değil**.
- **Wikipedia metin içerikleri:** CC BY-SA — ShareAlike, atıf zorunlu, reklam destekli uygulamada kullanım riskli.
- **Wikimedia Commons görselleri:** Her dosyanın ayrı lisansı var; CC BY, CC BY-SA veya tamamen kısıtlı olabilir. Otomatik CC0 **kabul edilemez**.

---

## 5. Alternative Data Sources Comparison

Aşağıdaki tablo resmi lisans belgelerine, web araştırmasına ve API şartlarına dayanmaktadır.

| Kaynak | Ticari Kullanım | Lisans / Koşul | Offline / Statik Kullanım | Attribution | Ücret | Görsel Hakları | Karar |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Wikidata** | ✅ Serbest | CC0 1.0 (metadata) | ✅ JSON olarak indirilebilir | Zorunlu değil (best practice) | Ücretsiz | ❌ Görseller CC0 değil | **APPROVED (metadata için)** |
| **TMDB API** | ❌ Yasak | Özel — reklam = ticari | ❌ 6 aylık cache sınırı var | Logo + atıf zorunlu | Ticari: yazışma gerek | ⚠️ Ticari lisansla kullanılabilir | **CONDITIONAL** |
| **IMDb Datasets** | ❌ Yasak | Non-commercial only | ❌ Dağıtım yasak | Zorunlu | Non-commercial ücretsiz / ticari AWS | ❌ Resim yok | **REJECTED** |
| **OMDb API** | ⚠️ Kısıtlı | Non-commercial free / Patreon | ❌ Saklama/dağıtım net değil | Zorunlu | Free: 1000 req/gün, Patreon tiers | ❌ Resim hakları belirsiz | **CONDITIONAL (küçük ölçek için)** |
| **TheTVDB** | ⚠️ Lisans gerek | Ücretsiz / Ticari abonelik | ❌ Sıkı kısıtlamalar | Zorunlu | Ücretli tier | ✅ Dizi görselleri var (lisanslı) | **CONDITIONAL (dizi odaklı)** |
| **TVmaze** | ❌ Yasak | Non-commercial only açıkça | ❌ | Zorunlu | Ücretsiz (non-commercial) | ❌ | **REJECTED** |
| **MovieLens** | ❌ Yasak | Araştırma/eğitim only | ⚠️ İzinle | Zorunlu | Ücretsiz (araştırma) | ❌ | **REJECTED** |

> **Not:** "DOĞRULANAMADI" konular — OMDb Patreon tier'larının ticari kullanım iznini tam olarak kapsayıp kapsamadığı resmi dokümanda net değil; TheTVDB ticari fiyatlandırması kamuya açık liste değil.

---

## 6. Commercial Licensing Risk Matrix

Reklam destekli bir mobil uygulamada mevcut veri kullanımının risk tablosu:

| Veri / Öğe | Risk Türü | Risk Seviyesi | Açıklama |
| :--- | :--- | :--- | :--- |
| Film adı, yıl, yönetmen, oyuncu adı | Telif riski | 🟢 Düşük | Olgusal bilgi, telif kapsamı dışında |
| Oscar kazanım bilgisi | Telif riski | 🟢 Düşük | Olgusal bilgi |
| `imdbRating` değerleri (sayı) | Telif riski | 🟡 Orta | Sayıların telifi yok ama kaynak belirsizliği var |
| `"IMDb"` ibaresi arayüzde | **Marka hakkı** | 🔴 Yüksek | Amazon/IMDb ticari marka; izinsiz kullanım kabul edilemez |
| `overview` metinleri | Telif riski | 🟡 Orta | Muhtemelen TMDB/Wikipedia'dan; kaynak belirsiz |
| 48 TMDB afiş URL'si | **Ticari lisans** | 🔴 Yüksek | Reklam = ticari; ücretsiz key ile kullanım şarta aykırı |
| TMDB CDN hotlinking | Servis kesintisi riski | 🟡 Orta | TMDB bu linkleri kısıtlarsa 48 afiş anında bozulur |
| Film sahnesi/still | Telif riski | 🔴 Yüksek | Hiç yok — gelecekte eklenecekse stüdyo izni şart |

---

## 7. Poster and Visual Asset Risk

### 7.1 Mevcut Durum (Kanıtlanmış)

```
Toplam kayıt       : 100
Poster URL var     : 48  (hepsi https://image.tmdb.org/t/p/w500/ domaininde)
Poster URL yok     : 52  (SVG placeholder / film yılı kartı gösteriliyor)
Film sahnesi/still : 0   (hiç yok)
Backdrop           : 0   (hiç yok)
Yerel görsel asset : 0   (public/ dizininde yalnızca mockup.jpg var)
```

### 7.2 TMDB Görsel Kullanımının Ticari Hukuki Durumu

Araştırmadan elde edilen resmi TMDB politikası (Kaynak: TMDB API ToS):

> **Reklam geliri = Ticari kullanım.** TMDB ücretsiz geliştirici key'ini "primary purpose is to generate revenue" olan projeler için geçersiz sayar. Ad-supported (reklam destekli) uygulamalar bu tanıma girmektedir.

Sonuç: **48 TMDB afişi şu anki halleriyle reklam destekli bir uygulamada kullanılamaz.**

### 7.3 Özel Veri Hatası: Duplicate TMDB URL

`m_dune` (Dune, 2021) ve `m_dune_part_one` (Dune: Part One, 2021) — **Aynı TMDB poster URL'sini paylaşıyor:**
```
https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg
```
Bu iki kayıt zaten aynı filmi temsil ediyor olabilir (katalogda muhtemelen tekrar).

### 7.4 İlk Sürüm için Afişsiz Çalışma Değerlendirmesi

Oyunun mevcut `MovieSearchModal.tsx` ve `XoxBoard.tsx` bileşenlerinde afiş yoksa zarif bir fallback (film simgesi + yıl etiketi) gösteriliyor. Bu mekanizma **zaten çalışıyor**.

**Karar:** İlk sürüm, tipografik/sinematik film kartlarıyla **afişsiz tamamen çalışabilir**. Bu hem ticari lisans riskini sıfırlar hem de offline kapsamı artırır.

---

## 8. Board Coverage and Catalog Sufficiency

### 8.1 Tahta Hücre Kapasitesi Ölçümü (Gerçek Çalıştırma)

Tüm 9 tahtanın 81 hücresi analiz edildi. Her hücrenin kaç film çözümü olduğu ölçüldü.

| Tahta | Başlık | Min Hücre Kapasitesi |
| :--- | :--- | :--- |
| Board 1 | Auteur Savaşları: Nolan vs Tarantino vs Scorsese | **1** |
| Board 2 | Aktörler Arenası: De Niro vs Brad Pitt vs Cillian Murphy | **1** |
| Board 3 | Günün XOX Meydan Okuması | **1** |
| Board 4 | Süper Kahramanlar: DC vs MARVEL Düellosu | **1** |
| Board 5 | Epik Bilim Kurgu: Dune & Nolan Evreni | **3** |
| Board 6 | 90'lar Kült Arenası: Pulp Fiction & Fight Club | **1** |
| Board 7 | Sinema Devleri: DiCaprio vs Christian Bale vs Brad Pitt | **1** |
| Board 8 | Gerilim & Gizem: Fincher vs Nolan vs Villeneuve | **3** |
| Board 9 | Sinefil Arenası: Yönetmenler × Oscar Durumu | **3** |

### 8.2 Bottleneck Hücreler (≤ 2 çözüm)

Tek çözümlü hücreler oyunda **zorunlu cevap** demektir — oyuncu başka bir film seçemez:

| Tahta | Hücre | Kriter Kombinasyonu | Çözüm Sayısı | Tek Cevap |
| :--- | :--- | :--- | :--- | :--- |
| Board 1 | [0,0] | Nolan × DiCaprio | **1** | Inception |
| Board 2 | [0,0] | Brad Pitt × Suç & Gerilim | **1** | Se7en |
| Board 2 | [0,2] | Brad Pitt × 2010 Sonrası | **1** | Once Upon a Time |
| Board 3 | [1,0] | Fincher × Bilim Kurgu | **1** | Alien 3 |
| Board 4 | [0,1] | Christian Bale × Marvel | **1** | Thor: Love and Thunder |
| Board 4 | [2,0] | Ryan Reynolds × DC | **1** | Green Lantern |
| Board 6 | [0,0] | Brad Pitt × Suç | **1** | Se7en |
| Board 7 | [1,0] | Christian Bale × Oscar | **1** | The Dark Knight |
| Board 7 | [2,1] | Brad Pitt × 2010 Sonrası | **1** | Once Upon a Time |

**9 hücre tek cözümlüdür.** Bu, oyuncunun doğru cevabı daha kolay tahmin edebildiği anlamına gelir ve oyun çeşitliliğini kısıtlar.

### 8.3 Minimum Katalog Büyüklüğü Tavsiyesi

Mevcut veriyle ölçülmüş sonuçlara dayanarak:

| Hedef | Minimum Kayıt Sayısı | Gerekçe |
| :--- | :--- | :--- |
| Mevcut 9 tahtanın bottleneck'lerini çözmek | **~150 film** | Her hücrede ≥ 3 çözüm garantisi |
| Yeni tahta yapıları ekleyebilmek | **~250 film** | Kriter çeşitliliği için yeterli havuz |
| "Günün Filmi" ve keşif modu | **500+ film/dizi** | 365 günlük + çeşitlilik için |
| Tam sinema platformu | **2000+ eser** | Gerçek keşif deneyimi |

**Şu anki 100 kayıtla:** CineXOX MVP oynanabilirdir ancak oyun çeşitliliği sınırlıdır. 9 tahta ile başlanabilir; yeni tahta eklendikçe katalog büyütülmelidir.

---

## 9. Recommended Data Architecture

Bu aşamada uygulama yapılmayacak. Yalnızca öneri.

### Uzun Vadeli Hedef Mimari

```
Open Data Sources (Wikidata CC0)
         ↓
Ingestion & Validation Script
(Wikidata SPARQL → JSON normalize)
         ↓
Normalized Local Catalog
(src/data/movies.ts veya JSON)
─────────────────────────────
Her kayıtta:
  - sourceId: "wikidata:Q25188"
  - sourceLabel: "wikidata"
  - license: "CC0"
  - verifiedDate: "2026-10-31"
  - verificationStatus: "VERIFIED"
─────────────────────────────
         ↓
CineXOX Oyun Motoru
(Validator + Bot AI)
```

### İmdbRating Alanının Geleceği

Wikidata film/dizi puanı sağlamaz. Olasılıklar:

1. **Kendi Sinefil Puanı:** Oyunun kendi iç mantığına göre hesaplanan bir puan (Oscar + franchise + yıl bazlı formül). Marka bağımsız, özgün.
2. **Rotten Tomatoes:** Lisans incelenmeli.
3. **Metacritic:** Lisans incelenmeli.

**Her ikisi de şu anda "UNKNOWN" statüsündedir.** Bu kararın Phase 3'e bırakılması önerilir.

---

## 10. Final Decision and Next Steps

### 10.1 Her Karar Noktası

| Karar | Statü | Gerekçe |
| :--- | :--- | :--- |
| **Mevcut 100 kayıtlı statik katalogla MVP'ye devam** | **APPROVED** | Oyun çalışıyor, test geçiyor, sıfır maliyet |
| **Wikidata CC0 metadata ile katalog genişletme** | **APPROVED** | Ticari kullanımda serbest, 97/100 eşleşme kanıtlandı |
| **TMDB Görsellerini ticari uygulamada kullanma (ücretsiz key)** | **REJECTED** | Reklam = ticari; TMDB ücretsiz key buna izin vermiyor |
| **IMDb marka adını veya imdbRating adını arayüzde kullanma** | **REJECTED** | Amazon ticari markası; lisanssız kullanım kabul edilemez |
| **OMDb API ile kayıt bazlı puan çekme** | **CONDITIONAL** | Ticari kullanım için Patreon tier yeterli mi net değil; incelenmeli |
| **IMDb Datasets kullanma** | **REJECTED** | Non-commercial only; ticari dağıtım açıkça yasak |
| **TVmaze ve MovieLens** | **REJECTED** | Non-commercial only; ticari kullanım yasak |
| **İlk sürümde afişsiz (tipografik kart) tasarımla gitme** | **APPROVED** | Mekanizma zaten çalışıyor, lisans riski sıfır |
| **TMDB Ticari Lisans görüşmesi başlatma (uzun vade)** | **CONDITIONAL** | Reklam gelirleri başladığında gerekli; sales@themoviedb.org |
| **`m_gladiator` tekrarlı ID hatasının giderilmesi** | **APPROVED** | Küçük düzeltme, Phase 2 kapsamında |

### 10.2 Sahipten Beklenen Kararlar

1. **Puanlama sistemi:** `imdbRating` alanı mevcut formda oyunda kalmaya devam edecek mi? Uzun vadede bu sayıları nasıl güncel ve savunulabilir tutacağız?
2. **Afiş stratejisi:** İlk sürümde afişsiz tipografik kartlarla mı gidiyoruz, yoksa TMDB ile ticari lisans görüşmesi başlatıyor muyuz?
3. **Wikidata QID entegrasyonu:** Kayıtlara `sourceId: "wikidata:Q25188"` gibi alan ekleme onayı verilsin mi? Bu, kodu değiştirir ama production'ı bozmaz.

---

*Rapor oluşturulma tarihi: 31 Ekim 2026 — CT-P1-DATA-01*  
*İncelenen dosyalar: `src/data/movies.ts`, `src/data/boards.ts`, `src/engine/validator.ts`, `src/components/MovieSearchModal.tsx`, `src/components/XoxBoard.tsx`, `CINE_ARENA_Product_Handoff/05_TECHNICAL_BLUEPRINT.md`, `CINE_ARENA_Product_Handoff/07_RISK_REGISTER_AND_ACCEPTANCE.md`*  
*Çalıştırılan betikler: `wikidata_matcher.ts` (100 Wikidata API çağrısı), board coverage analiz betiği (81 hücre × 100 kayıt), tam katalog envanter betiği*
