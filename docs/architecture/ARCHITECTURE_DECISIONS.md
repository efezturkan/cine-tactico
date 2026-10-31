# CINE-XOX — Mimari Karar Kayıtları (ADR)
**Doküman:** `docs/architecture/ARCHITECTURE_DECISIONS.md`  
**Durum:** ONAYLANDI (FAZ 0)  
**Tarih:** 31 Ekim 2026  
**İlgili Belgeler:** `MASTER_SPECIFICATION_v3.md`, `DATA_GOVERNANCE.md`, `GAME_RULES.md`

---

## 1. Giriş ve Amaç

Bu doküman, CINE-XOX projesinde kodlamaya başlamadan önce alınan mimari, veri, kural ve teknoloji kararlarını resmi bir "Mimari Karar Kayıtları" (Architecture Decision Records - ADR) standardında kaydeder.

Bu kararlar, `MASTER_SPECIFICATION_v3.md` belgesi ile mevcut kod tabanı arasındaki çelişkileri gidermek, telif ve lisans risklerini bertaraf etmek ve projenin sonraki fazlarda geri dönülemez mimari hatalara sürüklenmesini önlemek amacıyla alınmıştır.

---

## 2. Mimari Karar Kayıtları (ADR)

### ADR-001: IMDb ve TMDb Lisanssız Bağımlılıklarının Tasfiyesi
* **Bağlam:** Mevcut kodda `imdbRating` alanı hem film verisinde hem de "Kare Çalma" mekanizmasında kullanılmaktadır. Ayrıca 46 filmde TMDb CDN poster linkleri bulunmaktadır. IMDb ticari marka ve telif hakları ile korunmaktadır; TMDb API kullanım koşulları ise ticari/kapalı kural sınırlamalarına tabidir. İlk sürümde lisanssız afiş ve tescilli veri kullanılmayacaktır.
* **Karar:** 
  1. `imdbRating` alanı ve buna dayalı tüm oyun mantığı (kare çalma puan kıyası, bot sıralaması, yapay nadirlik çarpanı) tamamen kaldırılacak bağımlılıklar olarak işaretlenmiştir.
  2. TMDb poster URL'leri ilk sürüm veri setinden çıkarılacaktır.
  3. Film başarısı veya eleştirmen beğenisi gereken yerlerde, tescilsiz ve editoryal olarak doğrulanmış `acclaimScore` (veya `cultScore`) kullanılacaktır; ancak bu skor salt isim değişikliğiyle lisansı aklama yöntemi olarak değil, editoryal kürasyon standardıyla yönetilecektir.
* **Sonuç:** Hukuki ve ticari riskler sıfırlanır; uygulama poster bağımlılığından kurtulup özgün tipografik film şeridi estetiğine kavuşur.

---

### ADR-002: Alan Adı Değişikliğinin Lisansı Çözmeyeceği İlkesi (Data Provenance)
* **Bağlam:** Bir veri alanının adını `imdbRating` yerine `score` yapmak, verinin kaynağı IMDb'den scrape edilmişse lisans ihlalini ortadan kaldırmaz. Benzer şekilde, üçüncü taraf veritabanlarının telifli alanlarının kopyalanması kalıcı bir risk teşkil eder.
* **Karar:**
  1. Projede kullanılan her bir veri alanının kaynağı, lisansı ve editoryal doğrulama geçmişi (`source`, `license`, `verifiedAt`, `verifiedBy`) veri modelinde açıkça tutulacaktır.
  2. Film metadataları (yıl, yönetmen, oyuncu kadrosu, tür) yalnızca kamu malı / CC0 niteliğindeki açık ontolojilerden (Wikidata vb.) ve editoryal doğrulama süzgecinden geçirilerek eklenecektir.
* **Sonuç:** Veri seti denetlenebilir ve hukuken savunulabilir bir temele oturur.

---

### ADR-003: Backend Olmayan Mevcut Mimarinin Korunması & Multiplayer Ayrımı
* **Bağlam:** Proje şu anda Next.js statik export ve Capacitor hibrit altyapısıyla çalışmaktadır. Herhangi bir sunucu/backend bağlı değildir. Ancak kod tabanında `ONLINE_ROOM` ve `MatchmakingQueueModal` gibi gerçekte çalışmayan, yerel simülasyona dayalı arayüzler bulunmaktadır.
* **Karar:**
  1. Mevcut backend'siz ve offline çalışabilen hafif istemci mimarisi sebepsiz yere bozulmayacaktır.
  2. Single Player (Vs Bot) ve Pass & Play modları istemci tarafında %100 offline çalışacaktır.
  3. Gerçek çok oyunculu (multiplayer) deneyim için backend seçimi Faz 5'e bırakılacak; ancak sahte bir multiplayer çalışıyormuş gibi davranılmayacaktır.
* **Sonuç:** Kod karmaşası engellenir, offline deneyim korunur, multiplayer sınırları netleşir.

---

### ADR-004: Kare Çalma (Cell Stealing) Mekaniğinin Kaldırılması
* **Bağlam:** Mevcut `useXoxGame.ts` dosyasında Clash Royale tarzı `allowCellStealing` (daha yüksek puanlı filmle dolu kareyi ele geçirme) kodu bulunmaktadır. Bu mekanizma `MASTER_SPECIFICATION_v3.md` Madde 2.1 ve Madde 197 ile doğrudan çelişmektedir.
* **Karar:**
  1. Kare çalma mekanizması motor kodundan tamamen çıkarılacaktır.
  2. Bir hücre doğru cevaplandığında mühürlenir; maç sonuna kadar değiştirilemez veya çalınamaz.
  3. Yanlış cevap verildiğinde hücre rakibe devredilmez, boş kalır; sıra rakibe geçer.
