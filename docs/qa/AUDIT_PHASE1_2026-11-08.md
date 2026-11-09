# Cine-XOX / Cine-Tactico — Faz 1 Denetim Raporu (yalnızca inceleme)

Tarih: 2026-11-08 · Kapsam: `main` @ c886cd7, çalışma ağacı temiz · Bu rapor dışında hiçbir dosya değiştirilmedi.

## 0. Kanıt düzeyleri ve sınırlar (önce bunu oku)

| Etiket | Anlamı |
|---|---|
| **[ÖLÇÜLDÜ]** | Bu oturumda komut çalıştırıldı, çıktı görüldü |
| **[KODDAN]** | Kaynak okunarak çıkarıldı, çalıştırılıp doğrulanmadı |
| **[GÖZLEM]** | Tarayıcıda (dev sunucu, 375×812) bir kez görüldü, tekrar edilmedi |
| **[VARSAYIM]** | Kanıt yok, tahmin |

**Yapılmadı / doğrulanamadı:** gerçek cihazda klavye davranışı, iOS/Android farkları, Vercel production adresi (ağ erişimi denenmedi), App Store paketi, gerçek oyuncu testi, rakip ürünlerin güncel kullanıcı yorumları (web araştırması yapılmadı, Bölüm G genel bilgiye dayanır), Ters Kadraj ve Günün Kadrası'nın elle oynanışı. Simülasyon sonuçları **bot modelinin** davranışıdır, insan verisi değildir.

**Brief'teki başlangıç bağlamı güncel değil.** Pass & Play, Turnuva ve 9 sn'lik sahte global eşleştirme kodda yok. Mod listesi `GameMode = "VS_BOT" | "ONLINE_ROOM" | "DAILY_SOLO"` ve `FLAGS.SHOW_ONLINE_ROOM = false` [KODDAN: `src/core/types/index.ts:166`, `src/config/flags.ts:42`]. `MOVIE-DATA-AND-LICENSE-AUDIT.md` (100 kayıt, TMDB hotlink) bayat: katalog artık 722 kayıt ve `src/` içinde tmdb/imdb geçmiyor [ÖLÇÜLDÜ: grep].

---

## A. Executive Summary

**Gerçek kimlik:** Çevrimdışı, tek oyunculu, bota karşı oynanan bir **sinema bilgisi + XOX taktiği hibriti**. Çevrimiçi kapalı. v1.0 TestFlight kapsamı: Klasik Düello, Ters Kadraj, Sinefil Konsept, Günün Kadrası, 3 sekmeli alt bar.

**Güçlü taraflar**
- Kurallar tek yerde ve saf fonksiyon: `rules.ts`, `session.ts`, `validator.ts`; bot, hook ve test aynı fonksiyonları çağırıyor. Başsız simülatör (`sim-helpers.ts`) var, bu çok değerli.
- `tsc` 0 hata; `npm test` 19 dosyanın hepsi yeşil [ÖLÇÜLDÜ].
- Hücre kuralı tutarlı ve oyuncuya adil: tek hak, iki taraf da yakarsa nötr kilit, çalma yok.
- Bot "bilgi + taktik" olarak modellenmiş, gizli bilgiye bakmıyor (yalnızca kendi "hatırlama" zarını atıyor) [KODDAN: `bot-ai.ts:51-54`].
- Ana ekran sade, tek birincil eylem, 375px'te taşma görmedim [GÖZLEM].

**En büyük eksikler**
1. **Altın Makara (finalin yarısı) hatalı ve çok kolay** (P0, aşağıda).
2. **Rarity strateji değil süs:** hat kazanımını etkilemiyor, yalnızca beraberlik bozucu; üstelik yapısal olarak ilk oyuncuya yarıyor.
3. **İlk oyuncu avantajı büyük** ve mevcut bot testi bunu görmüyor.
4. **Hücre havuzları çok dar** (medyan 5 cevap): "bil ya da kaybet" hissi riski.
5. **Sunucu tarafı eski kurallarda** (çalma var, cevap doğrulaması yok). Online açılmadan önce yeniden yazılmalı.

**Genel değerlendirme:** Teknik temel sağlam, oyun tasarımı **henüz kanıtlanmamış**. Çekirdek döngü "doğru" ama final kuralı (Altın Makara) ve rarity bağı oyunun en kritik anını zayıflatıyor. Yeni özellik değil, bu iki şeyin düzeltilmesi öncelik.

