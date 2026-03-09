export type RoomPhase = "lobby" | "running" | "game_over";

export type RoomType = "normal" | "shop";
export type PlayerRole = "master" | "fox" | "hen" | "spectator" | "player";
export type SeatType = "participant" | "spectator";

export type Presence = {
  name: string;
  color: string;
  joinedAt: number;
  connected: boolean;
  seat: SeatType;
  isMaster: boolean;
  role: PlayerRole;
  alive: boolean;
};

export type MazeRoom = {
  id: string;
  x: number;
  y: number;
  type: RoomType;
};

export type Corridor = {
  id: string;
  fromRoomId: string;
  toRoomId: string;
  angleFrom: number;
  angleTo: number;
};

export type FullPlayerState = {
  name: string;
  color: string;
  joinedAt: number;
  seat: SeatType;
  role: PlayerRole;
  alive: boolean;
  locationRoomId: string | null;
  hasFullInfo: boolean;
};

export type FullGameState = {
  phase: RoomPhase;
  masterName: string | null;
  foxName: string | null;
  foxCandidateName: string | null;
  round: number;
  currentTurnName: string | null;
  players: Record<string, FullPlayerState>;
  rooms: Record<string, MazeRoom>;
  corridors: Record<string, Corridor>;
  henOrder: string[];
  pendingKillTargets: string[];
};

export type PlayerChip = {
  name: string;
  color: string;
  role: PlayerRole;
  alive: boolean;
  connected: boolean;
};

export type ExitInfo = {
  corridorId: string;
  angle: number;
  leadsToSelf: boolean;
};

export type LimitedPlayerView = {
  name: string;
  roomId: string | null;
  roomType: RoomType | null;
  playersHere: PlayerChip[];
  exits: ExitInfo[];
  alive: boolean;
  connected: boolean;
  canAct: boolean;
};

export type PublicState = {
  phase: RoomPhase;
  round: number;
  currentTurnName: string | null;
  screens: Record<string, LimitedPlayerView>;
  watchOrder: string[];
  pendingKillTargets: string[];
};

export type ActionRequest =
  | { id: string; type: "move"; actorName: string; corridorId: string | null }
  | { id: string; type: "kill"; actorName: string; targetName: string };

export type TransportPlayer = {
  name: string;
  color: string;
  joinedAt: number;
  seat: SeatType;
  activeSessionId: string | null;
  lastSeenTick: number;
};

export type TransportState = {
  phase: RoomPhase;
  masterName: string | null;
  roster: Record<string, TransportPlayer>;
  publicState: PublicState | null;
  fullState: FullGameState | null;
  actionRequests: ActionRequest[];
  consumedActionIds: string[];
  message: string | null;
  clockTick: number;
  nextJoinOrder: number;
};

export type RoomSync = {
  room: string;
  selfName: string;
  phase: RoomPhase;
  masterName: string | null;
  players: Presence[];
  publicState: PublicState | null;
  fullState: FullGameState | null;
  canClaimMaster: boolean;
  canBecomeMaster: boolean;
  swapMode: "none";
  swapVotes: string[];
  eligibleNames: string[];
  message: string | null;
  pendingActions: ActionRequest[];
};

export type NetPost =
  | { $: "join_room"; name: string; sessionId: string }
  | { $: "heartbeat"; name: string; sessionId: string }
  | { $: "claim_master"; name: string; sessionId: string }
  | {
      $: "publish_state";
      name: string;
      sessionId: string;
      fullState: FullGameState;
      publicState: PublicState;
      consumedActionIds: string[];
    }
  | {
      $: "submit_move";
      name: string;
      sessionId: string;
      actorName: string;
      requestId: string;
      corridorId: string | null;
    }
  | {
      $: "select_kill_target";
      name: string;
      sessionId: string;
      actorName: string;
      requestId: string;
      targetName: string;
    };
