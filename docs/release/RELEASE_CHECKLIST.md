# Yayın kontrol listesi (yaşayan standart) — Crosscut 1.0, 26 Kasım 2026

Durum: ✅ kanıtlı yapıldı · 👤 sende (hesap, ödeme, cihaz) · ⏳ TestFlight/gerçek cihazda yapılacak · ➖ bu sürümde geçerli değil (neden yazılı).
Sıralı yol ve sahipler: `APP_STORE_SUBMISSION.md` bölüm 0. Metinler, görseller, formlar: aynı belge C, D, E. Her sürümde bu listeyi yeniden çalıştır.

## 1. Hesap ve sahiplik
| Madde | Durum | Not/kanıt |
|---|---|---|
| Developer Program üyeliği (bireysel/Organization kararı) | 👤 | Bireysel hesapta mağazada yasal adın görünür; Organization için D-U-N-S gerekir |
| 2FA, kurtarma, Account Holder, vergi/banka | 👤 | Ücretli uygulama/IAP yok → Paid Apps sözleşmesi ve vergi formu şart değil (ileride IAP gelirse gerekir) |
| Sahiplik tek kişide toplanmasın (Apple, GitHub, domain, Vercel) | 👤 | GitHub: efezturkan/cine-tactico, Vercel: cine-tactico; alan adı alınmadı |

## 2. Teknik hazırlık
| Madde | Durum | Kanıt |
|---|---|---|
| Bundle ID benzersiz, ASC'dekiyle aynı | ✅/👤 | `com.crosscutgame.app` (pbxproj); ASC kaydında aynısını gir (kalıcıdır) |
| Sürüm 1.0, build 1 | ✅ | `MARKETING_VERSION=1.0`, `CURRENT_PROJECT_VERSION=1`; her yeni yüklemede build artır |
| Deployment target iOS 15.0, yalnızca iPhone, dikey | ✅ | pbxproj `TARGETED_DEVICE_FAMILY=1`; Info.plist yalnızca Portrait |
| Release build + imza | ✅/👤 | İmzasız Release cihaz derlemesi daha önce başarılı; imzalı arşiv Team seçilince (adım 5) |
| Entitlements | ✅ | Hiç entitlements dosyası yok, gereksiz izin yok |
| İzin metinleri (kamera, konum, mikrofon...) | ✅ | Info.plist'te hiç `NS*UsageDescription` yok; izin istenmiyor, bildirim izni de istenmiyor |
| Privacy Manifest | ✅ | `PrivacyInfo.xcprivacy`: izleme yok, veri toplanmıyor, UserDefaults sebebi CA92.1; Capacitor çerçeveleri kendi manifestini taşıyor |
| Export compliance | ✅ | `ITSAppUsesNonExemptEncryption=false`; ASC'de "Hayır" |
| Gizli anahtar paketin içinde değil | ✅ | **Bu turda bulundu ve düzeltildi:** `ios:sim` betiği `.env.local`'deki Supabase URL ve anon JWT'yi pakete gömüyordu. Betik artık `build:ios` gibi boş ortamla derliyor; `out/` ve `ios/App/App/public` taramasında JWT ve proje adresi 0. `.env.local` git'te değil. **Yayın derlemesi her zaman `npm run build:ios` ile alınır** |
| Test API/debug menüsü | ✅ | `src` içinde `fetch/XMLHttpRequest/axios` yok; ağ yok |
| Gereksiz SDK | ✅ | Capacitor core/ios/haptics/share; `@capacitor/android` yalnızca Android klasörü için (iOS paketine girmez) |
| Launch screen, ikon (1024, alfa yok) | ✅ | `AppIcon-512@2x.png`; arka plan `#0B0D12` ilk karede beyaz parlama yok |

## 3. Oyun ve oynanış
| Madde | Durum | Kanıt |
|---|---|---|
| Tüm modlar (Klasik, Ters Kadraj, Konsept, Günlük) | ✅ | Testler + simülatör; gerçek cihazda ⏳ |
| Kazanma/kaybetme/Altın Makara/skor | ✅ | `game-engine`, `golden-reel`, `daily-*` testleri (0 hata) |
| Yanlış/çift hamle, kare başına tek hak | ✅ | `daily-solo-rules`, `stress-fuzz`, `a11y-ownership` |
| Günlük: UTC, saat dilimi, cihaz saati oynama, yeniden oynama | ✅ | `daily-flow`, `daily-abandon`, `daily-board-golden`; gece yarısı gerçek cihazda ⏳ |
| Çevrimdışı çalışma | ✅/⏳ | Kodda ağ çağrısı yok; uçak modu gerçek cihazda ⏳. İlk açılış internetsiz de çalışmalı: ⏳ |
| Veri kaydı, bozuk kayıt dayanıklılığı | ✅ | `profile-store` testi |
| Film verisi: boş/çift kayıt | ✅ | `catalog-duplicates`, `catalog-freshness`, `content-foundation` |
| Pass & Play, online oda, hesap | ➖ | Pass & Play bilinçli yok; online oda kapalı (`SHOW_ONLINE_ROOM=false`); hesap yok. Mağaza ve inceleme notları buna uygun |
| İlk 30 sn, kurallar anlaşılıyor mu, onboarding | ⏳ | Geliştirici olmayan en az 5 kişi (adım 7 ile birlikte); henüz yapılmadı |