---

## B. Game Identity Assessment

- **Kategori:** Hibrit, ağırlık **bilgi tarafında**. Strateji katmanı gerçek ama ince: hücre seçimi (nerede cevabım var?), hat tehdidi/savunma, kilit.
- **Vaat (kodun ima ettiği):** "Kareyi seç, rakibini oku" (sayfa başlığı). Yani vaat sinema bilgisi değil, **okuma ve taktik**. Bunu oyun bugün tam yerine getirmiyor: rakip hamlesini okumanın bir ödülü yok, çünkü rakibin ne bildiği gizli ve botun "ne bildiği" oyuncuya hiçbir şekilde ipucu vermiyor.
- **Farklılaşma:** XOX + kesişim bilgisi, Immaculate Grid benzeri ızgara türüne yakın; ayrışma **iki taraflı sıra, tek hak, nötr kilit ve 12 sn baskı**. Bu gerçek ama anlatılması zor. Estetik kimlik (35mm, salon ışığı) rakiplerden net ayrışıyor.

---

## C. Current State Audit

| Özellik | Kodda | Çalışıyor | Kalite | Risk |
|---|---|---|---|---|
| VS Bot (3 seviye + isimli botlar) | Evet | Evet [GÖZLEM, ölçülen sim] | İyi | Rakip kimliği uyuşmazlığı (F-7) |
| Klasik / Sinefil Konsept | Evet | Evet (tsc+test) | İyi | Dar havuz |
| Ters Kadraj | Evet (2 hazır tahta) | Testlerde evet, elle oynanmadı | Orta | Sadece 2 tahta = hızlı tekrar |
| Günün Kadrası | Evet, UTC'ye göre üretim | Test yeşil, elle oynanmadı | Orta | Paylaşım kartı doğrulanmadı |
| Altın Makara | Evet | **Hatalı** (F-1) | Zayıf | **Yüksek** |
| Rarity | Evet | Çalışıyor, anlamı zayıf | Zayıf | Orta |
| Online Oda | Evet, **bayrakla kapalı** | Kapalı | Eski kurallar | Açılırsa yüksek |
| Turnuva / Global eşleştirme / Pass&Play | **Yok** | — | — | Brief bayat |
| Meta-game (görev, lig, mağaza) | Bayrakla kapalı | Kapalı | — | Yok |
| Profil/seri | `localStorage` | Evet | Basit | Cihaz değişince kaybolur |

---

## D. Game Design Critique

### D1. Altın Makara — en kritik bulgu [KODDAN]
- `useGameSession.ts:140-146`: tahta dolunca `applyOutcome` `true` döner, `switchTurn()` çağrılmaz. Yani `currentTurn` son hamleyi/başarısızlığı yapan oyuncuda kalır.
- `GoldenReelModal.tsx:85`: cevap `currentTurn` adına gönderilir; `useGameSession.ts:405-409`: doğru film = `currentTurn` kazanır.
- **VS Bot'ta son hamleyi bot (O) yaptıysa, insanın yazdığı doğru cevap botu kazandırır.** Modal ise "SEN (X)" diyor. Bot Altın Makara'da hiç cevap vermiyor.
- `X` sırasındaysa insan neredeyse her zaman kazanır: kabul kriteri "Oscar'lı **ya da** gişe rekortmeni film" (`:405`). Katalogda 199 Oscar'lı film var.
- Modal metni "İlk doğru filmi yazan kazanır" diyor, kod bunu yapmıyor (yarış yok).
- **Test kapsamı yok:** `src/tests` içinde `resolveGoldenReel` geçmiyor. Simülatör Altın Makara'yı rastgele modelliyor (`sim-helpers.ts`), gerçek kodu çalıştırmıyor.
- Sonuç: hat çıkmayan her maç (simülasyonda bot-bot Orta ~%33, Zor ~%84) bu yola düşüyor. Önemli: bu oranlar simülatörün kaba Altın Makara modeline bağlı, ama "hat çıkmama" oranı gerçek motordan.

