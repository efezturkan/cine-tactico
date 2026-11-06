"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  GameBoard,
  PlayerSymbol,
  CellAnswer,
  GameMode,
  Movie,
  BotDifficulty,
  validateMove,
  findMatchingMovies,
  calculateCellRarity,
  validateActorIntersection,
  evaluateBoardState,
  evaluateReverseBoardState,
  resolveFotoFinish,
  calculateBotMove,
  getBotThinkingDelay,
  getRandomThinkingPhrase,
} from "@/core";
import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import { useTranslation } from "@/i18n";
import confetti from "canvas-confetti";

export interface MoveResult {
  success: boolean;
  message?: string;
  points?: number;
  combo?: number;
}

export function useGameSession(
  initialBoard: GameBoard,
  mode: GameMode = "VS_BOT",
  botDifficulty: BotDifficulty = "MEDIUM",
  shotClockLimit: number = 12, // 12s Blitz (Hile ve dış kaynak aramasını önleme standardı)
  isActive: boolean = true
) {
  const { dict } = useTranslation();
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

  // Deadlock Önleme: Her hücre için oyuncu deneme takibi
  const [attemptsPerCell, setAttemptsPerCell] = useState<Record<number, { X: boolean; O: boolean }>>({});

  // Rarity Puanları (Tie-break & Foto-finiş)
  const [scoreRarityX, setScoreRarityX] = useState<number>(0);
  const [scoreRarityO, setScoreRarityO] = useState<number>(0);

  // Altın Makara (Sudden Death) Durumu
  const [isGoldenReelActive, setIsGoldenReelActive] = useState<boolean>(false);
  const goldenReelQuestion = dict.game.goldenReelPrompt;

  // Bot Düşünme Durumu & İnsan Benzeri Düşünce Akışı
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [botStatusMessage, setBotStatusMessage] = useState<string>(dict.game.botThinking);

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

  const turnStartTimeRef = useRef<number>(0);

  // Süre aşımı kuralı (Spec v3): açık hücre varsa zaman aşımı o hücrede 1 yanlış deneme sayılır
  const clockCellRef = useRef<number | null>(null);
  const currentTurnRef = useRef<PlayerSymbol>("X");
  const cellsRef = useRef<(CellAnswer | null)[]>(Array(9).fill(null));
  const recordFailedAttemptRef = useRef<(cellIndex: number, player: PlayerSymbol) => void>(() => {});
  const setClockCell = useCallback((cellIndex: number | null) => {
    clockCellRef.current = cellIndex;
  }, []);

  const switchTurn = useCallback(() => {
    setCurrentTurn(prev => (prev === "X" ? "O" : "X"));
    turnStartTimeRef.current = performance.now();
    setSecondsRemaining(shotClockLimit);
  }, [shotClockLimit]);

  const handleVictoryEffects = useCallback((winningPlayer: PlayerSymbol | "DRAW") => {
    if (winningPlayer === "X") {
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
    } else if (winningPlayer === "O") {
      setScoreO(s => s + 1);
      audio.playVictory();
      haptic.error();
    } else {
      audio.playSelect();
    }
  }, []);

  // Deadlock Kuralı: İki taraf da yanlış yaparsa hücre NEUTRAL olarak kilitlenir
  const recordFailedAttempt = useCallback(
    (cellIndex: number, player: PlayerSymbol) => {
      setAttemptsPerCell(prev => {
        const current = prev[cellIndex] || { X: false, O: false };
        const updated = { ...current, [player]: true };

        if (updated.X && updated.O) {
          setCells(prevCells => {
            if (prevCells[cellIndex] !== null) return prevCells;
            const nextCells = [...prevCells];
            nextCells[cellIndex] = {
              movie: {
                id: `neutral_locked_${cellIndex}`,
                title: "Sahipsiz Hücre",
                year: 0,
                director: "Kilitli",
                cast: [],
                genres: [],
                hasOscar: false,
              },
              answeredBy: "NEUTRAL",
              isLockedNeutral: true,
              timestamp: Date.now(),
            };

            // Hücre kilitlendiğinde tahta durumunu kontrol et
            if (board.boardMode === "REVERSE_CAST") {
              const revEval = evaluateReverseBoardState(nextCells, scoreRarityX, scoreRarityO);
              if (revEval.winner !== null) {
                if (revEval.winner === "DRAW" || revEval.winner === "GOLDEN_REEL") {
                  setIsGoldenReelActive(true);
                  setIsTimerActive(false);
                } else {
                  setWinner(revEval.winner);
                  setIsTimerActive(false);
                  handleVictoryEffects(revEval.winner);
                }
              }
            } else {
              const evalResult = evaluateBoardState(nextCells, true);
              if (evalResult.winner !== null) {
                if (evalResult.winner === "DRAW" || evalResult.winner === "GOLDEN_REEL") {
                  setIsGoldenReelActive(true);
                  setIsTimerActive(false);
                } else {
                  setWinner(evalResult.winner);
                  setWinningLine(evalResult.line);
                  setIsTimerActive(false);
                  handleVictoryEffects(evalResult.winner);
                }
              }
            }

            return nextCells;
          });
        }

        return { ...prev, [cellIndex]: updated };
      });
    },
    [board.boardMode, scoreRarityX, scoreRarityO, handleVictoryEffects]
  );

  useEffect(() => {
    currentTurnRef.current = currentTurn;
    cellsRef.current = cells;
    recordFailedAttemptRef.current = recordFailedAttempt;
  }, [currentTurn, cells, recordFailedAttempt]);

  // Timer Tick Cycle (performance.now() tabanlı drift-free sayaç)
  useEffect(() => {
    if (!isActive || !isTimerActive || winner !== null || isGoldenReelActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Maç başladığı veya aktifleştiği kesin anda referansı mühürle
    turnStartTimeRef.current = performance.now();
    setSecondsRemaining(shotClockLimit);

    timerRef.current = setInterval(() => {
      const now = performance.now();
      const elapsedSec = Math.floor((now - turnStartTimeRef.current) / 1000);
      const remaining = Math.max(0, shotClockLimit - elapsedSec);

      if (remaining <= 0) {
        try {
          audio.playError();
          haptic.error();
        } catch {
          // Fail-silent
        }
        setComboStreak(0);
        const openCell = clockCellRef.current;
        clockCellRef.current = null;
        if (openCell !== null && cellsRef.current[openCell] === null) {
          recordFailedAttemptRef.current(openCell, currentTurnRef.current);
        }
        switchTurn();
        return;
      }

      if (remaining <= 5 && remaining !== secondsRemainingRef.current) {
        try {
          audio.playTick(450 + (6 - remaining) * 90);
          haptic.light();
        } catch {
          // Fail-silent
        }
      }

      setSecondsRemaining(remaining);
    }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isTimerActive, winner, isGoldenReelActive, shotClockLimit, switchTurn]);

  // Execute Film Move (Klasik Düello ve Sinefil Konsept)
  const submitMove = useCallback(
    (cellIndex: number, movie: Movie, playerSymbol?: PlayerSymbol): MoveResult => {
      if (winner !== null) return { success: false, message: dict.game.msgGameOver };

      const activePlayer = playerSymbol || currentTurn;
      const currentOccupant = cells[cellIndex];

      // Hücre doluysa: Kare mühürlüdür, hamle yapılamaz
      if (currentOccupant !== null) {
        return { success: false, message: dict.game.msgCellTaken };
      }

      if (usedMovieIds.includes(movie.id)) {
        audio.playError();
        haptic.error();
        setComboStreak(0);
        recordFailedAttempt(cellIndex, activePlayer);
        switchTurn();
        return {
          success: false,
          message: dict.game.msgMovieUsed,
        };
      }

      const rowCrit = board.rows[Math.floor(cellIndex / 3)];
      const colCrit = board.cols[cellIndex % 3];

      if (!validateMove(movie, rowCrit, colCrit)) {
        audio.playError();
        haptic.error();
        setComboStreak(0);
        recordFailedAttempt(cellIndex, activePlayer);
        switchTurn();
        return {
          success: false,
          message: dict.game.msgWrongMovie,
        };
      }

      // Hamle geçerli: Hücre içi havuz üzerinden Rarity & Puan Hesaplaması
      const newCombo = comboStreak + 1;
      setComboStreak(newCombo);

      const rIdx = Math.floor(cellIndex / 3);
      const cIdx = cellIndex % 3;
      const validPool = findMatchingMovies(board.rows[rIdx], board.cols[cIdx]);
      const rarity = calculateCellRarity(movie, validPool);

      // Spec v3: Temel Puan (10) + Nadirlik Bonusu (0/2/5/8/12)
      const points = rarity.totalPoints;
      const updatedRarityX = activePlayer === "X" ? scoreRarityX + rarity.totalPoints : scoreRarityX;
      const updatedRarityO = activePlayer === "O" ? scoreRarityO + rarity.totalPoints : scoreRarityO;

      if (activePlayer === "X") {
        setScoreRarityX(updatedRarityX);
      } else {
        setScoreRarityO(updatedRarityO);
      }

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
        rarityTier: rarity.tier,
        rarityScore: rarity.totalPoints,
        pointsEarned: points,
      };
      setCells(newCells);

      setUsedMovieIds(prev => [...prev, movie.id]);

      // Kazanan Analizi
      if (board.boardMode === "REVERSE_CAST") {
        const revEval = evaluateReverseBoardState(newCells, updatedRarityX, updatedRarityO);
        if (revEval.winner !== null) {
          setWinner(revEval.winner as PlayerSymbol);
          setIsTimerActive(false);
          handleVictoryEffects(revEval.winner as PlayerSymbol);
        } else {
          switchTurn();
        }
      } else {
        const boardEvaluation = evaluateBoardState(newCells, true);
        if (boardEvaluation.winner !== null) {
          if (boardEvaluation.winner === "DRAW" || boardEvaluation.winner === "GOLDEN_REEL") {
            // ALTIN MAKARA (Sudden Death) TETİKLENİR!
            setIsGoldenReelActive(true);
            setIsTimerActive(false);
            audio.playPowerup();
          } else {
            setWinner(boardEvaluation.winner);
            setWinningLine(boardEvaluation.line);
            setIsTimerActive(false);
            handleVictoryEffects(boardEvaluation.winner);
          }
        } else {
          switchTurn();
        }
      }

      return {
        success: true,
        points,
        combo: newCombo,
      };
    },
    [
      winner,
      currentTurn,
      cells,
      usedMovieIds,
      board.rows,
      board.cols,
      board.boardMode,
      comboStreak,
      recordFailedAttempt,
      scoreRarityX,
      scoreRarityO,
      switchTurn,
      handleVictoryEffects,
      dict,
    ]
  );

  // Execute Actor Move (Ters Kadraj Modu)
  const submitActorMove = useCallback(
    (cellIndex: number, actorNameInput: string, playerSymbol?: PlayerSymbol): MoveResult => {
      if (winner !== null) return { success: false, message: dict.game.msgGameOver };

      const activePlayer = playerSymbol || currentTurn;
      const currentOccupant = cells[cellIndex];
      if (currentOccupant !== null) {
        return { success: false, message: dict.game.msgCellTaken };
      }

      const rowCrit = board.rows[Math.floor(cellIndex / 3)];
      const colCrit = board.cols[cellIndex % 3];

      const validation = validateActorIntersection(actorNameInput, rowCrit.value, colCrit.value);
      if (!validation.isValid || !validation.matchedActor) {
        audio.playError();
        haptic.error();
        setComboStreak(0);
        recordFailedAttempt(cellIndex, activePlayer);
        switchTurn();
        return {
          success: false,
          message: dict.game.msgWrongActor,
        };
      }

      // Geçerli aktör!
      const matchedActor = validation.matchedActor;
      const newCombo = comboStreak + 1;
      setComboStreak(newCombo);

      const baseScore = 250;
      const timeBonus = Math.floor(secondsRemainingRef.current * 15);
      const points = Math.round((baseScore + timeBonus) * (1 + (newCombo - 1) * 0.4));
      const rarityBonus = 15;

      const updatedRarityX = activePlayer === "X" ? scoreRarityX + rarityBonus : scoreRarityX;
      const updatedRarityO = activePlayer === "O" ? scoreRarityO + rarityBonus : scoreRarityO;

      if (activePlayer === "X") {
        setScoreRarityX(updatedRarityX);
      } else {
        setScoreRarityO(updatedRarityO);
      }

      setLastEarnedPoints(points);
      setTotalArcadeScore(prev => prev + points);

      audio.playChessMove();
      haptic.medium();

      const newCells = [...cells];
      newCells[cellIndex] = {
        movie: {
          id: `actor_${encodeURIComponent(matchedActor)}_${cellIndex}`,
          title: matchedActor,
          year: 0,
          director: "Ortak Aktör",
          cast: [matchedActor],
          genres: [],
          hasOscar: false,
        },
        actorName: matchedActor,
        answeredBy: activePlayer,
        timestamp: Date.now(),
        rarityTier: "RARE",
        rarityScore: rarityBonus,
        pointsEarned: points,
      };
      setCells(newCells);

      // Ters Kadraj: En çok hücreyi kapatan kazanır (Altın Makara kullanılmaz)
      const revEval = evaluateReverseBoardState(newCells, updatedRarityX, updatedRarityO);
      if (revEval.winner !== null) {
        setWinner(revEval.winner as PlayerSymbol);
        setIsTimerActive(false);
        handleVictoryEffects(revEval.winner as PlayerSymbol);
      } else {
        switchTurn();
      }

      return {
        success: true,
        points,
        combo: newCombo,
      };
    },
    [
      winner,
      currentTurn,
      cells,
      board.rows,
      board.cols,
      comboStreak,
      recordFailedAttempt,
      scoreRarityX,
      scoreRarityO,
      switchTurn,
      handleVictoryEffects,
      dict,
    ]
  );

  // Altın Makara (Sudden Death) Cevap Çözümleme
  const resolveGoldenReelAnswer = useCallback(
    (movie: Movie, playerSymbol: PlayerSymbol) => {
      if (usedMovieIds.includes(movie.id)) {
        return { success: false, message: dict.game.goldenReelUsed };
      }
      if (movie.hasOscar || movie.boxOfficeCategory === "BLOCKBUSTER") {
        setWinner(playerSymbol);
        setIsGoldenReelActive(false);
        handleVictoryEffects(playerSymbol);
        return { success: true };
      }
      return { success: false, message: dict.game.goldenReelRejected };
    },
    [handleVictoryEffects, usedMovieIds, dict]
  );

  // Altın Makara Süre Bitimi: Foto-finiş (Foto-finish) kararı!
  const resolveGoldenReelTimeout = useCallback(() => {
    const finalWinner = resolveFotoFinish(scoreRarityX, scoreRarityO);
    setWinner(finalWinner);
    setIsGoldenReelActive(false);
    handleVictoryEffects(finalWinner);
  }, [scoreRarityX, scoreRarityO, handleVictoryEffects]);

  // BOT AI TURN AUTOMATION
  useEffect(() => {
    if (!isActive || mode !== "VS_BOT" || currentTurn !== "O" || winner !== null || isGoldenReelActive) {
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

    const subTimeout =
      thinkingDelay > 3400
        ? setTimeout(() => {
            setBotStatusMessage(dict.game.botPickingPoster);
          }, thinkingDelay * 0.6)
        : null;

    botTimeoutRef.current = setTimeout(() => {
      botTimeoutRef.current = null;
      setIsBotThinking(false);

      const decision = calculateBotMove(board, cells, usedMovieIds, botDifficulty, "O");

      if (decision) {
        if (decision.actorName) {
          submitActorMove(decision.cellIndex, decision.actorName, "O");
        } else if (decision.movie) {
          submitMove(decision.cellIndex, decision.movie, "O");
        } else {
          audio.playError();
          switchTurn();
        }
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
  }, [
    isActive,
    mode,
    currentTurn,
    winner,
    isGoldenReelActive,
    board,
    cells,
    usedMovieIds,
    botDifficulty,
    submitMove,
    submitActorMove,
    switchTurn,
  ]);

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
      turnStartTimeRef.current = performance.now();
      setSecondsRemaining(shotClockLimit);
      setIsTimerActive(true);
      setUsedMovieIds([]);
      setComboStreak(0);
      setIsBotThinking(false);
      setAttemptsPerCell({});
      setScoreRarityX(0);
      setScoreRarityO(0);
      setIsGoldenReelActive(false);
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
    attemptsPerCell,
    scoreRarityX,
    scoreRarityO,
    isGoldenReelActive,
    goldenReelQuestion,
    totalArcadeScore,
    comboStreak,
    lastEarnedPoints,
    isBotThinking,
    botStatusMessage,
    submitMove,
    submitActorMove,
    setClockCell,
    resolveGoldenReelAnswer,
    resolveGoldenReelTimeout,
    switchTurn,
    resetGame,
    setBoard,
    getCellSolutions: (cellIndex: number) => {
      const r = Math.floor(cellIndex / 3);
      const c = cellIndex % 3;
      return findMatchingMovies(board.rows[r], board.cols[c]);
    },
  };
}