## 4. Hata, performans, kararlılık
| Madde | Durum | Kanıt |
|---|---|---|
| Arka plana alma/ön plana dönme, tur yanmaz | ✅/⏳ | `visibility-pause` testi + simülatör; gerçek cihazda ⏳ |
| Ağ hatası/timeout/retry | ➖ | Ağ yok |
| Bellek sızıntısı, ısınma, pil | ⏳ | Gerçek cihazda 20–30 aç/kapa, uzun oturum, Instruments (yapılmadı) |
| Düşük depolama | ⏳ | Paket ~4,8 MB web + çerçeve; yerel yazım küçük |
| Loglarda gizli veri | ✅ | Gizli anahtar yok; analitik/çökme izleme yok |
| Çökme izleme | ➖ | Yok (gizlilik etiketi "veri yok"); 1.1'de çerezsiz eklenecek, etiket birlikte güncellenir |

## 5. Gizlilik ve KVKK/GDPR
| Madde | Durum | Not |
|---|---|---|
| Veri envanteri | ✅ | Yalnızca cihazda `localStorage`: takma ad, avatar, bot geçmişi, seri, tercihler; sunucuya gitmez |
| App Privacy etiketi | 👤 | "Data Not Collected" (bölüm D); SDK yok |
| Gizlilik politikası canlı, uygulamayla aynı adı taşıyor | ✅ | 26 Kasım: `/privacy` ve `/support` HTTP 200, "Crosscut" yazıyor (Vercel güncellendi). Uygulama içinden erişim: Ayarlar'da var; ⏳ gerçek cihazda bir kez doğrula |
| Hesap silme | ➖ | Hesap yok; "Yerel Veriyi Sıfırla" ve uygulamayı silmek her şeyi kaldırır |
| ATT / IDFA / izleme | ➖ | İzleme yok, reklam yok, `NSPrivacyTracking=false` |
| Veri sorumlusu/iletişim/saklama/silme | ✅ | Gizlilik sayfasında; e-posta adresinin gerçekten cevaplandığını doğrula 👤 |

## 6. Güvenlik
Sunucu, RLS, API anahtarı, rate limit: ➖ bu sürümde sunucu yok (RLS ve sunucu doğrulaması 1.0 dışı; online oda açılmadan önce yapılır). Paketteki gizli anahtar: ✅ yukarıda. Üçüncü taraf SDK'lar: yalnızca Capacitor; ✅.

## 7. Telif ve lisans
| Madde | Durum | Not |
|---|---|---|
| Ad/marka | ✅ | WIPO resmî kayıtları, oyun için çakışma yok (`APP_STORE_SUBMISSION.md` H); USPTO/TÜRKPATENT elle teyit isteğe bağlı 👤 |
| Poster/kare/logo | ✅ | 0 poster, 0 afiş CDN'i; dış resim yok |
| Oyuncu portreleri | ✅ | 11 Wikimedia Commons (CC BY/BY-SA), Ayarlar → Lisanslar'da atıflı |
| Film verisi | ✅ | CC0 Wikidata, olgusal alanlar, kayıt başına kaynak; TMDb/IMDb verisi yok |
| Yazı tipleri, ses | ✅ | Fontlar pakette gömülü; sesler Web Audio ile cihazda sentezlenir (kayıt/örnek dosya yok) |
| Açık kaynak lisansları | ⏳ | Capacitor (MIT) ve npm bağımlılıkları için toplu lisans/atıf listesi yok; MIT için telif metni gerekir. Ayarlar → Lisanslar'a "Açık kaynak" bölümü eklenmesi önerilir (1.0.1) |
| Resmî ürün izlenimi | ✅ | Mağaza metni "Not affiliated with…" satırı; Ayarlar → Hakkında |

## 8. App Store Connect ve mağaza sayfası
| Madde | Durum | Not |
|---|---|---|
| Ad, alt başlık, anahtar kelime, açıklama TR/EN | ✅ | Bölüm C; EN anahtar 97 bayt |
| Kategori, fiyat, yaş (4+) | ✅/👤 | Trivia + Strategy, ücretsiz; yaş anketini ASC'de sen doldur |
| İkon | ✅ | 1024, alfa yok |
| Ekran görüntüleri | ✅ | TR/EN 6'şar, 1320×2868 (6,9"), gerçek ekranlar; iPad yok, gerekmez. Oyun ekranı ham çekimleri yeni derlemeyle yenilenebilir (huzme izi) |
| App Preview videosu | ➖ | Zorunlu değil; `promo/` içinde taslak var, mağazaya yüklenmedi |
| Destek/gizlilik URL'si | ✅ | Canlı, yeni marka |
| Copyright alanı, SKU | 👤 | `crosscut-ios-1` |
| Erişilebilirlik beyanı | 👤 | Yalnızca gerçekten desteklenenleri işaretle; VoiceOver gerçek cihazda ⏳ doğrulanmadan işaretleme |