### D2. Rarity strateji değil [KODDAN + ÖLÇÜLDÜ]
- Hat kazanımı anında bitiriyor (`rules.ts:27-44`); rarity yalnızca (a) Ters Kadraj eşitliği, (b) Altın Makara zaman aşımında devreye giriyor.
- Sıralama: `boxOfficeCategory`, Oscar ve yıl≥2000'e dayanan kaba ağırlık (`validator.ts:116-119`). `boxOfficeCategory` **722 kaydın yalnızca 75'inde dolu** (56 BLOCKBUSTER, 14 STANDARD, 5 INDIE); 647'sinde boş [ÖLÇÜLDÜ]. Berabere kalan filmler katalog sırasıyla dizilir, yani birçok hücrede nadirlik **keyfi**.
- Yüzdelik tabanlı olduğu için dağılım zaten dayatılmış: 135 film hücresinde geçerli cevapların %31 Common, %26 Uncommon, %26 Rare, %16 Epic, **%1 Legendary** [ÖLÇÜLDÜ]. Nadir cevap "gerçekten az bilinen" demek değil, "havuzda sıralaması düşük" demek.
- Brief'in kendi ilkesi ("Rarity gerçek karar unsuru olmalı") bugün karşılanmıyor. Oyuncu "bunu mu yazayım, nadirini mi" diye düşünmüyor; çünkü ödülün (hat) rarity ile ilgisi yok.

### D3. İlk oyuncu avantajı [ÖLÇÜLDÜ, bot modeli]
Bot-bot, aynı seviye, X ilk (üretilmiş tahtalar, 1200–3000 maç):

| Eşleşme | X kazanma |
|---|---|
| Kolay-Kolay | %61 |
| Orta-Orta | %66 |
| Zor-Zor | %71 |

Ayrıştırma (Orta / Zor): hatla biten maçlarda X %66 / %87; foto-finişle biten maçlarda X **%89 / %93**. Sebep: X 5 hücre, O 4 hücre doldurduğu için X'in toplam rarity puanı sistematik yüksek (ort. 64 vs 53) ve eşitlikte kural da X'i seçiyor (`rules.ts:70`, `:134`).
- `bot-calibration.test.ts` bunu **görmüyor**: `winRate` başlangıç tarafını dönüşümlü veriyor, yani yalnızca ajanlar arası simetriyi ölçüyor, X/O simetrisini değil.
- Uyarı: Altın Makara kategorisindeki X oranları anlamsız (sim modeli). Hat ve foto-finiş sayıları gerçek motordan.

### D4. Quiz tuzağı ve strateji [ÖLÇÜLDÜ, bot modeli]
- Hücre havuzu: preset film tahtalarında 135 hücreden 16'sı <3 cevaplı (min 1), medyan 5; üretilmiş tahtalarda min 3, medyan 5, max 14 [ÖLÇÜLDÜ]. Her film maçta bir kez kullanılabildiği için fiilî havuz daha da küçük.
- Bilgi mi, taktik mi? Orta seviye bota aynı bilgi (.75) verildiğinde mükemmel taktik, kötü taktiği %86 yeniyor; aynı taktikle bilgi .90'a karşı .60 olan %59 kazanıyor. **Bot modelinde taktik bilgiden daha belirleyici**, yani strateji katmanı gerçek. Ancak "taktik" burada büyük ölçüde "cevabını bildiğin hücreyi seç" demek (`informed`); saf XOX taktiği (merkez/köşe, çatal) ikinci planda. İnsan verisi olmadan bu iddia **kanıtlanmış sayılmaz**.
- 3×3 XOX çözülmüş oyundur; burada çözülemiyor çünkü hamle yeteneği bilgi tarafından kapılanıyor. Bu iyi, ama tek hakla kaybedilen hücre "tıkanma" duygusunu da büyütür.

### D5. Tıkanma (deadlock)
Tasarım gereği: tek hak, iki taraf da yakarsa nötr kilit, 12 sn dolunca boş hücrede hak yanar, AFK maçı sonsuza uzatamaz [KODDAN]. Bu **UX kusuru değil tasarım**, ama oyuncuya "pas" veya ipucu yok; dar havuzda ceza hissi yüksek olabilir. Karar sende (Bölüm I).

### D6. Bot
Üç seviye gerçekten farklı: ıskalama, savunma, hat görme parametreleri ayrı ve test ediliyor [KODDAN + test]. Ters Kadraj'da zor bot "kadronun ucundaki oyuncuyu" seçiyor. `movieFame` 647 kayıtta varsayılan 0,55 olduğu için bilgi modeli büyük ölçüde düz (D2 ile aynı veri boşluğu).

