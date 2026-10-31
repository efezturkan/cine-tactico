"use client";

import React, { useState } from "react";
import {
  UserProfile,
  AVATAR_OPTIONS,
  calculateRank,
  CinemaAmbience,
  AmbienceTheme,
  GrainLevel,
  AMBIENCE_THEMES,
  DEFAULT_AMBIENCE,
} from "@/types/profile";
import { TasteDnaCard } from "./TasteDnaCard";
import { MatchHistoryModal } from "./MatchHistoryModal";
import {
  User,
  Trophy,
  Flame,
  Zap,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Edit3,
  Check,
  X,
  Shield,
  Dna,
  Camera,
  ChevronRight,
  History,
  Clapperboard,
  Film,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  ShieldCheck,
  Lightbulb,
  Palette,
  Sliders,
  Eye,
  RotateCcw,
  Lock,
} from "lucide-react";
import { audio } from "@/utils/audio";

const FAVORITE_DIRECTORS = [
  "Christopher Nolan",
  "Quentin Tarantino",
  "Martin Scorsese",
  "David Fincher",
  "Denis Villeneuve",
  "Stanley Kubrick",
  "Hayao Miyazaki",
  "Wes Anderson",
  "Nuri Bilge Ceylan",
  "Bong Joon-ho",
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenLiveAmbience?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isMuted,
  onToggleMute,
  onOpenLiveAmbience,
}) => {
  const [activeTab, setActiveTab] = useState<"CAREER" | "DNA" | "AMBIENCE">("CAREER");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDirectorPicker, setShowDirectorPicker] = useState(false);
  const [showHistoryAlert, setShowHistoryAlert] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);

  const currentAmbience: CinemaAmbience = profile.ambience || DEFAULT_AMBIENCE;

  const handleUpdateAmbience = (delta: Partial<CinemaAmbience>) => {
    audio.playSelect();
    const updated: CinemaAmbience = {
      ...currentAmbience,
      ...delta,
    };
    onUpdateProfile({ ambience: updated });
  };

  const handleResetAmbience = () => {
    audio.playSelect();
    onUpdateProfile({ ambience: DEFAULT_AMBIENCE });
  };

  if (!isOpen) return null;

  const currentRank = calculateRank(profile.wins);
  const winRate =
    profile.totalMatches > 0
      ? Math.round((profile.wins / profile.totalMatches) * 100)
      : 0;

  const currentAvatar =
    AVATAR_OPTIONS.find(a => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  const last5 = profile.lastFiveMatches && profile.lastFiveMatches.length > 0
    ? profile.lastFiveMatches
    : profile.totalMatches === 0
    ? (["-", "-", "-", "-", "-"] as const)
    : (["W", "W", "W", "W", "W"] as const);

  const favoriteDirector = profile.favoriteDirector || "Christopher Nolan";
  const favoriteMode = profile.favoriteMode || "Klasik 3x3";

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateProfile({ username: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (id: string) => {
    audio.playSelect();
    setSelectedAvatar(id);
    onUpdateProfile({ avatarId: id });
    setShowAvatarPicker(false);
  };

  const handleSelectDirector = (dir: string) => {
    audio.playSelect();
    onUpdateProfile({ favoriteDirector: dir });
    setShowDirectorPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0a1122] border border-sky-500/20 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-white">
        {/* Üst Bar: Profil Başlığı & Kapat Butonu */}
        <div className="flex items-center justify-between pb-2 border-b border-sky-500/10">
          <div className="w-6" /> {/* Dengeleme boşluğu */}
          <h2 className="text-sm font-black tracking-widest text-zinc-300 uppercase font-mono">
            CINE<span className="text-amber-400">XOX</span> PROFİL
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#131f38] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sekmeler: Kariyer vs Zevk DNA'sı vs Sinema Işık & Loşluk */}
        <div className="grid grid-cols-3 gap-1.5 my-3 p-1 rounded-2xl bg-[#0f172a] border border-sky-500/15 text-xs font-bold text-zinc-400">
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("CAREER");
            }}
            className={`py-1.5 px-1 rounded-xl text-center truncate transition-all ${
              activeTab === "CAREER"
                ? "bg-amber-400 text-[#080d1a] font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            Kariyer
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("DNA");
            }}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === "DNA"
                ? "bg-purple-500 text-white font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            <Dna className="w-3 h-3" />
            <span className="truncate">Zevk DNA</span>
          </button>
          <button
            onClick={() => {
              audio.playSelect();
              setActiveTab("AMBIENCE");
            }}
            className={`py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === "AMBIENCE"
                ? "bg-rose-600 text-white font-black shadow-md"
                : "hover:text-white"
            }`}
          >
            <Lightbulb className="w-3 h-3 text-amber-300" />
            <span className="truncate">Salon Işığı</span>
          </button>
        </div>

        {activeTab === "DNA" ? (
          <TasteDnaCard
            tasteDna={profile.tasteDna}
            username={profile.username}
            letterboxdUsername={profile.letterboxdUsername}
            onUpdateLetterboxd={(handle) => onUpdateProfile({ letterboxdUsername: handle })}
          />
        ) : activeTab === "AMBIENCE" ? (
          /* ── SİNEMA SALONU AMBİYANS & IŞIK AYARLARI ─── */
          <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
            {/* Ana Ekranda Canlı Görerek Ayarla Butonu */}
            {onOpenLiveAmbience && (
              <button
                onClick={() => {
                  audio.playSelect();
                  onClose();
                  onOpenLiveAmbience();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 active:scale-[0.98] transition-all"
              >
                <Eye className="w-4 h-4 text-amber-200" />
                <span>ANA EKRANDA CANLI GÖREREK AYARLA 👁️</span>
              </button>
            )}

            {/* Canlı Projeksiyon Minyatür Önizlemesi */}
            <div
              className="p-3.5 rounded-2xl relative overflow-hidden text-center border"
              style={{
                background: currentAmbience.theme === "noir_silver" ? "#060709" : currentAmbience.theme === "kodak_amber" ? "#0a0703" : "#07080b",
                borderColor: AMBIENCE_THEMES[currentAmbience.theme]?.accentColor || "#8b151b",
                boxShadow: `0 0 30px ${AMBIENCE_THEMES[currentAmbience.theme]?.glowRgba || "rgba(139,21,27,0.4)"}`,
              }}
            >
              {/* Projeksiyon Hüzmesi Efekti */}
              <div
                className="absolute top-0 left-1/4 right-1/4 h-8 blur-xl pointer-events-none"
                style={{
                  background: AMBIENCE_THEMES[currentAmbience.theme]?.accentColor || "#8b151b",
                  opacity: currentAmbience.glowIntensity / 100,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                  <span>PROJEKSİYON AMBİYANS ÖNİZLEMESİ</span>
                  <span style={{ color: AMBIENCE_THEMES[currentAmbience.theme]?.accentColor }}>CANLI AYAR</span>
                </div>
                <div className="text-base font-black text-white flex items-center justify-center gap-1.5">
                  <span>{AMBIENCE_THEMES[currentAmbience.theme]?.emoji}</span>
                  <span>{AMBIENCE_THEMES[currentAmbience.theme]?.label}</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  {AMBIENCE_THEMES[currentAmbience.theme]?.sub}
                </p>
                <div className="flex items-center justify-center gap-3 mt-2 text-[9px] font-mono text-zinc-400">
                  <span>Loşluk: %{currentAmbience.dimness}</span>
                  <span>·</span>
                  <span>Işık: %{currentAmbience.glowIntensity}</span>
                  <span>·</span>
                  <span>Gren: {currentAmbience.grain}</span>
                </div>
              </div>
            </div>

            {/* 1. Salon Işık Temaları (5 Seçenek) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Salon Işık Tonu
                </span>
                <span className="text-[9px] font-mono text-zinc-500">5 Özel Tema</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(AMBIENCE_THEMES) as AmbienceTheme[]).map((themeKey) => {
                  const theme = AMBIENCE_THEMES[themeKey];
                  const isSelected = currentAmbience.theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => handleUpdateAmbience({ theme: themeKey })}
                      className="p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border active:scale-[0.98]"
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${theme.glowRgba}, rgba(14,16,24,0.9))`
                          : "rgba(14,16,24,0.6)",
                        borderColor: isSelected ? theme.accentColor : "#1e2230",
                        boxShadow: isSelected ? `0 0 15px ${theme.glowRgba}` : "none",
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow border"
                          style={{
                            background: theme.bgColor,
                            borderColor: theme.accentColor,
                          }}
                        >
                          {theme.emoji}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">{theme.label}</div>
                          <div className="text-[9px] text-zinc-400">{theme.sub}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ background: theme.accentColor }}
                        />
                        {isSelected && (
                          <span className="text-[10px] font-black" style={{ color: theme.accentColor }}>
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Salon Loşluğu Slider'ı (%50 - %100) */}
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Salon Loşluğu (Karartma)
                </span>
                <span className="text-xs font-mono font-black text-amber-400">
                  %{currentAmbience.dimness}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={currentAmbience.dimness}
                onChange={(e) => handleUpdateAmbience({ dimness: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 mt-1">
                <span>Rahat Loş (%50)</span>
                <span>Standart (%85)</span>
                <span>Zifiri OLED (%100)</span>
              </div>
            </div>

            {/* 3. Projeksiyon Işığı Yoğunluğu Slider'ı (%20 - %100) */}
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-zinc-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Projeksiyon Parıltısı
                </span>
                <span className="text-xs font-mono font-black text-rose-400">
                  %{currentAmbience.glowIntensity}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={currentAmbience.glowIntensity}
                onChange={(e) => handleUpdateAmbience({ glowIntensity: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 mt-1">
                <span>Mütevazı (%20)</span>
                <span>Sinematik (%65)</span>
                <span>Görkemli (%100)</span>
              </div>
            </div>

            {/* 4. 35mm Analog Film Greni */}
            <div className="p-3 rounded-2xl bg-[#0d1424] border border-zinc-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 block mb-2">
                35mm Analog Film Greni (Doku)
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "OFF", label: "Kapalı", desc: "Pürüzsüz" },
                  { id: "SUBTLE", label: "Doğal", desc: "Hafif 35mm" },
                  { id: "VINTAGE", label: "Vintage", desc: "Yoğun Gren" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleUpdateAmbience({ grain: g.id as GrainLevel })}
                    className={`py-2 px-1 rounded-xl text-center transition-all border ${
                      currentAmbience.grain === g.id
                        ? "bg-amber-400/20 border-amber-400 text-amber-300 font-black shadow"
                        : "bg-[#11192d] border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="text-[10px] font-black">{g.label}</div>
                    <div className="text-[8px] opacity-70 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Kamera Vizör Filigranı & Sıfırla */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0d1424] border border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[11px] font-black text-white">Vizör Lens Filigranı</div>
                  <div className="text-[9px] text-zinc-400">Arka plan optik nişangah deseni</div>
                </div>
              </div>
              <button
                onClick={() => handleUpdateAmbience({ showWatermark: !currentAmbience.showWatermark })}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                  currentAmbience.showWatermark
                    ? "bg-emerald-500 text-white shadow"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {currentAmbience.showWatermark ? "AÇIK ✓" : "KAPALI"}
              </button>
            </div>

            {/* Varsayılan Ayarlara Dön */}
            <button
              onClick={handleResetAmbience}
              className="py-2.5 px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-black flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Varsayılan Sinema Işıklarına Dön
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* 1. Merkez Avatar (Kamera Rozeti ile) */}
            <div className="relative mt-2 mb-2">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`w-20 h-20 rounded-full bg-gradient-to-tr ${currentAvatar.iconBg} flex items-center justify-center text-4xl shadow-xl shadow-sky-500/10 border-2 border-amber-400 relative active:scale-95 transition-transform`}
              >
                {currentAvatar.emoji}
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-amber-400 text-cinema-dark flex items-center justify-center shadow border-2 border-[#0a1122]">
                  <Camera className="w-3 h-3 fill-cinema-dark" />
                </div>
              </button>
            </div>

            {/* Avatar Seçici Açılır Paneli (Puanla Kilit Açma & Seçme) */}
            {showAvatarPicker && (
              <div className="w-full p-3 rounded-2xl bg-[#10182b] border border-amber-400/30 mb-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Sinefil İkonları (Avatar Seç / Aç)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300">
                    🎟️ {profile.reelsBalance.toLocaleString()} Makara
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map(a => {
                    const isUnlocked = (profile.unlockedAvatars || ["avatar_director", "avatar_actor"]).includes(a.id) || a.cost === 0;
                    const isSelected = selectedAvatar === a.id;
                    const canAfford = profile.reelsBalance >= a.cost;

                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          if (isUnlocked) {
                            handleSelectAvatar(a.id);
                          } else {
                            if (canAfford) {
                              audio.playVictory();
                              const newUnlocked = [...(profile.unlockedAvatars || ["avatar_director", "avatar_actor"]), a.id];
                              onUpdateProfile({
                                reelsBalance: profile.reelsBalance - a.cost,
                                unlockedAvatars: newUnlocked,
                                avatarId: a.id,
                              });
                              setSelectedAvatar(a.id);
                              setShowAvatarPicker(false);
                            } else {
                              audio.playError();
                              alert(`Yetersiz Makara! "${a.label}" için ${a.cost} Makara gerekiyor (Mevcut bakiyen: ${profile.reelsBalance}).`);
                            }
                          }
                        }}
                        className={`p-2 rounded-xl bg-gradient-to-tr ${a.iconBg} flex flex-col items-center justify-center text-xl transition-all border relative active:scale-95 ${
                          isSelected
                            ? "ring-2 ring-amber-400 scale-105 border-white shadow-lg"
                            : isUnlocked
                            ? "border-transparent opacity-90 hover:opacity-100"
                            : "border-transparent opacity-60 hover:opacity-90"
                        }`}
                        title={`${a.label} (${isUnlocked ? "Açık" : `${a.cost} Makara`})`}
                      >
                        <span>{a.emoji}</span>
                        <span className="text-[9px] font-black text-white truncate max-w-full mt-0.5">{a.label}</span>
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center text-amber-300 font-black text-[9px]">
                            <Lock className="w-3.5 h-3.5 mb-0.5 text-zinc-300" />
                            <span>{a.cost} 🎟️</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Kullanıcı Adı & Seviye */}
            <div className="flex items-center gap-2 mt-1">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    maxLength={16}
                    className="px-2 py-0.5 bg-[#131f38] border border-amber-400 rounded-lg text-sm font-bold text-white text-center focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 rounded-lg bg-emerald-500 text-white"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black text-white">{profile.username}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-black text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-md border border-amber-400/30">
                    Lv. {currentRank.level + 4}
                  </span>
                </div>
              )}
            </div>

            {/* Seviye İlerleme Çubuğu */}
            <div className="w-48 h-1.5 bg-[#131f38] rounded-full mt-2 overflow-hidden border border-sky-500/20">
              <div className="w-3/4 h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" />
            </div>
            <span className="text-[9px] text-zinc-500 font-bold mt-1">750 / 1000 XP</span>

            {/* 3. FAVORİ YÖNETMEN SEÇİMİ */}
            <div className="w-full my-3">
              <button
                onClick={() => setShowDirectorPicker(!showDirectorPicker)}
                className="w-full py-2.5 px-3 rounded-2xl bg-[#10182b] border border-sky-500/20 hover:border-amber-400/50 flex items-center justify-between text-xs transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-amber-400" />
                  <span className="text-zinc-400 text-[11px] font-bold">FAVORİ YÖNETMEN:</span>
                  <span className="font-black text-white">{favoriteDirector}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              {/* Yönetmen Seçim Listesi */}
              {showDirectorPicker && (
                <div className="mt-2 p-2 rounded-2xl bg-[#131f38] border border-amber-400/30 max-h-40 overflow-y-auto custom-scrollbar animate-in fade-in">
                  <span className="text-[9px] font-black uppercase text-amber-400 px-2 block mb-1">
                    Yönetmenini Değiştir
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {FAVORITE_DIRECTORS.map(dir => (
                      <button
                        key={dir}
                        onClick={() => handleSelectDirector(dir)}
                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          favoriteDirector === dir
                            ? "bg-amber-400 text-cinema-dark font-black"
                            : "text-zinc-300 hover:bg-[#10182b]"
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. CINEXOX 3'LÜ STAT KARTLARI (TOTAL MATCHES, WIN RATE, FAVOURITE MODE) */}
            <div className="w-full grid grid-cols-3 gap-2 my-1">
              <div className="p-3 rounded-2xl bg-[#10182b] border border-sky-500/20 text-center flex flex-col items-center justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  TOPLAM MAÇ
                </span>
                <span className="text-base font-black text-white mt-1">
                  {profile.totalMatches}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#10182b] border border-sky-500/20 text-center flex flex-col items-center justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  KAZANMA
                </span>
                <span className="text-base font-black text-amber-400 mt-1">
                  %{winRate}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#10182b] border border-sky-500/20 text-center flex flex-col items-center justify-center">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 truncate max-w-full">
                  FAVORİ MOD
                </span>
                <span className="text-xs font-black text-cyan-400 mt-1 truncate max-w-full">
                  {favoriteMode}
                </span>
              </div>
            </div>

            {/* 5. SON 5 MAÇ (Çember Form Göstergesi) */}
            <div className="w-full my-3 p-3.5 rounded-2xl bg-[#10182b] border border-sky-500/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 block">
                  SON 5 MAÇ
                </span>
                <span className="text-[9px] text-zinc-500 font-bold">Son karşılaşma formu</span>
              </div>

              <div className="flex items-center gap-1.5">
                {last5.map((res, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-md ${
                      res === "W"
                        ? "bg-emerald-500 text-white ring-1 ring-emerald-400"
                        : res === "L"
                        ? "bg-rose-500 text-white ring-1 ring-rose-400"
                        : "bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {res === "W" ? "✓" : res === "L" ? "✕" : "-"}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. MAÇ GEÇMİŞİ BUTONU (CLASH ROYALE STYLE BATTLE LOG) */}
            <div className="w-full my-1">
              <button
                onClick={() => {
                  audio.playSelect();
                  setShowMatchHistory(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#131f38] to-[#1c2c4d] hover:from-[#182747] hover:to-[#22365e] border border-sky-500/40 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
              >
                <History className="w-4 h-4 text-amber-400" />
                <span>SAVAŞ GEÇMİŞİ &amp; TAHTA İNCELEMESİ</span>
              </button>
            </div>

            {/* 7. OYUN AYARLARI (Ses ve Haptik) */}
            <div className="w-full mt-3 pt-3 border-t border-sky-500/10 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0d1424] border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-amber-400" />
                  )}
                  <span className="font-bold text-zinc-300 text-[11px]">
                    Sentezleyici Ses Efektleri
                  </span>
                </div>
                <button
                  onClick={onToggleMute}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors ${
                    !isMuted
                      ? "bg-amber-400 text-cinema-dark"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {!isMuted ? "AÇIK" : "KAPALI"}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#0d1424] border border-zinc-800 text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-zinc-300 text-[11px]">
                    Haptik Titreşim Geri Bildirimi
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                  AKTİF ✓
                </span>
              </div>

              {/* 8. VERİ VE GİZLİLİK KONTROLÜ */}
              <div className="p-2.5 rounded-xl bg-[#0a0f1d] border border-zinc-800/80 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-300 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gizlilik & Yerel Veri</span>
                  </div>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-400 hover:underline font-bold"
                  >
                    Politika ↗
                  </a>
                </div>
                <p className="text-[9.5px] text-zinc-500 leading-tight">
                  Uygulama sunucuya hiçbir kişisel veri göndermez. Sadece cihazınızdaki tema tercihleri saklanır.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const ok = window.confirm("Cihazınızdaki tüm yerel ambiyans ve oyun ayarları sıfırlanacaktır. Onaylıyor musunuz?");
                      if (ok) {
                        try {
                          localStorage.removeItem("cinexox_ambience");
                          localStorage.removeItem("cinetactico_ambience");
                        } catch {
                          // ignore
                        }
                        window.location.reload();
                      }
                    }
                  }}
                  className="w-full py-1.5 px-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                  Yerel Oyun Verilerini Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clash Royale Tarzı Savaş / Maç Geçmişi Modalı */}
        <MatchHistoryModal
          isOpen={showMatchHistory}
          onClose={() => setShowMatchHistory(false)}
          profile={profile}
        />
      </div>
    </div>
  );
};
