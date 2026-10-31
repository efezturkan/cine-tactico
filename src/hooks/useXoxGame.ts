"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GameBoard, PlayerSymbol, CellAnswer, GameMode, Movie, BotDifficulty } from "@/types/game";
import {
  validateMove,
  findMatchingMovies,
  calculateMovieRarity,
  validateActorIntersection,
} from "@/engine/validator";
import { evaluateBoardState, evaluateReverseBoardState } from "@/engine/rules";
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

  // Deadlock Önleme: Her hücre için oyuncu deneme takibi
  const [attemptsPerCell, setAttemptsPerCell] = useState<Record<number, { X: boolean; O: boolean }>>({});

  // Rarity Puanları (Tie-break & Foto-finiş)
  const [scoreRarityX, setScoreRarityX] = useState<number>(0);
  const [scoreRarityO, setScoreRarityO] = useState<number>(0);

  // Altın Makara (Sudden Death) Durumu
  const [isGoldenReelActive, setIsGoldenReelActive] = useState<boolean>(false);
  const [goldenReelQuestion] = useState<string>(
    "Oscar kazanmış bir başyapıt veya 8.5+ IMDb puanlı bir kült film yaz!"
  );

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
                imdbRating: 0,
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
                setWinner(revEval.winner);
                setIsTimerActive(false);
                handleVictoryEffects(revEval.winner);
              }
            } else {
              const evalResult = evaluateBoardState(nextCells);
              if (evalResult.winner !== null) {
                if (evalResult.winner === "DRAW") {
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

  // Timer Tick Cycle
  useEffect(() => {
    if (!isActive || !isTimerActive || winner !== null || isGoldenReelActive) {
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
  }, [isActive, isTimerActive, winner, isGoldenReelActive, shotClockLimit, switchTurn]);

  // Execute Film Move (Klasik Düello ve Sinefil Konsept)
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
        recordFailedAttempt(cellIndex, activePlayer);
        switchTurn();
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
        recordFailedAttempt(cellIndex, activePlayer);
        switchTurn();
        return {
          success: false,
          message: "Hatalı Tahmin! Film seçilen kriterlere uymuyor, sıra rakibe geçti.",
        };
      }

      // Hamle geçerli: Kombo & Rarity Hesaplaması
      const newCombo = comboStreak + 1;
      setComboStreak(newCombo);

      const baseScore = 200;
      const timeBonus = Math.floor(secondsRemainingRef.current * 15);
      const comboMultiplier = 1 + (newCombo - 1) * 0.4;
      const stealBonus = isStealingMove ? 350 : 0;
      const doubleMultiplier = isDouble ? 2 : 1;
      const points = Math.round((baseScore + timeBonus + stealBonus) * comboMultiplier * doubleMultiplier);

      const rarity = calculateMovieRarity(movie);
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

      if (isStealingMove && currentOccupant) {
        setUsedMovieIds(prev => [...prev.filter(id => id !== currentOccupant.movie.id), movie.id]);
      } else {
        setUsedMovieIds(prev => [...prev, movie.id]);
      }

      // Kazanan Analizi
      if (board.boardMode === "REVERSE_CAST") {
        const revEval = evaluateReverseBoardState(newCells, updatedRarityX, updatedRarityO);
        if (revEval.winner !== null) {
          setWinner(revEval.winner);
          setIsTimerActive(false);
          handleVictoryEffects(revEval.winner);
        } else {
          switchTurn();
        }
      } else {
        const boardEvaluation = evaluateBoardState(newCells);
        if (boardEvaluation.winner !== null) {
          if (boardEvaluation.winner === "DRAW") {
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
      board.boardMode,
      comboStreak,
      allowCellStealing,
      recordFailedAttempt,
      scoreRarityX,
      scoreRarityO,
      switchTurn,
      handleVictoryEffects,
    ]
  );

  // Execute Actor Move (Ters Kadraj Modu)
  const submitActorMove = useCallback(
    (cellIndex: number, actorNameInput: string, playerSymbol?: PlayerSymbol): MoveResult => {
      if (winner !== null) return { success: false, message: "Oyun tamamlandı." };

      const activePlayer = playerSymbol || currentTurn;
      const currentOccupant = cells[cellIndex];
      if (currentOccupant !== null) {
        return { success: false, message: "Seçilen kare dolu." };
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
          message: "Yanlış Aktör! İki filmde birden oynamadı, sıra rakibe geçti.",
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
          imdbRating: 8.0,
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

      // Ters Kadraj: En çok hücreyi kapatan kazanır
      const revEval = evaluateReverseBoardState(newCells, updatedRarityX, updatedRarityO);
      if (revEval.winner !== null) {
        setWinner(revEval.winner);
        setIsTimerActive(false);
        handleVictoryEffects(revEval.winner);
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
    ]
  );

  // Altın Makara (Sudden Death) Cevap Çözümleme
  const resolveGoldenReelAnswer = useCallback(
    (movie: Movie, playerSymbol: PlayerSymbol) => {
      if (movie.hasOscar || movie.imdbRating >= 8.0) {
        setWinner(playerSymbol);
        setIsGoldenReelActive(false);
        handleVictoryEffects(playerSymbol);
        return { success: true };
      }
      return { success: false, message: "Film Altın Makara kriterlerine uymuyor!" };
    },
    [handleVictoryEffects]
  );

  // Altın Makara Süre Bitimi: Foto-finiş (Foto-finish) kararı!
  const resolveGoldenReelTimeout = useCallback(() => {
    const finalWinner: PlayerSymbol = scoreRarityX >= scoreRarityO ? "X" : "O";
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
            setBotStatusMessage("Afiş seçiyor...");
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
    addSeconds: (extra: number) => {
      setSecondsRemaining(prev => prev + extra);
    },
    bombCell: (cellIndex: number) => {
      setCells(prev => {
        const next = [...prev];
        const removed = next[cellIndex];
        if (removed && removed.movie.id) {
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