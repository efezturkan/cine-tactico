"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { RotateCcw, Film } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("CineXOX Uncaught Client Error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("cinexox_") || key.startsWith("cinetactico_") || key.startsWith("sb-"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      const isEn =
        typeof window !== "undefined" &&
        window.localStorage?.getItem("cinexox_locale") === "en";

      return (
        <div className="min-h-screen bg-[#0B0D12] text-[#E8E6E1] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          {/* Tek Renk Film/Makara İkonu */}
          <div className="w-14 h-14 rounded-2xl bg-[#14171D] border border-white/10 flex items-center justify-center mb-4">
            <Film className="w-7 h-7 text-[#D9A441]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-wide text-[#E8E6E1] mb-2">
            {isEn ? "The reel snapped." : "Makara koptu."}
          </h1>
          <p className="text-xs text-[#8A8F9A] max-w-xs mb-6 leading-relaxed font-sans">
            {isEn
              ? "Something unexpected happened. Restart the session."
              : "Beklenmedik bir şey oldu. Seansı yeniden başlat."}
          </p>
          <Button
            variant="primary"
            onClick={this.handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isEn ? "RESTART SESSION" : "SEANSI YENİDEN BAŞLAT"}</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
