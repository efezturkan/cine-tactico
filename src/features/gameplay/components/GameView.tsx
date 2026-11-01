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
  const safeGameDimness = typeof gameAmbience.dimness === "number" && !isNaN(gameAmbience.dimness) ? gameAmbience.dimness : 85;
  const safeGameGlow = typeof gameAmbience.glowIntensity === "number" && !isNaN(gameAmbience.glowIntensity) ? gameAmbience.glowIntensity : 65;
  return (
    <div
      className="min-h-[100dvh] text-white flex flex-col font-sans select-none antialiased transition-colors duration-500 relative"
      style={{
        backgroundColor: gameTheme?.bgColor || "#07080b",
        filter: `brightness(${Math.min(1.1, Math.max(0.65, safeGameDimness / 85))})`,
      }}
    >
      {/* Top Dynamic Projector Beam in Game */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-48 pointer-events-none z-0 blur-3xl transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at top, ${gameTheme?.glowRgba || "rgba(139, 21, 27, 0.45)"}, transparent 75%)`,
          opacity: safeGameGlow / 100,
        }}
      />

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
      />

      {/* Block Blast Floating Combo Pop-up */}
      <ComboBanner comboStreak={props.comboStreak} lastPoints={props.lastEarnedPoints} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 max-w-2xl mx-auto w-full">
          {/* Özel Oda Bilgi Çubuğu */}
          {props.mode === "ONLINE_ROOM" && props.customRoomCode && (
            <div className="w-full max-w-md mx-auto mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" /> Oda #{props.customRoomCode}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {props.customShotClock}s
              </span>
            </div>
          )}

          {/* Board Title & Randomizer */}
          <div className="w-full max-w-md px-3 mt-1 text-center text-xs font-bold text-zinc-300 truncate">
            {props.board.title}
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

          {/* Joker / İpucu Bildirim Kartı */}
          {props.hintMessage && (
            <div className="w-full max-w-md mx-auto my-1.5 p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black text-center flex items-center justify-center gap-2 animate-in fade-in shadow-lg">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
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
          <div className="w-full max-w-sm bg-[#121622] border-2 border-rose-500/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-white relative">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
            </div>

            <h3 className="text-base font-black text-rose-400 font-mono tracking-wider mb-1 uppercase">
              {props.pendingSwitchMode ? "MOD DEĞİŞTİRİLİYOR" : "MAÇTAN ÇEKİLİYOR MUSUN?"}
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              {props.pendingSwitchMode ? (
                <>
                  Devam eden maçı sonlandırıp başka bir oyun moduna geçmek üzeresin. Bu maç hanene{" "}
                  <strong className="text-rose-400 font-black">HÜKMEN MAĞLUBİYET</strong> olarak işlenecektir!
                </>
              ) : (
                <>
                  Devam eden karşılaşmayı terk edersen bu maç hanene{" "}
                  <strong className="text-rose-400 font-black">HÜKMEN MAĞLUBİYET (Loss)</strong> olarak işlenecek ve serin sıfırlanacaktır!
                </>
              )}
            </p>

            <div className="w-full p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 mb-5 flex items-center justify-between">
              <span className="font-bold">Rakip:</span>
              <span className="font-extrabold text-white flex items-center gap-1">
                🤖 {props.pendingOpponent.name} ({props.pendingOpponent.rankTitle})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={props.onCancelSurrender}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs transition-all active:scale-95"
              >
                Savaşa Devam Et
              </button>
              <button
                type="button"
                onClick={props.onConfirmSurrender}
                className="py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
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
