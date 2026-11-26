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
| Çevrimiçi kod | Varsayılan derlemede Supabase istemcisi, oda, hamle RPC'si ve ağ kodu pakete girmez (`NEXT_PUBLIC_ENABLE_ONLINE` ≠ 1). Mağaza, görevler ve liderlik tablosu bileşenleri hiçbir ekrandan içe aktarılmadığı için zaten paketlenmiyor | `src/tests/release-bundle.test.ts` (7/7), `out/` taraması |
| Release arşivi | `xcodebuild archive` (generic iOS, imzasız): ARCHIVE SUCCEEDED, 15 MB arşiv, `MinimumOSVersion 15.0`, SDK `iphoneos27.2` | arşiv günlüğü |
| dSYM | `App`, `Capacitor`, `Cordova` dSYM'leri arşivde; `dwarfdump --uuid` ile ikili dosyayla UUID eşleşti (App: B1B4F1B9-6123-34B4-BE03-4221E2C45037) | `dwarfdump` |
| JS hata kurtarma | `ErrorBoundary` (render hataları) ve `window.onerror` / `unhandledrejection` kaydı; "yeniden başlat" artık veriyi silmez, yalnızca aynı oturumda 3. hatada son çare olarak siler | `src/tests/error-recovery.test.tsx` (4/4) |
| WebView hissi | `-webkit-tap-highlight-color`, `-webkit-touch-callout`, `touch-action: manipulation`, `overscroll-behavior: none`, gövdede `env(safe-area-inset-*)`, `user-select: none` (girdi alanları hariç) | `src/app/globals.css:40-56,163` |
| Testler | `tsc` temiz; `npm test` 41 dosya zincirde, hepsi başarısızlıkta süreci sonlandırıyor (`process.exit(1)`/`throw`), zincir dışı yalnızca yardımcı `sim-helpers.ts` | `package.json`, tarama |

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
| Kapandı | Kilitli çevrimiçi kod pakette duruyordu (Guideline 2.5.19) | Derleme zamanı kapısı: varsayılan pakette yok, Review Notes bununla birebir |
| Kapandı | Hata ekranındaki "yeniden başlat" tüm yerel veriyi (seri, Günlük Kadraj sonucu) siliyordu | Düzeltildi, testli |
| Kapandı | Eski Android derlemesinde `anon` anahtarı (`android/.../assets/public`, gitignore'lu, 3 Kasım) | Silindi; Android'e geçilirken `cap sync` temiz üretir |
| P2 | Çökme raporu ve analitik yok | Bilinçli (etiket "Data Not Collected"). İzleme planı bölüm 9 |
| P2 | Cihaz saatiyle Günlük Kadraj'ı yeniden oynama | Tek oyunculu, yerel, ödülsüz; kabul edildi |
| P2 | `next` 14.2.15 için `npm audit` bulgusu | Sunucu özellikleri; statik export'ta yok. 1.0.1'de yükseltilir |
| P2 | Dynamic Type ve VoiceOver desteği yok | 1.0.1 |
| P2 | Portreler: 11 Wikimedia Commons görseli (CC BY / CC BY-SA), atıf Ayarlar > Lisanslar'da, 11'i de manifestte | Uygun; SA koşulu görsellere sınırlı, uygulama kodunu etkilemez. Hukuki bağımsız doğrulama yok |
| P3 | Sessiz kipte Web Audio davranışı doğrulanmadı | Gerçek cihaz |

### Sürüm 1.1 backend kapıları (şimdiki pakette devre dışı; canlı veritabanı incelenmedi)
`supabase/migrations` okundu; `service_role` hiçbir yerde yok, istemci yalnızca `anon` anahtarını kullanır. Çevrimiçi açılmadan önce:
1. `profiles_update_own`: kullanıcı kendi `wins`, `reels_balance` gibi alanlarını değiştirebilir; liderlik tablosu bu haliyle hileye açık. Skor alanlarını sunucu RPC'sine taşı.
2. `game_rooms_update_participants`: `guest_id is null and status = 'WAITING'` koşulu, giriş yapmış herkese bekleyen odayı güncelleme izni verir; katılma yalnızca katılma RPC'siyle olmalı.
3. `submit_move` RPC'si `p_is_stealing` parametresini hâlâ taşıyor; anayasa hücre çalmayı kaldırdı, parametre silinmeli.
4. `profiles_select_public`: tüm profil sütunları herkese açık; liderlik için gereken sütunlara daralt.
5. Canlı Supabase projesinde RLS'in gerçekten açık ve migrasyonların uygulanmış olduğu panelden doğrulanmalı.

## 7. İNSAN KAPISI: ONAY BEKLİYOR (ajan sertifikalayamaz)

- [ ] Apple Developer Program kaydı, Paid Apps Agreement, vergi ve banka, AB DSA satıcı durumu
- [ ] App Store Connect formları: yaş derecelendirmesi, App Privacy, ihracat uyumluluğu
- [ ] Xcode'da Team seçimi, imzalı arşiv, doğrulama, yükleme
- [ ] Marka: USPTO, EUIPO, TÜRKPATENT elle kontrol (WIPO taraması yapıldı)
- [ ] 3-4 yaşında bir iPhone'da TestFlight/Release derlemesiyle 20-30 dakika oyun: ısınma, kare hızı, sessiz kip sesi, uçak modu (ilk açılış dahil), arama ve arka plandan öldürme sonrası durum
- [ ] 5-10 yabancıyla "koridor testi", ardından küçük TestFlight dalgası
- [ ] Ana ekranda rakiplerin yanında simge kontrolü
- [ ] VoiceOver, büyük yazı boyutu, Türkçe klavye, gece yarısı UTC

## 8. Çökme izleme planı (SDK eklenmeden)

- **Native çökmeler:** Xcode Organizer > Crashes ve TestFlight geri bildirimi. Yalnızca "Uygulama Analizlerini Paylaş" açan kullanıcılardan gelir. Her yükleme için bu arşivin dSYM'leri (`App.xcarchive/dSYMs`) arşivle; App Store Connect'e yükleyince semboller otomatik gelir.
- **JS çalışma hataları** (WebView içinde, native çökme sayılmaz): `ErrorBoundary` son hatayı yalnızca cihazda `sessionStorage` ("crosscut_last_error") ve konsolda tutar, hiçbir yere göndermez. Testçi sorun bildirirse Safari Web Inspector ile aynı kayıt okunur. TestFlight'ta "Send Beta Feedback" ekran görüntüsüyle birlikte gelir.
- **Eşik:** TestFlight'ta ilk 50-100 kullanıcıda Organizer'daki çökmesiz oturum oranı ≥ 99,5 % değilse yayına çıkma.
- **Sonraki karar:** TestFlight verisi yetersiz kalırsa 1.0.1'de gizlilik etiketini güncelleyerek bir çökme SDK'sı değerlendirilir.

## 9. SKORKART (kod ile doğrulanabilenin tavanı)

```text
================================================================
iOS COMMERCIAL RELEASE READINESS SCORECARD  (26 Kasım 2026, düzeltmeler sonrası)
================================================================
1. Core Loop, FTUE & Retention Strength     : 8/10 - rövanş 1 dokunuş, oyun sonu ekranı tek net CTA, ilk maç beklemesi ~4 sn
2. Visual Identity & Anti-AI-Slop Polish    : 8/10 - taşma, hizasızlık, emoji, yinelenen etiket temizlendi; tam ekran taramaları yapıldı
3. Game Feel (Haptics, Audio, Curves, UX)   : 7/10 - haptics tek yardımcıya toplandı, ayarlı; ses ve titreşim gerçek cihazda doğrulanamaz (tavan)
4. Code Hygiene & Zero-Shortcut Integrity   : 9/10 - kilitli kod paketten çıktı, boş catch'ler gerçek kontrole çevrildi, test zinciri doğrulandı
5. Chaos Resilience, Perf & Observability   : 7/10 - hata kurtarma veri kaybetmiyor, testli; gerçek cihaz, batarya, çökme verisi yok (tavan)
6. Security & OWASP MASVS Baseline          : 9/10 - pakette ağ, anahtar, hesap yok; 1.1 backend kapıları yazılı
7. 2026 Apple App Store Compliance          : 8/10 - Release arşivi, dSYM, gizlilik manifesti, Review Notes = gerçek davranış; hesap ve formlar insan kapısında
----------------------------------------------------------------
OPEN P0 BLOCKERS     : 0
OPEN P1 REJECT RISKS : 0
RELEASE VERDICT      : NO-GO kuralı tetikleniyor (3 ve 5 numaralı kategoriler 8 altında) ama kalan eksik YALNIZCA fiziksel cihaz kanıtı.
                       Kod tarafında yapılabilecek her şey kapandı: Master Release Execution Plan'a geçmeye hazır.
================================================================
```

Kategori 3 ve 5, 3-4 yaşında bir iPhone'da 20-30 dakikalık Release/TestFlight oturumu ve TestFlight çökme verisi olmadan 8'e çıkarılamaz; puanı kanıtsız yükseltmedim.
