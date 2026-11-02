"use client";

import React from "react";
import {
  GameBoard,
  CellAnswer,
  PlayerSymbol,
  GameMode,
  BotDifficulty,
  ContentPoolType,
  Movie,
} from "@/core";
import { UserProfile, DEFAULT_AMBIENCE, AMBIENCE_THEMES } from "@/types/profile";
import { BotOpponentProfile } from "@/data/boards";
import { Header } from "@/components/Header";
import { ShotClock } from "./ShotClock";
import { XoxBoard } from "./XoxBoard";
import { ComboBanner } from "./ComboBanner";
import { TabletSidePanel } from "./TabletSidePanel";
import { MovieSearchModal } from "./MovieSearchModal";
import { ActorSearchModal } from "./ActorSearchModal";
import { GoldenReelModal } from "./GoldenReelModal";
import { PostGameAnalysisModal } from "./PostGameAnalysisModal";

import {
  ShieldAlert,
  Swords,
  Lightbulb,
} from "lucide-react";

export interface GameViewProps {
  board: GameBoard;
  boardIndex: number;
  cells: (CellAnswer | null)[];
  currentTurn: PlayerSymbol;
  winner: PlayerSymbol | "DRAW" | null;
  winningLine: [number, number, number] | null;
  secondsRemaining: number;
  customShotClock: number;
  isBotThinking: boolean;
  botStatusMessage: string;
  scoreX: number;
  scoreO: number;
  scoreRarityX: number;
  scoreRarityO: number;
  comboStreak: number;
  lastEarnedPoints: number;
  totalArcadeScore: number;
  mode: GameMode;
  botDifficulty: BotDifficulty;
  allowSteal: boolean;
  customRoomCode: string | null;
  profile: UserProfile;
  muted: boolean;
  hintMessage: string | null;
  activeCellIndex: number | null;
  movieSearchError: string | null;
  usedMovieIds: string[];
  contentPool: ContentPoolType;
  isGoldenReelActive: boolean;
  goldenReelQuestion: string;
  showSurrenderConfirm: boolean;
  pendingSwitchMode: GameMode | null;
  pendingOpponent: BotOpponentProfile;
  pendingBoardIndex: number;

  onToggleMute: () => void;
  onHeaderReset: () => void;
  onRequestExitGame: () => void;
  onOpenQuests: () => void;
  onOpenProfile: () => void;
  onOpenHelp: () => void;
  onOpenDailyShare: () => void;
  onSwitchMode: (newMode: GameMode) => void;
  onSelectDifficulty: (diff: BotDifficulty) => void;
  onNextBoard: () => void;
  onCellSelect: (index: number) => void;
  onCloseSearchModal: () => void;
  onMovieChosen: (movie: Movie) => void;
  onActorChosen: (actor: string) => void;
  onResolveGoldenReelAnswer: (movie: Movie, playerSymbol: PlayerSymbol) => { success: boolean; message?: string };
  onResolveGoldenReelTimeout: () => void;
  onPlayAgain: () => void;
  onBackToHome: () => void;
  onCancelSurrender: () => void;
  onConfirmSurrender: () => void;
}

