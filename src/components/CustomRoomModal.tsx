"use client";

import React, { useState } from "react";
import { CustomRoomSettings, GameBoard } from "@/types/game";
import { PRESET_BOARDS } from "@/data/boards";
import { audio } from "@/utils/audio";
import {
  Trophy,
  Swords,
  Clock,
  Film,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  X,
  Users,
  Zap,
  Layers,
  Crown,
  Lock,
  Globe,
  PlusCircle,
  Search,
  ChevronRight,
  Flame,
  Award,
  Wallet,
} from "lucide-react";

interface CustomRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (settings: CustomRoomSettings, selectedBoard: GameBoard) => void;
}

export const CustomRoomModal: React.FC<CustomRoomModalProps> = ({
  isOpen,
  onClose,
  onCreateRoom,
}) => {
  // 1. Ana Sekme: 1v1 Özel Oda vs 8 Kişilik Turnuva
  const [mainTab, setMainTab] = useState<"1V1_ROOM" | "TOURNAMENT">("1V1_ROOM");

  // 2. Alt Sekmeler: Kur vs Katıl
  const [roomSubTab, setRoomSubTab] = useState<"CREATE" | "JOIN">("CREATE");
  const [tournamentSubTab, setTournamentSubTab] = useState<"JOIN" | "CREATE">("JOIN");

  // 3. 1v1 Oda Kurma State'leri
  const [roomCode] = useState(() => "SINE-" + Math.floor(1000 + Math.random() * 9000));
  const [isPublic, setIsPublic] = useState<boolean>(false); // 🔒 Özel vs 🌐 Herkese Açık
  const [matchFormat, setMatchFormat] = useState<"BO1" | "BO3">("BO1");
  const [shotClock, setShotClock] = useState<10 | 20 | 30>(30);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(PRESET_BOARDS[0].id);
  const [allowSteal, setAllowSteal] = useState<boolean>(false);
  const [allowPowerups, setAllowPowerups] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 4. Odaya Katılma Input State'i
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [joinError, setJoinError] = useState<string | null>(null);

  // 5. Turnuva Kurma State'leri
  const [tourneyName, setTourneyName] = useState<string>("Sinefil Şampiyonası");
  const [tourneyEntryFee, setTourneyEntryFee] = useState<"FREE" | "REELS" | "DIAMONDS">("FREE");
  const [joinedTourneyId, setJoinedTourneyId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBoard = PRESET_BOARDS.find(b => b.id === selectedBoardId) || PRESET_BOARDS[0];

  // 1v1 Odayı Başlat
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
      allowPowerups,
      ...overrideSettings,
    };
    onCreateRoom(settings, currentBoard);
    onClose();
  };

  // Davet Linkini Kopyala
  const handleCopyInvite = () => {
    audio.playSelect();
    const url = typeof window !== "undefined" ? `${window.location.origin}?room=${roomCode}` : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `🎬 CINEXOX 1v1 DÜELLO DAVETİ! 🏆\nOda Kodu: #${roomCode}\nTema: ${currentBoard.title}\nFormat: ${
          matchFormat === "BO1" ? "Tek Maç" : "3 Maçlık Seri (BO3)"
        }\nSüre: ${shotClock}s | Kare Çalma: ${allowSteal ? "AÇIK 🔥" : "KAPALI"}\n\nHemen Odaya Katıl: ${url}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Kod ile Odaya Katıl
  const handleJoinByCode = (codeToJoin: string) => {
    const cleanCode = codeToJoin.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      setJoinError("Lütfen geçerli bir Oda Kodu gir (Örn: SINE-1234)");
      return;
    }
    audio.playPowerup();
    const settings: CustomRoomSettings = {
      roomCode: cleanCode,
      roomName: "Özel Odaya Katılım",
      roomType: "1V1_ROOM",
      isPublic: false,
      matchFormat: "BO1",
      shotClockSeconds: 20,
      themeId: PRESET_BOARDS[0].id,
      category: PRESET_BOARDS[0].title,
      allowCellStealing: true,
      allowPowerups: true,
    };
    onCreateRoom(settings, PRESET_BOARDS[0]);
    onClose();
  };

  // Turnuva Başlat
  const handleCreateTournament = () => {
    audio.playPowerup();
    const settings: CustomRoomSettings = {
      roomCode: "TRNY-" + Math.floor(1000 + Math.random() * 9000),
      roomName: tourneyName || "8 Kişilik Eleme Şampiyonası",
      roomType: "TOURNAMENT",
      isPublic: true,
      matchFormat: "TOURNAMENT",
      shotClockSeconds: 20,
      themeId: selectedBoardId,
      category: currentBoard.title,
      allowCellStealing: allowSteal,
      allowPowerups: true,
      entryFee: {
        type: tourneyEntryFee,
        amount: tourneyEntryFee === "REELS" ? 200 : tourneyEntryFee === "DIAMONDS" ? 20 : 0,
      },
      prizePool: "1.500 Makara + Şampiyonluk Rozeti 🏆",
    };
    onCreateRoom(settings, currentBoard);
    onClose();
  };

  // Örnek Canlı Açık Odalar (Public Lobiler)
  const PUBLIC_ROOMS = [
    {
      code: "SINE-4421",
      host: "Kadir (Level 7)",
      boardTitle: "⚡ DC vs MARVEL Düellosu",
      boardIdx: 3,
      format: "Tek Maç",
      time: "20s",
      players: "1/2 Bekliyor",
      badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    },
    {
      code: "SINE-8910",
      host: "Selin (Level 5)",
      boardTitle: "🩸 90'lar Kült: Fight Club",
      boardIdx: 5,
      format: "BO1 Düello",
      time: "10s Blitz",
      players: "1/2 Bekliyor",
      badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      code: "SINE-1299",
      host: "Emre (Level 9)",
      boardTitle: "🎬 Auteur Savaşları: Nolan",
      boardIdx: 0,
      format: "BO3 Seri",
      time: "20s",
      players: "1/2 Bekliyor",
      badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
  ];

  // Canlı Turnuva Listesi
  const ACTIVE_TOURNAMENTS = [
    {
      id: "trny_1",
      title: "Haftalık Cinefil Kupası",
      theme: "Klasik & Kült Sinema",
      players: "6/8 Dolu",
      slotsLeft: "Son 2 Koltuk!",
      entryFee: "ÜCRETSİZ",
      prize: "2.000 🎞️ + Altın Kupa",
      badge: "CANLI",
      boardIdx: 0,
    },
    {
      id: "trny_2",
      title: "Süper Kahramanlar Şampiyonası",
      theme: "⚡ DC vs MARVEL Düellosu",
      players: "7/8 Dolu",
      slotsLeft: "Son 1 Koltuk!",
      entryFee: "100 🎞️",
      prize: "3.500 🎞️ + 25 💎",
      badge: "DOLUYOR",
      boardIdx: 3,
    },
    {
      id: "trny_3",
      title: "Midnight Cult Challenge",
      theme: "🩸 90'lar & Neo-Noir",
      players: "3/8 Dolu",
      slotsLeft: "Kayıt Açık",
      entryFee: "15 💎",
      prize: "50 💎 + Elmas Taç",
      badge: "KAYITTA",
      boardIdx: 5,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#0a1122] border border-sky-500/25 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-white">
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. ÜST BAŞLIK (Clash Royale Style Arena Header) */}
        <div className="text-center pb-2.5 border-b border-sky-500/15">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131f38] border border-amber-400/30 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>ARENA & TURNUVA MERKEZİ</span>
          </div>
          <h2 className="text-lg font-black text-white">Özel Oyun & Şampiyona</h2>
          <p className="text-[11px] text-zinc-400">
            Arkadaşınla 1v1 kapış veya 8 kişilik eleme turnuvasına katıl.
          </p>
        </div>

        {/* 2. ANA SEKMELER: 1v1 ÖZEL ODA vs 8 KİŞİLİK TURNUVA (Clash Royale Tarzı Net Ayrım) */}
        <div className="grid grid-cols-2 gap-2 my-3 p-1 rounded-2xl bg-[#070b16] border border-sky-500/15">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setMainTab("1V1_ROOM");
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
              mainTab === "1V1_ROOM"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>1v1 Özel Oda</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setMainTab("TOURNAMENT");
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black transition-all ${
              mainTab === "TOURNAMENT"
                ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Turnuva (8 Kişi)</span>
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                  roomSubTab === "CREATE"
                    ? "bg-[#111e3b] border-amber-400 text-amber-300 shadow-sm"
                    : "bg-[#0b101f] border-zinc-800 text-zinc-400 hover:text-white"
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                  roomSubTab === "JOIN"
                    ? "bg-[#111e3b] border-cyan-400 text-cyan-300 shadow-sm"
                    : "bg-[#0b101f] border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                🔍 Odaya Katıl & Lobiler
              </button>
            </div>

            {/* A. ODA KURMA PANELİ */}
            {roomSubTab === "CREATE" && (
              <div className="space-y-3">
                {/* 1. GİZLİLİK SEÇİMİ: ÖZEL vs HERKESE AÇIK (PUBLIC / PRIVATE) */}
                <div className="p-2.5 rounded-2xl bg-[#0b101f] border border-sky-500/15 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      {isPublic ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Herkese Açık Lobi (Public)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400">Gizli & Özel Oda (Private)</span>
                        </>
                      )}
                    </span>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      {isPublic
                        ? "Lobi listesinde görünür, dileyen oyuncu katılabilir."
                        : "Sadece oda kodunu verdiğin arkadaşın katılabilir."}
                    </p>
                  </div>
                  <div className="flex bg-[#121a30] p-0.5 rounded-xl border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                        !isPublic ? "bg-amber-400 text-black shadow" : "text-zinc-400"
                      }`}
                    >
                      Gizli
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                        isPublic ? "bg-emerald-500 text-white shadow" : "text-zinc-400"
                      }`}
                    >
                      Açık
                    </button>
                  </div>
                </div>

                {/* 2. MASA SEÇİMİ (5 STRATEJİK MASA) */}
                <div>
                  <label className="text-xs font-black text-zinc-300 flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                      Masa & Tematik Çarpışma
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">5 Masa</span>
                  </label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
                    {PRESET_BOARDS.map(b => {
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
                          className={`w-full p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? isDcMarvel
                                ? "bg-gradient-to-r from-red-950/60 via-[#10182b] to-blue-950/60 border-rose-500 text-white shadow-md ring-1 ring-rose-500"
                                : "bg-[#111e3b] border-amber-400 text-white shadow-md ring-1 ring-amber-400"
                              : "bg-[#10182b] border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="flex-1 pr-2 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-zinc-200 truncate">{b.title}</span>
                              {isDcMarvel && (
                                <span className="text-[9px] font-black px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                  🔥
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-500 truncate mt-0.5">
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
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-900 text-amber-400 border border-zinc-800">
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
                  ].map(f => (
                    <button
                      key={f.val}
                      type="button"
                      onClick={() => {
                        audio.playSelect();
                        setMatchFormat(f.val as any);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        matchFormat === f.val
                          ? "bg-[#111e3b] border-amber-400 text-white shadow-md ring-1 ring-amber-400"
                          : "bg-[#10182b] border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-black">{f.label}</div>
                      <div className="text-[9px] text-zinc-500 font-bold mt-0.5">{f.sub}</div>
                    </button>
                  ))}
                </div>

                {/* 4. HAMLE SÜRESİ (CHESS BLITZ SAATİ) */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 10, label: "10s Blitz", desc: "Hızlı" },
                    { val: 20, label: "20s Standart", desc: "Dengeli" },
                    { val: 30, label: "30s Taktik", desc: "Ağır" },
                  ].map(item => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        audio.playSelect();
                        setShotClock(item.val as any);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        shotClock === item.val
                          ? "bg-[#111e3b] border-cyan-400 text-white shadow-md ring-1 ring-cyan-400"
                          : "bg-[#10182b] border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <div className="text-xs font-black">{item.label}</div>
                      <div className="text-[9px] text-zinc-500 font-bold mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>

                {/* 5. TAKTİK TOGGLE'LAR (Kare Çalma Kuralı) */}
                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => setAllowSteal(!allowSteal)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs font-black transition-all ${
                      allowSteal
                        ? "bg-[#111e3b] border-amber-400 text-white"
                        : "bg-[#0b101f] border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <div>
                      <span>Kare Çalma (IMDb Steal)</span>
                      <p className="text-[10px] text-zinc-500 font-normal">Daha yüksek IMDb puanlı filmle rakip karesini devralma</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {allowSteal ? "AÇIK 🔥" : "KAPALI"}
                    </span>
                  </button>
                </div>

                {/* Oda Kodu & Başlat */}
                <div className="pt-2 border-t border-sky-500/10 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#121c33] border border-sky-500/20">
                    <div className="font-mono text-xs font-black text-cyan-400">
                      Oda Kodu: #{roomCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyInvite}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-[10px] flex items-center gap-1"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? "Kopyalandı!" : "Davet Linki"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartCustomRoom()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                  >
                    <Swords className="w-4 h-4 fill-black" />
                    <span>{isPublic ? "Herkese Açık Lobi Oluştur" : "Özel Odayı Başlat"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* B. ODAYA KATIL & CANLI AÇIK LOBİLER */}
            {roomSubTab === "JOIN" && (
              <div className="space-y-3">
                {/* Kod ile Doğrudan Katıl (No ugly browser prompts!) */}
                <div className="p-3 rounded-2xl bg-[#0b101f] border border-sky-500/20">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Özel Oda Kodunu Gir
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Örn: SINE-4421"
                      value={joinCodeInput}
                      onChange={e => {
                        setJoinCodeInput(e.target.value.toUpperCase());
                        setJoinError(null);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#121a30] border border-zinc-700 text-white font-mono text-xs font-bold uppercase placeholder:text-zinc-600 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleJoinByCode(joinCodeInput)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition-transform active:scale-95"
                    >
                      Katıl
                    </button>
                  </div>
                  {joinError && <p className="text-[10px] text-rose-400 mt-1 font-bold">{joinError}</p>}
                </div>

                {/* Canlı Açık Lobiler (Public Lobbies) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Canlı Bekleyen Lobiler</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">Gerçek Zamanlı</span>
                  </div>

                  <div className="space-y-2">
                    {PUBLIC_ROOMS.map(r => (
                      <div
                        key={r.code}
                        className="p-2.5 rounded-2xl bg-[#10182b] border border-zinc-800 hover:border-sky-500/40 flex items-center justify-between transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-white">{r.host}</span>
                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${r.badgeColor}`}>
                              {r.players}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{r.boardTitle}</p>
                          <div className="text-[9px] text-zinc-500 font-bold mt-0.5">
                            Format: {r.format} · Süre: {r.time}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBoardId(PRESET_BOARDS[r.boardIdx].id);
                            handleStartCustomRoom({
                              roomCode: r.code,
                              roomName: `${r.host} Düellosu`,
                              themeId: PRESET_BOARDS[r.boardIdx].id,
                              category: PRESET_BOARDS[r.boardIdx].title,
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-black font-black text-xs shadow-md active:scale-95 transition-all"
                        >
                          Katıl &rarr;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            SEKME 2: 8 KİŞİLİK TURNUVA ARENASI (ŞAMPİYONA)
        ======================================================== */}
        {mainTab === "TOURNAMENT" && (
          <div>
            {/* Alt Sekme: Turnuvaya Katıl vs Turnuva Kur */}
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  audio.playSelect();
                  setTournamentSubTab("JOIN");
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                  tournamentSubTab === "JOIN"
                    ? "bg-[#1f1122] border-rose-500 text-rose-300 shadow-sm"
                    : "bg-[#0b101f] border-zinc-800 text-zinc-400 hover:text-white"
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
                className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                  tournamentSubTab === "CREATE"
                    ? "bg-[#1f1122] border-amber-400 text-amber-300 shadow-sm"
                    : "bg-[#0b101f] border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                👑 Turnuva Kur
              </button>
            </div>

            {/* A. CANLI TURNUVALAR LİSTESİ */}
            {tournamentSubTab === "JOIN" && (
              <div className="space-y-2.5">
                {ACTIVE_TOURNAMENTS.map(t => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-gradient-to-br from-[#141024] to-[#0c142b] border border-rose-500/20 shadow-lg relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-black text-white">{t.title}</h4>
                      </div>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {t.slotsLeft}
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-300 font-bold mt-1">
                      Tema: <span className="text-amber-400">{t.theme}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5 text-[10px]">
                      <div>
                        <span className="text-zinc-500 block font-bold">ÖDÜL HAVUZU</span>
                        <span className="text-amber-300 font-black">{t.prize}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 block font-bold">DOLULUK</span>
                        <span className="text-emerald-400 font-black">{t.players}</span>
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
                            shotClockSeconds: 20,
                            themeId: PRESET_BOARDS[t.boardIdx].id,
                            category: t.theme,
                            allowCellStealing: true,
                            allowPowerups: true,
                            prizePool: t.prize,
                          };
                          onCreateRoom(settings, PRESET_BOARDS[t.boardIdx]);
                          onClose();
                        }, 500);
                      }}
                      className="w-full mt-2.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>{joinedTourneyId === t.id ? "Turnuvaya Kaydedildi! ✓" : `Kayıt Ol (${t.entryFee})`}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* B. TURNUVA KURMA PANELİ */}
            {tournamentSubTab === "CREATE" && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-[#0b101f] border border-sky-500/20 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
                    Turnuva Adı
                  </label>
                  <input
                    type="text"
                    value={tourneyName}
                    onChange={e => setTourneyName(e.target.value)}
                    placeholder="Örn: Hafta Sonu Sinefil Kupası"
                    className="w-full px-3 py-2 rounded-xl bg-[#121a30] border border-zinc-700 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-[#0b101f] border border-sky-500/20">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block mb-1.5">
                    Katılım Ücreti
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "FREE", label: "Ücretsiz", desc: "Açık Katılım" },
                      { val: "REELS", label: "200 🎞️", desc: "Makara Giriş" },
                      { val: "DIAMONDS", label: "20 💎", desc: "Elmas Ligi" },
                    ].map(f => (
                      <button
                        key={f.val}
                        type="button"
                        onClick={() => setTourneyEntryFee(f.val as any)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          tourneyEntryFee === f.val
                            ? "bg-[#1f1122] border-rose-500 text-white shadow"
                            : "bg-[#10182b] border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <div className="text-xs font-black">{f.label}</div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">{f.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-[10px] text-zinc-300 flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400 font-black block">8 Kişilik Bracket Eleme:</strong>
                    Çeyrek Final &rarr; Yarı Final &rarr; Büyük Final formatında oynanır. Şampiyon 1.500 Makara ve altın şampiyonluk rozeti kazanır.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateTournament}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                >
                  <Trophy className="w-4 h-4 fill-white" />
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
