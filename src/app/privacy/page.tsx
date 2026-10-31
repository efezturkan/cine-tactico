import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Smartphone, Database } from "lucide-react";

export const metadata = {
  title: "Gizlilik Politikası | Cine-Tactico",
  description: "Cine-Tactico kullanıcı gizliliği ve veri güvenliği politikası.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-200 py-12 px-4 sm:px-6 max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Oyuna Dön
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Gizlilik Politikası</h1>
          <p className="text-xs text-zinc-400 font-mono">Son Güncelleme: 31 Ekim 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-zinc-300 bg-[#0e1018] border border-[#1a1c24] rounded-2xl p-6 sm:p-8">
        <section>
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> 1. Veri Toplamama Taahhüdü
          </h2>
          <p>
            Cine-Tactico, Efe Öztürkan tarafından geliştirilmiş çevrimdışı çalışabilen 3x3 sinema taktik oyunudur.
            Uygulamamız kullanıcılarından <strong>HİÇBİR kişisel veri (ad, soyad, e-posta, konum, IP adresi, cihaz kimliği)</strong> toplamaz,
            işlemez ve sunuculara göndermez.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" /> 2. Cihaz İzinleri ve Ağ Erişimi
          </h2>
          <p>
            Uygulamamız kamera, mikrofon, telefon rehberi, konum veya fotoğraf galerisine erişim izni istemez.
            Oyun sırasında harici sunuculara hiçbir ağ isteği gönderilmez. Uygulama internet bağlantısı olmaksızın
            tamamen çevrimdışı oynanabilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" /> 3. Yerel Depolama ve Veri Sıfırlama
          </h2>
          <p>
            Kullanıcının tercih ettiği salon teması ve ışık ayarları yalnızca kullanıcının kendi cihazındaki yerel
            hafızada (localStorage) saklanır. Kullanıcı dilediği an uygulama içindeki profil menüsünden
            <strong>&quot;Yerel Oyun Verilerini Sıfırla&quot;</strong> seçeneği ile bu tercihleri silebilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">4. Reklam ve Üçüncü Taraflar</h2>
          <p>
            Uygulamanın mevcut sürümünde üçüncü taraf reklam ağları (AdMob vb.) veya analitik takip araçları (Firebase, Facebook Pixel) yer almamaktadır.
          </p>
        </section>

        <section className="pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          <p>
            <strong>Geliştirici / Veri Sorumlusu:</strong> Efe Öztürkan<br />
            <strong>İletişim:</strong>{" "}
            <a href="mailto:efezturkan@gmail.com" className="text-amber-400 hover:underline">
              efezturkan@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
