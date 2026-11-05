"use client";

import React, { useEffect } from "react";
import { applySalonConfigToDom, getSavedSalonConfig } from "@/utils/salonConfig";
import { FLAGS } from "@/config/flags";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * Salon Işığı'nın tek uygulama noktası. Uygulamanın en üstünde bir kez monte edilir;
 * Gişe, Vizyondakiler, Sinefil Kartı ve oyun ekranı aynı ışığı paylaşır.
 * Katmanlar modal'ların (z-50) altında, içerik ve alt barın (z-40) üstündedir.
 */
export const SalonAtmosphere: React.FC = () => {
  useEffect(() => {
    applySalonConfigToDom(getSavedSalonConfig());
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
      {/* 1. Salonun ışık rengi */}
      <div className="absolute inset-0" style={{ background: "var(--salon-tint, transparent)" }} />

      {/* 2. Projeksiyon huzması (üstten aşağı) */}
      {FLAGS.LIGHT_BEAM && (
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)",
            background: "linear-gradient(to bottom, var(--salon-beam, #F2D9A0) 0%, transparent 75%)",
            opacity: "var(--salon-beam-opacity, 0.09)",
          }}
        />
      )}

      {/* 3. Loşluk: düz kısma + kenar vinyeti */}
      <div className="absolute inset-0 bg-black" style={{ opacity: "var(--salon-dim-flat, 0.11)" }} />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 35%, #000 130%)",
          opacity: "var(--salon-dim-vignette, 0.31)",
        }}
      />

      {/* 4. 35mm gren */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundSize: "160px 160px",
          mixBlendMode: "screen",
          opacity: "var(--salon-grain-opacity, 0.028)",
        }}
      />
    </div>
  );
};

export default SalonAtmosphere;
