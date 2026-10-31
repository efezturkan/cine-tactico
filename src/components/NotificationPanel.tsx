"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, X, Film, Swords, Trophy, Flame, Zap, Clock, ChevronRight } from "lucide-react";

export interface CineNotification {
  id: string;
  type: "daily" | "tournament" | "opponent" | "event" | "streak" | "new_board" | "promo";
  title: string;
  body: string;
  cta?: string;
  onCta?: () => void;
  timestamp: Date;
  read: boolean;
}

const NOTIF_ICONS: Record<CineNotification["type"], React.ReactNode> = {
  daily: <Film className="w-4 h-4 text-amber-400" />,
  tournament: <Trophy className="w-4 h-4 text-amber-400" />,
  opponent: <Swords className="w-4 h-4 text-[#8b151b]" />,
  event: <Zap className="w-4 h-4 text-amber-400" />,
  streak: <Flame className="w-4 h-4 text-orange-500" />,
  new_board: <Film className="w-4 h-4 text-purple-400" />,
  promo: <Zap className="w-4 h-4 text-emerald-400" />,
};

const NOTIF_COLORS: Record<CineNotification["type"], string> = {
  daily: "border-amber-500/40 bg-amber-500/5",
  tournament: "border-amber-500/40 bg-amber-500/5",
  opponent: "border-[#8b151b]/60 bg-[#8b151b]/10",
  event: "border-amber-500/40 bg-amber-500/5",
  streak: "border-orange-500/40 bg-orange-500/5",
  new_board: "border-purple-500/40 bg-purple-500/5",
  promo: "border-emerald-500/40 bg-emerald-500/5",
};

// Default demo notifications – in prod, replace with server push
const DEFAULT_NOTIFS: CineNotification[] = [
  {
    id: "n1",
    type: "opponent",
    title: "Rakip seni bekliyor! ⚔️",
    body: "Donk666 seni 1v1 düelloya davet etti. 3 dakikada kabul et yoksa lobileri kapanır.",
    cta: "Düelloya Gir",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
  },
  {
    id: "n2",
    type: "event",
    title: "⚡ DC vs MARVEL Başlıyor!",
    body: "Bu haftasonu özel DC vs MARVEL arenası açık. 2x Makara kazanmak için hemen oyna.",
    cta: "Arene Katıl",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
  },
  {
    id: "n3",
    type: "daily",
    title: "Günün Kadresi seni bekliyor 🎬",
    body: "Bugünkü sinema bulmacasını henüz çözmedin. Seri devam etsin!",
    cta: "Şimdi Oyna",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
  },
  {
    id: "n4",
    type: "streak",
    title: "Serin tehlikede! 🔥",
    body: "3 günlük seriniz var. Bugün oynamazsan sifirdan başlarsın. Koruma al veya oyna.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "n5",
    type: "tournament",
    title: "Turnuva sona eriyor ⏳",
    body: "Klasik Sinefil Turnuvası 45 dakika sonra kapanıyor. Şu an 7. sıradasın.",
    cta: "Tabloya Bak",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
  },
];

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return "az önce";
  if (secs < 3600) return `${Math.floor(secs / 60)} dk önce`;
  if (secs < 86400) return `${Math.floor(secs / 3600)} sa önce`;
  return `${Math.floor(secs / 86400)} gün önce`;
}

// ─── Bell Icon with Badge ───────────────────────────────────────────
interface NotifBellProps {
  unreadCount: number;
  onClick: () => void;
}

export const NotifBell: React.FC<NotifBellProps> = ({ unreadCount, onClick }) => (
  <button
    onClick={onClick}
    className="relative p-2 rounded-xl bg-[#0e1018] border border-[#1a1c24] hover:border-[#8b151b]/50 text-zinc-400 hover:text-white transition-all active:scale-95"
    title="Bildirimler"
  >
    <Bell className="w-4 h-4" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#8b151b] text-white text-[9px] font-black flex items-center justify-center border border-[#07080b] shadow-lg animate-pulse">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    )}
  </button>
);

// ─── Inline Toast Banner (home screen top) ─────────────────────────
interface NotifToastProps {
  notif: CineNotification;
  onDismiss: () => void;
  onCta?: () => void;
}

