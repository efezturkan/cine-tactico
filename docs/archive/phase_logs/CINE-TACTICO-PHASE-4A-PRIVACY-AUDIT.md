# CINE-TACTICO — PHASE 4A: PRIVACY & STORE COMPLIANCE AUDIT REPORT

**Task ID:** CT-P4A-PRIVACY-AUDIT  
**Audit Mode:** READ-ONLY / NO CODE MODIFICATIONS  
**Date:** 2026-10-31  
**Evaluator:** Antigravity Autonomous Engine  

---

## 1. Yönetici Özeti ve Kullanıcının 2 Kritik Sorusunun Yanıtı

### Soru 1: Şu an uygulamada gerçek kullanıcı hesabı ve sunucuya bağlı profil sistemi var mı, yoksa profil tamamen cihaz üzerinde mi?
> **NET BULGU:** Uygulamada **KESİNLİKLE HİÇBİR KULLANICI HESABI VEYA SUNUCU BAĞLANTISI YOKTUR**.
> - Ne bir kayıt (sign-up), ne giriş (login), ne e-posta/şifre, ne de Apple/Google Sign-In bulunmaktadır.
> - Ekranda görünen "Sinefil_99" profili, avatarı ve makara bakiyesi, sadece cihazın belleğinde (React state) yaşayan yerel bir prototiptir. Sunucuya, veritabanına veya harici bir servise hiçbir veri aktarılmamaktadır.

### Soru 2: İlk sürümde reklam SDK'sı bulunacak mı, yoksa reklamları lansmandan sonraki sürüme mi bırakıyoruz?
> **NET BULGU:** İlk sürümde **HİÇBİR REKLAM SDK'SI BULUNMAYACAKTIR**.
> - CT-LAUNCH-MASTER sözleşmesi Kural 0.1 ("Never introduce advertisements, IAP, subscriptions or other monetization features into the MVP") gereğince reklamlar lansman sonrasına ertelenmiştir.
> - Kod tabanında (Google AdMob, Unity Ads, AppLovin vb.) hiçbir reklam SDK'sı yer almamaktadır.
> - Bu durum, Apple ve Google mağaza incelemelerinde "Veri Toplanmıyor / Takip Yapılmıyor" beyanı vermemizi sağlayarak inceleme sürecini büyük ölçüde kolaylaştırmaktadır.

---

## 2. 10 Maddelik Derinlemesine Gizlilik ve Uyumluluk Denetimi

### 2.1. Hesap Oluşturma, Giriş ve Kullanıcı Verisi Saklama Durumu
- **Durum:** `Yok`.
- Kod tabanında `auth`, `session`, `userId`, `firebase`, `supabase` veya herhangi bir uzak API kimlik doğrulayıcısı sıfırdır.
- Kullanıcı oyunu açtığı anda anonimdir ve hiçbir hesap açmadan doğrudan tahtaya erişir.

### 2.2. LocalStorage, IndexedDB ve Yerel Depolama Envanteri
- **IndexedDB:** `0` (Kullanılmıyor).
- **SessionStorage:** `0` (Kullanılmıyor).
- **LocalStorage:** Kod tabanında sadece **1 tek anahtar** kullanılmaktadır:
  - `cinexox_ambience` (veya geriye dönük `cinetactico_ambience`): Kullanıcının seçtiği salon teması (`velvet_red`, `kodak_amber` vb.), karartma oranı (`dimness`), projeksiyon parıltısı (`glowIntensity`), film greni (`grain`) ve vizör köşesi rengi.
  - Maç skorları, bakiye veya galibiyetler dahi localStorage'a yazılmamaktadır.

