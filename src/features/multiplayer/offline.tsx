import type * as Online from "./online";

/** Sürüm 1.0: çevrimiçi oda yok. İmzaları karşılayan, etkisiz parçalar. */
export const useRealtimeMatch: typeof Online.useRealtimeMatch = () => ({
  isConnected: false,
  opponentOnline: false,
  opponentInfo: null,
  broadcastMove: async () => ({ success: false }),
  error: null,
});

export const CustomRoomModal: typeof Online.CustomRoomModal = () => null;
