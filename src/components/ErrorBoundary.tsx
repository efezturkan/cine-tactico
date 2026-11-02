"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

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
      return (
        <div className="min-h-screen bg-[#0B0D12] text-[#E8E6E1] flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-14 h-14 rounded-2xl bg-[#14171D] border border-[#D9A441]/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-[#D9A441]" />
          </div>
          <h1 className="text-lg sm:text-xl font-serif font-bold tracking-wide text-[#E8E6E1] mb-2">
            Makara koptu, bağlantı yeniden kuruluyor...
          </h1>
          <p className="text-xs text-[#8A8F9A] max-w-xs mb-6 leading-relaxed font-sans">
            Projeksiyonda beklenmedik bir kesinti oluştu. Seansı tazeleyerek oyunu yeniden başlatabilirsiniz.
          </p>
          <button
            onClick={this.handleReset}
            className="h-11 px-6 rounded-xl bg-[#D9A441] text-[#0B0D12] font-serif font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform border border-[#D9A441] min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Seansı Yeniden Başlat</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
