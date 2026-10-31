import { audio } from "@/utils/audio";
import { haptic } from "@/utils/haptics";
import confetti from "canvas-confetti";

export const gameEffects = {
  playVictory: () => {
    audio.playVictory();
    haptic.success();
    if (typeof window !== "undefined") {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  },
  playDefeat: () => {
    audio.playVictory();
    haptic.error();
  },
  playDraw: () => {
    audio.playSelect();
  },
  playTimeout: () => {
    audio.playError();
    haptic.error();
  },
  playTimerTick: (remaining: number) => {
    audio.playTick(450 + (6 - remaining) * 90);
    haptic.light();
  },
  playError: () => {
    audio.playError();
    haptic.error();
  },
  playMoveSuccess: (combo: number) => {
    audio.playChessMove();
    if (combo >= 2) {
      audio.playCombo(combo);
    }
    haptic.medium();
  },
  playPowerup: () => {
    audio.playPowerup();
    haptic.medium();
  },
  playSelect: () => {
    audio.playSelect();
  },
};
