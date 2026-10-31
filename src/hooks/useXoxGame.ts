"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GameBoard, PlayerSymbol, CellAnswer, GameMode, Movie, BotDifficulty } from "@/types/game";
import { validateMove, findMatchingMovies } from "@/engine/validator";
import { evaluateBoardState } from "@/engine/rules";
import { calculateBotMove, getBotThinkingDelay, getRandomThinkingPhrase } from "@/engine/bot-ai";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import confetti from "canvas-confetti";

export interface MoveResult {
  success: boolean;
  message?: string;
  points?: number;
  combo?: number;
  stolen?: boolean;
}

export function useGameSession(
  initialBoard: GameBoard,
  mode: GameMode = "PASS_AND_PLAY",
  botDifficulty: BotDifficulty = "MEDIUM",
  shotClockLimit: number = 12, // 12s Blitz (Hile ve dış kaynak aramasını önleme standardı)
  allowCellStealing: boolean = false,
  isActive: boolean = true
) {
  const [board, setBoard] = useState<GameBoard>(initialBoard);
  const [cells, setCells] = useState<(CellAnswer | null)[]>(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState<PlayerSymbol>("X");
  const [winner, setWinner] = useState<PlayerSymbol | "DRAW" | null>(null);
  const [winningLine, setWinningLine] = useState<[number, number, number] | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(shotClockLimit);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [usedMovieIds, setUsedMovieIds] = useState<string[]>([]);
  const [scoreX, setScoreX] = useState<number>(0);
  const [scoreO, setScoreO] = useState<number>(0);

  // Bot Düşünme Durumu & İnsan Benzeri Düşünce Akışı
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [botStatusMessage, setBotStatusMessage] = useState<string>("Düşünüyor...");

  // Arcade Puan & Kombo
  const [totalArcadeScore, setTotalArcadeScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRemainingRef = useRef<number>(shotClockLimit);

  useEffect(() => {
    secondsRemainingRef.current = secondsRemaining;
  }, [secondsRemaining]);

  const switchTurn = useCallback(() => {
    setCurrentTurn(prev => (prev === "X" ? "O" : "X"));
    setSecondsRemaining(shotClockLimit);
  }, [shotClockLimit]);

  // Timer Tick Cycle (Sadece aktif ekrandayken çalışır, lobiye dönüldüğünde susar)
  useEffect(() => {
    if (!isActive || !isTimerActive || winner !== null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          audio.playError();
          haptic.error();
          setComboStreak(0);
          switchTurn();
          return shotClockLimit;
        }

        if (prev <= 5) {
          audio.playTick(450 + (6 - prev) * 90);
          haptic.light();
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isTimerActive, winner, shotClockLimit, switchTurn]);

  // Execute Move
  const submitMove = useCallback(
    (cellIndex: number, movie: Movie, playerSymbol?: PlayerSymbol, isDouble?: boolean): MoveResult => {
      if (winner !== null) return { success: false, message: "Oyun tamamlandı." };

      const activePlayer = playerSymbol || currentTurn;
      const currentOccupant = cells[cellIndex];
      let isStealingMove = false;

      // Hücre doluysa: Kare Çalma (Steal) kuralı kontrolü
      if (currentOccupant !== null) {
        if (!allowCellStealing) {
          return { success: false, message: "Seçilen kare dolu." };
        }
        if (currentOccupant.answeredBy === activePlayer) {
          return { success: false, message: "Kendi kareni çalamazsın!" };
        }
        // Clash Royale kuralı: Yeni filmin IMDb puanı daha YÜKSEK olmalı!
        if (movie.imdbRating <= currentOccupant.movie.imdbRating) {
          audio.playError();
          haptic.error();
          return {
            success: false,
            message: "Kareyi çalmak için daha yüksek puanlı bir film seçmelisin!",
          };
        }
        isStealingMove = true;
      }

      if (usedMovieIds.includes(movie.id)) {
        audio.playError();
        haptic.error();
        setComboStreak(0);
        switchTurn(); // Faul: Sıra rakibe geçer!
        return {
          success: false,
          message: "Bu film maçta daha önce kullanıldı! Hatalı hamle, sıra rakibe geçti.",
        };
      }

      const rowCrit = board.rows[Math.floor(cellIndex / 3)];
      const colCrit = board.cols[cellIndex % 3];

      if (!validateMove(movie, rowCrit, colCrit)) {
        audio.playError();
        haptic.error();
        setComboStreak(0);
        switchTurn(); // Faul: Sıra rakibe geçer!
        return {
          success: false,
          message: "Hatalı Tahmin! Film seçilen kriterlere uymuyor, sıra rakibe geçti.",
        };
      }

      // Hamle geçerli: Block Blast Kombo Hesaplaması
      const newCombo = comboStreak + 1;
      setComboStreak(newCombo);

      const baseScore = 200;
      const timeBonus = Math.floor(secondsRemainingRef.current * 15);
      const comboMultiplier = 1 + (newCombo - 1) * 0.4;
      const stealBonus = isStealingMove ? 350 : 0;
      const doubleMultiplier = isDouble ? 2 : 1;
      const points = Math.round((baseScore + timeBonus + stealBonus) * comboMultiplier * doubleMultiplier);

      setLastEarnedPoints(points);
      setTotalArcadeScore(prev => prev + points);

      audio.playChessMove();
      if (newCombo > 1) {
        audio.playCombo(newCombo);
      }
      haptic.medium();

      const newCells = [...cells];
      newCells[cellIndex] = {
        movie,
        answeredBy: activePlayer,
        timestamp: Date.now(),
      };
      setCells(newCells);

      if (isStealingMove && currentOccupant) {
        setUsedMovieIds(prev => [...prev.filter(id => id !== currentOccupant.movie.id), movie.id]);
      } else {
        setUsedMovieIds(prev => [...prev, movie.id]);
      }

      // Kazanan & Beraberlik Analizi
      const boardEvaluation = evaluateBoardState(newCells);

      if (boardEvaluation.winner !== null) {
        setWinner(boardEvaluation.winner);
        setWinningLine(boardEvaluation.line);
        setIsTimerActive(false);

        if (boardEvaluation.winner === "X") {
          setScoreX(s => s + 1);
          audio.playVictory();
          haptic.success();
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#d97706", "#06b6d4", "#e11d48", "#10b981"],
            });
          } catch {
            // Confetti env fallback
          }
        } else if (boardEvaluation.winner === "O") {
          setScoreO(s => s + 1);
          audio.playVictory();
          haptic.error();
        } else {
          audio.playSelect();
        }
      } else {
        switchTurn();
      }

      return {
        success: true,
        points,
        combo: newCombo,
        stolen: isStealingMove,
      };
    },
    [
      winner,
      currentTurn,
      cells,
      usedMovieIds,
      board.rows,
      board.cols,
      comboStreak,
      allowCellStealing,
      switchTurn,
    ]
  );

  // BOT AI TURN AUTOMATION (İnsan Benzeri Değişken Düşünme & Arama Süresi)
  useEffect(() => {
    if (!isActive || mode !== "VS_BOT" || currentTurn !== "O" || winner !== null) {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    setBotStatusMessage(getRandomThinkingPhrase());

    const thinkingDelay = getBotThinkingDelay(botDifficulty);

    // Daha uzun düşünmelerde (3.5s+) gerçek insan gibi afiş/seçim aşamasına geçiş
    const subTimeout = thinkingDelay > 3400 ? setTimeout(() => {
      setBotStatusMessage("Afiş seçiyor...");
    }, thinkingDelay * 0.6) : null;

    botTimeoutRef.current = setTimeout(() => {
      botTimeoutRef.current = null;
      setIsBotThinking(false);

      const decision = calculateBotMove(board, cells, usedMovieIds, botDifficulty, "O", allowCellStealing);

      if (decision && decision.movie) {
        submitMove(decision.cellIndex, decision.movie, "O");
      } else {
        audio.playError();
        switchTurn();
      }
    }, thinkingDelay);

    return () => {
      if (subTimeout) clearTimeout(subTimeout);
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
    };
  }, [isActive, mode, currentTurn, winner, board, cells, usedMovieIds, botDifficulty, allowCellStealing, submitMove, switchTurn]);

  const resetGame = useCallback(
    (newBoard?: GameBoard) => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
      if (newBoard) setBoard(newBoard);
      setCells(Array(9).fill(null));
      setCurrentTurn("X");
      setWinner(null);
      setWinningLine(null);
      setSecondsRemaining(shotClockLimit);
      setIsTimerActive(true);
      setUsedMovieIds([]);
      setComboStreak(0);
      setIsBotThinking(false);
      audio.playSelect();
    },
    [shotClockLimit]
  );

  return {
    board,
    cells,
    currentTurn,
    winner,
    winningLine,
    secondsRemaining,
    usedMovieIds,
    scoreX,
    scoreO,
    totalArcadeScore,
    comboStreak,
    lastEarnedPoints,
    isBotThinking,
    botStatusMessage,
    submitMove,
    switchTurn,
    resetGame,
    setBoard,
    getCellSolutions: (cellIndex: number) => {
      const r = Math.floor(cellIndex / 3);
      const c = cellIndex % 3;
      return findMatchingMovies(board.rows[r], board.cols[c]);
    },
    addSeconds: (extra: number) => {
      setSecondsRemaining(prev => prev + extra);
    },
    bombCell: (cellIndex: number) => {
      setCells(prev => {
        const next = [...prev];
        const removed = next[cellIndex];
        if (removed) {
          setUsedMovieIds(u => u.filter(id => id !== removed.movie.id));
        }
        next[cellIndex] = null;
        return next;
      });
      audio.playPowerup();
      haptic.medium();
    },
  };
}
