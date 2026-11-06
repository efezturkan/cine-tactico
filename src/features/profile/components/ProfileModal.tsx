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
  deleteUserAccount,
  isSupabaseConfigured,
} from "@/backend";
import {
  Edit3,
  Check,
  X,
  Camera,
  ChevronRight,
  ShieldCheck,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { AvatarIcon } from "@/components/ui/AvatarIcon";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n";

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
  isOpen?: boolean;
  isPage?: boolean;
  onClose?: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenArchive?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  initialTab?: "CAREER" | "DNA";
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen = true,
  isPage = false,
  onClose,
  profile,
  onUpdateProfile,
  onOpenArchive,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.username);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarId);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showDirectorPicker, setShowDirectorPicker] = useState(false);

  const [isAnonymousUser, setIsAnonymousUser] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLinkAccount, setShowLinkAccount] = useState<boolean>(false);
  const [linkEmail, setLinkEmail] = useState<string>("");
  const [linkPassword, setLinkPassword] = useState<string>("");
  const [linkLoading, setLinkLoading] = useState<boolean>(false);
  const [linkMessage, setLinkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState<boolean>(false);

  const [showResetLocalModal, setShowResetLocalModal] = useState<boolean>(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState<boolean>(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [isResettingLocal, setIsResettingLocal] = useState<boolean>(false);

  const { dict, locale, tBot } = useTranslation();
  const isEn = locale === "en";

  useEffect(() => {
    if (isOpen || isPage) {
      setTempName(profile.username);
      setSelectedAvatar(profile.avatarId);
    }
    if ((isOpen || isPage) && isSupabaseConfigured) {
      ensureAnonymousSession().then((auth) => {
        setIsAnonymousUser(auth.isAnonymous);
        setUserEmail(auth.user?.email || null);
      });
    }
  }, [isOpen, isPage, profile.username, profile.avatarId]);

  if (!isOpen && !isPage) return null;

  const currentRank = calculateRank(profile.wins);
  // 7D.4: Yeni kullanıcıda 0 / 0 / "—" (oran %0 değil)
  const winRateDisplay =
    profile.totalMatches > 0
      ? `%${Math.round((profile.wins / profile.totalMatches) * 100)}`
      : "—";

  const recent = (profile.lastFiveMatches ?? []).slice(-5);
  const favoriteDirector = profile.favoriteDirector || (isEn ? "Choose" : "Seç");

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
      setLinkMessage({ type: "error", text: "E-posta ve şifre yaz." });
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
      setLinkMessage({ type: "success", text: "Hesabın bağlandı." });
      setTimeout(() => setShowLinkAccount(false), 2500);
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

  const handleResetLocalData = () => {
    try {
      setIsResettingLocal(true);
      const localKeys = [
        "cinexox_player_profile",
        "cinexox_match_history",
        "cinexox_last_streak_date",
        "cinexox_last_streak_utc",
        "cinexox_salon_config",
        "cinexox_ipucu_ters",
        "cinexox_ipucu_konsept",
        "cinexox_rehber_v1",
      ];
      localKeys.forEach((key) => localStorage.removeItem(key));
      haptic.light();
      window.location.reload();
    } catch {
      setIsResettingLocal(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError(null);
    haptic.error();

    const res = await deleteUserAccount();
    if (!res.success) {
      setDeleteAccountError(res.error || "Hesap silinemedi.");
      setIsDeletingAccount(false);
      audio.playError();
      return;
    }

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("cinexox_") ||
            key.startsWith("cinetactico_") ||
            key.startsWith("sb-"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore
    }

    window.location.href = "/";
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

  const content = (
    <div className="w-full max-w-[430px] mx-auto flex flex-col select-none text-[#E8E6E1] p-4 sm:p-5">
      {/* 7D.1 Başlık: Serif 'Sinefil Kartı', mikro etiket yok, X yok */}
      <div className="text-center pb-4 mb-4 border-b border-white/5">
        <h1 className="text-3xl font-serif font-bold text-[#F1EEE7] tracking-wide">
          {dict.profile.title}
        </h1>
      </div>

      {/* Kimlik Bloğu: Avatar, İsim, Seviye, Favori Yönetmen */}
      <div className="flex flex-col items-center text-center">
        {/* Avatar + Kamera Rozeti */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setShowAvatarPicker(true)}
            className="w-20 h-20 rounded-2xl bg-[#181B22] border border-white/15 flex items-center justify-center shadow-md relative active:scale-95 transition-transform"
          >
            <AvatarIcon id={selectedAvatar} className="w-8 h-8 text-[#D9A441]" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#14171D] text-[#D9A441] border border-white/20 flex items-center justify-center shadow">
              <Camera className="w-3 h-3" />
            </div>
          </button>
        </div>

        {/* İsim Satırı & Kalem İkonu */}
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
              <h2 className="text-lg font-serif font-bold text-[#E8E6E1]">
                {profile.username}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-[#8A8F9A] hover:text-[#D9A441] transition-colors p-1"
                title={dict.profile.editName}
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 7D.3 Seviye Satırı: "Seviye 1 · Bilet Kontrolörü" */}
        <div className="text-xs font-sans text-[#8A8F9A] mb-1">
          <span>{isEn ? "Level" : "Seviye"} {currentRank.level} · {tBot(currentRank.title)}</span>
        </div>

        {/* 7D.3 Favori Yönetmen: Dokunulabilir (küçük ok, alt çizgi yok) */}
        <div className="relative mb-4">
          <button
            type="button"
            onClick={() => setShowDirectorPicker(true)}
            className="flex items-center gap-1 text-xs text-[#8A8F9A] hover:text-[#E8E6E1] transition-colors py-0.5"
          >
            <span>{isEn ? "Favorite director:" : "Favori yönetmen:"}</span>
            <span className="font-semibold text-[#E8E6E1] ml-0.5">{favoriteDirector}</span>
            <ChevronRight className="w-3 h-3 text-[#D9A441]" />
          </button>
        </div>
      </div>

      {nameError && (
        <div className="text-xs text-[#E5484D] mb-3 p-2 rounded-lg bg-[#E5484D]/10 border border-[#E5484D]/30 text-center">
          {nameError}
        </div>
      )}

      {/* 7D.4 Sinefil Sicili: Galibiyet / Mağlubiyet / Oran */}
      <div className="w-full p-3.5 rounded-xl bg-[#14171D] border border-white/10 text-center mb-3">
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#D9A441] block mb-2 pb-1.5 border-b border-white/5">
          {isEn ? "Cinephile record" : "Sinefil sicili"}
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[9px] font-sans font-bold text-[#8A8F9A] uppercase block">
              {dict.profile.wins}
            </span>
            <span className="text-lg font-mono font-bold text-[#D9A441] mt-0.5 block">
              {profile.wins}
            </span>
          </div>
          <div className="border-x border-white/5">
            <span className="text-[9px] font-sans font-bold text-[#8A8F9A] uppercase block">
              {dict.profile.losses}
            </span>
            <span className="text-lg font-mono font-bold text-[#8A8F9A] mt-0.5 block">
              {profile.losses}
            </span>
          </div>
          <div>
            <span className="text-[9px] font-sans font-bold text-[#8A8F9A] uppercase block">
              {dict.profile.winRate}
            </span>
            <span className="text-lg font-mono font-bold text-[#E8E6E1] mt-0.5 block">
              {winRateDisplay}
            </span>
          </div>
        </div>
      </div>

      {/* 7D.5 Son 5 Düello (Dokununca Arşiv açılır) */}
      <button
        type="button"
        onClick={() => {
          if (onOpenArchive) {
            audio.playSelect();
            onOpenArchive();
          }
        }}
        className="w-full p-3.5 rounded-xl bg-[#14171D] border border-white/10 hover:border-white/20 transition-all mb-3 flex items-center justify-between text-left"
      >
        <div>
          <span className="text-xs font-serif font-bold text-[#E8E6E1] block">
            {isEn ? "Last 5 duels" : "Son 5 düello"}
          </span>
          <span className="text-[10px] text-[#8A8F9A]">
            {recent.length === 0 ? (isEn ? "No duels yet." : "Henüz düello yok.") : (isEn ? "Review archive →" : "Arşivi incele →")}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {recent.length === 0 ? (
            <span className="text-xs text-[#8A8F9A] font-mono">—</span>
          ) : (
            recent.map((res, idx) => {
              const isWin = res === "W";
              const isLoss = res === "L";
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                    isWin
                      ? "bg-[#D9A441]/10 text-[#D9A441] border-[#D9A441]/40"
                      : isLoss
                      ? "bg-white/5 text-[#8A8F9A] border-white/10"
                      : "bg-[#181B22] text-[#8A8F9A] border-white/5"
                  }`}
                >
                  {isWin ? "✓" : isLoss ? "✕" : "·"}
                </div>
              );
            })
          )}
        </div>
      </button>

      {/* 7D.7 Hesap Satırı: "Misafir hesabı. Cihazında kayıtlı." + [HESAP OLUŞTUR] */}
      {isSupabaseConfigured && (
      <div className="w-full p-3.5 rounded-xl bg-[#14171D] border border-white/10 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isAnonymousUser ? "text-[#8A8F9A]" : "text-[#D9A441]"}`} />
            <div>
              <div className="text-xs font-bold text-[#E8E6E1]">
                {isAnonymousUser ? (isEn ? "Guest session" : "Misafir hesabı") : (isEn ? "Registered account" : "Kayıtlı hesap")}
              </div>
              <div className="text-[10px] text-[#8A8F9A]">
                {isAnonymousUser ? (isEn ? "Saved on device." : "Cihazında kayıtlı.") : userEmail || (isEn ? "Cloud linked" : "Buluta bağlı")}
              </div>
            </div>
          </div>

          {isAnonymousUser && (
            <Button
              variant="inline"
              onClick={() => setShowLinkAccount(!showLinkAccount)}
            >
              {showLinkAccount ? dict.common.close : dict.profile.linkAccount}
            </Button>
          )}
        </div>

        {isAnonymousUser && showLinkAccount && (
          <form
            onSubmit={handleLinkAccount}
            className="mt-3 pt-3 border-t border-white/5 space-y-2 animate-in fade-in"
          >
            <input
              type="email"
              placeholder={isEn ? "user@cinephile.com" : "ornek@sinefil.com"}
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#0B0D12] border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#8A8F9A]/40 focus:outline-none focus:border-[#D9A441]"
            />
            <input
              type="password"
              placeholder={isEn ? "Password (min 6 characters)" : "Şifre (en az 6 karakter)"}
              value={linkPassword}
              onChange={(e) => setLinkPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg bg-[#0B0D12] border border-white/10 text-xs text-[#E8E6E1] placeholder:text-[#8A8F9A]/40 focus:outline-none focus:border-[#D9A441]"
            />
            {linkMessage && (
              <div
                className={`text-xs p-1.5 rounded text-center ${
                  linkMessage.type === "success"
                    ? "bg-[#D9A441]/10 text-[#D9A441] border border-[#D9A441]/30"
                    : "bg-[#E5484D]/10 text-[#E5484D] border border-[#E5484D]/30"
                }`}
              >
                {linkMessage.text}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={linkLoading}
            >
              {linkLoading ? dict.common.loading : dict.common.confirm}
            </Button>
          </form>
        )}
      </div>
      )}

      {/* Veri ve Gizlilik Yönetimi (Apple 5.1.1(v) Uyumlu) */}
      <div className="p-3.5 rounded-xl bg-[#14171D] border border-white/5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8A8F9A]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8A8F9A]">
              {dict.profile.dataPrivacy}
            </span>
          </div>
          <a
            href="/privacy"
            className="text-[10px] font-mono text-[#D9A441] hover:underline"
          >
            {dict.profile.readPolicy}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setShowResetLocalModal(true);
            }}
            className="p-2.5 rounded-lg bg-[#0B0D12] border border-white/10 text-left hover:border-white/20 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E8E6E1]">
              <RotateCcw className="w-3.5 h-3.5 text-[#8A8F9A]" />
              <span>{dict.profile.resetLocal}</span>
            </div>
            <p className="text-[10px] text-[#8A8F9A] mt-1 line-clamp-1">
              {dict.profile.resetLocalSub}
            </p>
          </button>

          {isSupabaseConfigured && (
          <button
            type="button"
            onClick={() => {
              audio.playSelect();
              setDeleteAccountError(null);
              setShowDeleteAccountModal(true);
            }}
            className="p-2.5 rounded-lg bg-[#E5484D]/10 border border-[#E5484D]/30 text-left hover:bg-[#E5484D]/20 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E5484D]">
              <Trash2 className="w-3.5 h-3.5 text-[#E5484D]" />
              <span>{dict.profile.deleteAccount}</span>
            </div>
            <p className="text-[10px] text-[#E5484D]/70 mt-1 line-clamp-1">
              {dict.profile.deleteAccountSub}
            </p>
          </button>
          )}
        </div>
      </div>

      {/* 7D.8 Alt Etiket */}
      <div className="text-center mt-2">
        <span className="text-[9px] font-mono tracking-widest text-[#8A8F9A] opacity-40 uppercase">
          35MM · 24 FPS
        </span>
      </div>

      {/* 7D.2 Avatar Seçici Alt Sheet */}
      {showAvatarPicker && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAvatarPicker(false);
          }}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm select-none"
        >
          <div className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-4 sm:p-5 flex flex-col max-h-[85dvh] shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h2 className="font-serif text-base font-bold text-[#E8E6E1]">
                Avatar Seç
              </h2>
              <Button
                variant="icon"
                onClick={() => setShowAvatarPicker(false)}
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 8 Tek Renk Çizgi İkon, Tek Kelime Etiketler, Kesilmez */}
            <div className="grid grid-cols-4 gap-2.5 py-4">
              {AVATAR_OPTIONS.map((a) => {
                const isSelected = selectedAvatar === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelectAvatar(a.id)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all border active:scale-95 ${
                      isSelected
                        ? "bg-[#181B22] border-[#D9A441] text-[#D9A441]"
                        : "bg-[#0B0D12] border-white/5 text-[#8A8F9A] hover:text-[#E8E6E1] hover:border-white/15"
                    }`}
                  >
                    <AvatarIcon id={a.id} className="w-6 h-6" />
                    <span className="text-[10px] font-sans font-bold truncate max-w-full">
                      {a.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Yönetmen Seçici Alt Sheet */}
      {showDirectorPicker && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDirectorPicker(false);
          }}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-sm select-none"
        >
          <div className="w-full max-w-lg mx-auto bg-[#14171D] border-t border-x border-white/10 rounded-t-[24px] p-4 sm:p-5 flex flex-col max-h-[80dvh] shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3 shrink-0" />
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h2 className="font-serif text-base font-bold text-[#E8E6E1]">
                Favori Yönetmen
              </h2>
              <Button
                variant="icon"
                onClick={() => setShowDirectorPicker(false)}
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 py-3 pr-1 custom-scrollbar">
              {FAVORITE_DIRECTORS.map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => handleSelectDirector(dir)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-sans font-medium transition-colors border ${
                    favoriteDirector === dir
                      ? "bg-[#181B22] border-[#D9A441] text-[#D9A441] font-bold"
                      : "bg-[#0B0D12] border-white/5 text-[#E8E6E1] hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Yerel Veri Sıfırlama Onay Modalı */}
      {showResetLocalModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isResettingLocal) setShowResetLocalModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
        >
          <div className="w-full max-w-sm bg-[#14171D] border border-white/10 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8A8F9A]">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#E8E6E1]">
                  {isEn ? "Reset Local Data" : "Yerel Verileri Sıfırla"}
                </h3>
                <span className="text-[10px] font-mono text-[#8A8F9A]">
                  {isEn ? "Device Cache Cleanup" : "Cihaz Önbelleği Temizliği"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#8A8F9A] leading-relaxed">
              {isEn
                ? "This clears offline bot match records, auditorium ambience preferences, and UI onboarding flags stored on this device."
                : "Bu işlem cihazınızda kayıtlı çevrimdışı bot maç geçmişini, salon ambiyans tercihlerinizi ve arayüz ipuçlarını sıfırlar."}
            </p>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
              {isEn
                ? "✓ Your online rating, titles, and server profile are KEPT SAFE on the server."
                : "✓ Çevrimiçi lig dereceniz, unvanınız ve profiliniz sunucuda KORUNUR."}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                fullWidth
                disabled={isResettingLocal}
                onClick={() => setShowResetLocalModal(false)}
              >
                {dict.common.cancel}
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={isResettingLocal}
                onClick={handleResetLocalData}
              >
                {isResettingLocal ? (isEn ? "Resetting..." : "Sıfırlanıyor...") : (isEn ? "Reset" : "Sıfırla")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hesabı ve Tüm Verileri Silme Onay Modalı (Apple 5.1.1(v)) */}
      {showDeleteAccountModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingAccount) setShowDeleteAccountModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
        >
          <div className="w-full max-w-sm bg-[#14171D] border border-[#E5484D]/40 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/30 flex items-center justify-center text-[#E5484D]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">
                  {isEn ? "Delete Account & All Data" : "Hesabı ve Tüm Verileri Sil"}
                </h3>
                <span className="text-[10px] font-mono text-[#E5484D]">Apple Guideline 5.1.1(v)</span>
              </div>
            </div>

            <p className="text-xs text-[#E8E6E1]/90 leading-relaxed">
              {isEn ? (
                <>
                  This action is <strong className="text-[#E5484D]">IRREVERSIBLE</strong>. Your anonymous account, rank title, rating, reels balance, and stats on Supabase will be <strong>PERMANENTLY DESTROYED</strong>.
                </>
              ) : (
                <>
                  Bu işlem <strong className="text-[#E5484D]">GERİ ALINAMAZ</strong>. Supabase üzerindeki anonim oyuncu hesabınız, unvanınız, lig dereceniz, makara bakiyeniz ve tüm istatistikleriniz <strong>KALICI OLARAK YOK EDİLECEKTİR</strong>.
                </>
              )}
            </p>

            <div className="p-2.5 rounded-lg bg-[#E5484D]/10 border border-[#E5484D]/25 text-[11px] text-[#E5484D] leading-tight">
              {isEn
                ? "⚠ Your user references in multiplayer match records will be unlinked (set to null), while your personal profile is completely deleted."
                : "⚠ Çok oyunculu maç kayıtlarındaki kullanıcı bağlantınız kaldırılacak (oyuncu kimliği sıfırlanacak), kişisel profiliniz tamamen silinecektir."}
            </div>

            {deleteAccountError && (
              <div className="p-2 rounded bg-[#E5484D]/20 border border-[#E5484D]/40 text-xs text-[#E5484D] text-center">
                {deleteAccountError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                fullWidth
                disabled={isDeletingAccount}
                onClick={() => setShowDeleteAccountModal(false)}
              >
                {dict.common.cancel}
              </Button>
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={handleConfirmDeleteAccount}
                className="w-full py-2.5 px-3 rounded-lg bg-[#E5484D] hover:bg-[#E5484D]/90 text-white font-bold text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
              >
                {isDeletingAccount ? (isEn ? "Deleting..." : "Siliniyor...") : (isEn ? "Permanently Delete Account" : "Hesabı Kalıcı Olarak Sil")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isPage) {
    return (
      <div className="w-full max-w-[430px] min-h-[100dvh] bg-[#0B0D12] flex flex-col pt-4 pb-28">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-2xl bg-[#0B0D12] border border-white/10 shadow-2xl overflow-hidden relative">
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

export default ProfileModal;