* **Sonuç:** Standart XOX taktiksel derinliği korunur; kurallar Spec v3 anayasasıyla %100 uyumlu hale gelir.

---

### ADR-005: Rarity'nin Statik Film Değerinden Hücre Bazlı Editoryal & Göreli Havuz Mimarisine Geçişi
* **Bağlam:** Mevcut kodda rarity, filmin yılına ve IMDb puanına bakarak sabit bir değer hesaplamaktadır. Ancak bir film bir kesişimde çok yaygın iken başka bir kesişimde son derece nadirdir. Ayrıca az sayıda veriyle yapay "Legendary" üretmek rekabet adaletsizliği yaratır.
* **Karar:**
  1. Rarity, film başına sabit bir özellik olmaktan çıkarılmıştır.
  2. Faz 1 ve Faz 2 için: Rarity, ilgili hücrenin (satır × sütun) geçerli çözüm kümesi içindeki göreli bilinirlik sırasına ve editoryal zorluk puanına göre hesaplanacaktır.
  3. İlerideki dinamik topluluk rarity'si için veri şeması (`answerFrequency`, `totalCellAttempts`) hazır tutulacak; ancak yetersiz örneklem durumunda (örn. <100 deneme) asla rastgele "Legendary" üretilmeyecek, editoryal taban puana başvurulacaktır.
* **Sonuç:** Kült sinema bilgisi ödüllendirilir; matematiksel olarak tutarlı ve şeffaf bir puanlama elde edilir.

---

### ADR-006: Sahipsiz Hücre Emniyeti (Deadlock Prevention) ve İki Yanlışta Kilitlenme
* **Bağlam:** İki oyuncu da bilmediği veya çözümünün zor olduğu bir karede sonsuza kadar takılabilir.
* **Karar:**
  1. Her hücre için her oyuncunun yalnızca 1 yanlış deneme hakkı vardır.
  2. Shot-clock süresinin dolması da 1 yanlış deneme hakkı sayılır.
  3. İki oyuncu da aynı hücrede yanlış cevap verdiğinde veya süreyi tükettiğinde, hücre `LOCKED_NEUTRAL` (Sahipsiz / Kilitli) olarak işaretlenir ve o maç için kapatılır.
* **Sonuç:** Sonsuz döngüler engellenir, maç akışı garanti altına alınır.

---

### ADR-007: Dataset ve Ruleset Sürümleme Stratejisi
* **Bağlam:** Gelecekte yeni filmler eklendiğinde veya kural parametreleri güncellendiğinde geçmiş maç kayıtlarının ve doğrulama mantığının bozulmaması gerekir.
* **Karar:**
  1. Her veri seti bir `datasetVersion` (Örn: `1.0.0`) taşıyacaktır.
  2. Her kural motoru bir `rulesetVersion` (Örn: `3.0.0`) ile damgalanacaktır.
  3. Tahtalar ve maç durumları bu sürüm bilgisiyle kaydedilecektir.
* **Sonuç:** Geriye dönük uyumluluk ve istatistik güvenliği sağlanır.

---

## 3. MASTER_SPECIFICATION_v3 ile Çapraz Çelişki ve Netleştirme Haritası

| Spec v3 Maddesi | Spec v3 İfadesi | Mevcut Koddaki Durum | Mimari Karar & Netleştirme |
|---|---|---|---|
| **Madde 2.1 / Puan Modeli** | Temel Puan: 10, Rarity Bonusu: 0, 2, 5, 8, 12 | `baseScore = 200`, kombo çarpanı ve süre bonusu var | **Netleştirildi:** Spec v3'ün 10 temel puan + Rarity modeli esastır. Kombo/süre bonusları arcade puanından ayrıştırılacak, maç sonucunu sadece Spec v3 formülü belirleyecektir. |
| **Madde 2.1 / Kare Durumu** | Yanlış cevapta hücre boş kalır, iki yanlışta kilitlenir | `allowCellStealing` (kare çalma) kodu var | **Çelişki Giderildi:** Kare çalma kodu tamamen kaldırılacaktır. Deadlock durumu `LOCKED_NEUTRAL` olarak modellenecektir. |
| **Madde 2.3 / Ters Kadraj** | Manuel klavye girişi, hazır çip yok, 3'lü hat zorunlu değil | Sadece `validateActorIntersection` fonksiyonu var, UI yok | **Netleştirildi:** Ters Kadraj için özel tahta tipi, manuel aktör giriş inputu ve en çok hücre kapatanın kazandığı kural motoru ayrıştırılacaktır. |
| **Madde 3 / Altın Makara** | 9 hücre bitip 3'lü hat çıkmazsa 12s ortak tek soru | Kodda hiç yok (doğrudan Beraberlik ilan ediliyor) | **Netleştirildi:** 9 hücre sonuçlandığında 3'lü hat yoksa Beraberlik verilmeyecek; `GOLDEN_REEL` state'i tetiklenecektir. |
| **Madde 5 / Karar 15** | "Sunucu otoritesiyle doğrulanır" | Tamamen istemci tarafı kod, sunucu/backend yok | **Netleştirildi:** İlk sürümde Single Player & Pass & Play yerel deterministik motorla çalışır; Multiplayer için sunucu mimarisi Faz 5'te izole kurulacaktır. |
