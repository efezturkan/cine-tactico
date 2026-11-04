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
import { ReviewAnswersSheet } from "./ReviewAnswersSheet";
import { ClapperCountdown, IntroPhase } from "./ClapperCountdown";
import { X, Film, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/i18n";

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
  shakingCellIndex?: number | null;

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

// Tur 10C: Mod ipuçları oturum içi bellek koruması
const modeHintSeenMemory = { ters: false, konsept: false };

export function GameView(props: GameViewProps) {
  const [showClapper, setShowClapper] = useState(props.isIntroActive ?? true);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("3");
  const [delayedWinner, setDelayedWinner] = useState<PlayerSymbol | "DRAW" | null>(null);
  const [modeHint, setModeHint] = useState<string | null>(null);

  // Review Mode (Kadraj İnceleme) State
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [showPostGameModal, setShowPostGameModal] = useState<boolean>(true);
  const [selectedReviewCellIndex, setSelectedReviewCellIndex] = useState<number | null>(null);

  // Tur 10B: 3. Kazanan hat 350ms çizildikten sonra sonuç kartı 400ms nefes payıyla gelir
  useEffect(() => {
    if (props.winner !== null) {
      const timer = setTimeout(() => {
        setDelayedWinner(props.winner);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setDelayedWinner(null);
      setIsReviewMode(false);
      setShowPostGameModal(true);
      setSelectedReviewCellIndex(null);
    }
  }, [props.winner]);

  const handleEnterReviewMode = () => {
    setIsReviewMode(true);
    setShowPostGameModal(false);
    setSelectedReviewCellIndex(null);
  };

  const handleReturnToResult = () => {
    setIsReviewMode(false);
    setShowPostGameModal(true);
    setSelectedReviewCellIndex(null);
  };

  // Tur 10C: 5. Mod ipuçları (Ters Kadraj: cinexox_ipucu_ters, Sinefil Konsept: cinexox_ipucu_konsept)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (props.board.boardMode === "REVERSE_CAST") {
        if (!modeHintSeenMemory.ters && localStorage.getItem("cinexox_ipucu_ters") !== "görüldü") {
          modeHintSeenMemory.ters = true;
          setModeHint(dict.game.hintReverse);
          localStorage.setItem("cinexox_ipucu_ters", "görüldü");
        }
      } else if (props.board.boardMode === "CINE_CONCEPT") {
        if (!modeHintSeenMemory.konsept && localStorage.getItem("cinexox_ipucu_konsept") !== "görüldü") {
          modeHintSeenMemory.konsept = true;
          setModeHint(dict.game.hintConcept);
          localStorage.setItem("cinexox_ipucu_konsept", "görüldü");
        }
      }
    } catch {
      if (props.board.boardMode === "REVERSE_CAST" && !modeHintSeenMemory.ters) {
        modeHintSeenMemory.ters = true;
        setModeHint(dict.game.hintReverse);
      } else if (props.board.boardMode === "CINE_CONCEPT" && !modeHintSeenMemory.konsept) {
        modeHintSeenMemory.konsept = true;
        setModeHint(dict.game.hintConcept);
      }
    }
  }, [props.board.boardMode]);

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

  const { t, tBoardTitle, locale, dict } = useTranslation();
  const isEn = locale === "en";

  const isPlayerTurn = props.currentTurn === "X";

  // 2.5 Metin kısaltma: displayTitle (kısa ad)
  const rawTitle = props.board.title.includes(":")
    ? props.board.title.split(":")[0].trim()
    : props.board.title;
  const displayTitle = tBoardTitle(rawTitle);

  return (
    <div
      className="h-[100dvh] min-h-[100dvh] text-[#E8E6E1] flex flex-col justify-between font-sans select-none antialiased transition-colors duration-500 relative overflow-hidden"
      style={{
        backgroundColor: "var(--salon-bg, #0B0D12)",
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
        {/* ── 1. ÜST BAR: SOL REC | ORTA DISPLAYTITLE | SAĞ X BUTONU ─── */}
        <header className="w-full px-1 pt-1 pb-1 flex items-center justify-between z-30 relative select-none shrink-0">
          {/* Sol: REC Göstergesi (Sadeleştirilmiş, sayaçla yarışmaz) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-opacity ${
                props.winner === null ? "bg-[#E5484D] animate-pulse" : "bg-[#8A8F9A]/40"
              }`}
              style={{ animationDuration: "2s" }}
              title="REC"
            />
            <span className="font-mono text-[10px] sm:text-xs font-bold text-[#8A8F9A] uppercase tracking-wider">
              REC
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

        {/* ── 2. OYUNCU ŞERİDİ: SOLD SEN | SAĞDA RAKİP (Hafifletilmiş görsel ağırlık, isim taşması önlendi) ─── */}
        <div className="w-full flex items-center justify-between px-2 py-0.5 select-none shrink-0 text-xs gap-3">
          {/* SEN (X) */}
          <div
            className={`flex items-center gap-1.5 min-w-0 flex-1 justify-start transition-opacity ${
              isPlayerTurn ? "opacity-100 font-bold" : "opacity-60"
            }`}
          >
            <span className="w-4 h-4 rounded bg-[#D9A441]/20 border border-[#D9A441]/50 text-[#D9A441] font-mono font-bold flex items-center justify-center text-[9px] shrink-0">
              X
            </span>
            <span className="text-[#D9A441] tracking-wider uppercase text-[11px] truncate">
              {props.profile?.username || (isEn ? "YOU" : "SEN")}
            </span>
          </div>

          {/* RAKİP (O) */}
          <div
            className={`flex items-center gap-1.5 min-w-0 flex-1 justify-end text-right transition-opacity ${
              !isPlayerTurn ? "opacity-100 font-bold" : "opacity-60"
            }`}
          >
            <span className="text-[#4FA3C7] tracking-wider uppercase text-[11px] truncate">
              {props.pendingOpponent?.name || (isEn ? "Opponent" : "Rakip")}
            </span>
            <span className="w-4 h-4 rounded bg-[#4FA3C7]/20 border border-[#4FA3C7]/50 text-[#4FA3C7] font-mono font-bold flex items-center justify-center text-[9px] shrink-0">
              O
            </span>
          </div>
        </div>

        {/* ── 3. KADRAJ (ESNEK ALAN, DİKEY MERKEZ) ─── */}
        <main className="w-full flex-1 flex flex-col items-center justify-center min-w-0 min-h-0 my-auto">
          {isIntro && modeHint && (
            <p className="text-xs text-[#D9A441] font-mono tracking-wide mb-1.5 text-center animate-in fade-in duration-150">
              {modeHint}
            </p>
          )}

          {/* ── SAYAÇ / İNCELEME BAŞLIĞI: 3×3 Kadraj'ın Hemen Üstünde ve Yatay Merkezinde ─── */}
          <div
            className="w-full grid grid-cols-4 gap-1 sm:gap-2 mb-1.5 shrink-0"
            style={{ maxWidth: "min(100%, calc(100dvh - 220px))" }}
          >
            {/* Col 1 (Row Criteria genişliğiyle eşleşen dengeleyici boşluk) */}
            <div className="col-start-1 col-end-2 flex items-center justify-center" />

            {/* Col 2-4 (3×3 Kadraj'ın Matematiksel Merkez Ekseni) */}
            <div className="col-start-2 col-end-5 flex items-center justify-center min-h-[26px]">
              {isReviewMode ? (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D9A441]/10 border border-[#D9A441]/30 text-[#D9A441] font-mono text-[10px] sm:text-xs font-bold tracking-wider animate-in fade-in duration-150">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D9A441]" />
                  <span>{t("game.reviewModeHeader")}</span>
                </div>
              ) : props.winner === null ? (
                <div
                  className={`font-mono text-xs sm:text-sm font-bold tracking-[0.2em] px-3 py-0.5 rounded-md border transition-all duration-300 ${
                    props.secondsRemaining <= 3
                      ? "text-[#E5484D] border-[#E5484D]/40 bg-[#E5484D]/15 animate-pulse shadow-[0_0_12px_rgba(229,72,77,0.3)]"
                      : "text-[#D9A441] border-[#D9A441]/25 bg-[#14171D] shadow-[0_0_8px_rgba(217,164,65,0.08)]"
                  }`}
                >
                  00:00:{Math.max(0, props.secondsRemaining).toString().padStart(2, "0")}
                </div>
              ) : null}
            </div>
          </div>

          <XoxBoard
            board={props.board}
            cells={props.cells}
            winningLine={props.winningLine}
            currentTurn={props.currentTurn}
            winner={props.winner}
            onCellClick={
              isIntro
                ? () => {}
                : isReviewMode
                ? (index) => {
                    // Review Mode: Dolu karelere dokunulamaz, yalnızca boş kareler seçilir
                    if (!props.cells[index]) {
                      setSelectedReviewCellIndex(index);
                    }
                  }
                : props.onCellSelect
            }
            allowSteal={props.allowSteal}
            isIntro={isIntro}
            introPhase={isIntro ? introPhase : null}
            shakingCellIndex={props.shakingCellIndex}
            isReviewMode={isReviewMode}
            selectedReviewCellIndex={selectedReviewCellIndex}
          />
        </main>

        {/* ── 4. ALTA: 12 SANİYE SÜRE ÇUBUĞU + HAMLE SENDE VEYA İNCELEME MODU AKSİYONLARI ─── */}
        <div className="w-full flex flex-col items-center gap-1.5 px-3 pt-1 pb-2 select-none shrink-0 min-h-[46px] justify-center">
          {isReviewMode ? (
            <div className="w-full flex flex-col items-center gap-1.5 select-none animate-in fade-in duration-150">
              <span className="text-[11px] text-[#8A8F9A] font-sans">
                {t("game.reviewTapBlankCellHint")}
              </span>
              <div className="flex items-center gap-2 w-full max-w-xs justify-center">
                <Button
                  variant="secondary"
                  data-testid="review-mode-back-to-result-btn"
                  onClick={handleReturnToResult}
                  className="flex-1 border border-[#D9A441]/40 text-[#D9A441] hover:bg-[#D9A441]/10 text-xs py-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  <span>{t("game.backToResult")}</span>
                </Button>
                <Button
                  variant="secondary"
                  data-testid="review-mode-back-to-home-btn"
                  onClick={props.onBackToHome}
                  className="flex-1 border border-white/10 text-[#E8E6E1] text-xs py-1.5"
                >
                  <X className="w-3.5 h-3.5 mr-1 text-[#8A8F9A]" />
                  <span>{t("game.backToHome")}</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
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
                      {isEn ? "Blind Frame" : "Kör kadraj"}
                    </span>
                    <span className="text-xs text-[#8A8F9A]">
                      {isEn ? "Tied duel." : "Berabere."}
                    </span>
                  </div>
                ) : (
                  <span className="font-serif text-base sm:text-lg font-bold text-[#D9A441] tracking-wider">
                    {props.winner === "X"
                      ? isEn
                        ? "Scene's yours!"
                        : "Sahne senin!"
                      : isEn
                      ? "Not this take."
                      : "Bu çekim olmadı."}
                  </span>
                )
              ) : (
                <p
                  className={`text-xs font-sans font-semibold tracking-wider ${
                    isPlayerTurn ? "text-[#D9A441]" : "text-[#4FA3C7]"
                  }`}
                >
                  {isPlayerTurn
                    ? isEn
                      ? "Your turn"
                      : "Hamle sende"
                    : isEn
                    ? "Opponent's turn"
                    : "Rakip hamlede"}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Film Arama / Ortak Oyuncu Arama (Alt Sheet - Review Modunda Asla Açılmaz) */}
      {!isReviewMode && props.activeCellIndex !== null && props.board.boardMode === "REVERSE_CAST" ? (
        <ActorSearchModal
          isOpen={props.activeCellIndex !== null}
          onClose={props.onCloseSearchModal}
          rowCrit={props.board.rows[Math.floor(props.activeCellIndex / 3)]}
          colCrit={props.board.cols[props.activeCellIndex % 3]}
          onSelectActor={props.onActorChosen}
          errorMessage={props.movieSearchError}
        />
      ) : !isReviewMode && props.activeCellIndex !== null ? (
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

      {/* Kadraj İnceleme Modu: Boş Hücre Alternatif Cevaplar Alt Sheet'i */}
      <ReviewAnswersSheet
        isOpen={isReviewMode && selectedReviewCellIndex !== null}
        onClose={() => setSelectedReviewCellIndex(null)}
        board={props.board}
        cellIndex={selectedReviewCellIndex}
        contentPool={props.contentPool}
      />

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

      {/* Post Game Analysis (Sonuç Ekranı - İnceleme Modunda Gizlenir, Snapshot Korunur) */}
      <PostGameAnalysisModal
        winner={showPostGameModal ? delayedWinner : null}
        board={props.board}
        cells={props.cells}
        profile={props.profile}
        totalArcadeScore={props.totalArcadeScore}
        onPlayAgain={props.onPlayAgain}
        onNextBoard={props.onNextBoard}
        onBackToHome={props.onBackToHome}
        onReviewKadraj={handleEnterReviewMode}
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
              {isEn ? "Abandon Duel" : "Düellodan Çekil"}
            </h3>

            <p className="text-xs text-[#8A8F9A] leading-relaxed mb-4">
              {isEn
                ? "Leaving the duel counts as a defeat."
                : "Düelloyu bırakırsan yenilmiş sayılırsın."}
            </p>

            {props.pendingOpponent && (
              <div className="w-full p-2.5 rounded-lg bg-[#0B0D12] border border-white/5 text-[11px] text-[#8A8F9A] mb-5 flex items-center justify-between">
                <span>{isEn ? "Opponent:" : "Rakip:"}</span>
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
                {isEn ? "Keep Playing" : "Devam et"}
              </Button>
              <Button
                variant="primary"
                onClick={props.onConfirmSurrender}
              >
                {isEn ? "Surrender" : "Bırak"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
