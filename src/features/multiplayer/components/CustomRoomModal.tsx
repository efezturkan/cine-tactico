"use client";

import React, { useState } from "react";
import { CustomRoomSettings, GameBoard } from "@/core";
import { UserProfile } from "@/types/profile";
import { PRESET_BOARDS } from "@/data/boards";
import { isSupabaseConfigured, joinRealtimeRoom } from "@/backend";
import { audio } from "@/utils/audio";
import {
  Trophy,
  Swords,
  Film,
  Copy,
  Check,
  X,
  Lock,
  Globe,
} from "lucide-react";

// Kriptografik Güvenli 6 Karakterli Kod Üreteci (Unambiguous Alfanümerik: 0/O, 1/I hariç)
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
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (settings: CustomRoomSettings, selectedBoard: GameBoard) => void;
  onJoinRoom?: (roomCode: string, settings: CustomRoomSettings, selectedBoard: GameBoard) => void;
  currentUser?: UserProfile;
}

export const CustomRoomModal: React.FC<CustomRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
  onJoinRoom,
  currentUser,
}) => {
  // 1. Ana Sekme: 1v1 Özel Oda vs 8 Kişilik Turnuva
  const [mainTab, setMainTab] = useState<"1V1_ROOM" | "TOURNAMENT">("1V1_ROOM");

  // 2. Alt Sekmeler: Kur vs Katıl
  const [roomSubTab, setRoomSubTab] = useState<"CREATE" | "JOIN">("CREATE");
  const [tournamentSubTab, setTournamentSubTab] = useState<"JOIN" | "CREATE">("JOIN");

  // 3. 1v1 Oda Kurma State'leri (Kriptografik CX- Kod)
  const [roomCode] = useState<string>(() => generateSecureRoomCode());
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [matchFormat, setMatchFormat] = useState<"BO1" | "BO3">("BO1");
  const [shotClock, setShotClock] = useState<10 | 12 | 20>(12);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(PRESET_BOARDS[0].id);
  const [allowSteal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 4. Odaya Katılma Input State'i & Rate Limiter
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number[]>([]);
  const [rateLimitSeconds, setRateLimitSeconds] = useState<number>(0);

  // 5. Turnuva Kurma State'leri
  const [tourneyName, setTourneyName] = useState<string>("Sinefil Şampiyonası");
  const [tourneyEntryFee, setTourneyEntryFee] = useState<"FREE" | "REELS">("FREE");
  const [joinedTourneyId, setJoinedTourneyId] = useState<string | null>(null);

  React.useEffect(() => {
    if (rateLimitSeconds <= 0) return;
    const interval = setInterval(() => {
      setRateLimitSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitSeconds]);

  if (!isOpen) return null;

  const currentBoard = PRESET_BOARDS.find((b) => b.id === selectedBoardId) || PRESET_BOARDS[0];

  const handleStartCustomRoom = (overrideSettings?: Partial<CustomRoomSettings>) => {
    audio.playPowerup();
    const settings: CustomRoomSettings = {
      roomCode: overrideSettings?.roomCode || roomCode,
      roomName: isPublic ? "🌐 Herkese Açık Düello Lobisi" : "🔒 Özel Arkadaş Düellosu",
      roomType: "1V1_ROOM",
      isPublic,
      matchFormat,
      shotClockSeconds: shotClock,
      themeId: selectedBoardId,
      category: currentBoard.title,
      allowCellStealing: allowSteal,
      allowPowerups: false,
      ...overrideSettings,
    };
    onCreateRoom(settings, currentBoard);
    onClose();
  };

  const handleCopyInvite = () => {
    audio.playSelect();
    const url = typeof window !== "undefined" ? `${window.location.origin}?room=${roomCode}` : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `🎬 CINEXOX 1v1 DÜELLO DAVETİ! 🏆\nOda Kodu: #${roomCode}\nTema: ${currentBoard.title}\nFormat: ${
          matchFormat === "BO1" ? "Tek Maç" : "3 Maçlık Seri (BO3)"
        }\nSüre: ${shotClock}s\n\nHemen Odaya Katıl: ${url}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleJoinByCode = (codeToJoin: string) => {
    const now = Date.now();
    const recentFailures = failedAttempts.filter((t) => now - t < 60_000);

    if (rateLimitSeconds > 0 || recentFailures.length >= 5) {
      if (rateLimitSeconds <= 0) setRateLimitSeconds(60);
      setJoinError(
        `Güvenlik: Çok fazla başarısız deneme! Lütfen ${
          rateLimitSeconds > 0 ? rateLimitSeconds : 60
        } saniye bekleyin.`
      );
      audio.playError();
      return;
    }

    const cleanCode = codeToJoin.trim().toUpperCase();
    const isValidFormat = /^([A-Z0-9]{4,8}|CX-[A-Z0-9]{6})$/.test(cleanCode);

    if (!isValidFormat) {
      const updated = [...recentFailures, now];
      setFailedAttempts(updated);
      audio.playError();
      if (updated.length >= 5) {
        setRateLimitSeconds(60);
        setJoinError("5 kez geçersiz kod girildi. 60 saniye bekleyin.");
      } else {
        setJoinError(
          `Geçersiz oda kodu formatı! (Örn: CX-7K9M2P) [Kalan deneme: ${5 - updated.length}]`
        );
      }
      return;
    }

    audio.playPowerup();

    if (isSupabaseConfigured && currentUser) {
      joinRealtimeRoom(cleanCode, currentUser).then((res) => {
        if (res.success && res.room) {
          if (onJoinRoom) {
            onJoinRoom(cleanCode, res.room.settings, res.room.board_data);
          } else {
            onCreateRoom(res.room.settings, res.room.board_data);
          }
          onClose();
        } else {
          const settings: CustomRoomSettings = {
            roomCode: cleanCode,
            roomName: "Özel Odaya Katılım",
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
            onJoinRoom(cleanCode, settings, PRESET_BOARDS[0]);
          } else {
            onCreateRoom(settings, PRESET_BOARDS[0]);
          }
          onClose();
        }
      });
      return;
    }

    const settings: CustomRoomSettings = {
      roomCode: cleanCode,
      roomName: "Özel Odaya Katılım",
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
      onJoinRoom(cleanCode, settings, PRESET_BOARDS[0]);
    } else {
      onCreateRoom(settings, PRESET_BOARDS[0]);
    }
    onClose();
  };

  const handleCreateTournament = () => {
    audio.playPowerup();
    const settings: CustomRoomSettings = {
      roomCode: "TRNY-" + Math.floor(1000 + Math.random() * 9000),
      roomName: tourneyName || "8 Kişilik Eleme Şampiyonası",
      roomType: "TOURNAMENT",
      isPublic: true,
      matchFormat: "TOURNAMENT",
      shotClockSeconds: 12,
      themeId: selectedBoardId,
      category: currentBoard.title,
      allowCellStealing: false,
      allowPowerups: false,
      entryFee: {
        type: tourneyEntryFee,
        amount: tourneyEntryFee === "REELS" ? 200 : 0,
      },
      prizePool: "1.500 Makara + Şampiyonluk Rozeti 🏆",
    };
    onCreateRoom(settings, currentBoard);
    onClose();
  };

  const ACTIVE_TOURNAMENTS = [
    {
      id: "trny_1",
      title: "Haftalık Cinefil Kupası",
      theme: "Klasik & Kült Sinema",
      players: "6/8 Dolu",
      slotsLeft: "Son 2 Koltuk!",
      entryFee: "ÜCRETSİZ",
      prize: "2.000 🎞️ + Altın Kupa",
      boardIdx: 0,
    },
    {
      id: "trny_2",
      title: "Süper Kahramanlar Şampiyonası",
      theme: "⚡ DC vs MARVEL Düellosu",
      players: "7/8 Dolu",
      slotsLeft: "Son 1 Koltuk!",
      entryFee: "100 🎞️",
      prize: "3.500 🎞️ + Şampiyonluk Rozeti",
      boardIdx: 3,
    },
    {
      id: "trny_3",
      title: "Midnight Cult Challenge",
      theme: "🩸 90'lar & Neo-Noir",
      players: "3/8 Dolu",
      slotsLeft: "Kayıt Açık",
      entryFee: "250 🎞️",
      prize: "1.000 🎞️ + Altın Rozet",
      boardIdx: 5,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md rounded-3xl p-4 sm:p-5 flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-[#F1EEE7] tactile-card"
        style={{
          background: "linear-gradient(180deg, #1E222B 0%, #14171D 100%)",
          borderColor: "rgba(255,255,255,0.14)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 6px 0 #08090C, inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. ÜST BAŞLIK */}
        <div className="text-center pb-3 border-b border-white/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/35 text-[#F5A623] text-[10px] font-black uppercase tracking-wider mb-1 font-mono">
            <Trophy className="w-3.5 h-3.5" />
            <span>ÖZEL ODA & TURNUVA</span>
          </div>
          <h2 className="text-lg font-black text-[#F1EEE7]">İki Telefon, Bir Düello</h2>
          <p className="text-[11px] text-[#A5A8B0]">
            Kod paylaş. Rakip bağlanınca maç başlar. Saat 12 saniye.
          </p>
        </div>

        {/* Ana Sekme: 1v1 Özel Oda vs 8 Kişilik Turnuva */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setMainTab("1V1_ROOM");
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              mainTab === "1V1_ROOM"
                ? "tactile-btn-amber text-[#0F1115]"
                : "tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7]"
            }`}
          >
            ⚔️ 1v1 Özel Oda
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setMainTab("TOURNAMENT");
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              mainTab === "TOURNAMENT"
                ? "tactile-btn-cyan text-[#0F1115]"
                : "tactile-btn-surface text-[#A5A8B0] hover:text-[#F1EEE7]"
            }`}
          >
            🏆 8 Kişilik Turnuva
          </button>
        </div>

        {/* ========================================================
            SEKME 1: 1v1 ÖZEL ODA (DOSTLUK MAÇI)
        ======================================================== */}
        {mainTab === "1V1_ROOM" && (
          <div>
            {/* Alt Sekme: Oda Kur vs Odaya Katıl */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setRoomSubTab("CREATE");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                  roomSubTab === "CREATE"
                    ? "bg-[#252932] border-[#F5A623] text-[#F5A623] shadow-sm"
                    : "bg-[#181B22] border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7]"
                }`}
              >
                ➕ Oda Kur (Host)
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setRoomSubTab("JOIN");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                  roomSubTab === "JOIN"
                    ? "bg-[#252932] border-[#00D5E8] text-[#00D5E8] shadow-sm"
                    : "bg-[#181B22] border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7]"
                }`}
              >
                🔍 Odaya Katıl
              </button>
            </div>

            {/* A. ODA KURMA PANELİ */}
            {roomSubTab === "CREATE" && (
              <div className="space-y-3">
                {/* 1. GİZLİLİK SEÇİMİ */}
                <div className="p-2.5 rounded-2xl bg-[#181B22] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-[#F1EEE7] flex items-center gap-1.5">
                      {isPublic ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-[#8EBB70]" />
                          <span className="text-[#8EBB70]">Herkese Açık Lobi (Public)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#F5A623]" />
                          <span className="text-[#F5A623]">Gizli & Özel Oda (Private)</span>
                        </>
                      )}
                    </span>
                    <p className="text-[10px] text-[#A5A8B0] mt-0.5">
                      {isPublic
                        ? "Lobi listesinde görünür, dileyen oyuncu katılabilir."
                        : "Sadece oda kodunu verdiğin arkadaşın katılabilir."}
                    </p>
                  </div>
                  <div className="flex bg-[#0F1115] p-0.5 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        !isPublic ? "bg-[#F5A623] text-[#0F1115] shadow" : "text-[#A5A8B0]"
                      }`}
                    >
                      Gizli
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                        isPublic ? "bg-[#8EBB70] text-[#0F1115] shadow" : "text-[#A5A8B0]"
                      }`}
                    >
                      Açık
                    </button>
                  </div>
                </div>

                {/* 2. MASA SEÇİMİ (5 STRATEJİK MASA) */}
                <div>
                  <label className="text-xs font-black text-[#F1EEE7] flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-[#F5A623]" />
                      Masa & Tematik Çarpışma
                    </span>
                    <span className="text-[10px] text-[#A5A8B0] font-bold">5 Masa</span>
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                    {PRESET_BOARDS.map((b) => {
                      const isDcMarvel = b.id === "board_dc_marvel";
                      const isSelected = selectedBoardId === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            audio.playSelect();
                            setSelectedBoardId(b.id);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? "bg-[#252932] border-[#F5A623] text-[#F1EEE7] shadow-[0_3px_0_#090A0D] ring-1 ring-[#F5A623]"
                              : "bg-[#181B22] border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7]"
                          }`}
                        >
                          <div className="flex-1 pr-2 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-[#F1EEE7] truncate">{b.title}</span>
                              {isDcMarvel && (
                                <span className="text-[9px] font-black px-1 py-0.2 rounded bg-[#FF334B]/20 text-[#FF334B] border border-[#FF334B]/40">
                                  🔥
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-[#A5A8B0] truncate mt-0.5">
                              {b.id === "board_master_1"
                                ? "Nolan, Tarantino, Scorsese x DiCaprio, Oscar, 2010s+"
                                : isDcMarvel
                                ? "Christian Bale, James Gunn, Ryan Reynolds x DC, Marvel"
                                : b.id === "board_90s_cult"
                                ? "Brad Pitt, Tarantino, Fincher x Suç, 90'lar, 8.0+ Puan"
                                : b.id === "board_dune_scifi"
                                ? "Denis Villeneuve, Nolan, Chalamet x Sci-Fi, Oscar"
                                : "Brad Pitt, Murphy, De Niro x Suç, 8.0+ Puan, 2010s+"}
                            </p>
                          </div>
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#0F1115] text-[#F5A623] border border-white/10 font-mono">
                            {b.difficulty}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. MAÇ FORMATI (BO1 vs BO3) */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "BO1", label: "Tek Maç (BO1)", sub: "Hızlı Düello" },
                    { val: "BO3", label: "3 Maçlık Seri (BO3)", sub: "Prestij Rövanşı" },
                  ].map((f) => (
                    <button
                      key={f.val}
                      type="button"
                      onClick={() => {
                        audio.playSelect();
                        setMatchFormat(f.val as any);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        matchFormat === f.val
                          ? "bg-[#252932] border-[#F5A623] text-[#F1EEE7] shadow-md ring-1 ring-[#F5A623]"
                          : "bg-[#181B22] border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7]"
                      }`}
                    >
                      <div className="text-xs font-black">{f.label}</div>
                      <div className="text-[9px] text-[#A5A8B0] font-bold mt-0.5">{f.sub}</div>
                    </button>
                  ))}
                </div>

                {/* 4. HAMLE SÜRESİ (12S BLITZ) */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { val: 12, label: "12 Saniye Blitz", desc: "Standart Rekabetçi Maç Saati" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        audio.playSelect();
                        setShotClock(item.val as any);
                      }}
                      className="p-2 rounded-xl border bg-[#252932] border-[#00D5E8] text-[#F1EEE7] text-center shadow-sm"
                    >
                      <div className="text-xs font-black text-[#00D5E8] font-mono">{item.label}</div>
                      <div className="text-[9px] text-[#A5A8B0] font-bold mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Oda Kodu & Başlat */}
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0F1115] border border-white/15">
                    <div className="font-mono text-xs font-black text-[#00D5E8]">
                      Oda Kodu: #{roomCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="px-3 py-1 rounded-lg tactile-btn-surface text-[#F1EEE7] font-bold text-[10px] flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-[#8EBB70]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? "Kopyalandı!" : "Davet Linki"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCustomRoom()}
                    className="w-full py-3.5 rounded-2xl tactile-btn-amber font-black text-sm flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4 fill-[#0F1115]" />
                    <span>{isPublic ? "Herkese Açık Lobi Oluştur" : "Özel Odayı Başlat"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* B. ODAYA KATIL PANELİ */}
            {roomSubTab === "JOIN" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#181B22] border border-white/10">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#A5A8B0] block mb-1.5 font-mono">
                    Özel Oda Kodunu Gir
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Örn: CX-7K9M2P"
                      value={joinCodeInput}
                      disabled={rateLimitSeconds > 0}
                      onChange={(e) => {
                        setJoinCodeInput(e.target.value.toUpperCase());
                        setJoinError(null);
                      }}
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[#0F1115] border border-white/15 text-[#F1EEE7] font-mono text-xs font-bold uppercase placeholder:text-[#A5A8B0]/40 focus:outline-none focus:border-[#00D5E8] disabled:opacity-50"
                    />
                    <button
                      type="button"
                      disabled={rateLimitSeconds > 0}
                      onClick={() => handleJoinByCode(joinCodeInput)}
                      className="px-4 py-2.5 rounded-xl tactile-btn-cyan text-xs font-black disabled:opacity-50"
                    >
                      {rateLimitSeconds > 0 ? `${rateLimitSeconds}s` : "Katıl"}
                    </button>
                  </div>
                  {joinError && <p className="text-[10px] text-[#FF334B] mt-1.5 font-bold">{joinError}</p>}
                </div>

                <p className="text-[11px] text-[#A5A8B0] px-1">
                  Arkadaşının paylaştığı <span className="font-mono text-[#F5A623]">CX-XXXXXX</span> oda kodunu girerek doğrudan düello masasına bağlanabilirsin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SEKME 2: 8 KİŞİLİK TURNUVA ARENASI (ŞAMPİYONA)
        ======================================================== */}
        {mainTab === "TOURNAMENT" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setTournamentSubTab("JOIN");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                  tournamentSubTab === "JOIN"
                    ? "bg-[#252932] border-[#FF334B] text-[#FF334B] shadow-sm"
                    : "bg-[#181B22] border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7]"
                }`}
              >
                📋 Canlı Turnuvalar
              </button>
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setTournamentSubTab("CREATE");
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${
                  tournamentSubTab === "CREATE"
                    ? "bg-[#252932] border-[#F5A623] text-[#F5A623] shadow-sm"
                    : "bg-[#181B22] border-white/10 text-[#A5A8B0] hover:text-[#F1EEE7]"
                }`}
              >
                👑 Turnuva Kur
              </button>
            </div>

            {tournamentSubTab === "JOIN" && (
              <div className="space-y-2.5">
                {ACTIVE_TOURNAMENTS.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-[#181B22] border border-white/12 shadow-[0_4px_0_#090A0D] relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#F5A623]" />
                        <h4 className="text-xs font-black text-[#F1EEE7]">{t.title}</h4>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#FF334B]/15 text-[#FF334B] border border-[#FF334B]/30">
                        {t.slotsLeft}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#A5A8B0] font-bold mt-1">
                      Tema: <span className="text-[#F5A623]">{t.theme}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-[10px]">
                      <div>
                        <span className="text-[#A5A8B0] block font-bold">ÖDÜL HAVUZU</span>
                        <span className="text-[#F5A623] font-black font-mono">{t.prize}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#A5A8B0] block font-bold">DOLULUK</span>
                        <span className="text-[#8EBB70] font-black font-mono">{t.players}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        audio.playPowerup();
                        setJoinedTourneyId(t.id);
                        setSelectedBoardId(PRESET_BOARDS[t.boardIdx].id);
                        setTimeout(() => {
                          const settings: CustomRoomSettings = {
                            roomCode: "TRNY-" + Math.floor(1000 + Math.random() * 9000),
                            roomName: t.title,
                            roomType: "TOURNAMENT",
                            isPublic: true,
                            matchFormat: "TOURNAMENT",
                            shotClockSeconds: 12,
                            themeId: PRESET_BOARDS[t.boardIdx].id,
                            category: t.theme,
                            allowCellStealing: false,
                            allowPowerups: false,
                            prizePool: t.prize,
                          };
                          onCreateRoom(settings, PRESET_BOARDS[t.boardIdx]);
                          onClose();
                        }, 400);
                      }}
                      className="w-full mt-2.5 py-2.5 rounded-xl tactile-btn-amber font-black text-xs flex items-center justify-center gap-1.5"
                    >
                      <span>
                        {joinedTourneyId === t.id ? "Turnuvaya Kaydedildi! ✓" : `Kayıt Ol (${t.entryFee})`}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tournamentSubTab === "CREATE" && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-[#181B22] border border-white/10 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#A5A8B0] block font-mono">
                    Turnuva Adı
                  </label>
                  <input
                    type="text"
                    value={tourneyName}
                    onChange={(e) => setTourneyName(e.target.value)}
                    placeholder="Örn: Hafta Sonu Sinefil Kupası"
                    className="w-full px-3 py-2 rounded-xl bg-[#0F1115] border border-white/15 text-[#F1EEE7] text-xs font-bold focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-[#181B22] border border-white/10">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#A5A8B0] block mb-1.5 font-mono">
                    Katılım Ücreti
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { val: "FREE", label: "Ücretsiz", desc: "Açık Katılım" },
                      { val: "REELS", label: "200 🎞️", desc: "Makara Giriş" },
                    ].map((f) => (
                      <button
                        key={f.val}
                        type="button"
                        onClick={() => setTourneyEntryFee(f.val as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          tourneyEntryFee === f.val
                            ? "bg-[#252932] border-[#F5A623] text-[#F1EEE7] shadow"
                            : "bg-[#0F1115] border-white/10 text-[#A5A8B0]"
                        }`}
                      >
                        <div className="text-xs font-black">{f.label}</div>
                        <div className="text-[9px] text-[#A5A8B0] mt-0.5">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/30 text-[10px] text-[#F1EEE7] flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#F5A623] font-black block">8 Kişilik Bracket Eleme:</strong>
                    Çeyrek Final &rarr; Yarı Final &rarr; Büyük Final formatında oynanır. Şampiyon 1.500 Makara ve altın rozet kazanır.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateTournament}
                  className="w-full py-3.5 rounded-2xl tactile-btn-amber font-black text-sm flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 fill-[#0F1115]" />
                  <span>Turnuvayı Oluştur & Kayıtları Aç</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
