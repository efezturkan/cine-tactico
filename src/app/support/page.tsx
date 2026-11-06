"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

const SUPPORT_EMAIL = "efezturkan@gmail.com";

/** App Store "Destek URL'si" sayfası: iletişim ve sık sorulan sorular. */
export default function SupportPage() {
  const [lang, setLang] = useState<"TR" | "EN">("TR");
  const tr = lang === "TR";

  const faqs = tr
    ? [
        ["Uygulama internet gerektiriyor mu?", "Hayır. Tüm modlar internetsiz çalışır; hesap ya da giriş yoktur."],
        ["İlerlemem nerede saklanıyor?", "Yalnızca cihazında. Profil > Yerel Verileri Sıfırla ile silebilir, uygulamayı kaldırarak tamamen yok edebilirsin."],
        ["Bir film ya da oyuncu bilgisi yanlış.", "Aşağıdaki adrese filmin adını ve düzeltmeyi yaz, kataloğu güncelleyelim."],
        ["Dili nasıl değiştiririm?", "Gişe > Ayarlar > Dil bölümünden Türkçe veya English seçebilirsin."],
      ]
    : [
        ["Does the app need internet?", "No. Every mode works offline; there are no accounts or sign-in."],
        ["Where is my progress stored?", "Only on your device. Use Profile > Reset Local Data, or uninstall the app to remove everything."],
        ["A film or actor detail is wrong.", "Email the title and the correction below and we will update the catalog."],
        ["How do I change the language?", "Home > Settings > Language lets you pick Türkçe or English."],
      ];

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#E8E6E1] py-10 px-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#D9A441]">
          <ArrowLeft className="w-4 h-4" /> {tr ? "Oyuna Dön" : "Back to Game"}
        </Link>
        <div className="inline-flex rounded-lg bg-[#14171D] border border-white/10 p-0.5">
          {(["TR", "EN"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md ${lang === l ? "bg-[#D9A441] text-black" : "text-zinc-400"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <h1 className="font-serif text-3xl font-bold mb-2">{tr ? "Destek" : "Support"}</h1>
      <p className="text-sm text-[#8A8F9A] mb-6">Cine-XOX · {tr ? "Sinema Taktik Düellosu" : "Cinema Tactics Duel"}</p>

      <a
        href={`mailto:${SUPPORT_EMAIL}?subject=Cine-XOX`}
        className="flex items-center gap-3 p-4 rounded-2xl bg-[#14171D] border border-white/10 mb-8"
      >
        <Mail className="w-5 h-5 text-[#D9A441]" />
        <div>
          <div className="text-sm font-bold">{tr ? "Bize yaz" : "Email us"}</div>
          <div className="text-xs text-[#8A8F9A]">{SUPPORT_EMAIL}</div>
        </div>
      </a>

      <div className="space-y-4">
        {faqs.map(([q, a]) => (
          <div key={q} className="p-4 rounded-2xl bg-[#0E1016] border border-white/5">
            <div className="text-sm font-bold mb-1">{q}</div>
            <div className="text-xs text-[#A5A8B0] leading-relaxed">{a}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#8A8F9A] mt-8">
        <Link href="/privacy" className="text-[#D9A441] underline">
          {tr ? "Gizlilik Politikası" : "Privacy Policy"}
        </Link>
      </p>
    </div>
  );
}
