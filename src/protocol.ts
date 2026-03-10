export type RoomPhase = "lobby" | "running" | "game_over";

export type RoomType = "normal" | "shop";
export type PlayerRole = "master" | "fox" | "hen" | "spectator";
export type SeatType = "participant" | "spectator";
export type FeedKind = "chat" | "system";

export type Presence = {
  name: string;
  color: string;
  joinedAt: number;
  connected: boolean;
  seat: SeatType;
  role: PlayerRole;
  alive: boolean;
  ready: boolean;
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

export type FeedEntry = {
  id: string;
  kind: FeedKind;
  actorName: string | null;
  text: string;
  createdAt: number;
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
  ready: boolean;
};

export type FullGameState = {
  phase: RoomPhase;
  masterName: string | null;
  foxName: string | null;
  round: number;
  currentTurnName: string | null;
  players: Record<string, FullPlayerState>;
  rooms: Record<string, MazeRoom>;
  corridors: Record<string, Corridor>;
  henOrder: string[];
  pendingKillTargets: string[];
  feed: FeedEntry[];
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

export type LobbyState = {
  readyCount: number;
  connectedParticipantCount: number;
  totalParticipantCount: number;
  allConnectedReady: boolean;
  foxName: string | null;
};

export type TransportPlayer = {
  name: string;
  color: string;
  joinedAt: number;
  seat: SeatType;
  activeSessionId: string | null;
  lastSeenTick: number;
};

export type TransportState = {
  roster: Record<string, TransportPlayer>;
  fullState: FullGameState;
  clockTick: number;
  nextJoinOrder: number;
};

export type RoomSync = {
  room: string;
  selfName: string;
  phase: RoomPhase;
  masterName: string | null;
  players: Presence[];
  lobbyState: LobbyState | null;
  publicState: PublicState | null;
  fullState: FullGameState;
  feed: FeedEntry[];
};

export type MapEditAction =
  | { type: "add_room" }
  | { type: "set_default_map" }
  | { type: "set_random_map"; seed: number }
  | { type: "toggle_corridor"; leftRoomId: string; rightRoomId: string }
  | { type: "cycle_room_type"; roomId: string }
  | { type: "remove_room"; roomId: string }
  | { type: "toggle_loop"; roomId: string }
  | { type: "move_room"; roomId: string; x: number; y: number };

export type NetPost =
  | { $: "join_room"; name: string; sessionId: string }
  | { $: "heartbeat"; name: string; sessionId: string }
  | { $: "claim_master"; name: string; sessionId: string }
  | { $: "unclaim_master"; name: string; sessionId: string }
  | { $: "toggle_ready"; name: string; sessionId: string }
  | { $: "set_random_map"; name: string; sessionId: string; seed: number }
  | { $: "set_random_fox"; name: string; sessionId: string; foxName: string | null }
  | { $: "toggle_self_fox"; name: string; sessionId: string }
  | { $: "start_game"; name: string; sessionId: string; seed: number }
  | { $: "lobby_chat_message"; name: string; sessionId: string; text: string }
  | { $: "map_edit"; name: string; sessionId: string; action: MapEditAction }
  | {
      $: "submit_move";
      name: string;
      sessionId: string;
      actorName: string;
      corridorId: string | null;
    }
  | {
      $: "select_kill_target";
      name: string;
      sessionId: string;
      actorName: string;
      targetName: string;
    }
  | { $: "return_to_lobby"; name: string; sessionId: string };
