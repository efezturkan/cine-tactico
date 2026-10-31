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
  Zap,
  Flame,
  Bot,
  Share2,
  ShieldAlert,
  Flag,
  Users,
  Swords,
  Calendar,
  Lock,
  Shuffle,
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
  const isMatchInProgress = props.winner === null && props.cells.some(c => c !== null);

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
        onOpenQuests={props.onOpenQuests}
        onOpenProfile={props.onOpenProfile}
        onOpenHelp={props.onOpenHelp}
      />

      {/* Block Blast Floating Combo Pop-up */}
      <ComboBanner comboStreak={props.comboStreak} lastPoints={props.lastEarnedPoints} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 max-w-2xl mx-auto w-full">
          {/* Block Blast Skor & Hızlı Akış Barı */}
          <div className="w-full max-w-md mx-auto my-1 flex items-center justify-between px-3 py-1.5 rounded-2xl bg-gradient-to-r from-cinema-card via-cinema-dark to-cinema-card border border-cinema-border shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-black">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-zinc-400 text-[11px]">SKOR:</span>
              <span className="text-amber-400 text-sm font-black tracking-wide">
                {props.totalArcadeScore.toLocaleString()}
              </span>
            </div>

            {props.comboStreak > 1 ? (
              <div className="flex items-center gap-1 text-xs font-black text-rose-400 animate-pulse-fast bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                <Flame className="w-3.5 h-3.5 fill-rose-400" />
                KOMBO x{props.comboStreak}
              </div>
            ) : props.isBotThinking ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
                <span>{props.botStatusMessage || "Düşünüyor..."}</span>
              </div>
            ) : props.mode === "DAILY_SOLO" ? (
              <button
                onClick={props.onOpenDailyShare}
                className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 transition-all active:scale-95"
              >
                <Share2 className="w-3 h-3" />
                Skor Kartı Paylaş
              </button>
            ) : props.allowSteal ? (
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <ShieldAlert className="w-3 h-3" /> KARE ÇALMA AKTİF
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-amber-500/30 text-[10px] font-mono font-bold" title="Canlı Rarity Puanları">
                  <span className="text-cyan-400">X: {props.scoreRarityX}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-rose-400">O: {props.scoreRarityO}</span>
                </div>
                {props.winner === null && (
                  <button
                    type="button"
                    onClick={props.onRequestExitGame}
                    className="flex items-center gap-1 text-[10px] font-black text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 transition-all active:scale-95"
                    title="Maçtan Çekil (Hükmen Yenilgi)"
                  >
                    <Flag className="w-2.5 h-2.5 text-rose-400" />
                    <span>Terk Et</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 4 Ana Oyun Modu Seçici Sekmeler */}
          <div className="w-full max-w-md mx-auto my-1.5 grid grid-cols-4 gap-1 p-1 rounded-2xl bg-cinema-card border border-cinema-border text-xs font-bold text-zinc-400">
            <button
              onClick={() => props.onSwitchMode("PASS_AND_PLAY")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                props.mode === "PASS_AND_PLAY"
                  ? "bg-amber-400 text-cinema-dark shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Pass & Play</span>
            </button>

            <button
              onClick={() => props.onSwitchMode("VS_BOT")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                props.mode === "VS_BOT"
                  ? "bg-cyan-500 text-cinema-dark shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Yapay Zeka</span>
            </button>

            <button
              onClick={() => props.onSwitchMode("ONLINE_ROOM")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                props.mode === "ONLINE_ROOM"
                  ? "bg-rose-500 text-white shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Özel Oda</span>
            </button>

            <button
              onClick={() => props.onSwitchMode("DAILY_SOLO")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                props.mode === "DAILY_SOLO"
                  ? "bg-emerald-500 text-white shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Günün Kadresi</span>
            </button>
          </div>

          {/* Bot Zorluk Seçici & Durum Kartı */}
          {props.mode === "VS_BOT" && (
            <div className="w-full max-w-md mx-auto mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs shadow-sm">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-zinc-400 text-[11px] font-bold">Bot Zorluğu:</span>
                {isMatchInProgress && (
                  <span
                    className="flex items-center gap-0.5 text-[9px] font-mono text-zinc-400 bg-zinc-800/90 px-1.5 py-0.5 rounded border border-zinc-700/60"
                    title="Maç esnasında zorluk kilitlidir"
                  >
                    <Lock className="w-2.5 h-2.5 text-amber-400" />
                    <span>Kilitli</span>
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {(["EASY", "MEDIUM", "HARD"] as BotDifficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => props.onSelectDifficulty(diff)}
                    title={isMatchInProgress ? "Maç devam ederken zorluk değiştirilemez" : undefined}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                      props.botDifficulty === diff
                        ? diff === "HARD"
                          ? "bg-rose-500 text-white shadow-sm"
                          : diff === "MEDIUM"
                          ? "bg-amber-400 text-cinema-dark shadow-sm"
                          : "bg-emerald-500 text-white shadow-sm"
                        : isMatchInProgress
                        ? "bg-zinc-800/40 text-zinc-600 hover:text-zinc-500 cursor-not-allowed"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {diff === "EASY" ? "Acemi" : diff === "MEDIUM" ? "Meraklı" : "Sinefil"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Özel Oda Bilgi Çubuğu */}
          {props.mode === "ONLINE_ROOM" && props.customRoomCode && (
            <div className="w-full max-w-md mx-auto mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" /> Oda #{props.customRoomCode}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Süre: {props.customShotClock}s | Çalma: {props.allowSteal ? "AÇIK" : "KAPALI"}
              </span>
            </div>
          )}

          {/* Board Title & Randomizer */}
          <div className="w-full max-w-xl flex items-center justify-between px-3 mt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-zinc-200">{props.board.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700">
                {props.board.difficulty}
              </span>
            </div>
            <button
              onClick={props.onNextBoard}
              className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              Farklı Matris
            </button>
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