export function GameView(props: GameViewProps) {
  const gameAmbience = { ...DEFAULT_AMBIENCE, ...(props.profile?.ambience || {}) };
  const gameTheme = (gameAmbience.theme && AMBIENCE_THEMES[gameAmbience.theme]) || AMBIENCE_THEMES.velvet_red;
  const safeGameDimness =
    typeof gameAmbience.dimness === "number" && !isNaN(gameAmbience.dimness) ? gameAmbience.dimness : 85;
  const safeGameGlow =
    typeof gameAmbience.glowIntensity === "number" && !isNaN(gameAmbience.glowIntensity)
      ? gameAmbience.glowIntensity
      : 65;

  return (
    <div
      className="min-h-[100dvh] text-[#F1EEE7] flex flex-col font-sans select-none antialiased transition-colors duration-500 relative"
      style={{
        backgroundColor: gameTheme?.bgColor || "#0F1115",
        filter: `brightness(${Math.min(1.1, Math.max(0.65, safeGameDimness / 85))})`,
      }}
    >
      {/* 35mm Analog Film Grain Overlay in Game */}
      {gameAmbience.grain && gameAmbience.grain !== "OFF" && (
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen transition-opacity duration-300"
          style={{
            opacity: gameAmbience.grain === "VINTAGE" ? 0.16 : 0.08,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* Top Header */}
      <Header
        scoreX={props.scoreX}
        scoreO={props.scoreO}
        currentTurn={props.currentTurn}
        onReset={props.onHeaderReset}
        isMuted={props.muted}
        onToggleMute={props.onToggleMute}
        reelsBalance={props.profile.reelsBalance}
        userAvatarId={props.profile.avatarId}
        onBackToHome={props.onRequestExitGame}
        onOpenHelp={props.onOpenHelp}
        onOpenQuests={props.onOpenQuests}
      />

      {/* Block Blast Floating Combo Pop-up */}
      <ComboBanner comboStreak={props.comboStreak} lastPoints={props.lastEarnedPoints} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10 min-w-0">
        <main className="flex-1 flex flex-col items-center justify-start p-1.5 sm:p-4 max-w-lg sm:max-w-xl mx-auto w-full min-w-0 overflow-x-hidden">
          {/* Özel Oda Bilgi Çubuğu */}
          {props.mode === "ONLINE_ROOM" && props.customRoomCode && (
            <div className="w-full max-w-md mx-auto mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#00D5E8]/15 border border-[#00D5E8]/40 text-xs">
              <span className="font-bold text-[#00D5E8] flex items-center gap-1.5 font-mono">
                <Swords className="w-3.5 h-3.5" /> Oda #{props.customRoomCode}
              </span>
              <span className="text-[10px] font-mono text-[#F1EEE7] font-bold">
                {props.customShotClock}s Blitz
              </span>
            </div>
          )}

          {/* Board Title Header */}
          <div className="w-full max-w-md px-3 mt-1.5 mb-0.5 text-center">
            <h2 className="text-xs sm:text-sm font-serif font-bold text-[#F1EEE7] tracking-wider truncate">
              {props.board.title}
            </h2>
          </div>

          {/* Shot Clock */}
          <ShotClock
            currentTurn={props.currentTurn}
            secondsRemaining={props.secondsRemaining}
            totalSeconds={props.customShotClock}
            winner={props.winner}
            isBotThinking={props.isBotThinking}
            botStatusMessage={props.botStatusMessage}
          />

          {/* Visual 3x3 Poster Matrix */}
          <XoxBoard
            board={props.board}
            cells={props.cells}
            winningLine={props.winningLine}
            currentTurn={props.currentTurn}
            winner={props.winner}
            onCellClick={props.onCellSelect}
            allowSteal={props.allowSteal}
          />

          {/* Joker / İpucu / Hata Bildirim Kartı */}
          {props.hintMessage && (
            <div className="w-full max-w-md mx-auto my-1.5 p-2.5 rounded-2xl bg-[#F5A623]/15 border border-[#F5A623]/50 text-[#F5A623] text-xs font-black text-center flex items-center justify-center gap-2 animate-in fade-in shadow-lg">
              <Lightbulb className="w-4 h-4 text-[#F5A623] shrink-0" />
              <span>{props.hintMessage}</span>
            </div>
          )}
        </main>

        {/* Tablet Side Panel */}
        <TabletSidePanel
          cells={props.cells}
          currentTurn={props.currentTurn}
          playerXScore={props.scoreX}
          playerOScore={props.scoreO}
        />
      </div>

      {/* Movie Search Modal / Actor Search Modal (Ters Kadraj) */}
      {props.activeCellIndex !== null && props.board.boardMode === "REVERSE_CAST" ? (
        <ActorSearchModal
          isOpen={props.activeCellIndex !== null}
          onClose={props.onCloseSearchModal}
          rowCrit={props.board.rows[Math.floor(props.activeCellIndex / 3)]}
          colCrit={props.board.cols[props.activeCellIndex % 3]}
          onSelectActor={props.onActorChosen}
          errorMessage={props.movieSearchError}
        />
      ) : props.activeCellIndex !== null ? (
        <MovieSearchModal
          isOpen={props.activeCellIndex !== null}
          onClose={props.onCloseSearchModal}
          rowCrit={props.board.rows[Math.floor(props.activeCellIndex / 3)]}
          colCrit={props.board.cols[props.activeCellIndex % 3]}
          usedMovieIds={props.usedMovieIds}
          onSelectMovie={props.onMovieChosen}
          contentPool={props.contentPool}
          errorMessage={props.movieSearchError}
          targetOccupant={props.cells[props.activeCellIndex]}
        />
      ) : null}

      {/* Altın Makara (Sudden Death) Modalı */}
      <GoldenReelModal
        isOpen={props.isGoldenReelActive}
        question={props.goldenReelQuestion}
        scoreRarityX={props.scoreRarityX}
        scoreRarityO={props.scoreRarityO}
        currentTurn={props.currentTurn}
        onSubmitAnswer={props.onResolveGoldenReelAnswer}
        onTimeout={props.onResolveGoldenReelTimeout}
      />

      {/* Post Game Analysis (Kazanma/Kaybetme ve Rarity Analiz Ekranı) */}
      <PostGameAnalysisModal
        winner={props.winner}
        board={props.board}
        cells={props.cells}
        profile={props.profile}
        totalArcadeScore={props.totalArcadeScore}
        onPlayAgain={props.onPlayAgain}
        onNextBoard={props.onNextBoard}
        onBackToHome={props.onBackToHome}
      />

      {/* Maçı Terk Et / Teslim Ol (Surrender) Onay Modalı */}
      {props.showSurrenderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div
            className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center text-[#F1EEE7] relative tactile-card"
            style={{
              background: "linear-gradient(180deg, #1E222B 0%, #14171D 100%)",
              borderColor: "rgba(255,51,75,0.65)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.85), 0 6px 0 #08090C",
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#FF334B]/15 border border-[#FF334B]/40 flex items-center justify-center text-[#FF334B] mb-3 animate-pulse">
              <ShieldAlert className="w-7 h-7 text-[#FF334B]" />
            </div>

            <h3 className="text-base font-black text-[#FF334B] font-mono tracking-wider mb-1 uppercase">
              {props.pendingSwitchMode ? "MOD DEĞİŞTİRİLİYOR" : "MAÇTAN ÇEKİLİYOR MUSUN?"}
            </h3>

            <p className="text-xs text-[#F1EEE7] leading-relaxed mb-4">
              {props.pendingSwitchMode ? (
                <>
                  Devam eden maçı sonlandırıp başka bir oyun moduna geçmek üzeresin. Bu maç hanene{" "}
                  <strong className="text-[#FF334B] font-black">HÜKMEN MAĞLUBİYET</strong> olarak işlenecektir!
                </>
              ) : (
                <>
                  Devam eden karşılaşmayı terk edersen bu maç hanene{" "}
                  <strong className="text-[#FF334B] font-black">HÜKMEN MAĞLUBİYET (Loss)</strong> olarak işlenecek ve serin sıfırlanacaktır!
                </>
              )}
            </p>

            <div className="w-full p-2.5 rounded-xl bg-[#0F1115] border border-white/10 text-[11px] text-[#A5A8B0] mb-5 flex items-center justify-between">
              <span className="font-bold">Rakip:</span>
              <span className="font-extrabold text-[#F1EEE7] flex items-center gap-1">
                🤖 {props.pendingOpponent.name} ({props.pendingOpponent.rankTitle})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={props.onCancelSurrender}
                className="py-2.5 rounded-xl tactile-btn-surface text-[#F1EEE7] font-black text-xs"
              >
                Savaşa Devam Et
              </button>
              <button
                type="button"
                onClick={props.onConfirmSurrender}
                className="py-2.5 rounded-xl bg-[#FF334B] hover:bg-[#e0243c] text-white font-black text-xs shadow-[0_4px_0_#991424] active:translate-y-[2px] transition-all"
              >
                {props.pendingSwitchMode ? "Modu Değiştir (Terk Et)" : "Terk Et (Teslim Ol)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
