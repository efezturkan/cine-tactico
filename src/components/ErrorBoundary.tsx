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
    console.error("Crosscut Uncaught Client Error:", error, errorInfo);
  }

  public componentDidMount() {
    window.addEventListener("error", this.recordWindowError);
    window.addEventListener("unhandledrejection", this.recordRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener("error", this.recordWindowError);
    window.removeEventListener("unhandledrejection", this.recordRejection);
  }

  // Yakalanmayan JS hataları native çökme üretmez, Xcode Organizer görmez. Ağ yok, SDK yok:
  // son hata yalnızca cihazda tutulur ve destek yazışmasında istenirse kullanıcı iletebilir.
  private remember(kind: string, reason: unknown) {
    const text = reason instanceof Error ? `${reason.message}\n${reason.stack ?? ""}` : String(reason);
    console.error(`Crosscut ${kind}:`, reason);
    try {
      sessionStorage.setItem("crosscut_last_error", `${kind}: ${text}`.slice(0, 2000));
    } catch {
      // Depolama doluysa hata konsola yazılmıştır; kayıt tutulamaz.
    }
  }

  private recordWindowError = (event: ErrorEvent) => this.remember("window.onerror", event.error ?? event.message);
  private recordRejection = (event: PromiseRejectionEvent) => this.remember("unhandledrejection", event.reason);

  // İlk dokunuş yalnızca yeniden yükler: ilerleme, seri ve Günlük Kadraj sonucu korunur.
  // Aynı oturumda hata tekrarlarsa (bozuk kayıt şüphesi) yerel veri son çare olarak silinir.
  private handleReset = () => {
    let attempts = 1;
    try {
      attempts = Number(sessionStorage.getItem("crosscut_boundary_retries") ?? "0") + 1;
      sessionStorage.setItem("crosscut_boundary_retries", String(attempts));
    } catch {
      // Sayaç tutulamıyorsa her seferinde yalnızca yeniden yüklenir; veri silinmez.
    }
    if (attempts >= 3) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("cinexox_") || key.startsWith("cinetactico_") || key.startsWith("sb-"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
      } catch {
        // Silinemiyorsa yeniden yükleme yine denenir.
      }
    }
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      let isEn = false;
      try {
        // Safari gizli mod / engelli depolamada erişim SecurityError fırlatabilir
        isEn =
          typeof window !== "undefined" &&
          window.localStorage?.getItem("cinexox_locale") === "en";
      } catch {
        isEn = false;
      }

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
