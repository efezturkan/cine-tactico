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
  calculateActorRarity,
  evaluateOutcome,
  registerFailedAttempt,
  hasPlayerTriedCell,
  BoardOutcome,
  AttemptsPerCell,
  resolveFotoFinish,
  calculateBotMove,
  getBotThinkingDelay,
  BotSkill,
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
  isActive: boolean = true,
  botSkill?: Partial<BotSkill>
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
  const [attemptsPerCell, setAttemptsPerCell] = useState<AttemptsPerCell>({});

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
  const attemptsRef = useRef<AttemptsPerCell>({});
  const rarityRef = useRef<{ x: number; o: number }>({ x: 0, o: 0 });
  const usedMovieIdsRef = useRef<string[]>([]);
  const recordFailedAttemptRef = useRef<(cellIndex: number, player: PlayerSymbol) => boolean>(() => false);
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

  // Tahta durumu değişince (hamle veya kilit) sonucu uygular. Maç bittiyse true döner.
  const applyOutcome = useCallback(
    (outcome: BoardOutcome): boolean => {
      if (outcome.kind === "WIN") {
        setWinner(outcome.winner);
        setWinningLine(outcome.line);
        setIsTimerActive(false);
        handleVictoryEffects(outcome.winner);
        return true;
      }
      if (outcome.kind === "GOLDEN_REEL") {
        // ALTIN MAKARA (Sudden Death) tetiklenir
        setIsGoldenReelActive(true);
        setIsTimerActive(false);
        audio.playPowerup();
        return true;
      }
      return false;
    },
    [handleVictoryEffects]
  );

  const commitCells = useCallback((next: (CellAnswer | null)[]) => {
    cellsRef.current = next;
    setCells(next);
  }, []);

  // Deadlock Kuralı: yanlış cevap / süre aşımı hakkı yakar; iki taraf da yakarsa kare kilitlenir.
  // Referanslar üzerinden saf çalışır (state güncelleyici içinde yan etki yok). Maç bittiyse true döner.
  const recordFailedAttempt = useCallback(
    (cellIndex: number, player: PlayerSymbol): boolean => {
      const result = registerFailedAttempt(attemptsRef.current, cellsRef.current, cellIndex, player);
      attemptsRef.current = result.attempts;
      setAttemptsPerCell(result.attempts);
      if (!result.locked) return false;
      commitCells(result.cells);
      return applyOutcome(
        evaluateOutcome(board.boardMode, result.cells, rarityRef.current.x, rarityRef.current.o)
      );
    },
    [board.boardMode, applyOutcome, commitCells]
  );

  useEffect(() => {
    currentTurnRef.current = currentTurn;
    recordFailedAttemptRef.current = recordFailedAttempt;
  }, [currentTurn, recordFailedAttempt]);

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
        // Spec: süre aşımı 1 yanlış denemedir. Kare açık değilse hakkı kalan rastgele bir kare yanar;
        // böylece AFK bir oyuncu maçı sonsuza uzatamaz (her süre aşımı bir hak tüketir).
        const player = currentTurnRef.current;
        let burn = openCell !== null && cellsRef.current[openCell] === null ? openCell : null;
        if (burn === null) {
          const candidates = cellsRef.current
            .map((c, i) => (c === null && !hasPlayerTriedCell(attemptsRef.current, i, player) ? i : -1))
            .filter(i => i >= 0);
          if (candidates.length > 0) burn = candidates[Math.floor(Math.random() * candidates.length)];
        }
        const ended = burn !== null ? recordFailedAttemptRef.current(burn, player) : false;
        if (!ended) switchTurn();
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

  // Her iki hamle türünün ortak ön kontrolü: maç, hücre doluluğu ve tek-hak kuralı
  const guardMove = useCallback(
    (cellIndex: number, player: PlayerSymbol): MoveResult | null => {
      if (winner !== null || isGoldenReelActive) return { success: false, message: dict.game.msgGameOver };
      if (!Number.isInteger(cellIndex) || cellIndex < 0 || cellIndex > 8) {
        return { success: false, message: dict.game.msgCellTaken };
      }
      if (cellsRef.current[cellIndex] !== null) return { success: false, message: dict.game.msgCellTaken };
      if (hasPlayerTriedCell(attemptsRef.current, cellIndex, player)) {
        return { success: false, message: dict.game.msgCellBurned };
      }
      return null;
    },
    [winner, isGoldenReelActive, dict]
  );

  // Ortak: yanlış cevap sonrası sırayı rakibe geçir (maç bittiyse geçirme)
  const failMove = useCallback(
    (cellIndex: number, player: PlayerSymbol, message: string): MoveResult => {
      audio.playError();
      haptic.error();
      setComboStreak(0);
      const ended = recordFailedAttempt(cellIndex, player);
      if (!ended) switchTurn();
      return { success: false, message };
    },
    [recordFailedAttempt, switchTurn]
  );

  // Ortak: doğru cevap sonrası puan, hücre ve sonuç
  const commitCorrectMove = useCallback(
    (
      cellIndex: number,
      player: PlayerSymbol,
      answer: CellAnswer,
      rarityPoints: number,
      points: number,
      newCombo: number
    ) => {
      setComboStreak(newCombo);
      rarityRef.current = {
        x: player === "X" ? rarityRef.current.x + rarityPoints : rarityRef.current.x,
        o: player === "O" ? rarityRef.current.o + rarityPoints : rarityRef.current.o,
      };
      setScoreRarityX(rarityRef.current.x);
      setScoreRarityO(rarityRef.current.o);
      setLastEarnedPoints(points);
      setTotalArcadeScore(prev => prev + points);

      audio.playChessMove();
      if (newCombo > 1) audio.playCombo(newCombo);
      haptic.medium();

      const next = [...cellsRef.current];
      next[cellIndex] = answer;
      commitCells(next);

      const ended = applyOutcome(evaluateOutcome(board.boardMode, next, rarityRef.current.x, rarityRef.current.o));
      if (!ended) switchTurn();
    },
    [board.boardMode, applyOutcome, commitCells, switchTurn]
  );

  // Execute Film Move (Klasik Düello ve Sinefil Konsept)
  const submitMove = useCallback(
    (cellIndex: number, movie: Movie, playerSymbol?: PlayerSymbol): MoveResult => {
      const player = playerSymbol || currentTurnRef.current;
      const blocked = guardMove(cellIndex, player);
      if (blocked) return blocked;

      if (usedMovieIdsRef.current.includes(movie.id)) {
        return failMove(cellIndex, player, dict.game.msgMovieUsed);
      }

      const rowCrit = board.rows[Math.floor(cellIndex / 3)];
      const colCrit = board.cols[cellIndex % 3];
      if (!validateMove(movie, rowCrit, colCrit)) {
        return failMove(cellIndex, player, dict.game.msgWrongMovie);
      }

      // Hücre içi havuz üzerinden Rarity: Temel 10 + nadirlik bonusu (0/2/5/8/12)
      const validPool = findMatchingMovies(rowCrit, colCrit);
      const rarity = calculateCellRarity(movie, validPool);
      const newCombo = comboStreak + 1;

      usedMovieIdsRef.current = [...usedMovieIdsRef.current, movie.id];
      setUsedMovieIds(usedMovieIdsRef.current);
      commitCorrectMove(
        cellIndex,
        player,
        {
          movie,
          answeredBy: player,
          timestamp: Date.now(),
          rarityTier: rarity.tier,
          rarityScore: rarity.totalPoints,
          pointsEarned: rarity.totalPoints,
        },
        rarity.totalPoints,
        rarity.totalPoints,
        newCombo
      );
      return { success: true, points: rarity.totalPoints, combo: newCombo };
    },
    [guardMove, failMove, commitCorrectMove, board.rows, board.cols, comboStreak, dict]
  );

  // Execute Actor Move (Ters Kadraj Modu)
  const submitActorMove = useCallback(
    (cellIndex: number, actorNameInput: string, playerSymbol?: PlayerSymbol): MoveResult => {
      const player = playerSymbol || currentTurnRef.current;
      const blocked = guardMove(cellIndex, player);
      if (blocked) return blocked;

      const rowCrit = board.rows[Math.floor(cellIndex / 3)];
      const colCrit = board.cols[cellIndex % 3];
      const validation = validateActorIntersection(actorNameInput, rowCrit.value, colCrit.value);
      if (!validation.isValid || !validation.matchedActor) {
        return failMove(cellIndex, player, dict.game.msgWrongActor);
      }

      const matchedActor = validation.matchedActor;
      const rarity = calculateActorRarity(matchedActor, rowCrit.value, colCrit.value);
      const newCombo = comboStreak + 1;
      // Arcade puanı: hız ve kombo ödüllendirilir (galibiyeti belirlemez, yalnızca skor)
      const timeBonus = Math.floor(secondsRemainingRef.current * 15);
      const points = Math.round((250 + timeBonus) * (1 + (newCombo - 1) * 0.4));

      commitCorrectMove(
        cellIndex,
        player,
        {
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
          answeredBy: player,
          timestamp: Date.now(),
          rarityTier: rarity.tier,
          rarityScore: rarity.totalPoints,
          pointsEarned: points,
        },
        rarity.totalPoints,
        points,
        newCombo
      );
      return { success: true, points, combo: newCombo };
    },
    [guardMove, failMove, commitCorrectMove, board.rows, board.cols, comboStreak, dict]
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

  // Bot kararı verirken en güncel fonksiyonlara ihtiyaç duyar; efektin yeniden kurulup
  // düşünme süresini sıfırlamaması için referanslardan okunur.
  const moveActionsRef = useRef({ submitMove, submitActorMove, failMove });
  useEffect(() => {
    moveActionsRef.current = { submitMove, submitActorMove, failMove };
  }, [submitMove, submitActorMove, failMove]);

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
    const phrases = dict.game.botPhrases;
    setBotStatusMessage(phrases[Math.floor(Math.random() * phrases.length)] ?? dict.game.botThinking);

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

      const decision = calculateBotMove(
        board,
        cellsRef.current,
        usedMovieIdsRef.current,
        botDifficulty,
        "O",
        attemptsRef.current,
        botSkill
      );
      const actions = moveActionsRef.current;

      if (!decision) {
        // Oynayabileceği kare kalmadı: sıra rakibe geçer
        audio.playError();
        switchTurn();
      } else if (decision.miss) {
        // Bot doğru cevabı hatırlayamadı: hakkı yanar (insan oyuncuyla aynı kural)
        setBotStatusMessage(dict.game.botMissed);
        actions.failMove(decision.cellIndex, "O", dict.game.botMissed);
      } else if (decision.actorName) {
        actions.submitActorMove(decision.cellIndex, decision.actorName, "O");
      } else if (decision.movie) {
        actions.submitMove(decision.cellIndex, decision.movie, "O");
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
  }, [isActive, mode, currentTurn, winner, isGoldenReelActive, board, botDifficulty, botSkill, dict, switchTurn]);

  // Sıradaki oyuncunun açık karelerin hepsinde hakkı bittiyse 12 sn boşuna beklenmez, sıra geçer.
  useEffect(() => {
    if (!isActive || winner !== null || isGoldenReelActive) return;
    if (mode === "VS_BOT" && currentTurn === "O") return; // bot kendi akışında karar verir
    const open = cells.map((c, i) => (c === null ? i : -1)).filter(i => i >= 0);
    if (open.length > 0 && open.every(i => hasPlayerTriedCell(attemptsPerCell, i, currentTurn))) {
      const t = setTimeout(() => switchTurn(), 700);
      return () => clearTimeout(t);
    }
  }, [isActive, winner, isGoldenReelActive, mode, currentTurn, cells, attemptsPerCell, switchTurn]);

  const resetGame = useCallback(
    (newBoard?: GameBoard) => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
      if (newBoard) setBoard(newBoard);
      cellsRef.current = Array(9).fill(null);
      attemptsRef.current = {};
      rarityRef.current = { x: 0, o: 0 };
      usedMovieIdsRef.current = [];
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