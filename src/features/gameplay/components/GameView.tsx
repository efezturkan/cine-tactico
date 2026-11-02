"use client";

import React, { useState, useEffect } from "react";
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
import { XoxBoard } from "./XoxBoard";
import { MovieSearchModal } from "./MovieSearchModal";
import { ActorSearchModal } from "./ActorSearchModal";
import { GoldenReelModal } from "./GoldenReelModal";
import { PostGameAnalysisModal } from "./PostGameAnalysisModal";
import { ClapperCountdown, IntroPhase } from "./ClapperCountdown";
import { X, Film } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  isIntroActive?: boolean;
  onCompleteIntro?: () => void;

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
  const [showClapper, setShowClapper] = useState(props.isIntroActive ?? true);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("3");

  useEffect(() => {
    if (props.isIntroActive) {
      setShowClapper(true);
      setIntroPhase("3");
    }
  }, [props.isIntroActive]);

  const handleIntroImpact = () => {
    if (props.onCompleteIntro) {
      props.onCompleteIntro();
    }
  };

  const handleIntroComplete = () => {
    setShowClapper(false);
    setIntroPhase(null);
  };

  const isIntro = showClapper;

  const gameAmbience = { ...DEFAULT_AMBIENCE, ...(props.profile?.ambience || {}) };
  const gameTheme = (gameAmbience.theme && AMBIENCE_THEMES[gameAmbience.theme]) || AMBIENCE_THEMES.velvet_red;
  const safeGameDimness =
    typeof gameAmbience.dimness === "number" && !isNaN(gameAmbience.dimness) ? gameAmbience.dimness : 85;

  const isPlayerTurn = props.currentTurn === "X";

  // 2.5 Metin kısaltma: displayTitle (kısa ad)
  const displayTitle = props.board.title.includes(":")
    ? props.board.title.split(":")[0].trim()
    : props.board.title;

  return (
    <div
      className="h-[100dvh] min-h-[100dvh] text-[#E8E6E1] flex flex-col justify-between font-sans select-none antialiased transition-colors duration-500 relative overflow-hidden"
      style={{
        backgroundColor: gameTheme?.bgColor || "#0B0D12",
        filter: `brightness(${Math.min(1.1, Math.max(0.65, safeGameDimness / 85))})`,
        ["--game-arena-size" as string]: "min(94vw, calc(100dvh - 120px), 640px)",
      }}
    >
      {/* Klaket & Geri Sayım Overlay (Doğal akış) */}
      {isIntro && (
        <ClapperCountdown
          onImpact={handleIntroImpact}
          onComplete={handleIntroComplete}
          onPhaseChange={setIntroPhase}
          isMuted={props.muted}
        />
      )}

      {/* ── Layer 1: Ambient Projector Beam ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 12%, rgba(217, 164, 65, 0.08) 0%, rgba(217, 164, 65, 0.02) 48%, transparent 75%)",
        }}
      />

      {/* ── Layer 2: 35mm Analog Film Grain Overlay ─── */}
      {gameAmbience.grain && gameAmbience.grain !== "OFF" && (
        <div
          className="absolute inset-0 pointer-events-none z-10 mix-blend-screen transition-opacity duration-300"
          style={{
            opacity: gameAmbience.grain === "VINTAGE" ? 0.16 : 0.08,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      )}

      {/* ── 2.7 CSS Perforasyon Kenar Şeritleri (DOM düğümleri yerine CSS deseni) ─── */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-3 film-sprockets-left pointer-events-none z-10 opacity-30" />
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-3 film-sprockets-right pointer-events-none z-10 opacity-30" />

      {/* ── 6C.3 Merkezi Oyun Arenası (Dikey Dengeli Düzen) ─── */}
      <div
        className="w-full flex-1 flex flex-col items-center justify-between mx-auto relative z-20 py-2 px-2 sm:px-3 min-h-0"
        style={{ maxWidth: "var(--game-arena-size)" }}
      >
        {/* ── 1. ÜST BAR: SOL REC + TIMECODE | ORTA DISPLAYTITLE | SAĞ X BUTONU ─── */}
        <header className="w-full px-1 pt-1 pb-1 flex items-center justify-between z-30 relative select-none shrink-0">
          {/* Sol: REC + Timecode */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-opacity ${
                props.winner === null ? "bg-[#E5484D] animate-pulse" : "bg-[#8A8F9A]/40"
              }`}
              style={{ animationDuration: "2s" }}
              title="REC"
            />
            <span className="font-mono text-xs sm:text-sm font-bold text-[#E8E6E1] tracking-wider">
              00:00:{Math.max(0, props.secondsRemaining).toString().padStart(2, "0")}:08
            </span>
          </div>

          {/* Orta: Kısa Ad (displayTitle, Tek Satır, Başlık X ile Çakışmaz) */}
          <div className="text-center min-w-0 px-2 flex-1">
            <h1 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#E8E6E1] truncate leading-tight">
              {displayTitle}
            </h1>
          </div>

          {/* Sağ: 44×44 Bevelsiz Simge Butonu (X) */}
          <div className="flex items-center shrink-0">
            <Button
              variant="icon"
              onClick={props.onRequestExitGame}
              title="Düellodan Çık"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* ── 2. OYUNCU ŞERİDİ: SOLD SEN (X, ALTIN) | SAĞDA RAKİP (O, SOLUK MAVİ) ─── */}
        <div className="w-full flex items-center justify-between px-2 py-1 select-none shrink-0 text-xs">
          {/* SEN (X) */}
          <div
            className={`flex items-center gap-1.5 transition-all ${
              isPlayerTurn ? "opacity-100 font-bold" : "opacity-60"
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-[#D9A441] text-[#0B0D12] font-mono font-bold flex items-center justify-center text-[10px]">
              X
            </span>
            <span className="text-[#D9A441] tracking-wider uppercase text-[11px] truncate max-w-[120px]">
              SEN
            </span>
          </div>

          {/* RAKİP (O) */}
          <div
            className={`flex items-center gap-1.5 transition-all ${
              !isPlayerTurn ? "opacity-100 font-bold" : "opacity-60"
            }`}
          >
            <span className="text-[#4FA3C7] tracking-wider uppercase text-[11px] truncate max-w-[120px]">
              RAKİP · {props.pendingOpponent?.name || "Sinefil"}
            </span>
            <span className="w-5 h-5 rounded-md bg-[#4FA3C7] text-[#0B0D12] font-mono font-bold flex items-center justify-center text-[10px]">
              O
            </span>
          </div>
        </div>

        {/* ── 3. KADRAJ (ESNEK ALAN, DİKEY MERKEZ) ─── */}
        <main className="w-full flex-1 flex flex-col items-center justify-center min-w-0 min-h-0 my-auto">
          <XoxBoard
            board={props.board}
            cells={props.cells}
            winningLine={props.winningLine}
            currentTurn={props.currentTurn}
            winner={props.winner}
            onCellClick={isIntro ? () => {} : props.onCellSelect}
            allowSteal={props.allowSteal}
            isIntro={isIntro}
            introPhase={isIntro ? introPhase : null}
          />
        </main>

        {/* ── 4. ALTA: 12 SANİYE SÜRE ÇUBUĞU + HAMLE SENDE / RAKİP HAMLEDE ─── */}
        <div className="w-full flex flex-col items-center gap-1.5 px-3 pt-1 pb-2 select-none shrink-0">
          {/* İnce Süre Çubuğu (Son 3 saniyede kırmızıya döner) */}
          {props.winner === null && (
            <div className="w-full max-w-sm h-1 bg-[#181B22] rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                  props.secondsRemaining <= 3 ? "bg-[#E5484D]" : "bg-[#D9A441]"
                }`}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (props.secondsRemaining / (props.customShotClock || 12)) * 100)
                  )}%`,
                }}
              />
            </div>
          )}

          {/* Durum Metni */}
          {props.winner !== null ? (
            props.winner === "DRAW" ? (
              <div className="flex flex-col items-center text-center">
                <span className="font-serif text-base font-bold text-[#D9A441] tracking-wider">
                  Kör kadraj
                </span>
                <span className="text-xs text-[#8A8F9A]">Berabere.</span>
              </div>
            ) : (
              <span className="font-serif text-base sm:text-lg font-bold text-[#D9A441] tracking-wider">
                {props.winner === "X" ? "Kesin!" : "Kurgu masasına dönüyoruz."}
              </span>
            )
          ) : (
            <p
              className={`text-xs font-sans font-semibold tracking-wider ${
                isPlayerTurn ? "text-[#D9A441]" : "text-[#4FA3C7]"
              }`}
            >
              {isPlayerTurn ? "Hamle sende" : "Rakip hamlede"}
            </p>
          )}
        </div>
      </div>

      {/* Film Arama / Ortak Oyuncu Arama (Alt Sheet) */}
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

      {/* Post Game Analysis (Sonuç Ekranı) */}
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

      {/* 1.3 & 6C.6 Düelloyu Bırakma Onayı (Orta Kart) */}
      {props.showSurrenderConfirm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              props.onCancelSurrender();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center text-center text-[#E8E6E1] bg-[#14171D] border border-white/10 shadow-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-[#E5484D]/15 border border-[#E5484D]/30 flex items-center justify-center text-[#E5484D] mb-3">
              <Film className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-lg font-bold text-[#E8E6E1] mb-1">
              Düellodan Çekil
            </h3>

            <p className="text-xs text-[#8A8F9A] leading-relaxed mb-4">
              Düelloyu bırakırsan yenilmiş sayılırsın.
            </p>

            {props.pendingOpponent && (
              <div className="w-full p-2.5 rounded-lg bg-[#0B0D12] border border-white/5 text-[11px] text-[#8A8F9A] mb-5 flex items-center justify-between">
                <span>Rakip:</span>
                <span className="font-semibold text-[#E8E6E1]">
                  {props.pendingOpponent.name}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 w-full">
              <Button
                variant="secondary"
                onClick={props.onCancelSurrender}
              >
                Devam et
              </Button>
              <Button
                variant="primary"
                onClick={props.onConfirmSurrender}
              >
                Bırak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