### 2.3. Capacitor Eklentileri ve Native İzinler
- **Kurulu Eklentiler:** `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `@capacitor/haptics`.
- **iOS (`Info.plist`):**
  - Kamera (`NSCameraUsageDescription`): **YOK**
  - Konum (`NSLocationWhenInUseUsageDescription`): **YOK**
  - Mikrofon (`NSMicrophoneUsageDescription`): **YOK**
  - Rehber / Kişiler (`NSContactsUsageDescription`): **YOK**
  - Takip İzni (`NSUserTrackingUsageDescription`): **YOK**
  - Fotoğraflar (`NSPhotoLibraryUsageDescription`): **YOK**
- **Android (`AndroidManifest.xml`):**
  - Yalnızca Capacitor WebView'ın yerel HTML dosyalarını HTTPS şemasında yükleyebilmesi için gereken standart `android.permission.INTERNET` izni mevcuttur.
  - Reklam Kimliği (`com.google.android.gms.permission.AD_ID`) izni **YOKTUR**.
  - Konum, kamera veya harici depolama izni **YOKTUR**.

### 2.4. Uygulamanın Yaptığı Ağ İstekleri (Runtime Network Calls)
- **Runtime İstek Sayısı:** **0 (SIFIR)**.
- Uygulama çalışırken hiçbir `fetch()`, `axios`, `XMLHttpRequest` veya `WebSocket` isteği göndermemektedir.
- `src/data/movies.ts` içindeki TMDB afiş URL'leri string olarak dursa dahi, Phase 2'de `SHOW_EXTERNAL_POSTERS = false` yapıldığı için tarayıcı/WebView tarafından bu görseller dahi indirilmemektedir.
- Uygulama uçak modunda %100 çevrimdışı çalışabilmektedir.

### 2.5. Analytics, Crash Reporting ve Tracking SDK Analizi
- **Google Analytics / Firebase Analytics:** YOK.
- **Sentry / Bugsnag / Crashlytics:** YOK.
- **Facebook Pixel / Adjust / AppsFlyer:** YOK.
- Kullanıcının cihaz kimliği (IDFA / GAID) okunmamaktadır.

### 2.6. Gelecekte Planlanan Reklam Entegrasyonunun Etkisi
İlerleyen sürümlerde Google AdMob veya Unity Ads entegre edildiğinde gizlilik durumu kökten değişecektir:
- **Apple Tarafında:** `NSUserTrackingUsageDescription` (App Tracking Transparency - ATT) izni zorunlu olacak; App Store Gizlilik Etiketi'ne "Üçüncü Taraf Reklamcılığı" ve "Kullanıcıyı Takip Eden Veriler (IDFA)" eklenecektir.
- **Google Play Tarafında:** Google Play Data Safety formunda `Device or other IDs` (Reklam Kimliği) ve `Ad interactions` işaretlenmek zorunda kalınacaktır.
- **Stratejik Avantaj:** Bu gereksinimlerin ilk sürüme dahil edilmemesi, MVP lansmanında mağaza reddi (rejection) riskini sıfıra indirmektedir.

### 2.7. Cihazda Tutulan Hangi Veriler Sıfırlanabilir?
1. **Ambiyans Tercihleri:** `localStorage.removeItem("cinexox_ambience")`.
2. **Bellekteki Profil ve Skorlar:** `profile` React state'inin ilk varsayılan değerlerine döndürülmesi.
3. *Önemli Ayrım:* Sunucuda hesap bulunmadığı için Apple'ın "Hesap Silme" (Account Deletion - Guideline 5.1.1v) şartı teknik olarak geçerli değildir. Ancak kullanıcıya yerel ayarlarını ve skorlarını sıfırlama seçeneği sunmak iyi bir kullanıcı deneyimidir.

### 2.8. Apple App Privacy ve Google Play Data Safety Beyanları
- **Apple App Store Connect:**
  - *"Do you or your third-party partners collect data from this app?"* sorusuna **"No, we do not collect data from this app"** (Veri Toplanmıyor) beyanı verilecektir.
- **Google Play Console Data Safety:**
  - *"Does your app collect or share any of the required user data types?"* sorusuna **"No"** (Hayır) yanıtı verilecektir.
  - Hedef Kitle: 13 yaş ve üzeri (veya genel izleyici).

### 2.9. Gizlilik Politikasında Yer Alması Gereken Gerçek Veri Akışları
1. **Sıfır Veri Toplama Taahhüdü:** Uygulamanın kullanıcının kimliğini belirleyici hiçbir kişisel veri (ad, e-posta, telefon, konum, IP adresi) toplamadığı.
2. **Çevrimdışı ve Yerel Çalışma:** Tüm oyun mantığının ve görsel tema tercihlerinin yalnızca kullanıcının kendi cihazında yerel olarak barındırıldığı.
3. **Üçüncü Taraf Paylaşımı Yok:** Hiçbir analitik, izleme veya reklam şirketiyle veri paylaşılmadığı.
4. **Çocukların Gizliliği:** 13 yaşından küçük çocuklardan bilerek veya bilmeyerek hiçbir kişisel veri toplanmadığı.

### 2.10. KVKK ve Yasal İletişim Bilgilerinde Eksik Olanlar
Gizlilik politikasının yasal olarak geçerli olabilmesi için şu bilgiler henüz belirlenmemiştir:
1. **Veri Sorumlusu Unvanı / Adı:** Geliştiricinin yasal adı veya şirket unvanı.
2. **İletişim E-posta Adresi:** Kullanıcıların veya mağaza denetçilerinin ulaşabileceği resmi destek e-postası (örn. `support@...` veya kişisel geliştirici e-postası).
3. **Yargı Yetkisi / Coğrafya:** Türkiye Cumhuriyeti (KVKK) ve App Store/Google Play küresel dağıtımı.

---

## 3. Riskler, Eksikler ve Sonraki Adım Yol Haritası

| Madde | Durum | Gerekli Eylem |
| :--- | :--- | :--- |
| **Kullanıcı Hesabı** | Yok (Yerel) | Apple hesap silme kuralı işletilmeyecek; yerel profil sıfırlama opsiyonel tutulacak. |
| **Ağ / Sunucu İsteği** | Sıfır | Mağazaya "Veri Toplanmıyor" beyanı verilecek. |
| **Gizlilik Sözleşmesi** | Eksik | Resmi bir `PRIVACY_POLICY.md` hazırlanmalı ve webde bir URL'ye bağlanmalı. |
| **İletişim Bilgisi** | Eksik | Kullanıcıdan gizlilik metnine yazılacak resmi bir iletişim e-postası alınmalı. |
| **Uygulama İkonları** | Eksik | Native projelere 1024x1024 uygulama ikonu entegre edilmeli. |
