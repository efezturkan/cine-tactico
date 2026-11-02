"use client";

import React, { useState, useMemo } from "react";
import { CustomRoomSettings, GameBoard } from "@/core";
import { UserProfile } from "@/types/profile";
import { PRESET_BOARDS } from "@/data/boards";
import { isSupabaseConfigured } from "@/backend";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { Button } from "@/components/ui/Button";
import { Copy, Share2, Check, X, ChevronRight } from "lucide-react";

// Kriptografik Güvenli 6 Karakterli Kod Üreteci (Unambiguous: 0/O, 1/I hariç)
function generateSecureRoomCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(6);
    window.crypto.getRandomValues(array);
    let code = "CX-";
    for (let i = 0; i < 6; i++) {
      code += chars[array[i] % chars.length];
    }
    return code;
  }
  let code = "CX-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

interface CustomRoomModalProps {
  isOpen?: boolean;
  isPage?: boolean;
  onClose?: () => void;
  onCreateRoom: (settings: CustomRoomSettings, selectedBoard: GameBoard) => void;
  onJoinRoom?: (roomCode: string, settings: CustomRoomSettings, selectedBoard: GameBoard) => void;
  currentUser?: UserProfile;
}

export const CustomRoomModal: React.FC<CustomRoomModalProps> = ({
  isOpen = true,
  isPage = false,
  onClose,
  onCreateRoom,
  onJoinRoom,
  currentUser,
}) => {
  // 7C.2 İki seçenek: "Oda kur" ve "Koda katıl"
  const [subTab, setSubTab] = useState<"CREATE" | "JOIN">("CREATE");

  // Oda Kur state
  const [roomCode] = useState<string>(() => generateSecureRoomCode());
  const [selectedBoardId, setSelectedBoardId] = useState<string>(PRESET_BOARDS[0].id);
  const [showBoardPicker, setShowBoardPicker] = useState<boolean>(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Koda Katıl state
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [joinError, setJoinError] = useState<string | null>(null);

  if (!isOpen && !isPage) return null;

  const currentBoard = PRESET_BOARDS.find((b) => b.id === selectedBoardId) || PRESET_BOARDS[0];
  const displayTitle = currentBoard.title.includes(":")
    ? currentBoard.title.split(":")[0].trim()
    : currentBoard.title;
  const subTitle = currentBoard.title.includes(":")
    ? currentBoard.title.split(":")[1].trim()
    : "3×3 Taktik Kadraj";

  const handleStartCustomRoom = () => {
    audio.playSelect();
    haptic.medium();
    setIsWaitingForOpponent(true);
    const settings: CustomRoomSettings = {
      roomCode,
      roomName: "Özel Gösterim",
      roomType: "1V1_ROOM",
      isPublic: false,
      matchFormat: "BO1",
      shotClockSeconds: 12,
      themeId: selectedBoardId,
      category: currentBoard.title,
      allowCellStealing: false,
      allowPowerups: false,
    };
    onCreateRoom(settings, currentBoard);
  };

  const handleCopyCode = () => {
    audio.playSelect();
    haptic.light();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareInvite = () => {
    audio.playSelect();
    haptic.light();
    const url = typeof window !== "undefined" ? `${window.location.origin}?room=${roomCode}` : "";
    const shareText = `CineXOX Düellosu: ${roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: "CineXOX Özel Gösterim",
        text: shareText,
        url,
      }).catch(() => {
        handleCopyCode();
      });
    } else {
      handleCopyCode();
    }
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    let raw = joinCodeInput.trim().toUpperCase();
    if (!raw.startsWith("CX-") && raw.length === 6) {
      raw = `CX-${raw}`;
    }

    if (!/^CX-[A-Z0-9]{6}$/.test(raw)) {
      setJoinError("Bu kodla açık bir salon bulunamadı.");
      audio.playError();
      return;
    }

    setJoinError(null);
    audio.playSelect();
    haptic.medium();

    const settings: CustomRoomSettings = {
      roomCode: raw,
      roomName: "Özel Gösterim",
      roomType: "1V1_ROOM",
      isPublic: false,
      matchFormat: "BO1",
      shotClockSeconds: 12,
      themeId: PRESET_BOARDS[0].id,
      category: PRESET_BOARDS[0].title,
      allowCellStealing: false,
      allowPowerups: false,
    };

    if (onJoinRoom) {
      onJoinRoom(raw, settings, PRESET_BOARDS[0]);
    } else {
      onCreateRoom(settings, PRESET_BOARDS[0]);
    }
    if (onClose) onClose();
  };

  const content = (
    <div className="w-full max-w-md mx-auto flex flex-col select-none text-[#E8E6E1] p-4 sm:p-5">
      {/* 7C.1 Başlık: Serif 'Özel Gösterim', altında 'İki telefon, bir düello.' */}
      <div className="text-center pb-4 mb-4 border-b border-white/10">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#E8E6E1] tracking-wide">
          Özel Gösterim
        </h1>
        <p className="text-xs text-[#8A8F9A] mt-1 font-sans">
          İki telefon, bir düello.
        </p>
      </div>

      {/* 7C.2 İki Seçenek: 'Oda kur' ve 'Koda katıl' (Seçimde yükseklik zıplamaz) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            setSubTab("CREATE");
            setJoinError(null);
          }}
          className={`h-11 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all border ${
            subTab === "CREATE"
              ? "bg-[#181B22] border-[#D9A441] text-[#D9A441]"
              : "bg-transparent border-white/10 text-[#8A8F9A] hover:text-[#E8E6E1]"
          }`}
        >
          Oda kur
        </button>
        <button
          type="button"
          onClick={() => {
            audio.playSelect();
            setSubTab("JOIN");
            setJoinError(null);
          }}
          className={`h-11 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all border ${
            subTab === "JOIN"
              ? "bg-[#181B22] border-[#D9A441] text-[#D9A441]"
              : "bg-transparent border-white/10 text-[#8A8F9A] hover:text-[#E8E6E1]"
          }`}
        >
          Koda katıl
        </button>
      </div>

      {/* ========================================================
          7C.3 SEÇENEK A: ODA KUR
      ======================================================== */}
      {subTab === "CREATE" && (
        <div className="space-y-4 min-h-[300px] flex flex-col justify-between">
          {!isWaitingForOpponent ? (
            <>
              {/* Seçili Seans */}
              <div className="p-3.5 rounded-xl bg-[#14171D] border border-white/10 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <span className="text-xs font-bold text-[#E8E6E1] block truncate">
                    {displayTitle}
                  </span>
                  <span className="text-[11px] text-[#8A8F9A] truncate block mt-0.5">
                    {subTitle}
                  </span>
                </div>
                <Button
                  variant="inline"
                  onClick={() => setShowBoardPicker(true)}
                  className="shrink-0"
                >
                  Değiştir
                </Button>
              </div>

              {/* Oda Kodu & Kopyalama / Paylaşım */}
              <div className="p-4 rounded-xl bg-[#14171D] border border-white/10 flex flex-col items-center text-center">
                <span className="text-[10px] font-sans uppercase font-medium text-[#8A8F9A] tracking-wider mb-1">
                  Oda Kodu
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold tracking-widest text-[#D9A441] my-1">
                  {roomCode}
                </span>

                <div className="flex items-center gap-2 mt-3 w-full justify-center">
                  <Button
                    variant="inline"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#8EBB70]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Kopyalandı" : "Kopyala"}</span>
                  </Button>
                  <Button
                    variant="inline"
                    onClick={handleShareInvite}
                    className="flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Davet linkini paylaş</span>
                  </Button>
                </div>
              </div>

              {/* 7C.7 Alt Açıklama */}
              <p className="text-[11px] text-[#8A8F9A] text-center leading-relaxed px-2">
                Kodu arkadaşınla paylaş. İki telefon bağlanınca düello başlar. Süre 12 saniye.
              </p>

              {/* 7C.3 Ana Buton: ODAYI AÇ */}
              <Button
                variant="primary"
                fullWidth
                onClick={handleStartCustomRoom}
              >
                ODAYI AÇ
              </Button>
            </>
          ) : (
            /* Bekleme Durumu */
            <div className="p-6 rounded-xl bg-[#14171D] border border-white/10 flex flex-col items-center text-center space-y-4 my-auto">
              <span className="font-mono text-2xl font-bold tracking-widest text-[#D9A441]">
                {roomCode}
              </span>
              <p className="font-serif text-base text-[#E8E6E1]">
                Salon loş, rakip aranıyor…
              </p>
              <p className="text-xs text-[#8A8F9A] max-w-xs">
                Arkadaşının koda katılması bekleniyor.
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setIsWaitingForOpponent(false)}
              >
                Vazgeç
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          7C.4 SEÇENEK B: KODA KATIL
      ======================================================== */}
      {subTab === "JOIN" && (
        <form onSubmit={handleJoinByCode} className="space-y-4 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#14171D] border border-white/10">
              <label className="text-[10px] font-sans uppercase font-medium text-[#8A8F9A] tracking-wider block mb-2 text-center">
                Salon Kodu
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={9}
                  value={joinCodeInput}
                  onChange={(e) => {
                    let val = e.target.value.toUpperCase();
                    setJoinCodeInput(val);
                    if (joinError) setJoinError(null);
                  }}
                  placeholder="CX-XXXXXX"
                  className="w-full text-center font-mono text-2xl font-bold tracking-widest bg-[#0B0D12] border border-white/10 focus:border-[#D9A441] rounded-xl py-3 text-[#E8E6E1] placeholder:text-[#8A8F9A]/30 focus:outline-none transition-colors"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              {joinError && (
                <p className="text-xs text-[#E5484D] text-center mt-2.5 font-medium">
                  {joinError}
                </p>
              )}
            </div>

            <p className="text-[11px] text-[#8A8F9A] text-center leading-relaxed px-2">
              Arkadaşının paylaştığı 6 karakterli kodu gir. Süre 12 saniye.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!joinCodeInput.trim()}
          >
            KATIL
          </Button>
        </form>
      )}

      {/* Seans Değiştirme Alt Sheet'i */}
      {showBoardPicker && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBoardPicker(false);
          }}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm select-none"
        >
          <div className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-4 sm:p-5 flex flex-col max-h-[80dvh] shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h2 className="font-serif text-base font-bold text-[#E8E6E1]">
                Seans Seç
              </h2>
              <Button
                variant="icon"
                onClick={() => setShowBoardPicker(false)}
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-1 custom-scrollbar">
              {PRESET_BOARDS.map((b) => {
                const isSelected = b.id === selectedBoardId;
                const dTitle = b.title.includes(":") ? b.title.split(":")[0].trim() : b.title;
                const sTitle = b.title.includes(":") ? b.title.split(":")[1].trim() : "";

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      audio.playSelect();
                      setSelectedBoardId(b.id);
                      setShowBoardPicker(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-[#181B22] border-[#D9A441] text-[#E8E6E1]"
                        : "bg-[#14171D] border-white/10 text-[#8A8F9A] hover:text-[#E8E6E1] hover:border-white/20"
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <span className="font-sans font-bold text-xs text-[#E8E6E1] block truncate">
                        {dTitle}
                      </span>
                      {sTitle && (
                        <span className="text-[10px] text-[#8A8F9A] block truncate mt-0.5">
                          {sTitle}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <span className="text-[#D9A441] font-bold text-sm">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Sayfa modu (Alttan sekme çubuğunun üstünde normal akış)
  if (isPage) {
    return (
      <div className="min-h-screen bg-[#0B0D12] flex flex-col pt-4 pb-28">
        {content}
      </div>
    );
  }

  // Modal modu fallback (varsa)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md rounded-2xl bg-[#0B0D12] border border-white/10 shadow-2xl overflow-hidden relative">
        {onClose && (
          <Button
            variant="icon"
            onClick={onClose}
            className="absolute top-3 right-3 z-10"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {content}
      </div>
    </div>
  );
};