---

## E. UX/UI Critique (375×812, yalnızca gördüklerim)

| Ekran | Gözlem | Ağırlık |
|---|---|---|
| Ana ekran | Tek birincil buton, mod kartları, günlük bilet. Net hiyerarşi. | İyi |
| Rakip seçimi (alt sheet) | Seviye + replik + stil okunur. **"Rating 850/1390" oyuncunun kendi ratingi olmadığı için anlamsız bir sayı.** | Düşük |
| Maç başlangıcı | 3-2-1 klaket, rakip kartı, 3 kriter ismi başlıkta. İyi bir "sahne açılışı". | İyi |
| Oyun tahtası | Tahta ekranın ortasında, üstte ~200px boş alan, alt bölgede yalnızca "Sıra sende". | Düşük |
| **Süre baskısı** | 12 sn'lik çekim süresi tahtadan uzakta **ince bir çubuk**; ekranda en belirgin sayaç kırmızı bir timecode. Hangisinin geri sayım olduğu belli değil, dokunma bölgesinden göz kaçıyor. | **Orta (UX)** |
| Cevap sheet'i | Kriter çipleri, arama kutusu. "Anti-Cheat: …" metni geliştirici jargonu. | Düşük |
| Rakip kimliği | Seçtiğim bot (PatlamisMisirci, 850) yerine farklı bir bot (SeansGezgini, 920) geldi. | **Orta (F-7)** |

Doğrulanamayanlar: gerçek klavye açıldığında tahta/modal davranışı, Türkçe karakter girişi, yanlış/doğru geri bildirim animasyonu, maç sonu ve paylaşım ekranları, Ayarlar, Salon ışığı, iOS/Android farkı.

---

## F. Technical Audit

