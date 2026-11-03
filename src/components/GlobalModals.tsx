"use client";

import React from "react";
import { UserProfile, CinemaAmbience, DEFAULT_AMBIENCE } from "@/types/profile";
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
  GameModesHubModal,
  DailyShareModal,
  LiveAmbienceConsole,
} from "@/components";

import NotificationPanel, { NotifToast, useNotifications } from "@/components/NotificationPanel";
import { FLAGS } from "@/config/flags";

export interface GlobalModalsProps {
  showMatchmakingQueue: boolean;
  showMatchFound: boolean;
  showDailyShare: boolean;
  showCustomLobby: boolean;
  showQuests: boolean;
  showShop: boolean;
  showGameModesHub: boolean;
  showProfile: boolean;
  profileInitialTab?: "CAREER" | "DNA" | "AMBIENCE";
  showHelp: boolean;
  showLeaderboard: boolean;
  showAmbienceConsole: boolean;
  showNotifications: boolean;

  profile: UserProfile;
  queueMode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL";
  queueDifficulty: "EASY" | "NORMAL" | "HARD";
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
  onCloseGameModesHub: () => void;
  onSelectPlayableBoard: (idx: number, title: string) => void;
  onCloseProfile: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onToggleMute: () => void;
  onCloseHelp: () => void;
  onCloseLeaderboard: () => void;
  onCloseAmbienceConsole: () => void;
  onUpdateAmbience: (updated: Partial<CinemaAmbience>) => void;
  onResetAmbience: () => void;
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

      <MatchFoundModal
        isOpen={props.showMatchFound}
        userProfile={props.profile}
        opponentName={props.pendingOpponent.name}
        opponentAvatarId={props.pendingOpponent.avatarId}
        opponentLevel={props.pendingOpponent.level}
        opponentRankTitle={props.pendingOpponent.rankTitle}
        opponentWinRate={props.pendingOpponent.winRate}
        boardTitle={props.board.title}
        onCountdownComplete={props.onMatchFoundCountdownComplete}
      />

      <DailyShareModal
        isOpen={props.showDailyShare || (props.mode === "DAILY_SOLO" && props.winner !== null)}
        onClose={props.onCloseDailyShare}
        board={props.board}
        cells={props.cells}
        score={props.totalArcadeScore}
      />

      <CustomRoomModal
        isOpen={props.showCustomLobby}
        onClose={props.onCloseCustomLobby}
        currentUser={props.profile}
        onCreateRoom={props.onCreateCustomRoom}
        onJoinRoom={props.onJoinCustomRoom}
      />

      {FLAGS.SHOW_DAILY_QUESTS && (
        <QuestsModal
          isOpen={props.showQuests}
          onClose={props.onCloseQuests}
          reelsBalance={props.profile.reelsBalance}
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

      <GameModesHubModal
        isOpen={props.showGameModesHub}
        onClose={props.onCloseGameModesHub}
        onSelectPlayableBoard={props.onSelectPlayableBoard}
      />

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

      {FLAGS.SHOW_HEADER_AMBIENCE_BUTTON && (
        <LiveAmbienceConsole
          isOpen={props.showAmbienceConsole}
          onClose={props.onCloseAmbienceConsole}
          ambience={props.profile.ambience || DEFAULT_AMBIENCE}
          onUpdateAmbience={props.onUpdateAmbience}
          onResetAmbience={props.onResetAmbience}
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
    </>
  );
}