export const NotifToast: React.FC<NotifToastProps> = ({ notif, onDismiss, onCta }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="notif-enter fixed top-2 left-2 right-2 z-[999] max-w-md mx-auto">
      <div className={`flex items-start gap-3 p-3 rounded-2xl border backdrop-blur-md shadow-2xl ${NOTIF_COLORS[notif.type]}`}
        style={{ background: "rgba(7,8,11,0.95)" }}>
        <div className="w-8 h-8 rounded-xl bg-[#0e1018] border border-[#1a1c24] flex items-center justify-center shrink-0">
          {NOTIF_ICONS[notif.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black text-white leading-tight">{notif.title}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{notif.body}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {notif.cta && onCta && (
            <button
              onClick={() => { onCta(); onDismiss(); }}
              className="text-[10px] font-black text-[#d97706] bg-[#d97706]/10 border border-[#d97706]/30 px-2 py-1 rounded-lg hover:bg-[#d97706]/20 transition-all active:scale-95"
            >
              {notif.cta}
            </button>
          )}
          <button onClick={onDismiss} className="p-1 text-zinc-500 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Full Notification Panel (slide-down drawer) ────────────────────
interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: CineNotification[];
  onMarkAllRead?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications = DEFAULT_NOTIFS,
  onMarkAllRead,
}) => {
  const [items, setItems] = useState<CineNotification[]>(notifications);

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const dismiss = (id: string) => {
    setItems(prev => prev.filter(n => n.id !== id));
  };

  const unread = items.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 left-0 right-0 z-[91] max-w-md mx-auto notif-enter"
        style={{ maxHeight: "80vh" }}
      >
        <div
          className="relative overflow-hidden rounded-b-3xl border-b border-x border-[#2a1518]"
          style={{
            background: "linear-gradient(to bottom, #07080b, #0b0a0c)",
            boxShadow: "0 20px 60px rgba(139,21,27,0.3), 0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {/* Velvet top border accent */}
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#8b151b] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1c24]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8b151b]" />
              <span className="text-sm font-black text-white tracking-wide">BİLDİRİMLER</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#8b151b] text-white text-[9px] font-black">
                  {unread} yeni
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-black text-[#d97706] hover:text-amber-300 transition-colors"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-[#0e1018] border border-[#1a1c24] text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "65vh" }}>
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 font-bold">Henüz bildirim yok</p>
                <p className="text-[10px] text-zinc-600 mt-1">Maç başladığında burada görürsün</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1a1c24]">
                {items.map(notif => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#0e1018]/60 ${
                      !notif.read ? "bg-[#8b151b]/5" : ""
                    }`}
                  >
                    {/* Unread dot */}
                    <div className="pt-1 shrink-0">
                      {!notif.read ? (
                        <div className="w-2 h-2 rounded-full bg-[#8b151b] shadow-sm shadow-red-900/50" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-transparent" />
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${NOTIF_COLORS[notif.type]}`}>
                      {NOTIF_ICONS[notif.type]}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-black leading-tight ${!notif.read ? "text-white" : "text-zinc-300"}`}>
                        {notif.title}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 leading-snug line-clamp-2">
                        {notif.body}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-bold text-zinc-600 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(notif.timestamp)}
                        </span>
                        {notif.cta && (
                          <button className="text-[9px] font-black text-[#d97706] flex items-center gap-0.5 hover:text-amber-300 transition-colors">
                            {notif.cta} <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Dismiss */}
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="p-1 text-zinc-700 hover:text-zinc-400 transition-colors shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[#1a1c24] text-center">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
              FRAME #{Math.floor(Math.random() * 900 + 100)} · KODAK 35mm
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Hook: manages notification state ──────────────────────────────
export function useNotifications(onOpenDaily?: () => void) {
  const [notifications, setNotifications] = useState<CineNotification[]>(DEFAULT_NOTIFS);
  const [showPanel, setShowPanel] = useState(false);
  const [activeToast, setActiveToast] = useState<CineNotification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Show first unread toast on mount after 2s
  useEffect(() => {
    const firstUnread = notifications.find(n => !n.read);
    if (firstUnread) {
      const t = setTimeout(() => setActiveToast(firstUnread), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismissToast = useCallback(() => setActiveToast(null), []);

  const openPanel = useCallback(() => {
    setActiveToast(null);
    setShowPanel(true);
  }, []);

  const closePanel = useCallback(() => setShowPanel(false), []);

  return {
    notifications,
    unreadCount,
    showPanel,
    activeToast,
    dismissToast,
    openPanel,
    closePanel,
  };
}

export default NotificationPanel;