| # | Bulgu | Kanıt | Düzey |
|---|---|---|---|
| F-1 | Altın Makara kazananı `currentTurn`'e bağlı; bot sırasında insan botu kazandırabilir | D1 | KODDAN (UI'da yeniden üretilmedi) |
| F-2 | Sunucu `submit_move` hâlâ eski kurallarda: `p_is_stealing` var, **cevap doğrulaması yok** (istemcinin yolladığı `movie_data`'ya güveniyor), yanlış cevap/kilit/rarity/Altın Makara yok | `supabase/migrations/20261101_faz4_submit_move_rpc.sql:11-12, 81-109` | KODDAN. Online kapalı, açılışın önkoşulu (MVP_SCOPE zaten yazıyor) |
| F-3 | Anayasa "çalma yok" diyor, ama sunucuda çalma yolu duruyor | aynı dosya | KODDAN |
| F-4 | `page.tsx` 1127 satırlık monolit; mod, oyun, profil, kuyruk durumu tek yerde. Hata riski yüksek | `src/app/page.tsx` | ÖLÇÜLDÜ (satır) |
| F-5 | `createRandomizedBoard` iki yerde kopya (`core/engine/board-generator.ts`, `data/boards.ts`) ve önyargılı karıştırma (`sort(() => Math.random() - 0.5)`) | `board-generator.ts:50-51`, `boards.ts:965-966` | KODDAN |
| F-6 | `validateActorIntersection` "ismin bir sözcüğü" ve Levenshtein≤1 kabul ediyor; hakkında negatif test yok | `validator.ts:250-273` | KODDAN |
| F-7 | Seçilen bot ile gelen bot farklı. `MatchmakingQueueModal` `onMatchFound`'u efekt bağımlılığında tutuyor; `executeMatchSetup` `chosenBotRef`'i tüketip sıfırlıyor. İkinci çağrıda rastgele bot geliyor olabilir. `reactStrictMode: true` ile dev'de olası | `page.tsx:723,774-775`, `MatchmakingQueueModal.tsx:44-92` | GÖZLEM (1 kez) + hipotez; production build'de doğrulanmadı |
| F-8 | Katalog 722 kayıt, `wikidataBulk.json` 2,3 MB. İstemci paketine girip girmediği ve ilk yükleme süresi **ölçülmedi** | — | ÖLÇÜLMEDİ |
| F-9 | Bayat belgeler: lisans denetimi (100 kayıt/TMDB), `GAME_FEEL.md` arşiv. Yeni katılan biri yanlış bağlama düşer | docs/ | ÖLÇÜLDÜ |

Olumlu: veri kaynağı Wikidata (CC0) olarak işaretli, provenance alanları tipte var; online kapalıyken ağ/hesap yok ve gizlilik politikası buna göre yazılmış (MVP_SCOPE v1.0 kararı).

Test: 19 test dosyası, hepsi yeşil [ÖLÇÜLDÜ]. Boşluklar: Altın Makara, hook seviyesi (zamanlayıcı, bot zamanlaması, yeniden açılışta durum), Ters Kadraj doğrulayıcı negatifleri, X/O dengesi.

---

## G. Competitive Positioning (genel bilgi, güncel yorumlarla doğrulanmadı)

| Ürün | Öğrenilecek ilke | Cine-XOX'a karşılığı |
|---|---|---|
| Wordle | Günde bir, paylaşılabilir spoiler'sız iz | Günün Kadrası var; **paylaşım kartı kalitesi doğrulanmadı** |
| Immaculate Grid tarzı ızgara oyunları | Kesişim bilgisi + sınırlı hak | En yakın rakip; Cine-XOX'un farkı rakip + sıra + kilit |
| Connections / Letterboxed | Tek bakışta anlaşılan kural, kısıtın kendisi oyun | Kriter başlıkları iyi; kural anlatımı 3 adımlı rehberde |
| Trivia Crack | Meta + sosyal döngü | Burada yok, ve olması şart değil |
| Satranç | Rating anlamlı olduğunda motive eder | Oyuncunun kendi ratingi yok, botlarda rating görünüyor (E) |
| Balatro | Basit kuraldan çıkan çarpan/kombinasyon derinliği | Rarity **bunu yapabilir** ama bugün yapmıyor |

**"Telefonda kalmak için savunulabilir neden var mı?"** Bugün **kısmen**: görsel kimlik ve günlük ritüel güçlü, ama çekirdek döngünün tekrar oynanabilirliği 17 elle seçilmiş tahta + üretilmiş tahtalara ve tek bir rakip tipine (bot) bağlı. İnsan rakip olmadan "arkadaşına meydan oku" döngüsü yok. Bu eksik, v1 kapsamı gereği bilinçli bir seçim; ama retention iddiası şimdilik **kanıtsız**.

---

## H. Prioritized Roadmap

Her satır: Sorun · Kanıt · Etki · Çözüm · Kapsam · Risk · Bağımlılık · Test · Öncelik.

**P0**
1. **Altın Makara düzeltmesi** — F-1/D1. İnsan her zaman X; kazananı o belirlesin ya da bot da cevap versin; kriter "ilk doğru" ise gerçekten yarış olsun. Kapsam: `useGameSession.ts`, `GoldenReelModal.tsx`; bağımlılık: kural kararı (Bölüm I-2). Test: hook'suz saf fonksiyon + `currentTurn=O` regresyon testi. **Önce tasarım kararı gerekir.**
2. **Online'ı açmadan sunucuyu yeniden yaz** (F-2/F-3): çalma yolu kaldırılsın, cevap doğrulaması sunucuda, kilit/rarity/Altın Makara olayları. Bayrak kapalı kaldığı sürece P0 *değil* "kapı"; açma kararı bu işe bağlı.

**P1**
3. İlk oyuncu dengesi (D3): foto-finişte X'e yapısal avantajı kaldır (ör. hücre başına ortalama rarity ya da O'ya eşitlik). Önce kural kararı. Test: simülasyonda X oranı hedef bandı (örn. %48–54, yalnız hat+foto-finiş).
4. Rakip kimliği uyuşmazlığı (F-7): production build'de yeniden üret, sonra `chosenBotRef` tüketimini idempotent yap.
5. Süre baskısı görünürlüğü (E): `ShotClock.tsx` ve `XoxBoard.tsx` **dokunulmaz listesinde**; değişiklik için senin onayın şart.

**P2**
6. Rarity'yi gerçek karar unsuru yap (D2): önce veri (`boxOfficeCategory` 647 boş), sonra kural. Seçenekler Bölüm I-3'te.
7. Dar havuzlar (D4): üretilmiş tahtalar için min 4–5 cevap; preset'lerde <3 olan 16 hücre yeniden yazılsın.
8. Bot testine X/O simetri testi ekle; Altın Makara için gerçek-kod testi.
9. `page.tsx` bölünmesi (F-4), ancak özellik eklerken değil ayrı küçük adımlarla.
10. Rating göstergesi: oyuncunun ratingi yoksa botlarda gizle ya da oyuncuya ver.

