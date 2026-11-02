"use client";

import React, { useState, useEffect } from "react";
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
  ensureAnonymousSession,
  linkAnonymousAccountToEmail,
  updateUsernameWithUniqueness,
  isSupabaseConfigured,
} from "@/backend";
import {
  Volume2,
  VolumeX,
  Smartphone,
  Edit3,
  Check,
  X,
  Dna,
  Camera,
  ChevronRight,
  History,
  Clapperboard,
  Sun,
  Moon,
  Trash2,
  ShieldCheck,
  Palette,
  Eye,
  RotateCcw,
  Lock,
  Trophy,
} from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic, setHapticEnabled } from "@/utils/haptics";

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
  initialTab?: "CAREER" | "DNA" | "AMBIENCE";
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isMuted,
  onToggleMute,
  onOpenLiveAmbience,
  initialTab = "CAREER",
}) => {
  const [activeTab, setActiveTab] = useState<"CAREER" | "DNA" | "AMBIENCE">(initialTab);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDirectorPicker, setShowDirectorPicker] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);
  const [hapticOn, setHapticOn] = useState(true);

  const [isAnonymousUser, setIsAnonymousUser] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLinkAccount, setShowLinkAccount] = useState<boolean>(false);
  const [linkEmail, setLinkEmail] = useState<string>("");
  const [linkPassword, setLinkPassword] = useState<string>("");
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const [linkMessage, setLinkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState<boolean>(false);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setTempName(profile.username);
      setSelectedAvatar(profile.avatarId);
      try {
        setHapticOn(localStorage.getItem("cinexox_haptic") !== "0");
      } catch {
        setHapticOn(true);
      }
    }
    if (isOpen && isSupabaseConfigured) {
      ensureAnonymousSession().then((auth) => {
        setIsAnonymousUser(auth.isAnonymous);
        setUserEmail(auth.user?.email || null);
      });
    }
  }, [isOpen, initialTab, profile.username, profile.avatarId]);

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
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  const recent = (profile.lastFiveMatches ?? []).slice(-5);
  const last5 = [...Array(Math.max(0, 5 - recent.length)).fill("-"), ...recent];

  const favoriteDirector = profile.favoriteDirector || "Christopher Nolan";
  const favoriteMode = profile.favoriteMode || "Klasik 3×3";

  const handleSaveName = async () => {
    const cleaned = tempName.trim();
    if (!cleaned || cleaned === profile.username) {
      setIsEditingName(false);
      return;
    }

    if (isSupabaseConfigured) {
      setNameLoading(true);
      setNameError(null);
      const res = await updateUsernameWithUniqueness(cleaned);
      setNameLoading(false);
      if (!res.success) {
        setNameError(res.error || "Bu kullanıcı adı alınamadı.");
        audio.playError();
        return;
      }
    }

    audio.playSelect();
    onUpdateProfile({ username: cleaned });
    setIsEditingName(false);
    setNameError(null);
  };

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim() || !linkPassword.trim()) {
      setLinkMessage({ type: "error", text: "Lütfen e-posta ve şifre giriniz." });
      return;
    }
    setLinkLoading(true);
    setLinkMessage(null);
    const res = await linkAnonymousAccountToEmail(linkEmail.trim(), linkPassword);
    setLinkLoading(false);
    if (res.success) {
      audio.playVictory();
      setIsAnonymousUser(false);
      setUserEmail(linkEmail.trim());
      setLinkMessage({ type: "success", text: "Hesabınız başarıyla bağlandı! ⭐" });
      setTimeout(() => setShowLinkAccount(false), 3000);
    } else {
      audio.playError();
      setLinkMessage({ type: "error", text: res.error || "Hesap bağlanamadı." });
    }
  };

  const handleSelectAvatar = (id: string) => {
    audio.playSelect();
    setSelectedAvatar(id);
    onUpdateProfile({ avatarId: id });
    setShowAvatarPicker(false);
  };

  const handleSelectDirector = (dir: string) => {
    audio.playSelect();
    onUpdateProfile({
      favoriteDirector: dir,
      tasteDna: {
        ...profile.tasteDna,
        topDirector: dir,
      },
    });
    setShowDirectorPicker(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-md rounded-3xl p-4 sm:p-5 flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-[#F1EEE7]"
        style={{
          background: "linear-gradient(180deg, #181B22 0%, #0F1115 100%)",
          border: "2px solid #252932",
          borderBottom: "5px solid #090A0D",
          boxShadow: "0 20px 60px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Üst Bar: Profil Başlığı & Kapat Butonu */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <div className="w-7" />
          <div className="text-center">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#D9A441] block">
              CINE-XOX IDENTITY
            </span>
            <h2 className="text-sm font-serif font-bold tracking-wider text-[#E8E6E1] uppercase">
              SİNEFİL KARTI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Sekme: Kariyer | Zevk DNA'sı | Salon Işıkları */}
        <div className="grid grid-cols-3 gap-1.5 my-3 p-1 rounded-2xl bg-[#0F1115] border border-white/10 text-xs font-bold text-[#A5A8B0]">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setActiveTab("CAREER");
            }}
            className={`py-2 px-2 rounded-xl text-center truncate transition-all flex items-center justify-center gap-1 ${
              activeTab === "CAREER"
                ? "tactile-btn-amber font-black text-[11px]"
                : "hover:text-[#F1EEE7] text-[11px]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>Kariyer</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setActiveTab("DNA");
            }}
            className={`py-2 px-2 rounded-xl text-center truncate transition-all flex items-center justify-center gap-1 ${
              activeTab === "DNA"
                ? "bg-purple-500 text-white border border-purple-300 border-b-[3px] border-b-purple-900 font-black text-[11px]"
                : "hover:text-[#F1EEE7] text-[11px]"
            }`}
          >
            <Dna className="w-3.5 h-3.5 shrink-0" />
            <span>Zevk DNA</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setActiveTab("AMBIENCE");
            }}
            className={`py-2 px-2 rounded-xl text-center truncate transition-all flex items-center justify-center gap-1 ${
              activeTab === "AMBIENCE"
                ? "tactile-btn-cyan font-black text-[11px]"
                : "hover:text-[#F1EEE7] text-[11px]"
            }`}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span>Ambiyans</span>
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
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            {onOpenLiveAmbience && (
              <button
                onClick={() => {
                  audio.playSelect();
                  onClose();
                  onOpenLiveAmbience();
                }}
                className="w-full py-3 px-4 rounded-2xl tactile-btn-amber font-black text-xs flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>ANA EKRANDA CANLI GÖREREK AYARLA 👁️</span>
              </button>
            )}

            {/* 1. Salon Işık Temaları (5 Seçenek) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A5A8B0] flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-[#F5A623]" />
                  Salon Işık Tonu
                </span>
                <span className="text-[9px] font-mono text-[#A5A8B0]">5 Özel Tema</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(AMBIENCE_THEMES) as AmbienceTheme[]).map((themeKey) => {
                  const theme = AMBIENCE_THEMES[themeKey];
                  const isSelected = currentAmbience.theme === themeKey;
                  return (
                    <button
                      key={themeKey}
                      onClick={() => handleUpdateAmbience({ theme: themeKey })}
                      className="p-2.5 rounded-2xl flex items-center justify-between text-left transition-all border active:translate-y-[1px]"
                      style={{
                        background: isSelected
                          ? `linear-gradient(135deg, ${theme.glowRgba}, #181B22)`
                          : "#14171E",
                        borderColor: isSelected ? theme.accentColor : "#252932",
                        borderBottomWidth: "3px",
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
                          <div className="text-xs font-black text-[#F1EEE7]">{theme.label}</div>
                          <div className="text-[9.5px] text-[#A5A8B0]">{theme.sub}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ background: theme.accentColor }}
                        />
                        {isSelected && (
                          <span className="text-xs font-black" style={{ color: theme.accentColor }}>
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Salon Loşluğu Slider'ı */}
            <div className="p-3 rounded-2xl bg-[#14171E] border border-[#252932]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F1EEE7] flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-[#00D5E8]" />
                  Salon Loşluğu (Karartma)
                </span>
                <span className="text-xs font-mono font-black text-[#F5A623]">
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
                className="w-full accent-[#F5A623] cursor-pointer"
              />
            </div>

            {/* 3. Projeksiyon Işığı Yoğunluğu Slider'ı */}
            <div className="p-3 rounded-2xl bg-[#14171E] border border-[#252932]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F1EEE7] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#F5A623]" />
                  Projeksiyon Parıltısı
                </span>
                <span className="text-xs font-mono font-black text-[#FF334B]">
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
                className="w-full accent-[#FF334B] cursor-pointer"
              />
            </div>

            {/* 4. 35mm Analog Film Greni */}
            <div className="p-3 rounded-2xl bg-[#14171E] border border-[#252932]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F1EEE7] block mb-2">
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
                        ? "bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623] font-black"
                        : "bg-[#181B22] border-[#252932] text-[#A5A8B0] hover:text-[#F1EEE7]"
                    }`}
                  >
                    <div className="text-[10px] font-black">{g.label}</div>
                    <div className="text-[8px] opacity-70 mt-0.5">{g.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleResetAmbience}
              className="py-2.5 px-3 rounded-xl tactile-btn-surface text-xs font-black flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F5A623]" />
              Varsayılan Sinema Işıklarına Dön
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* 1. Merkez Avatar (Kamera Rozeti ile) */}
            <div className="relative mt-1 mb-2">
              <button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${currentAvatar.iconBg} flex items-center justify-center text-4xl shadow-xl border-2 border-[#F5A623] border-b-4 border-b-[#9A5B0A] relative active:translate-y-[1.5px] transition-transform`}
              >
                {currentAvatar.emoji}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#F5A623] text-[#0F1115] flex items-center justify-center shadow border-2 border-[#0F1115]">
                  <Camera className="w-3 h-3" />
                </div>
              </button>
            </div>

            {/* Avatar Seçici Açılır Paneli */}
            {showAvatarPicker && (
              <div className="w-full p-3 rounded-2xl bg-[#14171E] border border-[#F5A623]/40 mb-3 animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#F5A623]">
                    Sinefil İkonları (Avatar Seç / Aç)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#F5A623]">
                    🎞️ {(profile.reelsBalance || 350).toLocaleString()} Makara
                  </span>
                </div>
                {avatarNotice && (
                  <div className="mb-2 p-2 rounded-xl bg-[#FF334B]/20 border border-[#FF334B]/40 text-[#FF334B] text-xs font-black text-center">
                    {avatarNotice}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((a) => {
                    const isUnlocked =
                      (profile.unlockedAvatars || ["avatar_director", "avatar_actor"]).includes(a.id) ||
                      a.cost === 0;
                    const isSelected = selectedAvatar === a.id;
                    const canAfford = (profile.reelsBalance || 350) >= a.cost;

                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          if (isUnlocked) {
                            handleSelectAvatar(a.id);
                          } else if (canAfford) {
                            audio.playVictory();
                            const newUnlocked = [
                              ...(profile.unlockedAvatars || ["avatar_director", "avatar_actor"]),
                              a.id,
                            ];
                            onUpdateProfile({
                              reelsBalance: (profile.reelsBalance || 350) - a.cost,
                              unlockedAvatars: newUnlocked,
                              avatarId: a.id,
                            });
                            setSelectedAvatar(a.id);
                            setShowAvatarPicker(false);
                          } else {
                            audio.playError();
                            setAvatarNotice(
                              `Yetersiz Makara! "${a.label}" için ${a.cost} Makara gerekiyor.`
                            );
                            setTimeout(() => setAvatarNotice(null), 3000);
                          }
                        }}
                        className={`p-2 rounded-xl bg-gradient-to-tr ${a.iconBg} flex flex-col items-center justify-center text-xl transition-all border relative active:scale-95 ${
                          isSelected
                            ? "ring-2 ring-[#F5A623] scale-105 border-white shadow-lg"
                            : isUnlocked
                            ? "border-transparent opacity-90 hover:opacity-100"
                            : "border-transparent opacity-60 hover:opacity-90"
                        }`}
                      >
                        <span>{a.emoji}</span>
                        <span className="text-[9px] font-black text-white truncate max-w-full mt-0.5">
                          {a.label}
                        </span>
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center text-[#F5A623] font-black text-[9px]">
                            <Lock className="w-3.5 h-3.5 mb-0.5 text-zinc-300" />
                            <span>{a.cost} 🎞️</span>
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
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={16}
                    className="px-2.5 py-1 bg-[#0F1115] border-2 border-[#F5A623] rounded-xl text-sm font-bold text-[#F1EEE7] text-center focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameLoading}
                    className="p-1.5 rounded-xl bg-[#8EBB70] text-[#0F1115] font-black disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-black text-[#F1EEE7]">
                    {profile.username === "Oyuncu" ? "Sinefil #3095" : profile.username}
                  </h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[#A5A8B0] hover:text-[#F5A623] transition-colors"
                    title="İsmi Düzenle"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-black text-[#F5A623] bg-[#F5A623]/15 px-2 py-0.5 rounded-lg border border-[#F5A623]/35">
                    Lv. {currentRank.level}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#A5A8B0] mt-0.5">
              {currentRank.title}
            </span>

            {nameError && (
              <span className="text-[10px] text-[#FF334B] font-bold mt-1 bg-[#FF334B]/10 px-2 py-0.5 rounded border border-[#FF334B]/30">
                {nameError}
              </span>
            )}

            {/* Sinefil Künyesi Kartı */}
            <div className="w-full mt-3 rounded-2xl tactile-card p-3">
              <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-widest text-[#A5A8B0]">
                <span className="text-[#F5A623] font-black">● SİNEFİL KÜNYESİ</span>
                <span>
                  {profile.totalMatches < 10
                    ? `DERECESİZ · ${Math.max(0, 10 - profile.totalMatches)} MAÇ KALDI`
                    : profile.rankTitle}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[#0F1115] p-2 border border-white/8">
                  <div className="text-[8px] font-mono font-bold text-[#A5A8B0]">GALİBİYET</div>
                  <div className="text-base font-black text-[#8EBB70]">{profile.wins}</div>
                </div>
                <div className="rounded-xl bg-[#0F1115] p-2 border border-white/8">
                  <div className="text-[8px] font-mono font-bold text-[#A5A8B0]">MAĞLUBİYET</div>
                  <div className="text-base font-black text-[#FF334B]">{profile.losses}</div>
                </div>
                <div className="rounded-xl bg-[#0F1115] p-2 border border-white/8">
                  <div className="text-[8px] font-mono font-bold text-[#A5A8B0]">ORAN</div>
                  <div className="text-base font-black text-[#F5A623]">%{winRate}</div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded-[3px] ${
                      idx < Math.max(profile.totalMatches, 5)
                        ? "bg-[#F5A623]"
                        : "bg-[#0F1115] border border-[#252932]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* HESAP & KİMLİK DURUMU */}
            <div className="w-full my-2.5 p-3 rounded-2xl bg-[#14171E] border border-[#252932]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                      isAnonymousUser
                        ? "bg-[#F5A623]/20 text-[#F5A623]"
                        : "bg-[#8EBB70]/20 text-[#8EBB70]"
                    }`}
                  >
                    {isAnonymousUser ? "🎭" : "⭐"}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-[#F1EEE7] flex items-center gap-1.5">
                      {isAnonymousUser ? "Misafir Sinefil" : "Doğrulanmış Sinefil"}
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                          isAnonymousUser
                            ? "bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30"
                            : "bg-[#8EBB70]/15 text-[#8EBB70] border border-[#8EBB70]/30"
                        }`}
                      >
                        {isAnonymousUser ? "Anonim" : "Kayıtlı"}
                      </span>
                    </div>
                    <div className="text-[9.5px] text-[#A5A8B0]">
                      {isAnonymousUser
                        ? "Verileriniz bu cihazda saklanıyor"
                        : userEmail || "Hesabınız kalıcı olarak bağlı"}
                    </div>
                  </div>
                </div>

                {isAnonymousUser && (
                  <button
                    onClick={() => setShowLinkAccount(!showLinkAccount)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F5A623]/15 border border-[#F5A623]/35 text-[#F5A623] text-[10px] font-black hover:bg-[#F5A623]/25 transition-all"
                  >
                    {showLinkAccount ? "Kapat" : "Hesabı Kaydet 🔐"}
                  </button>
                )}
              </div>

              {isAnonymousUser && showLinkAccount && (
                <form
                  onSubmit={handleLinkAccount}
                  className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in"
                >
                  <input
                    type="email"
                    placeholder="ornek@sinefil.com"
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#0F1115] border border-[#252932] text-xs text-[#F1EEE7] placeholder-[#A5A8B0]/50 focus:outline-none focus:border-[#F5A623]"
                  />
                  <input
                    type="password"
                    placeholder="Güçlü bir şifre (en az 6 karakter)"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F1115] border border-[#252932] text-xs text-[#F1EEE7] placeholder-[#A5A8B0]/50 focus:outline-none focus:border-[#F5A623]"
                  />
                  {linkMessage && (
                    <div
                      className={`text-[10px] font-bold p-1.5 rounded-lg text-center ${
                        linkMessage.type === "success"
                          ? "bg-[#8EBB70]/20 text-[#8EBB70] border border-[#8EBB70]/30"
                          : "bg-[#FF334B]/20 text-[#FF334B] border border-[#FF334B]/30"
                      }`}
                    >
                      {linkMessage.text}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={linkLoading}
                    className="w-full py-2.5 rounded-xl tactile-btn-amber text-xs font-black uppercase tracking-wider disabled:opacity-50"
                  >
                    {linkLoading ? "Bağlanıyor..." : "Hesabı E-posta ile Kilitle ✓"}
                  </button>
                </form>
              )}
            </div>

            {/* 3. FAVORİ YÖNETMEN SEÇİMİ */}
            <div className="w-full mb-2.5">
              <button
                onClick={() => setShowDirectorPicker(!showDirectorPicker)}
                className="w-full py-2.5 px-3 rounded-2xl tactile-btn-surface flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Clapperboard className="w-4 h-4 text-[#F5A623]" />
                  <span className="text-[#A5A8B0] text-[11px] font-bold">FAVORİ YÖNETMEN:</span>
                  <span className="font-black text-[#F1EEE7]">{favoriteDirector}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#A5A8B0]" />
              </button>

              {showDirectorPicker && (
                <div className="mt-2 p-2 rounded-2xl bg-[#14171E] border border-[#F5A623]/40 max-h-40 overflow-y-auto custom-scrollbar animate-in fade-in">
                  <div className="grid grid-cols-1 gap-1">
                    {FAVORITE_DIRECTORS.map((dir) => (
                      <button
                        key={dir}
                        onClick={() => handleSelectDirector(dir)}
                        className={`text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          favoriteDirector === dir
                            ? "bg-[#F5A623] text-[#0F1115] font-black"
                            : "text-[#F1EEE7] hover:bg-[#252932]"
                        }`}
                      >
                        {dir}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. 3'LÜ STAT KARTLARI */}
            <div className="w-full grid grid-cols-3 gap-2 mb-2.5">
              <div className="p-2.5 rounded-2xl bg-[#14171E] border border-[#252932] text-center">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[#A5A8B0] block">
                  TOPLAM MAÇ
                </span>
                <span className="text-base font-black text-[#F1EEE7] mt-0.5 block">
                  {profile.totalMatches}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#14171E] border border-[#252932] text-center">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[#A5A8B0] block">
                  SERİ REKORU
                </span>
                <span className="text-base font-black text-[#F5A623] mt-0.5 block">
                  {profile.highestCombo}x
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#14171E] border border-[#252932] text-center">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[#A5A8B0] block truncate">
                  FAVORİ MOD
                </span>
                <span className="text-xs font-black text-[#00D5E8] mt-1 block truncate">
                  {favoriteMode}
                </span>
              </div>
            </div>

            {/* 5. SON 5 MAÇ FORMU */}
            <div className="w-full mb-2.5 p-3 rounded-2xl bg-[#14171E] border border-[#252932] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#F1EEE7] block">
                  SON 5 MAÇ FORMU
                </span>
                <span className="text-[9px] text-[#A5A8B0] font-bold">Son karşılaşma sonuçları</span>
              </div>

              <div className="flex items-center gap-1.5">
                {last5.map((res, idx) => (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black border-b-2 ${
                      res === "W"
                        ? "bg-[#8EBB70] text-[#0F1115] border-b-[#4D7C32]"
                        : res === "L"
                        ? "bg-[#FF334B] text-white border-b-[#9F1239]"
                        : "bg-[#252932] text-[#A5A8B0] border-b-black"
                    }`}
                  >
                    {res === "W" ? "✓" : res === "L" ? "✕" : "-"}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. MAÇ GEÇMİŞİ BUTONU */}
            <div className="w-full mb-2.5">
              <button
                onClick={() => {
                  audio.playSelect();
                  setShowMatchHistory(true);
                }}
                className="w-full py-3 rounded-2xl tactile-btn-amber font-black text-xs flex items-center justify-center gap-2"
              >
                <History className="w-4 h-4" />
                <span>SAVAŞ GEÇMİŞİ &amp; TAHTA İNCELEMESİ</span>
              </button>
            </div>

            {/* 7. OYUN AYARLARI (Ses ve Haptik) */}
            <div className="w-full pt-2.5 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14171E] border border-[#252932] text-xs">
                <div className="flex items-center gap-2">
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-[#A5A8B0]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#F5A623]" />
                  )}
                  <span className="font-bold text-[#F1EEE7] text-[11px]">
                    Ses Efektleri
                  </span>
                </div>
                <button
                  onClick={onToggleMute}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors ${
                    !isMuted
                      ? "bg-[#F5A623] text-[#0F1115]"
                      : "bg-[#252932] text-[#A5A8B0]"
                  }`}
                >
                  {!isMuted ? "AÇIK" : "KAPALI"}
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14171E] border border-[#252932] text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00D5E8]" />
                  <span className="font-bold text-[#F1EEE7] text-[11px]">
                    Haptik Titreşim
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !hapticOn;
                    setHapticOn(next);
                    setHapticEnabled(next);
                    if (next) haptic.light();
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black transition-colors ${
                    hapticOn
                      ? "bg-[#00D5E8] text-[#0F1115]"
                      : "bg-[#252932] text-[#A5A8B0]"
                  }`}
                >
                  {hapticOn ? "AKTİF ✓" : "KAPALI"}
                </button>
              </div>

              {/* 8. VERİ VE GİZLİLİK KONTROLÜ */}
              <div className="p-2.5 rounded-xl bg-[#111318] border border-[#252932] space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#F1EEE7] text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8EBB70]" />
                    <span>Gizlilik &amp; Yerel Veri</span>
                  </div>
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#F5A623] hover:underline font-bold"
                  >
                    Politika ↗
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      const ok = window.confirm(
                        "Cihazınızdaki tüm yerel ambiyans ve oyun ayarları sıfırlanacaktır. Onaylıyor musunuz?"
                      );
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
                  className="w-full py-1.5 px-2 rounded-lg bg-[#FF334B]/15 hover:bg-[#FF334B]/25 border border-[#FF334B]/35 text-[#FF334B] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Yerel Oyun Verilerini Sıfırla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Savaş / Maç Geçmişi Modalı */}
        <MatchHistoryModal
          isOpen={showMatchHistory}
          onClose={() => setShowMatchHistory(false)}
          profile={profile}
        />
      </div>
    </div>
  );
};