## 9. Apple incelemesi
| Madde | Durum | Not |
|---|---|---|
| Review Notes | ✅ | `APP_REVIEW_NOTES.md`: hesap yok, demo gerekmez, çevrimdışı, günlük, lisanslar, "online yok". 26 Kasım: eski "hesap silme" ifadesi düzeltildi |
| İletişim bilgisi güncel | 👤 | Notlardaki e-posta/telefonu doğrula |
| Backend/sunucu | ➖ | Yok, incelemeyi etkileyecek bağımlılık yok |

## 10. TestFlight ve QA
⏳ hepsi gerçek cihaz: ilk kurulum, uçak modu (açılış dahil), uygulama kapat/aç, yeniden başlat, gün değişimi, güncelleme sonrası veri korunması (1.0.1'de), sil-yükle (yerel veri gider, beklenen), Türkçe klavye, ses/sessiz anahtar, paylaşım. Liste: `YAYIN_ICIN_KALANLAR.md` bölüm 2. Test edilen build = gönderilen build olmalı.

## 11. Para kazanma
| Madde | Durum |
|---|---|
| Ücretsiz, reklamsız, IAP yok | ✅ (satın alma, Restore, sandbox, ATT: ➖) |
| Gelecek IAP için hazırlık | Mimari bağımsız; 1.2'de eklenince ASC ürünleri, Restore, sunucusuz doğrulama kararı ve vergi/banka gerekir |

## 12. Dil ve erişilebilirlik
✅ TR/EN sözlük testleri, diyakritik kırpma testi, renk körlüğü işareti, 44 pt dokunma alanı, ses/titreşim kapatılır, oyundan çıkış var. ⏳ VoiceOver ve sistem yazı boyutu gerçek cihazda. Yalnızca koyu arayüz (açık tema yok): bilinçli.

## 13. Yayın planı
| Madde | Durum | Not |
|---|---|---|
| Sürüm etiketi ve commit | 👤/ben | `main` = `release/round-2` (26 Kasım). Gönderim öncesi `git tag v1.0.0` benim işim; onayınla |
| Arşiv saklama | 👤 | Xcode Organizer arşivi + commit SHA'sını bu dosyaya yaz |
| Yayın tercihi | Öneri | **Manually Release**: onaydan sonra mağaza sayfası, destek ve Vercel'i son kez kontrol edip kendin yayınla; Phased Release gerekmez (ücretsiz, sunucusuz) |
| Ülkeler | 👤 | İlk yayında tüm ülkeler uygun; EN öncelikli. İstemediğin pazar varsa ASC'de çıkar |
| Geri dönüş | Plan | Mağazadan sürüm kaldırılabilir; eski sürümde kritik hata olursa düzeltme sürümü (1.0.1). Sunucu olmadığı için sunucu geri dönüşü yok |

## 14. ASO ve pazarlama
✅ Ad/alt başlık/anahtar kelime, TR/EN, mağaza görselleri, rakip denetimi (`docs/strategy/`). 👤 Alan adı, sosyal hesaplar, landing sayfası (şimdilik Vercel adresi), App Store bağlantısı/QR yayın sonrası, App Analytics (Apple'ın kendi paneli, gizlilik etiketini etkilemez).

## 15. Hukuki belgeler
✅ Gizlilik politikası (TR/EN, canlı), destek sayfası. ➖ Kullanım koşulları zorunlu değil (hesap/satın alma yok; isteğe bağlı 1.1). 👤 Veri sorumlusu bilgisi ve iletişim e-postasının güncelliği.

## 16. Yayın sonrası (ilk 72 saat)
👤 App Store bağlantısı farklı ülkelerden, yeni kurulumda ilk açılış, yorumları izleme (puan 4,5 altına inerse ilk bakılacak: günlük sıfırlanma, katalog "bulunamadı"). Sunucu/health check/yedek: ➖. Alan adı yenileme tarihi ve Vercel hesabı takip edilecek. Katalog dondurulur; yayın sonrası değişiklik günlük tahtayı sürümler arası ayırır (`00_FINAL_STRATEGY.md` bölüm 13).

## Açık kalan, yayını engelleyen (şimdilik)
1. Apple Developer hesabı + ASC kaydı + imza (👤).
2. TestFlight'ta gerçek cihaz testi ve 5 gözlemci (👤).
3. Yaş anketi, App Privacy, Export compliance formlarını ASC'de doldurma (👤).
Engellemeyen ama önerilen: açık kaynak lisans listesi (1.0.1), VoiceOver testi, mağaza ham ekran yenileme.
