"use client";

import React, { useState, useEffect } from "react";
import {
  UserProfile,
  AVATAR_OPTIONS,
  calculateRank,
} from "@/types/profile";
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
  Camera,
  Clapperboard,
  ShieldCheck,
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

// 35mm film edge perforations for profile modal
const ModalSprocketColumn = ({ count = 20 }: { count?: number }) => (
  <div className="flex flex-col items-center justify-around py-3 gap-2 h-full">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="w-2 h-3.5 rounded-[2px] bg-[#07080b] border border-white/10 shrink-0"
      />
    ))}
  </div>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isMuted,
  onToggleMute,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDirectorPicker, setShowDirectorPicker] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, profile.username, profile.avatarId]);

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
      setLinkMessage({ type: "success", text: "Hesabınız başarıyla bağlandı! ✓" });
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

  const toggleHaptic = () => {
    const next = !hapticOn;
    setHapticOn(next);
    setHapticEnabled(next);
    if (next) haptic.light();
    try {
      localStorage.setItem("cinexox_haptic", next ? "1" : "0");
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="w-full max-w-sm rounded-2xl p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-y-auto custom-scrollbar relative text-[#E8E6E1] bg-[#14171D] border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Left & Right 35mm Film Edge Perforations */}
        <div className="absolute left-1.5 top-0 bottom-0 w-2.5 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none">
          <ModalSprocketColumn count={24} />
        </div>
        <div className="absolute right-1.5 top-0 bottom-0 w-2.5 flex flex-col items-center overflow-hidden opacity-30 pointer-events-none">
          <ModalSprocketColumn count={24} />
        </div>

        {/* Viewfinder corner brackets */}
        <div className="absolute top-2 left-5 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none" />
        <div className="absolute top-2 right-5 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 left-5 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none" />
        <div className="absolute bottom-2 right-5 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none" />

        {/* Header: Title & Close Button */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
          <div className="w-11" />
          <div className="text-center">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#D9A441] block">
              CINE-XOX · IDENTİTY
            </span>
            <h2 className="text-base font-serif font-bold tracking-wider text-[#E8E6E1] uppercase">
              Sinefil Kartı
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-[#181B22] border border-white/10 flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] transition-colors active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Identity Block: Avatar, Name, Level & Favorite Director */}
        <div className="flex flex-col items-center text-center">
          {/* Avatar with Camera Badge */}
          <div className="relative mb-3">
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#181B22] border border-white/15 flex items-center justify-center text-4xl shadow-md relative active:scale-95 transition-transform"
            >
              <span>{currentAvatar.emoji}</span>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#181B22] text-[#D9A441] border border-white/20 flex items-center justify-center shadow">
                <Camera className="w-3 h-3" />
              </div>
            </button>
          </div>

          {/* Avatar Picker Panel */}
          {showAvatarPicker && (
            <div className="w-full p-3 rounded-xl bg-[#0F1115] border border-white/10 mb-3 animate-in fade-in">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#D9A441] block mb-2 text-left">
                Avatar Seç
              </span>
              <div className="grid grid-cols-4 gap-2">
                {AVATAR_OPTIONS.map((a) => {
                  const isSelected = selectedAvatar === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => handleSelectAvatar(a.id)}
                      className={`p-2 rounded-xl bg-[#181B22] flex flex-col items-center justify-center text-xl transition-all border active:scale-95 ${
                        isSelected
                          ? "border-[#D9A441] text-[#D9A441] bg-[#181B22]"
                          : "border-white/5 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <span>{a.emoji}</span>
                      <span className="text-[8px] font-mono font-bold text-zinc-400 truncate max-w-full mt-1">
                        {a.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Username & Level */}
          <div className="flex items-center gap-1.5 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  maxLength={16}
                  className="px-2.5 py-1 bg-[#0F1115] border border-[#D9A441] rounded-lg text-sm font-bold text-[#E8E6E1] text-center focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={nameLoading}
                  className="p-1.5 rounded-lg bg-[#D9A441] text-[#0B0D12] font-black disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-serif font-bold text-[#E8E6E1]">
                  {profile.username === "Oyuncu" ? "Sinefil #3095" : profile.username}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-[#8A8F9A] hover:text-[#D9A441] transition-colors p-1"
                  title="İsmi Düzenle"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Level & Rank */}
          <div className="flex items-center gap-1 text-[11px] font-mono text-[#8A8F9A] mb-1">
            <span className="text-[#D9A441] font-bold">Seviye {currentRank.level}</span>
            <span>·</span>
            <span>{currentRank.title}</span>
          </div>

          {/* Favorite Director (Single line) */}
          <div className="relative mb-4">
            <button
              type="button"
              onClick={() => setShowDirectorPicker(!showDirectorPicker)}
              className="flex items-center gap-1 text-[11px] font-sans text-zinc-400 hover:text-white transition-colors"
            >
              <Clapperboard className="w-3 h-3 text-[#D9A441]" />
              <span>Favori Yönetmen:</span>
              <span className="font-semibold text-[#E8E6E1] underline decoration-[#D9A441]/40 underline-offset-2">
                {favoriteDirector}
              </span>
            </button>

            {showDirectorPicker && (
              <div className="absolute left-1/2 -translate-x-1/2 top-6 z-30 w-56 p-1.5 rounded-xl bg-[#0F1115] border border-white/10 shadow-xl max-h-36 overflow-y-auto custom-scrollbar animate-in fade-in">
                {FAVORITE_DIRECTORS.map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => handleSelectDirector(dir)}
                    className={`w-full text-left px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      favoriteDirector === dir
                        ? "bg-[#181B22] text-[#D9A441] font-bold"
                        : "text-[#E8E6E1] hover:bg-white/5"
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {nameError && (
          <div className="text-[10px] text-[#E5484D] font-mono mb-3 bg-[#E5484D]/10 px-2 py-1 rounded border border-[#E5484D]/30 text-center">
            {nameError}
          </div>
        )}

        {/* 3 Core Stats: Wins, Losses, Ratio */}
        <div className="w-full p-3 rounded-xl bg-[#0F1115] border border-white/5 text-center mb-3">
          <div className="flex items-center justify-center gap-1.5 mb-2 pb-1.5 border-b border-white/5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#D9A441]">
              SİNEFİL SİCİLİ
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
                GALİBİYET
              </span>
              <span className="text-base font-mono font-bold text-[#D9A441] mt-0.5 block">
                {profile.wins}
              </span>
            </div>
            <div className="border-x border-white/5">
              <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
                MAĞLUBİYET
              </span>
              <span className="text-base font-mono font-bold text-[#E5484D] mt-0.5 block">
                {profile.losses}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-mono font-bold text-[#8A8F9A] uppercase block">
                ORAN
              </span>
              <span className="text-base font-mono font-bold text-[#E8E6E1] mt-0.5 block">
                %{winRate}
              </span>
            </div>
          </div>
        </div>

        {/* Last 5 Matches: Film Strip of 5 mini frames */}
        <div className="w-full p-3 rounded-xl bg-[#0F1115] border border-white/5 mb-3 flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#8A8F9A] block">
              SON 5 MAÇ
            </span>
            <span className="text-[8px] text-zinc-500 font-sans">Form Şeridi</span>
          </div>

          <div className="flex items-center gap-1.5">
            {last5.map((res, idx) => {
              const isWin = res === "W";
              const isLoss = res === "L";
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                    isWin
                      ? "bg-[#D9A441]/10 text-[#D9A441] border-[#D9A441]/40"
                      : isLoss
                      ? "bg-[#E5484D]/10 text-[#E5484D] border-[#E5484D]/40"
                      : "bg-[#181B22] text-[#8A8F9A] border-white/5"
                  }`}
                >
                  {isWin ? "✓" : isLoss ? "✕" : "·"}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Settings: Sound & Haptics Toggles */}
        <div className="w-full pt-3 border-t border-white/5 space-y-1.5">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#0F1115] border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-[#8A8F9A]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#D9A441]" />
              )}
              <span className="font-sans text-[11px] text-[#E8E6E1]">Ses Efektleri</span>
            </div>
            <button
              type="button"
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-colors min-h-[44px] min-w-[54px] flex items-center justify-center ${
                !isMuted
                  ? "bg-[#181B22] text-[#D9A441] border border-[#D9A441]/40"
                  : "bg-[#14171D] text-[#8A8F9A] border border-white/5"
              }`}
            >
              {!isMuted ? "AÇIK" : "KAPALI"}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#0F1115] border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Smartphone className={`w-3.5 h-3.5 ${hapticOn ? "text-[#D9A441]" : "text-[#8A8F9A]"}`} />
              <span className="font-sans text-[11px] text-[#E8E6E1]">Titreşim &amp; Haptik</span>
            </div>
            <button
              type="button"
              onClick={toggleHaptic}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-colors min-h-[44px] min-w-[54px] flex items-center justify-center ${
                hapticOn
                  ? "bg-[#181B22] text-[#D9A441] border border-[#D9A441]/40"
                  : "bg-[#14171D] text-[#8A8F9A] border border-white/5"
              }`}
            >
              {hapticOn ? "AÇIK" : "KAPALI"}
            </button>
          </div>
        </div>

        {/* Account Status / Link */}
        <div className="w-full mt-2 p-2.5 rounded-xl bg-[#0F1115] border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-3.5 h-3.5 ${isAnonymousUser ? "text-[#8A8F9A]" : "text-[#D9A441]"}`} />
              <div>
                <div className="text-[10px] font-sans font-semibold text-[#E8E6E1]">
                  {isAnonymousUser ? "Misafir Hesabı" : "Bağlı Hesap"}
                </div>
                <div className="text-[8px] font-mono text-[#8A8F9A]">
                  {isAnonymousUser ? "Cihazınızda kayıtlı" : userEmail || "Buluta bağlı"}
                </div>
              </div>
            </div>

            {isAnonymousUser && (
              <button
                type="button"
                onClick={() => setShowLinkAccount(!showLinkAccount)}
                className="px-2 py-1 rounded-lg bg-[#181B22] border border-white/10 text-[9px] font-mono font-bold text-[#D9A441] hover:border-[#D9A441]/40 transition-colors"
              >
                {showLinkAccount ? "Kapat" : "Kaydet"}
              </button>
            )}
          </div>

          {isAnonymousUser && showLinkAccount && (
            <form
              onSubmit={handleLinkAccount}
              className="mt-2.5 pt-2 border-t border-white/5 space-y-1.5 animate-in fade-in"
            >
              <input
                type="email"
                placeholder="ornek@sinefil.com"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#14171D] border border-white/10 text-xs text-[#E8E6E1] placeholder-zinc-600 focus:outline-none focus:border-[#D9A441]"
              />
              <input
                type="password"
                placeholder="Şifre (en az 6 karakter)"
                value={linkPassword}
                onChange={(e) => setLinkPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#14171D] border border-white/10 text-xs text-[#E8E6E1] placeholder-zinc-600 focus:outline-none focus:border-[#D9A441]"
              />
              {linkMessage && (
                <div
                  className={`text-[9px] font-mono p-1 rounded text-center ${
                    linkMessage.type === "success"
                      ? "bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30"
                      : "bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30"
                  }`}
                >
                  {linkMessage.text}
                </div>
              )}
              <button
                type="submit"
                disabled={linkLoading}
                className="w-full py-2 rounded-lg bg-[#D9A441] text-[#0B0D12] text-xs font-black uppercase tracking-wider disabled:opacity-50"
              >
                {linkLoading ? "Bağlanıyor..." : "Hesabı Kilitle"}
              </button>
            </form>
          )}
        </div>

        {/* Micro-label at bottom */}
        <div className="text-center mt-3">
          <span className="text-[8px] font-mono tracking-widest text-[#8A8F9A] opacity-30 uppercase">
            KODAK 5219 · 35MM
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
