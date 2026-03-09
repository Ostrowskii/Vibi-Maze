export type RoomPhase =
  | "lobby"
  | "running"
  | "paused_master_disconnect"
  | "game_over";

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
  swapMode: "none" | "quit" | "swap";
  swapVotes: string[];
  eligibleNames: string[];
  message: string | null;
};

export type ClientToServerMessage =
  | { type: "join_room"; room: string; name: string }
  | { type: "claim_master" }
  | { type: "publish_state"; fullState: FullGameState; publicState: PublicState }
  | { type: "submit_move"; corridorId: string | null }
  | { type: "select_kill_target"; targetName: string }
  | { type: "vote_swap_master" }
  | { type: "become_master" }
  | { type: "abandon_match" };

export type ServerToClientMessage =
  | { type: "sync"; payload: RoomSync }
  | {
      type: "action_request";
      action:
        | { type: "move"; actorName: string; corridorId: string | null }
        | { type: "kill"; actorName: string; targetName: string };
    }
  | { type: "force_logout"; reason: string }
  | { type: "error"; message: string };
