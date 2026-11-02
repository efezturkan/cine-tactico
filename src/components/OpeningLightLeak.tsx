"use client";

import React, { useState, useEffect } from "react";
import { FLAGS } from "@/config/flags";

export const OpeningLightLeak: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!FLAGS.OPENING_LEAK || typeof window === "undefined") return;
    try {
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) return;

      const hasShown = sessionStorage.getItem("cinexox_opening_leak_shown");
      if (hasShown) return;
      sessionStorage.setItem("cinexox_opening_leak_shown", "1");

      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 700);
      return () => clearTimeout(timer);
    } catch {
      // safe fallback
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-700 ease-out"
      style={{
        background: "radial-gradient(ellipse at 100% 0%, rgba(242, 217, 160, 0.14) 0%, transparent 60%)",
      }}
    />
  );
};

export default OpeningLightLeak;
