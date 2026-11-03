"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Smartphone, Database, Trash2, Globe, FileText } from "lucide-react";

export default function PrivacyPage() {
  const [lang, setLang] = useState<"TR" | "EN">("TR");

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-200 py-12 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Üst Bar: Geri Dönüş ve Dil Değiştirici */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "TR" ? "Oyuna Dön" : "Back to Game"}
        </Link>

        <div className="inline-flex items-center rounded-lg bg-[#14171d] border border-white/10 p-0.5">
          <button
            type="button"
            onClick={() => setLang("TR")}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors ${
              lang === "TR" ? "bg-amber-400 text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            TR
          </button>
          <button
            type="button"
            onClick={() => setLang("EN")}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md transition-colors ${
              lang === "EN" ? "bg-amber-400 text-black" : "text-zinc-400 hover:text-white"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">
            {lang === "TR" ? "Gizlilik Politikası" : "Privacy Policy"}
          </h1>
          <p className="text-xs text-zinc-400 font-mono">
            {lang === "TR" ? "Son Güncelleme: 3 Kasım 2026" : "Last Updated: November 3, 2026"} · Cine-XOX
          </p>
        </div>
      </div>

      {/* İçerik */}
      <div className="space-y-6 text-sm leading-relaxed text-zinc-300 bg-[#0e1018] border border-[#1a1c24] rounded-2xl p-6 sm:p-8">
        {lang === "TR" ? (
          <>
            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> 1. Toplanan Veriler ve Kullanım Amaçları
              </h2>
              <p>
                <strong>Cine-XOX</strong>, varsayılan olarak kayıt zorunluluğu olmadan (misafir oturumuyla) çalışır ve ad, soyad, telefon numarası, coğrafi konum veya cihaz donanım kimliği toplamaz.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Oyun deneyimini sağlamak için yalnızca şu veriler işlenir:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-zinc-400">
                <li><strong>Anonim Oyuncu Kimliği:</strong> Uygulama ilk açıldığında sunucu tarafında rastgele bir kullanıcı kimliği (UUID) oluşturulur. Bu kimlik doğrudan gerçek kimliğinizle ilişkilendirilmez.</li>
                <li><strong>Oyun İlerlemesi ve İstatistikler:</strong> Lig dereceniz (rating), kazandığınız unvanlar, galibiyet/mağlubiyet sayılarınız ve makara bakiyeniz.</li>
                <li><strong>Çok Oyunculu Maç Kayıtları:</strong> Çevrimiçi Özel Gösterim odalarında yapılan hamleler (`room_moves`) ve maç sonuçları (`match_sessions`).</li>
                <li><strong>İsteğe Bağlı Bilgiler ve Hesap Bağlama:</strong> Kendi seçtiğiniz takma ad (username), avatar, isteğe bağlı Letterboxd kullanıcı adı ve yalnızca misafir hesabınızı yedeklemek için kendi isteğinizle &quot;Hesap Oluştur&quot; özelliğini kullanırsanız kimlik doğrulama amaçlı e-posta adresiniz.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> 2. Çevrimdışı ve Çevrimiçi Ağ Erişimi
              </h2>
              <p>
                <strong>Tek Kişilik Oyun (Bot Karşılaşmaları):</strong> İnternet bağlantısı gerektirmez. Maç geçmişiniz ve görsel tercihleriniz yalnızca cihazınızın yerel belleğinde (localStorage) saklanır.
              </p>
              <p className="mt-2">
                <strong>Çok Oyunculu Mod ve Sıralama:</strong> Canlı maç senkronizasyonu ve genel lig tablosu için güvenli bulut sağlayıcımız Supabase altyapısına şifreli (HTTPS/WSS) ağ istekleri yapılır. Kamera, mikrofon veya rehber erişimi kesinlikle istenmez.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> 3. Reklam ve Üçüncü Taraflar
              </h2>
              <p>
                Uygulamamızda üçüncü taraf reklam ağları (AdMob vb.) yer almaz. Kullanıcı davranışlarını takip eden analitik veya izleme (tracking) araçları (Firebase Analytics, Facebook Pixel vb.) kullanılmaz. Verileriniz hiçbir reklamveren veya veri simsarıyla paylaşılmaz ya da satılmaz.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" /> 4. Yerel Veri Sıfırlama ve Hesap Silme Hakları
              </h2>
              <p>
                Kullanıcılarımız verileri üzerinde Apple Guideline 5.1.1(v) ve KVKK/GDPR kapsamında tam kontrole sahiptir:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 text-xs text-zinc-300">
                <li>
                  <strong>Yerel Verileri Sıfırla:</strong> Profil menüsünden cihazınızdaki çevrimdışı bot maç geçmişini, salon ambiyans tercihlerinizi ve yerel önbelleği temizleyebilirsiniz. Çevrimiçi profiliniz korunur.
                </li>
                <li>
                  <strong>Hesabı ve Tüm Verileri Sil:</strong> Profil menüsündeki &quot;Hesabı Sil&quot; seçeneğini kullanarak sunucudaki anonim veya bağlı hesabınızı (`auth.users`), profilinizi (`profiles`), bekleyen odalarınızı ve hamle kayıtlarınızı (`room_moves`) kalıcı olarak yok edebilirsiniz. Tamamlanmış çok oyunculu maç arşivlerinde (`match_sessions`) rakibin geçmişi bozulmaması için oyuncu kimliğiniz anonimleştirilir (`NULL` yapılır). Bu işlem geri alınamaz.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> 5. Fikri Mülkiyet, Açık Lisanslar ve Görsel Atıfları
              </h2>
              <p>
                <strong>Telifli Afişler:</strong> Cine-XOX içerisinde hiçbir stüdyo film afişi veya telifli tanıtım görseli barındırılmaz. Tüm filmler tipografik ve vektörel gösterimlerle sunulur.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                <strong>Creative Commons Portreler:</strong> Uygulama paketinde yer alan 11 aktör ve yönetmen portresi Wikimedia Commons üzerinden CC BY ve CC BY-SA açık lisanslarıyla temin edilmiştir. Her görsel 160×160 kare formatında kırpılmış olup, yazar ve lisans detayları Ayarlar menüsündeki &quot;Lisanslar &amp; Görsel Atıfları&quot; alanında tam olarak listelenmektedir.
              </p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> 1. Data Collection and Purpose
              </h2>
              <p>
                <strong>Cine-XOX</strong> operates by default with an anonymous guest session and does NOT require your real name, phone number, GPS coordinates, or hardware identifiers.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                To provide core game functionality, the following data is processed:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-zinc-400">
                <li><strong>Anonymous Player ID:</strong> A randomized pseudonymous identifier (UUID) generated on first launch. Not linked to your real identity.</li>
                <li><strong>Gameplay Progress & Stats:</strong> Tier ratings, rank titles, wins, losses, draws, and reels balance.</li>
                <li><strong>Multiplayer Match Data:</strong> Cell moves (`room_moves`) and outcomes (`match_sessions`) in Custom Room multiplayer duels.</li>
                <li><strong>Optional Profile & Account Linking:</strong> Public nickname, avatar selection, optional Letterboxd handle, and—only if you voluntarily choose to link your guest session via &quot;Create Account&quot;—your email address solely for authentication.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> 2. Offline vs. Online Modes
              </h2>
              <p>
                <strong>Single-Player (Bot Matches):</strong> Fully playable offline. Game history and display preferences remain strictly in your device local storage.
              </p>
              <p className="mt-2">
                <strong>Online Multiplayer & Leaderboard:</strong> Secure encrypted network connections (HTTPS/WSS) to our cloud service provider, Supabase, are utilized for realtime gameplay and rankings. We never request access to camera, microphone, or contacts.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" /> 3. Advertising and Third Parties
              </h2>
              <p>
                The App contains NO third-party advertising networks. We do NOT use third-party behavioral tracking or analytics SDKs (such as Firebase Analytics or Facebook Pixel). Your gameplay data is never sold or shared with data brokers.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" /> 4. Data Deletion Rights (Apple 5.1.1(v) & GDPR)
              </h2>
              <p>
                You maintain complete authority over your data:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-2 text-xs text-zinc-300">
                <li>
                  <strong>Reset Local Data:</strong> Clears local device cache, offline bot matches, and visual theme preferences without altering your online standing.
                </li>
                <li>
                  <strong>Delete Account & All Data:</strong> Located in the Profile menu, &quot;Delete Account&quot; permanently purges your server-side authentication record (`auth.users`), profile (`profiles`), waiting rooms, and move history (`room_moves`), while unlinking (`SET NULL`) your user reference in completed multiplayer match records (`match_sessions`) so your opponent&apos;s match archive remains intact. This action is irreversible.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> 5. Intellectual Property & Creative Commons Licensing
              </h2>
              <p>
                <strong>Zero Copyrighted Posters:</strong> Cine-XOX hosts 0 copyrighted studio posters or promotional stills. All movie titles use typographic representations and icons.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                <strong>Creative Commons Portraits:</strong> The 11 actor and director portraits packaged locally are sourced from Wikimedia Commons under CC BY and CC BY-SA open licenses. All items are cropped to 160×160 pixels. Full author, license, and provenance attribution is publicly accessible in the Settings &gt; &quot;Licenses &amp; Attributions&quot; panel.
              </p>
            </section>
          </>
        )}

        <section className="pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          <p>
            <strong>{lang === "TR" ? "Geliştirici / Veri Sorumlusu:" : "Developer / Data Controller:"}</strong> Efe Öztürkan<br />
            <strong>{lang === "TR" ? "İletişim:" : "Contact:"}</strong>{" "}
            <a href="mailto:efezturkan@gmail.com" className="text-amber-400 hover:underline">
              efezturkan@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
