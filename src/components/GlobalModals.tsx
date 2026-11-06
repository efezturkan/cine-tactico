"use client";

import React from "react";
import { UserProfile } from "@/types/profile";
import { GameBoard, CellAnswer, CustomRoomSettings, ContentPoolType, GameMode, PlayerSymbol } from "@/core";
import { BotOpponentProfile } from "@/data/boards";

import {
  CustomRoomModal,
  MatchFoundModal,
  MatchmakingQueueModal,
} from "@/features/multiplayer";

import {
  ProfileModal,
  LeaderboardModal,
  QuestsModal,
  ShopModal,
} from "@/features/profile";

import {
  DailyShareModal,
  OpponentPickerSheet,
} from "@/components";
import { HowToPlayModal } from "./HowToPlayModal";
import { BotRecordBook } from "@/utils/botRecord";

import NotificationPanel, { NotifToast, useNotifications } from "@/components/NotificationPanel";
import { FLAGS } from "@/config/flags";

export interface GlobalModalsProps {
  showMatchmakingQueue: boolean;
  showMatchFound: boolean;
  showDailyShare: boolean;
  showCustomLobby: boolean;
  showQuests: boolean;
  showShop: boolean;
  showProfile: boolean;
  profileInitialTab?: "CAREER" | "DNA";
  showHelp: boolean;
  showLeaderboard: boolean;
  showNotifications: boolean;
  showOpponentPicker: boolean;

  profile: UserProfile;
  queueMode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL";
  queueDifficulty: "EASY" | "NORMAL" | "HARD";
  botRecords: BotRecordBook;
  contentPool: ContentPoolType;
  pendingOpponent: BotOpponentProfile;
  board: GameBoard;
  cells: (CellAnswer | null)[];
  totalArcadeScore: number;
  mode: GameMode;
  winner: PlayerSymbol | "DRAW" | null;
  muted: boolean;
  claimedDaily: boolean;
  claimedQuestIds: string[];

  onPickOpponent: (bot: BotOpponentProfile) => void;
  onCloseOpponentPicker: () => void;
  onCloseMatchmakingQueue: () => void;
  onQueueMatchFound: () => void;
  onQueuePlayWithAiImmediately: () => void;
  onMatchFoundCountdownComplete: () => void;
  onCloseDailyShare: () => void;
  onCloseCustomLobby: () => void;
  onCreateCustomRoom: (settings: CustomRoomSettings, optionalBoard?: GameBoard) => void;
  onJoinCustomRoom?: (roomCode: string, settings: CustomRoomSettings, board: GameBoard) => void;
  onCloseQuests: () => void;
  onClaimDailyReward: (reels: number) => void;
  onClaimQuest: (qId: string, reels: number) => void;
  onCloseShop: () => void;
  onSelectAvatar: (avatarId: string) => void;
  onBuyAvatar: (avatarId: string, price: number) => void;
  onCloseProfile: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onToggleMute: () => void;
  onCloseHelp: () => void;
  onCloseLeaderboard: () => void;
  onCloseNotifications: () => void;
}

export function GlobalModals(props: GlobalModalsProps) {
  const { notifications, activeToast, dismissToast } = useNotifications();

  return (
    <>
      <MatchmakingQueueModal
        isOpen={props.showMatchmakingQueue}
        userProfile={props.profile}
        selectedMode={props.queueMode}
        contentPool={props.contentPool}
        difficulty={props.queueDifficulty}
        onCancel={props.onCloseMatchmakingQueue}
        onMatchFound={props.onQueueMatchFound}
        onPlayWithAiImmediately={props.onQueuePlayWithAiImmediately}
      />

      <OpponentPickerSheet
        isOpen={props.showOpponentPicker}
        records={props.botRecords}
        onPick={props.onPickOpponent}
        onClose={props.onCloseOpponentPicker}
      />

      <MatchFoundModal
        isOpen={props.showMatchFound}
        userProfile={props.profile}
        opponentName={props.pendingOpponent.name}
        opponentAvatarId={props.pendingOpponent.avatarId}
        opponentLevel={props.pendingOpponent.level}
        opponent={props.pendingOpponent}
        record={props.botRecords[props.pendingOpponent.name]}
        boardTitle={props.board.title}
        onCountdownComplete={props.onMatchFoundCountdownComplete}
      />

      <DailyShareModal
        isOpen={props.showDailyShare || (props.mode === "DAILY_SOLO" && props.winner !== null)}
        onClose={props.onCloseDailyShare}
        cells={props.cells}
      />

      <CustomRoomModal
        isOpen={props.showCustomLobby}
        onClose={props.onCloseCustomLobby}
        onCreateRoom={props.onCreateCustomRoom}
        onJoinRoom={props.onJoinCustomRoom}
      />

      {FLAGS.SHOW_DAILY_QUESTS && (
        <QuestsModal
          isOpen={props.showQuests}
          onClose={props.onCloseQuests}
          dailyStreak={props.profile.dailyStreak}
          onClaimDaily={props.onClaimDailyReward}
          claimedDaily={props.claimedDaily}
          claimedQuestIds={props.claimedQuestIds}
          onClaimQuest={props.onClaimQuest}
        />
      )}

      {FLAGS.SHOW_COIN_ECONOMY && (
        <ShopModal
          isOpen={props.showShop}
          onClose={props.onCloseShop}
          profile={props.profile}
          onSelectAvatar={props.onSelectAvatar}
          onBuyAvatar={props.onBuyAvatar}
        />
      )}

      <ProfileModal
        isOpen={props.showProfile}
        onClose={props.onCloseProfile}
        profile={props.profile}
        onUpdateProfile={props.onUpdateProfile}
        isMuted={props.muted}
        onToggleMute={props.onToggleMute}
        initialTab={props.profileInitialTab}
      />

      {FLAGS.SHOW_LEAGUE_BAR && (
        <LeaderboardModal
          isOpen={props.showLeaderboard}
          onClose={props.onCloseLeaderboard}
          currentUser={props.profile}
        />
      )}

      {FLAGS.SHOW_NOTIFICATIONS && (
        <NotificationPanel
          isOpen={props.showNotifications}
          onClose={props.onCloseNotifications}
          notifications={notifications}
        />
      )}

      {FLAGS.SHOW_NOTIFICATIONS && activeToast && (
        <NotifToast
          notif={activeToast}
          onDismiss={dismissToast}
        />
      )}

      {/* Tur 10C: 4. İsteğe bağlı erişim tekil Nasıl Oynanır Modalı */}
      <HowToPlayModal
        isOpen={props.showHelp}
        onClose={props.onCloseHelp}
      />
    </>
  );
}
