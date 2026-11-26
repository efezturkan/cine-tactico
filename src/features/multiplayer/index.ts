import type * as Online from "./online";

export * from "./components/MatchFoundModal";
export * from "./components/MatchmakingQueueModal";

/** Çevrimiçi oda kodu yalnızca NEXT_PUBLIC_ENABLE_ONLINE=1 ile paketlenir (bkz. src/backend/index.ts). */
const impl: typeof Online =
  process.env.NEXT_PUBLIC_ENABLE_ONLINE === "1"
    ? require("./online")
    : (require("./offline") as typeof Online);

export const useRealtimeMatch = impl.useRealtimeMatch;
export const CustomRoomModal = impl.CustomRoomModal;
