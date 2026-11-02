"use client";

import React from "react";
import { Ticket, Film, Swords, User } from "lucide-react";
import { audio } from "@/utils/audio";

export type NavTabId = "HOME" | "GAME_SELECT" | "CUSTOM_ROOM" | "PROFILE";

interface BottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: "HOME" as NavTabId,
      label: "Gişe",
      icon: Ticket,
    },
    {
      id: "GAME_SELECT" as NavTabId,
      label: "Vizyondakiler",
      icon: Film,
    },
    {
      id: "CUSTOM_ROOM" as NavTabId,
      label: "Özel Gösterim",
      icon: Swords,
    },
    {
      id: "PROFILE" as NavTabId,
      label: "Sinefil Kartı",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Ana gezinme çubuğu"
      className="fixed bottom-0 left-0 right-0 flex items-center justify-around px-2 sm:px-3 z-40 max-w-[430px] mx-auto w-full"
      style={{
        background: "rgba(11, 13, 18, 0.96)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(12px)",
        paddingTop: "0.45rem",
        paddingBottom: "max(0.55rem, env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (!isActive) {
                audio.playSelect();
                onSelectTab(tab.id);
              }
            }}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[56px] transition-all active:scale-95 px-3 py-1 rounded-xl ${
              isActive
                ? "bg-[#181B22] border border-[#D9A441]/40"
                : "hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon
              className="w-4 h-4 stroke-[1.8]"
              style={{ color: isActive ? "#D9A441" : "#8A8F9A" }}
            />
            <span
              className="text-[9px] font-bold mt-0.5 tracking-wide"
              style={{ color: isActive ? "#D9A441" : "#8A8F9A" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
