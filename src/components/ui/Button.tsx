import React, { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "icon" | "inline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", fullWidth = false, className = "", children, disabled, ...props }, ref) => {
    // 2.3 Buton sistemi (tek Button bileşeni)
    let baseStyles = "inline-flex items-center justify-center font-sans transition-transform select-none active:scale-[0.97] focus:outline-none";

    let variantStyles = "";

    switch (variant) {
      case "primary":
        // Ana: altın zemin, koyu yazı, büyük harf sans 700, yükseklik 52, 3 px alt kenar, basınca scale(.97)
        variantStyles = disabled
          ? "h-[52px] px-6 text-sm font-bold uppercase tracking-wider bg-[#D9A441]/40 text-[#0B0D12]/60 border-b-[3px] border-[#8E651B]/40 cursor-not-allowed rounded-xl"
          : "h-[52px] px-6 text-sm font-bold uppercase tracking-wider bg-[#D9A441] text-[#0B0D12] border-b-[3px] border-[#8E651B] hover:brightness-[1.03] active:translate-y-[1px] active:border-b-[1.5px] rounded-xl shadow-none";
        break;

      case "secondary":
        // İkincil: saydam zemin, 1 px çerçeve, yükseklik 52, büyük harf
        variantStyles = disabled
          ? "h-[52px] px-6 text-sm font-bold uppercase tracking-wider bg-transparent text-[#8A8F9A]/40 border border-white/5 cursor-not-allowed rounded-xl"
          : "h-[52px] px-6 text-sm font-bold uppercase tracking-wider bg-transparent text-[#E8E6E1] border border-white/15 hover:border-white/30 hover:bg-white/[0.03] rounded-xl";
        break;

      case "icon":
        // Simge butonu: 44×44, bevelsiz, 1 px çerçeve veya saydam. Ses, ayarlar, X (kapat), geri.
        variantStyles = disabled
          ? "w-11 h-11 min-w-[44px] min-h-[44px] text-[#8A8F9A]/30 border border-white/5 bg-transparent cursor-not-allowed rounded-xl"
          : "w-11 h-11 min-w-[44px] min-h-[44px] text-[#8A8F9A] hover:text-[#E8E6E1] border border-white/10 hover:border-white/20 bg-transparent hover:bg-white/[0.04] rounded-xl";
        break;

      case "inline":
        // Satır içi küçük buton: (Paylaş, İncele, Kopyala) 36 px, ikincil stil, normal harf
        variantStyles = disabled
          ? "h-9 px-3 text-xs font-medium normal-case text-[#8A8F9A]/40 bg-white/[0.02] border border-white/5 cursor-not-allowed rounded-lg"
          : "h-9 px-3 text-xs font-medium normal-case text-[#E8E6E1] bg-white/[0.04] border border-white/15 hover:border-white/30 hover:bg-white/[0.08] rounded-lg";
        break;
    }

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variantStyles} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
