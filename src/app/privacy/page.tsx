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
            {lang === "TR" ? "Son Güncelleme: 4 Kasım 2026" : "Last Updated: November 4, 2026"} · Cine-XOX
          </p>
        </div>
      </div>

      {/* İçerik */}
      <div className="space-y-6 text-sm leading-relaxed text-zinc-300 bg-[#0e1018] border border-[#1a1c24] rounded-2xl p-6 sm:p-8">
        {lang === "TR" ? (
          <>
            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> 1. Toplanan Veriler
              </h2>
              <p>
                <strong>Cine-XOX</strong> hesap, kayıt ya da giriş gerektirmez. Ad, e-posta, telefon, konum veya cihaz kimliği toplamaz; verilerinizi sunucuya göndermez.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Yalnızca cihazınızın yerel belleğinde (localStorage) şunlar saklanır: takma adınız, avatarınız, bot maç geçmişi ve istatistikleriniz, günlük seri bilgisi, ses/titreşim ve salon ambiyans tercihleriniz.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> 2. Ağ Erişimi
              </h2>
              <p>
                Bu sürümdeki tüm oyun modları (Botla Düello, Günün Kadrası) internet bağlantısı olmadan çalışır. Uygulama oyun sırasında hiçbir sunucuya veri göndermez. Çevrimiçi özellikler eklenirse bu politika önceden güncellenir.
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
                <Database className="w-4 h-4 text-purple-400" /> 4. Verileriniz Üzerindeki Haklarınız
              </h2>
              <p>
                Tüm verileriniz yalnızca cihazınızdadır. Profil menüsündeki &quot;Yerel Verileri Sıfırla&quot; seçeneğiyle bot maç geçmişinizi, tercihlerinizi ve istatistiklerinizi silebilir, uygulamayı kaldırarak her şeyi kalıcı olarak yok edebilirsiniz. Sunucuda saklanan bir hesabınız bulunmadığı için silinecek çevrimiçi bir kaydınız yoktur.
              </p>
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
                <Lock className="w-4 h-4 text-emerald-400" /> 1. Data Collection
              </h2>
              <p>
                <strong>Cine-XOX</strong> needs no account, sign-up, or login. It does not collect your name, email, phone number, location, or device identifiers, and it does not send your data to any server.
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                Only your device&apos;s local storage holds: your nickname, avatar, bot match history and stats, daily streak, and sound, haptic and ambience preferences.
              </p>
            </section>
            <section>
              <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" /> 2. Network Access
              </h2>
              <p>
                Every mode in this version (Bot Duel, Daily Frame) works fully offline. The app sends no data to any server during play. If online features are added later, this policy will be updated first.
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
                <Trash2 className="w-4 h-4 text-red-400" /> 4. Your Rights Over Your Data
              </h2>
              <p>
                All your data lives only on your device. Use &quot;Reset Local Data&quot; in the Profile menu to erase bot match history, preferences and stats, or uninstall the app to remove everything permanently. There is no server-side account, so there is no online record to delete.
              </p>
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
