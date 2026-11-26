# Crosscut: App Store Launch Kit (26 Kasım 2026)

Metin (ad, alt başlık, anahtar kelime, açıklama, sürüm notu) tek yerde durur: [APP_STORE_SUBMISSION.md](APP_STORE_SUBMISSION.md) bölüm C. Burada kopyalanmadı ki iki dosya birbirinden sapmasın. Bu dosya kanıtı, varlık ölçülerini, etiket eşlemesini ve insan kapısını tutar.

## 1. Kanıtlanmış teknik durum (komutla doğrulandı)

| Kontrol | Sonuç | Kanıt |
|---|---|---|
| Xcode / SDK | Xcode 27.2, iOS SDK 27.2 (en az Xcode 26 şartı karşılanıyor) | `xcodebuild -version` |
| Dağıtım hedefi | iOS 15.0 (en az 13.0) | `project.pbxproj` `IPHONEOS_DEPLOYMENT_TARGET` |
| Release derleme | `generic/platform=iOS`, imzasız: BUILD SUCCEEDED, tek uyarı AppIntents (zararsız) | derleme günlüğü |
| Paket boyutu | Release `.app` 7,7 MB; `out/` 4,8 MB | `du -sh` |
| dSYM | Release'te `dwarf-with-dsym`, `App.app.dSYM` üretildi | derleme çıktısı |
| Gizlilik manifesti | `PrivacyInfo.xcprivacy` var: izleme yok, toplanan veri yok, UserDefaults `CA92.1`. `Capacitor` ve `Cordova` çerçevelerinin kendi manifestleri paketin içinde | `find App.app -name PrivacyInfo.xcprivacy` |
| Info.plist | Kullanım açıklaması gerektiren izin yok, `UIBackgroundModes` yok, ATS istisnası yok, `ITSAppUsesNonExemptEncryption=false` | `Info.plist` |
| Yönelim / aygıt | Yalnızca dikey, yalnızca iPhone (`TARGETED_DEVICE_FAMILY=1`); iPad'de uyumluluk kipi | plist, pbxproj |
| Sırlar | Takipli dosyalarda ve iOS paketinde anahtar yok. İzlenmeyen eski Android derlemesinde (`android/.../assets/public`, gitignore'lu) Supabase `anon` anahtarı var; `anon` herkese açık roldür, ama Android'e geçmeden önce silinip temiz derlenmeli | JWT çözümü: rol `anon` |
| IPv4 / http | Sabit IPv4 yok, düz `http://` yok | `grep` |
| Uzaktan bayrak | Yok. `FLAGS` derleme zamanı sabiti, ağdan okunmuyor | `src/config/flags.ts` |
| Hata ayıklama kapısı | `debug`, `cheat`, geliştirici menüsü yok | `grep` |
| Yazı tipleri | Inter, Newsreader, Barlow Condensed: `next/font` ile derlemede paketlenir (`out/_next/static/media/*.woff2`), çalışma anında Google isteği yok. Üçü de SIL OFL; uygulamaya gömmeye izin verir. Lisans metni 1.0.1 ayar listesine eklenecek | `out/index.html` içinde `fonts.googleapis` 0 |
| Ses | Web Audio ile üretim, ses dosyası yok | kod |
| URL'ler | `/`, `/privacy`, `/support`: HTTP 200. `/terms` yok (abonelik/IAP olmadığı için gerekmez) | `curl` |
| Testler | `tsc` temiz, `npm test` exit 0, FAIL yok | günlük |

## 2. Varlık ölçüleri

| Varlık | Ölçü | Durum |
|---|---|---|
| Uygulama simgesi | 1024×1024, alfa yok | doğrulandı (`sips`) |
| iPhone 6.9" ekran görüntüsü | 1320×2868, alfa yok, TR ve EN altışar adet | doğrulandı (`sips`) |
| iPhone 6.3" | 1206×2622 | üretilmedi; 6.9" seti tek başına yeterli |
| iPad 13" | Gerekmez, iPad hedeflenmiyor | n/a |
| Önizleme videosu | Yok | isteğe bağlı |

## 3. Erişilebilirlik etiketi eşlemesi (dürüst)

App Store Connect'te şunları işaretleme: **VoiceOver**, **Larger Text**, **Voice Control**. Dinamik Tür desteklenmiyor (WebView, piksel birimleri), VoiceOver gerçek cihazda denenmedi.
İşaretlenebilir: **Dark Interface** (yalnızca koyu tema), **Reduced Motion** (`prefers-reduced-motion` kuralı ve konfeti koruması var; gerçek cihazda doğrulanmalı).
Yazı tipi büyütme ve VoiceOver 1.0.1 hedefi.

## 4. Gizlilik etiketi

Veri toplanmıyor, izleme yok, ATT istemi yok, üçüncü taraf SDK yok. `PrivacyInfo.xcprivacy` ile birebir: "Data Not Collected". Çevrimiçi oda kapalı; Supabase istemcisi pakette duruyor ama ağa çıkmıyor (bayrak kapalı).

## 5. Karşılaştırma kaynakları (insan işi)
Game UI Database, Interface In Game, Sensor Tower, AppMagic, Deconstructor of Fun, TestFlight ve r/DestroyMyGame. Rakip kazıması `docs/strategy/` altında yapıldı.

## 6. Açık riskler ve karar kaydı

| Önem | Konu | Karar |
|---|---|---|
| P2 | Kilitli ve uykuda kod: çevrimiçi oda, mağaza, görevler, liderlik tablosu kodu pakette. Kural 2.5.19 uzaktan açılan özellik arar; burada bayraklar derleme sabiti, ağdan açılamıyor | Yorumcuya Review Notes'ta açıkça yazılı. Sürüm 1.1'de ya açılır ya paketten çıkarılır |
| P2 | Çökme raporu ve analitik yok | Bilinçli: "veri toplanmıyor" etiketi korunuyor. Çökme verisi Xcode Organizer'dan (kullanıcı izin verirse) gelir. Sentry eklemek etiketi ve manifesti değiştirir; 1.0 sonrası karar |
| P2 | Cihaz saatini geri alarak Günlük Kadraj'ı yeniden oynama | Tek oyunculu, yerel; tablo ve ödül yok. Kabul edilen risk, sürüm 1.1 sunucusuz değilse kalır |
| P2 | `next` 14.2.15 için `npm audit` kritik bulgusu | Bulgular sunucu özellikleri (Server Actions, middleware, görsel optimizasyonu); statik export'ta yok. 1.0.1'de yükseltilecek |
| P2 | Sistem yazı boyutu ve VoiceOver desteği yok | Sürüm 1.0.1 |
| P3 | Sessiz kipte Web Audio davranışı doğrulanmadı | Gerçek cihaz testi |
| P3 | Eski Android derlemesinde `anon` anahtarı (gitignore'lu) | Android'e geçerken temizle |

## 7. İNSAN KAPISI: ONAY BEKLİYOR (ajan sertifikalayamaz)

- [ ] Apple Developer Program kaydı, Paid Apps Agreement, vergi ve banka, AB DSA satıcı durumu
- [ ] App Store Connect formları: yaş derecelendirmesi, App Privacy, ihracat uyumluluğu
- [ ] Xcode'da Team seçimi, imzalı arşiv, doğrulama, yükleme
- [ ] Marka: USPTO, EUIPO, TÜRKPATENT elle kontrol (WIPO taraması yapıldı)
- [ ] 3-4 yaşında bir iPhone'da TestFlight/Release derlemesiyle 20-30 dakika oyun: ısınma, kare hızı, sessiz kip sesi, uçak modu (ilk açılış dahil), arama ve arka plandan öldürme sonrası durum
- [ ] 5-10 yabancıyla "koridor testi", ardından küçük TestFlight dalgası
- [ ] Ana ekranda rakiplerin yanında simge kontrolü
- [ ] VoiceOver, büyük yazı boyutu, Türkçe klavye, gece yarısı UTC

## 8. SKORKART

```text
================================================================
iOS COMMERCIAL RELEASE READINESS SCORECARD  (26 Kasım 2026)
================================================================
1. Core Loop, FTUE & Retention Strength     : 7/10 - Günlük Kadraj ve 1 dokunuşluk rövanş iyi; ilk maç ~4 sn bekleme (kuyruk 1,4 sn + rakip karşılaşma 2,7 sn + klaket)
2. Visual Identity & Anti-AI-Slop Polish    : 7/10 - tutarlı 35mm kimlik; hâlâ monoton kart yapısı, aynı ikonu kullanan iki bot
3. Game Feel (Haptics, Audio, Curves, UX)   : 6/10 - Haptics ve ayar var; sessiz kip ve ses gerçek cihazda doğrulanmadı
4. Code Hygiene & Zero-Shortcut Integrity   : 8/10 - boş catch gerekçelendirildi, any yok, eslint-disable 3 (bilinen)
5. Chaos Resilience, Perf & Observability   : 5/10 - testler ve simülatör var; gerçek cihaz, batarya ölçümü, çökme raporu yok
6. Security & OWASP MASVS Baseline          : 8/10 - çevrimdışı, sır yok, ATS temiz; next audit bulgusu 1.0.1'de
7. 2026 Apple App Store Compliance          : 7/10 - kodla doğrulanabilenler tamam; hesap, form, yükleme insan kapısında
----------------------------------------------------------------
OPEN P0 BLOCKERS     : 0
OPEN P1 REJECT RISKS : 0 (kodla bilinen yok; Apple kararı doğrulanamaz)
RELEASE VERDICT      : NO-GO (kural: 8 altı kategori var). Gerçek cihaz turu ve insan kapısı tamamlanınca TESTFLIGHT'A HAZIR olarak yeniden puanlanır.
================================================================
```
