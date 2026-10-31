"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { ShotClock } from "@/components/ShotClock";
import { XoxBoard } from "@/components/XoxBoard";
import { MovieSearchModal } from "@/components/MovieSearchModal";
import { PostGameAnalysisModal } from "@/components/PostGameAnalysisModal";
import { TabletSidePanel } from "@/components/TabletSidePanel";
import { ComboBanner } from "@/components/ComboBanner";
import { DailyShareModal } from "@/components/DailyShareModal";
import { CustomRoomModal } from "@/components/CustomRoomModal";
import { QuestsModal } from "@/components/QuestsModal";
import { ProfileModal } from "@/components/ProfileModal";
import { HowToPlayModal } from "@/components/HowToPlayModal";
import { HomeScreen } from "@/components/HomeScreen";
import { ShopModal } from "@/components/ShopModal";
import { GameModesHubModal } from "@/components/GameModesHubModal";
import { GameSelectScreen } from "@/components/GameSelectScreen";
import { MatchFoundModal } from "@/components/MatchFoundModal";
import { MatchmakingQueueModal } from "@/components/MatchmakingQueueModal";
import { LeaderboardModal } from "@/components/LeaderboardModal";
import { LiveAmbienceConsole } from "@/components/LiveAmbienceConsole";
import NotificationPanel, { NotifToast, useNotifications } from "@/components/NotificationPanel";
import { ActorSearchModal } from "@/components/ActorSearchModal";
import { GoldenReelModal } from "@/components/GoldenReelModal";
import { useGameSession } from "@/hooks/useXoxGame";
import { PRESET_BOARDS, getRandomBoard, createRandomizedBoard, getRandomOpponent, BotOpponentProfile, BOT_OPPONENTS, getBoardForMode } from "@/data/boards";
import { GameMode, Movie, BotDifficulty, CustomRoomSettings, GameBoard, ContentPoolType } from "@/types/game";
import { UserProfile, PowerupInventory, DEFAULT_AMBIENCE, AMBIENCE_THEMES, CinemaAmbience, AmbienceTheme } from "@/types/profile";
import { audio } from "@/utils/audio";
import { Users, Bot, Swords, Calendar, Shuffle, Zap, Flame, Share2, ShieldAlert, ArrowLeft, Lightbulb, Flag, Lock } from "lucide-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

