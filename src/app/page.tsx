"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { HomeScreen, GameSelectScreen, ErrorBoundary, GlobalModals } from "@/components";
import { GameView, useGameSession } from "@/features/gameplay";
import { useRealtimeMatch } from "@/features/multiplayer";
import {
  createRealtimeRoom,
  joinRealtimeRoom,
  syncProfileToSupabase,
  finishRealtimeGame,
  isSupabaseConfigured,
  ensureAnonymousSession,
} from "@/backend";
import {
  PRESET_BOARDS,
  getRandomBoard,
  createRandomizedBoard,
  getRandomOpponent,
  BotOpponentProfile,
  BOT_OPPONENTS,
  getBoardForMode,
} from "@/data/boards";
import {
  GameMode,
  Movie,
  BotDifficulty,
  CustomRoomSettings,
  GameBoard,
  ContentPoolType,
  PlayerSymbol,
} from "@/core";
import {
  UserProfile,
  DEFAULT_AMBIENCE,
  AMBIENCE_THEMES,
  AmbienceTheme,
  CinemaAmbience,
  MatchRecord,
} from "@/types/profile";
import { audio } from "@/utils/audio";

function CineXoxApp() {
  const [currentView, setCurrentView] = useState<"HOME" | "GAME_SELECT" | "GAME">("HOME");
  const [boardIndex, setBoardIndex] = useState<number>(0);
  const [mode, setMode] = useState<GameMode>("VS_BOT");
  const [contentPool, setContentPool] = useState<ContentPoolType>("HYBRID");
  const [allowSteal, setAllowSteal] = useState<boolean>(false);
  const [customRoomCode, setCustomRoomCode] = useState<string | null>(null);
  const [customShotClock, setCustomShotClock] = useState<number>(12);
  const [movieSearchError, setMovieSearchError] = useState<string | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("MEDIUM");
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Modallar
  const [showDailyShare, setShowDailyShare] = useState<boolean>(false);
  const [showCustomLobby, setShowCustomLobby] = useState<boolean>(false);
  const [showQuests, setShowQuests] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showGameModesHub, setShowGameModesHub] = useState<boolean>(false);
  const [showMatchFound, setShowMatchFound] = useState<boolean>(false);
  const [showMatchmakingQueue, setShowMatchmakingQueue] = useState<boolean>(false);
  const [queueMode, setQueueMode] = useState<"CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL">("CLASSIC");
  const [queueDifficulty, setQueueDifficulty] = useState<"EASY" | "NORMAL" | "HARD">("NORMAL");
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showAmbienceConsole, setShowAmbienceConsole] = useState<boolean>(false);
  const [showSurrenderConfirm, setShowSurrenderConfirm] = useState<boolean>(false);
  const [pendingSwitchMode, setPendingSwitchMode] = useState<GameMode | null>(null);
  const [pendingBoardIndex, setPendingBoardIndex] = useState<number>(0);
  const [pendingOpponent, setPendingOpponent] = useState<BotOpponentProfile>(() => BOT_OPPONENTS[0]);
  const hasRecordedMatchRef = useRef<boolean>(false);

  // Kullanıcı Profili
  const [profile, setProfile] = useState<UserProfile>({
    username: "Sinefil_99",
    avatarId: "avatar_director",
    rankTitle: "Bilet Kontrolörü 🍿",
    rankLevel: 1,
    totalMatches: 4,
    wins: 3,
    losses: 1,
    draws: 0,
    highestCombo: 4,
    dailyStreak: 3,
    streakProtected: false,
    favoriteGenre: "Sci-Fi",
    favoriteDirector: "Christopher Nolan",
    favoriteMode: "Klasik 3x3",
    lastFiveMatches: ["L", "W", "L", "W", "W"],
    reelsBalance: 350,
    diamondsBalance: 45,
    powerups: {
      freezeTime: 2,
      directorHint: 2,
      bombRetake: 1,
      doublePoints: 1,
    },
    unlockedAvatars: ["avatar_director", "avatar_actor"],
    isPro: false,
    tasteDna: {
      topDirector: "Christopher Nolan",
      topGenre: "Bilim Kurgu (Sci-Fi)",
      topDecade: "2010 Sonrası",
      cinemaAesthetic: "Karanlık Zihinler & Bilim Kurgu Tutkunu 🌌",
      genreBreakdown: [
        { genre: "Bilim Kurgu", percentage: 45 },
        { genre: "Suç & Gerilim", percentage: 35 },
        { genre: "Dram", percentage: 20 },
      ],
    },
    ambience: DEFAULT_AMBIENCE,
  });

  const [claimedDaily, setClaimedDaily] = useState<boolean>(false);
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>([]);

  // LocalStorage senkronizasyonu
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cinexox_ambience") || localStorage.getItem("cinetactico_ambience");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setProfile(prev => ({
            ...prev,
            ambience: {
              ...DEFAULT_AMBIENCE,
              ...parsed,
              theme: parsed.theme && parsed.theme in AMBIENCE_THEMES ? (parsed.theme as AmbienceTheme) : DEFAULT_AMBIENCE.theme,
            },
          }));
        }
      }

      const savedHistory = localStorage.getItem("cinexox_match_history");
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          setProfile(prev => ({
            ...prev,
            matchHistory: parsedHistory,
          }));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (profile.ambience) {
      try {
        localStorage.setItem("cinexox_ambience", JSON.stringify(profile.ambience));
      } catch {
        // ignore
      }
    }
  }, [profile.ambience]);

  // Otomatik anonim oyuncu kimliği başlatma / mevcut oturumu yükleme
  useEffect(() => {
    if (isSupabaseConfigured) {
      ensureAnonymousSession().then(state => {
        if (state.profile) {
          setProfile(prev => ({
            ...prev,
            username: state.profile?.username || prev.username,
            avatarId: state.profile?.avatar_id || prev.avatarId,
            wins: state.profile?.wins ?? prev.wins,
            losses: state.profile?.losses ?? prev.losses,
            draws: state.profile?.draws ?? prev.draws,
            reelsBalance: state.profile?.reels_balance ?? prev.reelsBalance,
          }));
        }
      });
    }
  }, []);

  // Oyun Oturumu (Game Session Hook)
  const {
    board,
    cells,
    currentTurn,
    winner,
    winningLine,
    secondsRemaining,
    usedMovieIds,
    scoreX,
    scoreO,
    scoreRarityX,
    scoreRarityO,
    isGoldenReelActive,
    goldenReelQuestion,
    submitMove,
    submitActorMove,
    resolveGoldenReelAnswer,
    resolveGoldenReelTimeout,
    totalArcadeScore,
    comboStreak,
    lastEarnedPoints,
    isBotThinking,
    botStatusMessage,
    resetGame,
    setBoard,
  } = useGameSession(
    PRESET_BOARDS[boardIndex],
    mode,
    botDifficulty,
    customShotClock,
    allowSteal,
    currentView === "GAME" && !showMatchFound
  );

  const isMatchInProgress = winner === null && cells.some(c => c !== null);

  // URL Davet Linki ile Odaya Katılım (?room=TRNY-XXXX)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam && isSupabaseConfigured) {
      const clean = roomParam.trim().toUpperCase();
      joinRealtimeRoom(clean, profile).then(res => {
        if (res.success && res.room) {
          setCustomRoomCode(clean);
          setMode("ONLINE_ROOM");
          setBoard(res.room.board_data);
          resetGame(res.room.board_data);
          setCurrentView("GAME");
        }
      });
    }
  }, []);

  // Supabase Gerçek Zamanlı Çok Oyunculu Senkronizasyonu
  const isHost = mode === "ONLINE_ROOM" && customRoomCode !== null && currentTurn === "X";

  const handleRemoteMove = useCallback(
    (cellIndex: number, movie: Movie, playerSymbol: PlayerSymbol) => {
      submitMove(cellIndex, movie, playerSymbol);
    },
    [submitMove]
  );

  const { broadcastMove } = useRealtimeMatch({
    roomCode: mode === "ONLINE_ROOM" ? customRoomCode : null,
    userProfile: profile,
    isHost,
    onRemoteMoveReceived: handleRemoteMove,
  });

  // Lobiye dönüldüğünde sesleri durdur
  useEffect(() => {
    if (currentView !== "GAME") {
      audio.stopAll();
    }
  }, [currentView]);

  // Maç bittiğinde istatistik güncellemesi
  useEffect(() => {
    if (winner === null) {
      hasRecordedMatchRef.current = false;
      return;
    }

    if (hasRecordedMatchRef.current) return;
    hasRecordedMatchRef.current = true;

    setProfile(prev => {
      const isWin = winner === "X";
      const outcome: "W" | "L" | "D" = isWin ? "W" : winner === "O" ? "L" : "D";
      const currentLast5 = prev.lastFiveMatches && prev.lastFiveMatches.length > 0
        ? prev.lastFiveMatches
        : ["L", "W", "L", "W", "W"];
      const updatedLast5 = [...currentLast5.slice(1), outcome] as ("W" | "L" | "D")[];

      const matchMode = (board.boardMode || (mode === "ONLINE_ROOM" ? "ONLINE_ROOM" : "CLASSIC")) as any;
      const modeLabel = board.boardMode === "REVERSE_CAST"
        ? "Ters Kadraj"
        : board.boardMode === "CINE_CONCEPT"
        ? "Sinefil Konsept"
        : mode === "ONLINE_ROOM"
        ? "Canlı Çevrimiçi Düello"
        : "Klasik Düello";

      const newRecord: MatchRecord = {
        id: `match_${Date.now()}`,
        timestamp: Date.now(),
        outcome: isWin ? "VICTORY" : winner === "O" ? "DEFEAT" : "DRAW",
        mode: matchMode,
        modeLabel,
        opponent: {
          name: pendingOpponent.name || "Sinefil Bot",
          avatarId: pendingOpponent.avatarId || "avatar_director",
          rankTitle: pendingOpponent.rankTitle,
        },
        trophyDelta: isWin ? 25 : winner === "DRAW" ? 10 : 8,
        scoreRarity: scoreRarityX,
        totalArcadeScore: totalArcadeScore || (isWin ? 1850 : 920),
        board: { ...board },
        cells: [...cells],
      };

      const updatedHistory = [newRecord, ...(prev.matchHistory || [])].slice(0, 20);
      try {
        localStorage.setItem("cinexox_match_history", JSON.stringify(updatedHistory));
      } catch {
        // ignore
      }

      const updated = {
        ...prev,
        totalMatches: prev.totalMatches + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: winner === "O" ? prev.losses + 1 : prev.losses,
        draws: winner === "DRAW" ? prev.draws + 1 : prev.draws,
        highestCombo: Math.max(prev.highestCombo, comboStreak),
        lastFiveMatches: updatedLast5,
        matchHistory: updatedHistory,
      };

      if (isSupabaseConfigured) {
        syncProfileToSupabase(updated);
        if (mode === "ONLINE_ROOM" && customRoomCode) {
          finishRealtimeGame(customRoomCode, winner);
        }
      }

      return updated;
    });
  }, [winner, board, cells, pendingOpponent, scoreRarityX, totalArcadeScore, mode, customRoomCode, comboStreak]);

  // Eylemler & Etkileşimler
  const handleCellSelect = (index: number) => {
    if (mode === "VS_BOT" && currentTurn === "O") return;
    setMovieSearchError(null);
    setActiveCellIndex(index);
  };

  const handleMovieChosen = (movie: Movie) => {
    if (activeCellIndex === null) return;
    const targetIdx = activeCellIndex;
    setActiveCellIndex(null);
    const result = submitMove(targetIdx, movie);
    if (result.success) {
      setMovieSearchError(null);
      if (mode === "ONLINE_ROOM" && customRoomCode) {
        broadcastMove(targetIdx, movie, currentTurn, result.stolen);
      }
    } else {
      audio.playError();
      const failMsg = result.message || "Hatalı tahmin! Sıra rakibe geçti.";
      setMovieSearchError(null);
      setHintMessage(`❌ ${failMsg}`);
      setTimeout(() => setHintMessage(null), 3500);
    }
  };

  const handleActorChosen = (actorName: string) => {
    if (activeCellIndex === null) return;
    const targetIdx = activeCellIndex;
    setActiveCellIndex(null);
    const result = submitActorMove(targetIdx, actorName);
    if (result.success) {
      setMovieSearchError(null);
    } else {
      audio.playError();
      const failMsg = result.message || "Hatalı aktör! Sıra rakibe geçti.";
      setMovieSearchError(null);
      setHintMessage(`❌ ${failMsg}`);
      setTimeout(() => setHintMessage(null), 3500);
    }
  };

  const handleNextBoard = () => {
    if (isMatchInProgress) {
      setPendingSwitchMode(null);
      setShowSurrenderConfirm(true);
      return;
    }
    const { board: nextBoard, index: nextIdx } = getRandomBoard(boardIndex);
    const opp = getRandomOpponent(botDifficulty, pendingOpponent.name);
    setBoardIndex(nextIdx);
    setPendingBoardIndex(nextIdx);
    setPendingOpponent(opp);
    setBoard(nextBoard);
    resetGame(nextBoard);
  };

  const handleRequestExitGame = () => {
    if (isMatchInProgress) {
      setPendingSwitchMode(null);
      setShowSurrenderConfirm(true);
    } else {
      audio.stopAll();
      audio.playSelect();
      setCurrentView("HOME");
    }
  };

  const handleHeaderReset = () => {
    if (isMatchInProgress) {
      setPendingSwitchMode(null);
      setShowSurrenderConfirm(true);
    } else {
      audio.playSelect();
      resetGame();
    }
  };

  const handleSelectDifficulty = (diff: BotDifficulty) => {
    if (botDifficulty === diff) return;
    if (isMatchInProgress) {
      audio.playError();
      setHintMessage("🔒 Maç devam ederken bot zorluğu değiştirilemez! Önce maçı tamamlayın veya 'Terk Et' yapın.");
      setTimeout(() => setHintMessage(null), 3500);
      return;
    }
    audio.playSelect();
    setBotDifficulty(diff);
    const opp = getRandomOpponent(diff, pendingOpponent.name);
    setPendingOpponent(opp);
  };

  const handleSwitchMode = (targetMode: GameMode) => {
    if (mode === targetMode) return;
    if (isMatchInProgress) {
      setPendingSwitchMode(targetMode);
      setShowSurrenderConfirm(true);
      return;
    }
    audio.playSelect();
    setMode(targetMode);
    setAllowSteal(false);
    setCustomShotClock(12);
    if (targetMode === "VS_BOT") {
      const { board: nextBoard, index: nextIdx } = getRandomBoard(boardIndex);
      const opp = getRandomOpponent(botDifficulty, pendingOpponent.name);
      setBoardIndex(nextIdx);
      setPendingBoardIndex(nextIdx);
      setPendingOpponent(opp);
      setBoard(nextBoard);
      resetGame(nextBoard);
    } else if (targetMode === "DAILY_SOLO") {
      setBoardIndex(2);
      resetGame(PRESET_BOARDS[2]);
    } else if (targetMode === "ONLINE_ROOM") {
      setShowCustomLobby(true);
    } else {
      resetGame();
    }
  };

  const handleConfirmSurrender = () => {
    audio.stopAll();
    audio.playError();
    setShowSurrenderConfirm(false);
    setProfile(prev => {
      const currentLast5 = prev.lastFiveMatches?.length ? prev.lastFiveMatches : ["L", "W", "L", "W", "W"];
      const updatedLast5 = [...currentLast5.slice(1), "L"] as ("W" | "L" | "D")[];
      return {
        ...prev,
        totalMatches: prev.totalMatches + 1,
        losses: prev.losses + 1,
        lastFiveMatches: updatedLast5,
      };
    });
    setHintMessage("🏳️ Maçı terk ettin! Hükmen mağlubiyet kariyerine işlendi.");
    setTimeout(() => setHintMessage(null), 4000);
    resetGame();

    if (pendingSwitchMode) {
      const targetMode = pendingSwitchMode;
      setPendingSwitchMode(null);
      setMode(targetMode);
      setAllowSteal(false);
      setCustomShotClock(12);
      if (targetMode === "VS_BOT") {
        const { board: nextBoard, index: nextIdx } = getRandomBoard(boardIndex);
        const opp = getRandomOpponent(botDifficulty, pendingOpponent.name);
        setBoardIndex(nextIdx);
        setPendingBoardIndex(nextIdx);
        setPendingOpponent(opp);
        setBoard(nextBoard);
        resetGame(nextBoard);
      } else if (targetMode === "DAILY_SOLO") {
        setBoardIndex(2);
        resetGame(PRESET_BOARDS[2]);
      } else if (targetMode === "ONLINE_ROOM") {
        setShowCustomLobby(true);
      }
    } else {
      setCurrentView("HOME");
    }
  };

  const handleCreateCustomRoom = (settings: CustomRoomSettings) => {
    setCustomRoomCode(settings.roomCode);
    setCustomShotClock(settings.shotClockSeconds);
    setAllowSteal(settings.allowCellStealing);
    setMode("ONLINE_ROOM");
    const activeBoard = PRESET_BOARDS[boardIndex];
    setBoard(activeBoard);
    resetGame(activeBoard);

    if (isSupabaseConfigured) {
      createRealtimeRoom(settings.roomCode, profile, activeBoard, settings);
    }
  };

  const handleClaimDailyReward = (amount: number) => {
    const todayUtc = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem("cinexox_last_streak_utc", todayUtc);
    } catch {
      // ignore
    }
    setProfile(p => ({
      ...p,
      reelsBalance: p.reelsBalance + amount,
      lastStreakDateUtc: todayUtc,
    }));
    setClaimedDaily(true);
  };

  const handleBuyAvatar = (avatarId: string, costReels: number) => {
    setProfile(p => ({
      ...p,
      reelsBalance: Math.max(0, p.reelsBalance - costReels),
      avatarId,
      unlockedAvatars: [...(p.unlockedAvatars || ["avatar_director", "avatar_actor"]), avatarId],
    }));
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile(p => ({ ...p, ...updated }));
  };

  const handleToggleMute = () => {
    const isMuted = audio.toggleMute();
    setMuted(isMuted);
  };

  const handleStartFromHome = (
    categoryOrMode: string,
    diff: "EASY" | "NORMAL" | "HARD",
    pool: ContentPoolType = "HYBRID"
  ) => {
    audio.playSelect();
    setContentPool(pool);
    setQueueDifficulty(diff);
    let resolvedMode: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL" = "CLASSIC";
    if (categoryOrMode === "REVERSE_CAST") resolvedMode = "REVERSE_CAST";
    else if (categoryOrMode === "CINE_CONCEPT") resolvedMode = "CINE_CONCEPT";
    else if (categoryOrMode === "SINEFIL") resolvedMode = "SINEFIL";
    setQueueMode(resolvedMode);

    const difficultyMap: Record<"EASY" | "NORMAL" | "HARD", BotDifficulty> = {
      EASY: "EASY",
      NORMAL: "MEDIUM",
      HARD: "HARD",
    };
    setBotDifficulty(difficultyMap[diff]);
    setShowMatchmakingQueue(true);
  };

  const executeMatchSetup = (
    modeType: "CLASSIC" | "REVERSE_CAST" | "CINE_CONCEPT" | "SINEFIL",
    diff: "EASY" | "NORMAL" | "HARD"
  ) => {
    const difficultyMap: Record<"EASY" | "NORMAL" | "HARD", BotDifficulty> = {
      EASY: "EASY",
      NORMAL: "MEDIUM",
      HARD: "HARD",
    };
    const targetDiff = difficultyMap[diff];
    setBotDifficulty(targetDiff);

    const result = getBoardForMode(modeType, boardIndex);
    const targetIdx = result.index;
    const nextBoard = result.board;
    const opp = getRandomOpponent(targetDiff, pendingOpponent.name);

    setPendingBoardIndex(targetIdx);
    setPendingOpponent(opp);
    setBoardIndex(targetIdx);
    setBoard(nextBoard);
    resetGame(nextBoard);
    setMode("VS_BOT");
    setCustomShotClock(12);

    setShowMatchmakingQueue(false);
    setShowMatchFound(true);
  };

  const handleQueueMatchFound = () => {
    executeMatchSetup(queueMode, queueDifficulty);
  };

  const handleQueuePlayWithAiImmediately = () => {
    executeMatchSetup(queueMode, queueDifficulty);
  };

  const handleMatchFoundCountdownComplete = () => {
    setShowMatchFound(false);
    setCurrentView("GAME");
  };

  const handleOpenDailyFromHome = () => {
    audio.playSelect();
    setMode("DAILY_SOLO");
    setBoardIndex(2);
    setBoard(PRESET_BOARDS[2]);
    resetGame(PRESET_BOARDS[2]);
    setCurrentView("GAME");
    setShowDailyShare(true);
  };

  // Ortak Modallar Props
  const globalModalsProps = {
    showMatchmakingQueue,
    showMatchFound,
    showDailyShare,
    showCustomLobby,
    showQuests,
    showShop,
    showGameModesHub,
    showProfile,
    showHelp,
    showLeaderboard,
    showAmbienceConsole,
    showNotifications,
    profile,
    queueMode,
    queueDifficulty,
    contentPool,
    pendingOpponent,
    board,
    cells,
    totalArcadeScore,
    mode,
    winner,
    muted,
    claimedDaily,
    claimedQuestIds,
    onCloseMatchmakingQueue: () => setShowMatchmakingQueue(false),
    onQueueMatchFound: handleQueueMatchFound,
    onQueuePlayWithAiImmediately: handleQueuePlayWithAiImmediately,
    onMatchFoundCountdownComplete: handleMatchFoundCountdownComplete,
    onCloseDailyShare: () => setShowDailyShare(false),
    onCloseCustomLobby: () => setShowCustomLobby(false),
    onCreateCustomRoom: handleCreateCustomRoom,
    onCloseQuests: () => setShowQuests(false),
    onClaimDailyReward: handleClaimDailyReward,
    onClaimQuest: (qId: string, reels: number) => {
      setClaimedQuestIds(p => [...p, qId]);
      handleClaimDailyReward(reels);
    },
    onCloseShop: () => setShowShop(false),
    onSelectAvatar: (avatarId: string) => handleUpdateProfile({ avatarId }),
    onBuyAvatar: handleBuyAvatar,
    onCloseGameModesHub: () => setShowGameModesHub(false),
    onSelectPlayableBoard: (idx: number) => {
      setBoardIndex(idx);
      setBoard(PRESET_BOARDS[idx]);
      resetGame(PRESET_BOARDS[idx]);
      setCurrentView("GAME");
    },
    onCloseProfile: () => setShowProfile(false),
    onUpdateProfile: handleUpdateProfile,
    onToggleMute: handleToggleMute,
    onCloseHelp: () => setShowHelp(false),
    onCloseLeaderboard: () => setShowLeaderboard(false),
    onCloseAmbienceConsole: () => setShowAmbienceConsole(false),
    onUpdateAmbience: (updated: Partial<CinemaAmbience>) => {
      setProfile(prev => ({
        ...prev,
        ambience: {
          ...(prev.ambience || DEFAULT_AMBIENCE),
          ...updated,
        },
      }));
    },
    onResetAmbience: () => {
      setProfile(prev => ({
        ...prev,
        ambience: DEFAULT_AMBIENCE,
      }));
    },
    onCloseNotifications: () => setShowNotifications(false),
  };

  // 1. HOME SCREEN VIEW
  if (currentView === "HOME") {
    return (
      <main className="min-h-[100dvh] bg-[#07080b] flex flex-col items-center">
        <HomeScreen
          profile={profile}
          onStartGame={handleStartFromHome}
          onOpenProfileModal={() => {
            audio.playSelect();
            setShowProfile(true);
          }}
          onOpenCustomLobby={() => {
            audio.playSelect();
            setShowCustomLobby(true);
          }}
          onOpenDaily={handleOpenDailyFromHome}
          onOpenLeaderboard={() => {
            audio.playSelect();
            setShowLeaderboard(true);
          }}
          onOpenShop={() => {
            audio.playSelect();
            setShowShop(true);
          }}
          onOpenQuests={() => {
            audio.playSelect();
            setShowQuests(true);
          }}
          onOpenGameModesHub={() => {
            audio.playSelect();
            setShowGameModesHub(true);
          }}
          onOpenDna={() => {
            audio.playSelect();
            setShowProfile(true);
          }}
          onOpenLiveAmbience={() => {
            audio.playSelect();
            setShowAmbienceConsole(true);
          }}
          onOpenNotifications={() => {
            audio.playSelect();
            setShowNotifications(true);
          }}
          onOpenGameSelect={() => {
            audio.playSelect();
            setCurrentView("GAME_SELECT");
          }}
        />
        <GlobalModals {...globalModalsProps} />
      </main>
    );
  }

  // 2. GAME SELECT SCREEN VIEW
  if (currentView === "GAME_SELECT") {
    return (
      <main className="min-h-[100dvh] bg-[#07080b] flex flex-col items-center">
        <GameSelectScreen
          onBack={() => setCurrentView("HOME")}
          onSelectBoard={(boardIdx, selectedMode) => {
            const opp = getRandomOpponent(pendingOpponent.name);
            const randomized = createRandomizedBoard(PRESET_BOARDS[boardIdx]);
            setBoardIndex(boardIdx);
            setBoard(randomized);
            resetGame(randomized);
            setMode(selectedMode);
            setPendingBoardIndex(boardIdx);
            setPendingOpponent(opp);
            setShowMatchFound(true);
          }}
          onOpenCustomLobby={() => {
            setCurrentView("HOME");
            setTimeout(() => {
              audio.playSelect();
              setShowCustomLobby(true);
            }, 100);
          }}
        />
        <GlobalModals {...globalModalsProps} />
      </main>
    );
  }

  // 3. GAMEPLAY SCREEN VIEW
  return (
    <>
      <GameView
        board={board}
        boardIndex={boardIndex}
        cells={cells}
        currentTurn={currentTurn}
        winner={winner}
        winningLine={winningLine}
        secondsRemaining={secondsRemaining}
        customShotClock={customShotClock}
        isBotThinking={isBotThinking}
        botStatusMessage={botStatusMessage}
        scoreX={scoreX}
        scoreO={scoreO}
        scoreRarityX={scoreRarityX}
        scoreRarityO={scoreRarityO}
        comboStreak={comboStreak}
        lastEarnedPoints={lastEarnedPoints}
        totalArcadeScore={totalArcadeScore}
        mode={mode}
        botDifficulty={botDifficulty}
        allowSteal={allowSteal}
        customRoomCode={customRoomCode}
        profile={profile}
        muted={muted}
        hintMessage={hintMessage}
        activeCellIndex={activeCellIndex}
        movieSearchError={movieSearchError}
        usedMovieIds={usedMovieIds}
        contentPool={contentPool}
        isGoldenReelActive={isGoldenReelActive}
        goldenReelQuestion={goldenReelQuestion}
        showSurrenderConfirm={showSurrenderConfirm}
        pendingSwitchMode={pendingSwitchMode}
        pendingOpponent={pendingOpponent}
        pendingBoardIndex={pendingBoardIndex}
        onToggleMute={handleToggleMute}
        onHeaderReset={handleHeaderReset}
        onRequestExitGame={handleRequestExitGame}
        onOpenQuests={() => {
          audio.playSelect();
          setShowQuests(true);
        }}
        onOpenProfile={() => {
          audio.playSelect();
          setShowProfile(true);
        }}
        onOpenHelp={() => {
          audio.playSelect();
          setShowHelp(true);
        }}
        onOpenDailyShare={() => {
          audio.playSelect();
          setShowDailyShare(true);
        }}
        onSwitchMode={handleSwitchMode}
        onSelectDifficulty={handleSelectDifficulty}
        onNextBoard={handleNextBoard}
        onCellSelect={handleCellSelect}
        onCloseSearchModal={() => {
          setMovieSearchError(null);
          setActiveCellIndex(null);
        }}
        onMovieChosen={handleMovieChosen}
        onActorChosen={handleActorChosen}
        onResolveGoldenReelAnswer={resolveGoldenReelAnswer}
        onResolveGoldenReelTimeout={resolveGoldenReelTimeout}
        onPlayAgain={() => {
          const { board: nextBoard, index: nextIdx } = getRandomBoard(boardIndex);
          const opp = getRandomOpponent(botDifficulty, pendingOpponent.name);
          setPendingBoardIndex(nextIdx);
          setPendingOpponent(opp);
          setBoardIndex(nextIdx);
          setBoard(nextBoard);
          resetGame(nextBoard);
          setShowMatchFound(true);
        }}
        onBackToHome={() => {
          audio.stopAll();
          audio.playSelect();
          resetGame();
          setCurrentView("HOME");
        }}
        onCancelSurrender={() => {
          setPendingSwitchMode(null);
          setShowSurrenderConfirm(false);
        }}
        onConfirmSurrender={handleConfirmSurrender}
      />
      <GlobalModals {...globalModalsProps} />
    </>
  );
}

export default function CineXoxPage() {
  return (
    <ErrorBoundary>
      <CineXoxApp />
    </ErrorBoundary>
  );
}
