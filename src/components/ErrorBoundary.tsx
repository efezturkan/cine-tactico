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
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080b] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-black tracking-wider uppercase mb-2">
            Kadraj Yeniden Başlatılıyor
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs mb-6 leading-relaxed">
            Tarayıcı veya yerel veri uyumsuzluğu nedeniyle bir hata oluştu. Verileri sıfırlayarak oyunu yeniden başlatabilirsiniz.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black text-sm active:scale-95 transition-transform shadow-lg shadow-amber-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Oyunu Yeniden Başlat</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
