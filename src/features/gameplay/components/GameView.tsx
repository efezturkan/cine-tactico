"use client";

import React, { useState } from "react";
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
import { ClapperCountdown } from "./ClapperCountdown";

import {
  ShieldAlert,
  Swords,
  Lightbulb,
  X,
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
  const [showClapper, setShowClapper] = useState(true);
  const [introCount, setIntroCount] = useState<3 | 2 | 1 | null>(3);

  const isIntro = props.isIntroActive !== undefined ? props.isIntroActive : showClapper;
  const handleIntroComplete = () => {
    setShowClapper(false);
    setIntroCount(null);
    if (props.onCompleteIntro) {
      props.onCompleteIntro();
    }
  };

  const gameAmbience = { ...DEFAULT_AMBIENCE, ...(props.profile?.ambience || {}) };
  const gameTheme = (gameAmbience.theme && AMBIENCE_THEMES[gameAmbience.theme]) || AMBIENCE_THEMES.velvet_red;
  const safeGameDimness =
    typeof gameAmbience.dimness === "number" && !isNaN(gameAmbience.dimness) ? gameAmbience.dimness : 85;

  const isPlayerTurn = props.currentTurn === "X";

  return (
    <div
      className="min-h-[100dvh] text-[#E8E6E1] flex flex-col justify-between font-sans select-none antialiased transition-colors duration-500 relative overflow-hidden"
      style={{
        backgroundColor: gameTheme?.bgColor || "#0B0D12",
        filter: `brightness(${Math.min(1.1, Math.max(0.65, safeGameDimness / 85))})`,
      }}
    >
      {/* Maç Başı First Look & Klaket Animasyonu (Tahtayı İnceleme + 35mm Klaket Çarpması, Dokunarak Geçilebilir) */}
      {isIntro && (
        <ClapperCountdown
          onComplete={handleIntroComplete}
          onCountChange={setIntroCount}
          isMuted={props.muted}
        />
      )}

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

      {/* ── 1. ÜST BAR: SOL REC + TIMECODE | ORTA TAHTA ADI | SAĞ ÇIKIŞ ─── */}
      <header className="w-full max-w-lg sm:max-w-xl mx-auto px-3 sm:px-4 pt-3 pb-1 flex items-center justify-between z-30 select-none">
        {/* Sol: REC Noktası (2sn yumuşak nabız, sadece maç aktifken) + Timecode Süre Sayacı */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-opacity ${
              props.winner === null
                ? "bg-[#E5484D] animate-pulse"
                : "bg-[#8A8F9A]/40"
            }`}
            style={{ animationDuration: "2s" }}
            title="REC"
          />
          <span className="font-mono text-xs sm:text-sm font-bold text-[#E8E6E1] tracking-wider">
            00:00:{Math.max(0, props.secondsRemaining).toString().padStart(2, "0")}:08
          </span>
        </div>

        {/* Orta: Tahta Adı (Serif Başlık, Kapsayıcı/Hap Yok) */}
        <div className="text-center min-w-0 px-2 flex-1">
          <h1 className="font-serif font-bold text-sm sm:text-base text-[#E8E6E1] truncate leading-tight">
            {props.board.title}
          </h1>
        </div>

        {/* Sağ: Çıkış */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={props.onRequestExitGame}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[#8A8F9A] hover:text-[#E8E6E1] tactile-btn-surface"
            title="Gişe'ye Dön"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── 2. TAHTA BÜYÜK VE MERKEZDE ─── */}
      <main className="flex-1 flex flex-col items-center justify-center p-1 sm:p-3 max-w-lg sm:max-w-xl mx-auto w-full min-w-0">
        <XoxBoard
          board={props.board}
          cells={props.cells}
          winningLine={props.winningLine}
          currentTurn={props.currentTurn}
          winner={props.winner}
          onCellClick={isIntro ? () => {} : props.onCellSelect}
          allowSteal={props.allowSteal}
          isIntro={isIntro}
          introCount={isIntro ? introCount : null}
        />

        {/* ── 3. ALTA TEK SATIR SIRA GÖSTERGESİ ─── */}
        <div className="w-full text-center pt-2 pb-1 select-none">
          {props.winner !== null ? (
            <span className="font-serif text-base sm:text-lg font-bold text-[#D9A441] tracking-wider">
              {props.winner === "X"
                ? "Kesin!"
                : props.winner === "DRAW"
                ? "Berabere"
                : "Kurgu masasına dönüyoruz."}
            </span>
          ) : (
            <p
              className={`text-xs font-mono font-bold tracking-widest uppercase ${
                isPlayerTurn ? "text-[#D9A441]" : "text-[#4FA3C7]"
              }`}
            >
              {isPlayerTurn ? "Sıra sende" : "Rakip çekiyor"}
            </p>
          )}
        </div>
      </main>

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