**P3** — Yeni formatlar, lig, sezon, Sinema Pasaportu/attestation (MVP dışı, brief'in kendi ilkesiyle uyumlu).

**REJECT (şimdilik)** — Token/NFT, günlük görev, battle pass, enerji/bekleme süresi, mağaza ekonomisi: çekirdek döngü kanıtlanmadan değer katmaz. Yeni mod eklemek de aynı gerekçeyle reddedilir; mevcut 3 mod bile fazla olabilir (Bölüm I-4).

---

## I. Open Questions (cevabına göre tasarım değişir)

1. **Vaat:** Oyun "bilgi" mi, "okuma/taktik" mi satıyor? Sayfa başlığı ikincisini söylüyor; mevcut kural ilkini ödüllendiriyor. Seçime göre Rarity ve Altın Makara farklı tasarlanır.
2. **Altın Makara:** İki taraf da aynı soruyu mu cevaplasın (gerçek yarış, botun cevap hızı/bilgisi modellenir), yoksa tahta dolunca doğrudan rarity/hücre sayısıyla mı bitsin? İlki heyecanlı ama tek-oyunculuda bota zaman modeli ister; ikincisi sade.
3. **Rarity:** (a) kazanma çizgisine bağla (nadir cevap hücreyi "sağlam" yapar, kilit/bozulma zorlaşır), (b) yalnız puan/ünvan olarak bırak ama dürüstçe öyle sun, (c) kaldır. Hangi yön?
4. **Mod sayısı:** İlk TestFlight'ta 3 mod + Günün Kadrası. Ters Kadraj'ın yalnız 2 tahtası var; bunu v1'de tutmak mı, saklamak mı?
5. **Tıkanma:** "Pas/ipucu yok, tek hak" bilinçli ceza mı? Casual kitle için en yüksek terk riski burada olabilir; oyuncu testi olmadan bilemem.
6. **Hedef kitle:** Sinefil mi (zor, dar), geniş kitle mi (kolay, geniş havuz)? Katalogdaki 647 "kategori boş" kaydı bunu etkiliyor.
7. **Dokunulmaz dosyalar:** ShotClock/XoxBoard/MatchmakingQueueModal üzerindeki değişiklikleri bu denetimden çıkan bulgular için onaylıyor musun?

---

## J. Final Verdict

- **Bugün iyi bir oyun mu?** Hayır, **henüz kanıtlanmadı**. Çekirdek sağlam, final yarım (Altın Makara) ve rarity süs.
- **Eğlenceli mi?** Kanıtım yok; hiçbir gerçek oyuncu gözlemi ve süre/terk verisi bu oturumda toplanmadı. Elle iki maç başlangıcı gördüm, bitirmedim.
- **Stratejik derinlik?** Var ama ince; bot simülasyonunda taktik bilgiden daha belirleyici çıktı, insanda doğrulanmadı.
- **Mobil olarak yeterince güçlü mü?** Görsel ve akış olarak ana ekran/açılış güçlü; klavye, süre baskısı görünürlüğü ve maç sonu doğrulanmadı.
- **Tekrar oynanabilir mi?** Kısa vadede evet (üretilmiş tahtalar); "yarın neden döneyim" tek başına Günün Kadrası'na dayanıyor.
- **Ticari potansiyel?** Sadık sinefil niş için olası; model kararı için erken. Kozmetik/premium olasılığı kimlikle uyumlu, ama ölçüm yok.
- **En önemli üç değişiklik:** (1) Altın Makara'yı düzelt ve test et, (2) X avantajını sıfırla, (3) Rarity'ye gerçek bir rol ver ya da kaldır.
- **Devam mı, yeniden mi?** **Devam, ama yeni özellik yok.** Önce bu üç kural düzeltmesi ve bir gerçek oyuncu playtesti (5–8 kişi, ilk maç + ikinci maç isteği), sonra karar.

---

## Ek: Tekrar üretme komutları

Simülasyon betikleri oturum scratchpad'indeydi (repo'ya eklenmedi). Mantık: `src/tests/sim-helpers.ts` içindeki `simulateMatch`; üretilmiş tahtalar `generateSolvableBoard(i*7919+1)`, 200–300 tahta, `makeRng(i*31+7)`.