function CineXoxPageContent() {
  const [currentView, setCurrentView] = useState<"HOME" | "GAME_SELECT" | "GAME">("HOME");
  // Hydration fix: Deterministic initial board index (prevents SSR vs client mismatch)
  const [boardIndex, setBoardIndex] = useState<number>(0);
  const [contentPool, setContentPool] = useState<ContentPoolType>("FILM");
  const [mode, setMode] = useState<GameMode>("PASS_AND_PLAY");
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("MEDIUM");
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
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
  const [notifUnreadCount, setNotifUnreadCount] = useState<number>(2);
  const [pendingBoardIndex, setPendingBoardIndex] = useState<number>(0);
  const [pendingOpponent, setPendingOpponent] = useState<BotOpponentProfile>(() => BOT_OPPONENTS[0]);

  // Kullanıcı Profili & Sinefil Kimliği (Letterboxd & CineXOX)
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

  // LocalStorage'dan Sinema Salonu Ambiyans & Işık Ayarlarını Yükle/Kaydet
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
  const [claimedDaily, setClaimedDaily] = useState<boolean>(false);
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>([]);

  // UTC Server-Time Authority for Daily Streak & Claims
  useEffect(() => {
    try {
      const todayUtc = new Date().toISOString().slice(0, 10);
      const savedDate = localStorage.getItem("cinexox_last_streak_utc");
      if (savedDate) {
        if (savedDate === todayUtc) {
          setClaimedDaily(true);
        } else {
          setClaimedDaily(false);
          const lastDate = new Date(savedDate + "T00:00:00Z");
          const curDate = new Date(todayUtc + "T00:00:00Z");
          const diffDays = Math.round((curDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 1) {
            setProfile(p => ({ ...p, dailyStreak: 1 }));
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Özel Turnuva & Düello Odası Ayarları (MVP: 12s Hızlı Blitz Tempo, Hile Koruması)
  const [customShotClock, setCustomShotClock] = useState<number>(12);
  const [allowSteal, setAllowSteal] = useState<boolean>(false);
  const [allowPowerups, setAllowPowerups] = useState<boolean>(false);
  const [customRoomCode, setCustomRoomCode] = useState<string | null>(null);
  const [movieSearchError, setMovieSearchError] = useState<string | null>(null);

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
    addSeconds,
    bombCell,
    getCellSolutions,
  } = useGameSession(
    PRESET_BOARDS[boardIndex],
    mode,
    botDifficulty,
    customShotClock,
    allowSteal,
    currentView === "GAME" && !showMatchFound
  );

  const isMatchInProgress = winner === null && cells.some(c => c !== null);

  // Lobi veya diğer ekranlara dönüldüğünde tüm ses ve arka plan osilatörlerini derhal durdur
  useEffect(() => {
    if (currentView !== "GAME") {
      audio.stopAll();
    }
  }, [currentView]);

  // Maç bittiğinde kariyer istatistiğini ve son 5 maç formunu güncelle
  useEffect(() => {
    if (winner !== null) {
      setProfile(prev => {
        const isWin = winner === "X";
        const outcome: "W" | "L" | "D" = isWin ? "W" : winner === "O" ? "L" : "D";
        const currentLast5 = prev.lastFiveMatches && prev.lastFiveMatches.length > 0
          ? prev.lastFiveMatches
          : ["L", "W", "L", "W", "W"];
        const updatedLast5 = [...currentLast5.slice(1), outcome] as ("W" | "L" | "D")[];

        return {
          ...prev,
          totalMatches: prev.totalMatches + 1,
          wins: isWin ? prev.wins + 1 : prev.wins,
          losses: winner === "O" ? prev.losses + 1 : prev.losses,
          draws: winner === "DRAW" ? prev.draws + 1 : prev.draws,
          highestCombo: Math.max(prev.highestCombo, comboStreak),
          lastFiveMatches: updatedLast5,
        };
      });
    }
  }, [winner]);

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
      setAllowPowerups(false);
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

  const handleCreateCustomRoom = (settings: CustomRoomSettings, selectedBoard: GameBoard) => {
    setCustomRoomCode(settings.roomCode);
    setCustomShotClock(settings.shotClockSeconds);
    setAllowSteal(settings.allowCellStealing);
    setAllowPowerups(settings.allowPowerups ?? false);
    setMode("ONLINE_ROOM");
    setBoard(selectedBoard);
    resetGame(selectedBoard);
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

  // Avatar Koleksiyonu Satın Alma (Makara ile)
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

    // Ekran 3: Eşleşme Bekleme Ekranını (Film Makarası Animasyonu) Başlat
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

    // Mod'a göre Eksen Güvenliği onaylı tahta getir
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

  if (currentView === "HOME") {
    return (
      <main className="min-h-screen bg-[#07080b] flex flex-col items-center">
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
          onOpenQuests={() => {
            audio.playSelect();
            setShowQuests(true);
          }}
          onOpenDna={() => {
            audio.playSelect();
            setShowProfile(true);
          }}
          onOpenShop={() => {
            audio.playSelect();
            setShowShop(true);
          }}
          onOpenPro={() => {
            audio.playSelect();
            setShowShop(true);
          }}
          onOpenGameModesHub={() => {
            audio.playSelect();
            setShowGameModesHub(true);
          }}
          onOpenGameSelect={() => {
            audio.playSelect();
            setCurrentView("GAME_SELECT");
          }}
          onOpenLeaderboard={() => {
            audio.playSelect();
            setShowLeaderboard(true);
          }}
          onOpenNotifications={() => {
            audio.playSelect();
            setShowNotifications(true);
            setNotifUnreadCount(0);
          }}
          onOpenLiveAmbience={() => {
            audio.playSelect();
            setShowAmbienceConsole(true);
          }}
          notifUnreadCount={notifUnreadCount}
        />

        {/* Live Ambience Console (Ana Ekranda Canlı Görerek Işık Ayarlama Masası) */}
        <LiveAmbienceConsole
          isOpen={showAmbienceConsole}
          onClose={() => setShowAmbienceConsole(false)}
          ambience={profile.ambience || DEFAULT_AMBIENCE}
          onUpdateAmbience={(updated) => {
            setProfile(prev => ({
              ...prev,
              ambience: {
                ...(prev.ambience || DEFAULT_AMBIENCE),
                ...updated,
              },
            }));
          }}
          onResetAmbience={() => {
            setProfile(prev => ({
              ...prev,
              ambience: DEFAULT_AMBIENCE,
            }));
          }}
        />

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          onMarkAllRead={() => setNotifUnreadCount(0)}
        />

        {/* Home Screen Modals */}
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          isMuted={muted}
          onToggleMute={handleToggleMute}
          onOpenLiveAmbience={() => {
            setShowProfile(false);
            setShowAmbienceConsole(true);
          }}
        />

        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
          currentUser={profile}
        />

        {/* ── Ekran 3: Eşleşme Bekleme Ekranı (10-15s Film Şeridi Animasyonu) ─── */}
        <MatchmakingQueueModal
          isOpen={showMatchmakingQueue}
          userProfile={profile}
          selectedMode={queueMode}
          contentPool={contentPool}
          difficulty={queueDifficulty}
          onCancel={() => setShowMatchmakingQueue(false)}
          onMatchFound={handleQueueMatchFound}
          onPlayWithAiImmediately={handleQueuePlayWithAiImmediately}
        />

        <MatchFoundModal
          isOpen={showMatchFound}
          userProfile={profile}
          opponentName={pendingOpponent.name}
          opponentAvatarId={pendingOpponent.avatarId}
          opponentLevel={pendingOpponent.level}
          opponentRankTitle={pendingOpponent.rankTitle}
          opponentWinRate={pendingOpponent.winRate}
          boardTitle={board.title || PRESET_BOARDS[pendingBoardIndex]?.title}
          onCountdownComplete={handleMatchFoundCountdownComplete}
        />

        <QuestsModal
          isOpen={showQuests}
          onClose={() => setShowQuests(false)}
          reelsBalance={profile.reelsBalance}
          dailyStreak={profile.dailyStreak}
          onClaimDaily={handleClaimDailyReward}
          claimedDaily={claimedDaily}
          claimedQuestIds={claimedQuestIds}
          onClaimQuest={(qId, reels) => {
            setClaimedQuestIds(p => [...p, qId]);
            handleClaimDailyReward(reels);
          }}
        />

        {/* Sinefil İkon Pazarı (Avatar Koleksiyonu) Modalı */}
        <ShopModal
          isOpen={showShop}
          onClose={() => setShowShop(false)}
          profile={profile}
          onSelectAvatar={(avatarId) => handleUpdateProfile({ avatarId })}
          onBuyAvatar={handleBuyAvatar}
        />

        <GameModesHubModal
          isOpen={showGameModesHub}
          onClose={() => setShowGameModesHub(false)}
          onSelectPlayableBoard={(idx, title) => {
            setBoardIndex(idx);
            setBoard(PRESET_BOARDS[idx]);
            resetGame(PRESET_BOARDS[idx]);
            setCurrentView("GAME");
          }}
        />

        <CustomRoomModal
          isOpen={showCustomLobby}
          onClose={() => setShowCustomLobby(false)}
          onCreateRoom={(settings, selectedBoard) => {
            handleCreateCustomRoom(settings, selectedBoard);
            const bIdx = PRESET_BOARDS.findIndex(b => b.id === selectedBoard.id);
            setPendingBoardIndex(bIdx !== -1 ? bIdx : 0);
            setPendingOpponent(getRandomOpponent("MEDIUM"));
            setShowMatchFound(true);
          }}
        />

        <DailyShareModal
          isOpen={showDailyShare}
          onClose={() => setShowDailyShare(false)}
          board={board}
          cells={cells}
          score={totalArcadeScore}
        />

        <HowToPlayModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </main>
    );
  }

  // ── GAME SELECT SCREEN ─────────────────────────────────────────────────────
  if (currentView === "GAME_SELECT") {
    return (
      <>
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
        {/* ── Ekran 3: Eşleşme Bekleme Ekranı (10-15s Film Şeridi Animasyonu) ─── */}
        <MatchmakingQueueModal
          isOpen={showMatchmakingQueue}
          userProfile={profile}
          selectedMode={queueMode}
          contentPool={contentPool}
          difficulty={queueDifficulty}
          onCancel={() => setShowMatchmakingQueue(false)}
          onMatchFound={handleQueueMatchFound}
          onPlayWithAiImmediately={handleQueuePlayWithAiImmediately}
        />

        <MatchFoundModal
          isOpen={showMatchFound}
          userProfile={profile}
          opponentName={pendingOpponent.name}
          opponentAvatarId={pendingOpponent.avatarId}
          opponentLevel={pendingOpponent.level}
          opponentRankTitle={pendingOpponent.rankTitle}
          opponentWinRate={pendingOpponent.winRate}
          boardTitle={board.title || PRESET_BOARDS[pendingBoardIndex]?.title}
          onCountdownComplete={handleMatchFoundCountdownComplete}
        />
      </>
    );
  }

  const gameAmbience = { ...DEFAULT_AMBIENCE, ...(profile?.ambience || {}) };
  const gameTheme = (gameAmbience.theme && AMBIENCE_THEMES[gameAmbience.theme]) || AMBIENCE_THEMES.velvet_red;
  const safeGameDimness = typeof gameAmbience.dimness === "number" && !isNaN(gameAmbience.dimness) ? gameAmbience.dimness : 85;
  const safeGameGlow = typeof gameAmbience.glowIntensity === "number" && !isNaN(gameAmbience.glowIntensity) ? gameAmbience.glowIntensity : 65;

  return (
    <div
      className="min-h-screen text-white flex flex-col font-sans select-none antialiased transition-colors duration-500 relative"
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
        scoreX={scoreX}
        scoreO={scoreO}
        currentTurn={currentTurn}
        onReset={handleHeaderReset}
        isMuted={muted}
        onToggleMute={handleToggleMute}
        reelsBalance={profile.reelsBalance}
        userAvatarId={profile.avatarId}
        onBackToHome={handleRequestExitGame}
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
      />

      {/* Block Blast Floating Combo Pop-up */}
      <ComboBanner comboStreak={comboStreak} lastPoints={lastEarnedPoints} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <main className="flex-1 flex flex-col items-center justify-start p-2 sm:p-4 max-w-2xl mx-auto w-full">
          {/* Block Blast Skor & Hızlı Akış Barı */}
          <div className="w-full max-w-md mx-auto my-1 flex items-center justify-between px-3 py-1.5 rounded-2xl bg-gradient-to-r from-cinema-card via-cinema-dark to-cinema-card border border-cinema-border shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-black">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-zinc-400 text-[11px]">SKOR:</span>
              <span className="text-amber-400 text-sm font-black tracking-wide">
                {totalArcadeScore.toLocaleString()}
              </span>
            </div>

            {comboStreak > 1 ? (
              <div className="flex items-center gap-1 text-xs font-black text-rose-400 animate-pulse-fast bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                <Flame className="w-3.5 h-3.5 fill-rose-400" />
                KOMBO x{comboStreak}
              </div>
            ) : isBotThinking ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
                <span>{botStatusMessage || "Düşünüyor..."}</span>
              </div>
            ) : mode === "DAILY_SOLO" ? (
              <button
                onClick={() => {
                  audio.playSelect();
                  setShowDailyShare(true);
                }}
                className="flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 transition-all active:scale-95"
              >
                <Share2 className="w-3 h-3" />
                Skor Kartı Paylaş
              </button>
            ) : allowSteal ? (
              <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                <ShieldAlert className="w-3 h-3" /> KARE ÇALMA AKTİF
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 border border-amber-500/30 text-[10px] font-mono font-bold" title="Canlı Rarity (Nadirlik) Puanları & Foto-finiş Üstünlüğü">
                  <span className="text-cyan-400">X: {scoreRarityX}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-rose-400">O: {scoreRarityO}</span>
                </div>
                {winner === null && (
                  <button
                    type="button"
                    onClick={handleRequestExitGame}
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
              onClick={() => handleSwitchMode("PASS_AND_PLAY")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                mode === "PASS_AND_PLAY"
                  ? "bg-amber-400 text-cinema-dark shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Pass & Play</span>
            </button>

            <button
              onClick={() => handleSwitchMode("VS_BOT")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                mode === "VS_BOT"
                  ? "bg-cyan-500 text-cinema-dark shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Yapay Zeka</span>
            </button>

            <button
              onClick={() => handleSwitchMode("ONLINE_ROOM")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                mode === "ONLINE_ROOM"
                  ? "bg-rose-500 text-white shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Özel Oda (LoL)</span>
            </button>

            <button
              onClick={() => handleSwitchMode("DAILY_SOLO")}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                mode === "DAILY_SOLO"
                  ? "bg-emerald-500 text-white shadow-md font-black"
                  : "hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">Günün Kadresi</span>
            </button>
          </div>

          {/* Bot Zorluk Seçici & Durum Kartı */}
          {mode === "VS_BOT" && (
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
                    onClick={() => handleSelectDifficulty(diff)}
                    title={isMatchInProgress ? "Maç devam ederken zorluk değiştirilemez" : undefined}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                      botDifficulty === diff
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
          {mode === "ONLINE_ROOM" && customRoomCode && (
            <div className="w-full max-w-md mx-auto mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
              <span className="font-bold text-rose-300 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" /> Oda #{customRoomCode}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Süre: {customShotClock}s | Çalma: {allowSteal ? "AÇIK" : "KAPALI"}
              </span>
            </div>
          )}

          {/* Board Title & Randomizer */}
          <div className="w-full max-w-xl flex items-center justify-between px-3 mt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-zinc-200">{board.title}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-amber-400 border border-zinc-700">
                {board.difficulty}
              </span>
            </div>
            <button
              onClick={handleNextBoard}
              className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <Shuffle className="w-3 h-3" />
              Farklı Matris
            </button>
          </div>

          {/* Shot Clock */}
          <ShotClock
            currentTurn={currentTurn}
            secondsRemaining={secondsRemaining}
            totalSeconds={customShotClock}
            winner={winner}
            isBotThinking={isBotThinking}
            botStatusMessage={botStatusMessage}
          />

          {/* Visual 3x3 Poster Matrix */}
          <XoxBoard
            board={board}
            cells={cells}
            winningLine={winningLine}
            currentTurn={currentTurn}
            winner={winner}
            onCellClick={handleCellSelect}
            allowSteal={allowSteal}
          />

          {/* Joker / İpucu Bildirim Kartı */}
          {hintMessage && (
            <div className="w-full max-w-md mx-auto my-1.5 p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-black text-center flex items-center justify-center gap-2 animate-in fade-in shadow-lg">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{hintMessage}</span>
            </div>
          )}
        </main>

        {/* Tablet Side Panel */}
        <TabletSidePanel
          cells={cells}
          currentTurn={currentTurn}
          playerXScore={scoreX}
          playerOScore={scoreO}
        />
      </div>

      {/* Movie Search Modal / Actor Search Modal (Ters Kadraj) */}
      {activeCellIndex !== null && board.boardMode === "REVERSE_CAST" ? (
        <ActorSearchModal
          isOpen={activeCellIndex !== null}
          onClose={() => {
            setMovieSearchError(null);
            setActiveCellIndex(null);
          }}
          rowCrit={board.rows[Math.floor(activeCellIndex / 3)]}
          colCrit={board.cols[activeCellIndex % 3]}
          onSelectActor={handleActorChosen}
          errorMessage={movieSearchError}
        />
      ) : activeCellIndex !== null ? (
        <MovieSearchModal
          isOpen={activeCellIndex !== null}
          onClose={() => {
            setMovieSearchError(null);
            setActiveCellIndex(null);
          }}
          rowCrit={board.rows[Math.floor(activeCellIndex / 3)]}
          colCrit={board.cols[activeCellIndex % 3]}
          usedMovieIds={usedMovieIds}
          onSelectMovie={handleMovieChosen}
          contentPool={contentPool}
          errorMessage={movieSearchError}
          targetOccupant={cells[activeCellIndex]}
        />
      ) : null}

      {/* Altın Makara (Sudden Death) Modalı */}
      <GoldenReelModal
        isOpen={isGoldenReelActive}
        question={goldenReelQuestion}
        scoreRarityX={scoreRarityX}
        scoreRarityO={scoreRarityO}
        currentTurn={currentTurn}
        onSubmitAnswer={resolveGoldenReelAnswer}
        onTimeout={resolveGoldenReelTimeout}
      />

      {/* Post Game Analysis (Kazanma/Kaybetme ve Rarity Analiz Ekranı) */}
      <PostGameAnalysisModal
        winner={winner}
        board={board}
        cells={cells}
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
        onNextBoard={handleNextBoard}
        onBackToHome={() => {
          audio.stopAll();
          audio.playSelect();
          resetGame();
          setCurrentView("HOME");
        }}
      />

      <MatchFoundModal
        isOpen={showMatchFound}
        userProfile={profile}
        opponentName={pendingOpponent.name}
        opponentAvatarId={pendingOpponent.avatarId}
        opponentLevel={pendingOpponent.level}
        opponentRankTitle={pendingOpponent.rankTitle}
        opponentWinRate={pendingOpponent.winRate}
        boardTitle={board.title || PRESET_BOARDS[pendingBoardIndex]?.title}
        onCountdownComplete={handleMatchFoundCountdownComplete}
      />

      {/* Günün Kadresi Skor Kartı & SOS Modalı */}
      <DailyShareModal
        isOpen={showDailyShare || (mode === "DAILY_SOLO" && winner !== null)}
        onClose={() => setShowDailyShare(false)}
        board={board}
        cells={cells}
        score={totalArcadeScore}
      />

      {/* LoL / Clash Royale Özel Oda Kurma Modalı */}
      <CustomRoomModal
        isOpen={showCustomLobby}
        onClose={() => setShowCustomLobby(false)}
        onCreateRoom={handleCreateCustomRoom}
      />

      {/* Günlük Giriş Ödülleri & Görevler Modalı */}
      <QuestsModal
        isOpen={showQuests}
        onClose={() => setShowQuests(false)}
        reelsBalance={profile.reelsBalance}
        dailyStreak={profile.dailyStreak}
        onClaimDaily={handleClaimDailyReward}
        claimedDaily={claimedDaily}
        claimedQuestIds={claimedQuestIds}
        onClaimQuest={(qId, reels) => {
          setClaimedQuestIds(p => [...p, qId]);
          handleClaimDailyReward(reels);
        }}
      />

      {/* Sinefil İkon Pazarı (Avatar Koleksiyonu) Modalı */}
      <ShopModal
        isOpen={showShop}
        onClose={() => setShowShop(false)}
        profile={profile}
        onSelectAvatar={(avatarId) => handleUpdateProfile({ avatarId })}
        onBuyAvatar={handleBuyAvatar}
      />

      {/* Oyun Modları Arenası & Olasılık Modalı */}
      <GameModesHubModal
        isOpen={showGameModesHub}
        onClose={() => setShowGameModesHub(false)}
        onSelectPlayableBoard={(idx, title) => {
          setBoardIndex(idx);
          setBoard(PRESET_BOARDS[idx]);
          resetGame(PRESET_BOARDS[idx]);
          setCurrentView("GAME");
        }}
      />

      {/* Kullanıcı Profili, İstatistikler & Ayarlar Modalı */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        isMuted={muted}
        onToggleMute={handleToggleMute}
      />

      {/* Nasıl Oynanır? Onboarding Modalı */}
      <HowToPlayModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Maçı Terk Et / Teslim Ol (Surrender) Onay Modalı */}
      {showSurrenderConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-sm bg-[#121622] border-2 border-rose-500/70 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-white relative">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
            </div>

            <h3 className="text-base font-black text-rose-400 font-mono tracking-wider mb-1 uppercase">
              {pendingSwitchMode ? "MOD DEĞİŞTİRİLİYOR" : "MAÇTAN ÇEKİLİYOR MUSUN?"}
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              {pendingSwitchMode ? (
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
                🤖 {pendingOpponent.name} ({pendingOpponent.rankTitle})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setPendingSwitchMode(null);
                  setShowSurrenderConfirm(false);
                }}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xs transition-all active:scale-95"
              >
                Savaşa Devam Et
              </button>
              <button
                type="button"
                onClick={handleConfirmSurrender}
                className="py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                {pendingSwitchMode ? "Modu Değiştir (Terk Et)" : "Terk Et (Teslim Ol)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CineXoxPage() {
  return (
    <ErrorBoundary>
      <CineXoxPageContent />
    </ErrorBoundary>
  );
}
