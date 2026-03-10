import type {
  ActionRequest,
  Corridor,
  ExitInfo,
  FullGameState,
  FullPlayerState,
  MazeRoom,
  NetPost,
  PlayerRole,
  Presence,
  PublicState,
  RoomType,
  RoomSync,
  SeatType,
  TransportPlayer,
  TransportState,
} from "./protocol";

const DEFAULT_ROOM_SIZE = 220;
const PRESENCE_COLORS = [
  "#f25f5c",
  "#247ba0",
  "#70c1b3",
  "#f7b267",
  "#8e6c88",
  "#5c80bc",
  "#9bc53d",
  "#f18f01",
];
const HEARTBEAT_GRACE_TICKS = 24;
const SAVED_MAZE_SEEDS = [
  101, 207, 311, 419, 523, 631, 733, 839, 947, 1051,
  1153, 1259, 1361, 1471, 1579, 1681, 1789, 1891, 1993, 2099,
  2203, 2309, 2411, 2521, 2621, 2729, 2833, 2939, 3041, 3149,
  3253, 3359, 3461, 3571, 3677, 3779, 3881, 3989, 4091, 4201,
  4303, 4409, 4513, 4621, 4723, 4831, 4933, 5039, 5147, 5251,
];
const RANDOM_MAZE_EDGE_PAIRS: Array<[number, number]> = [
  [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9],
  [1, 4], [4, 7], [2, 5], [5, 8], [3, 6], [6, 9],
  [1, 5], [5, 9], [2, 4], [2, 6], [4, 8], [6, 8], [3, 5], [5, 7],
];

function room_id(index: number): string {
  return `room-${index}`;
}

function corridor_id(left: string, right: string): string {
  return `corridor:${left}:${right}`;
}

function normalized_id_pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function clone_state<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function normalize_name(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, 24);
}

export function normalize_room(raw: string): string {
  return raw.trim().replace(/\s+/g, "-").slice(0, 36).toLowerCase();
}

export function encode_transport_post(post: NetPost): string {
  return JSON.stringify(post);
}

export function create_transport_state(): TransportState {
  return {
    phase: "lobby",
    masterName: null,
    roster: {},
    publicState: null,
    fullState: null,
    actionRequests: [],
    consumedActionIds: [],
    message: null,
    clockTick: 0,
    nextJoinOrder: 0,
  };
}

export function tick_transport_state(state: TransportState): TransportState {
  return {
    ...state,
    clockTick: state.clockTick + 1,
  };
}

export function saved_maze_count(): number {
  return SAVED_MAZE_SEEDS.length;
}

export function pick_random_saved_maze(): Pick<FullGameState, "rooms" | "corridors"> {
  const seed = SAVED_MAZE_SEEDS[Math.floor(Math.random() * SAVED_MAZE_SEEDS.length)] ?? SAVED_MAZE_SEEDS[0];
  return build_saved_maze(seed);
}

export function apply_transport_post(raw: string, state: TransportState): TransportState {
  let post: NetPost;
  try {
    post = JSON.parse(raw) as NetPost;
  } catch {
    return state;
  }

  switch (post.$) {
    case "join_room":
      return handle_join_post(state, post);
    case "heartbeat":
      return handle_heartbeat_post(state, post);
    case "claim_master":
      return handle_claim_master_post(state, post);
    case "unclaim_master":
      return handle_unclaim_master_post(state, post);
    case "publish_state":
      return handle_publish_state_post(state, post);
    case "submit_move":
      return handle_action_request_post(state, {
        id: post.requestId,
        type: "move",
        actorName: post.actorName,
        corridorId: post.corridorId,
      }, post.name, post.sessionId);
    case "select_kill_target":
      return handle_action_request_post(state, {
        id: post.requestId,
        type: "kill",
        actorName: post.actorName,
        targetName: post.targetName,
      }, post.name, post.sessionId);
    default:
      return state;
  }
}

export function derive_room_sync(room: string, selfName: string, state: TransportState): RoomSync {
  const consumed = new Set(state.consumedActionIds);
  const controllerName = transport_controller_name(state);
  const players = Object.values(state.roster)
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => {
      const synced = state.fullState?.players[player.name];
      const isMaster = state.masterName === player.name;
      const seat = synced?.seat ?? player.seat;
      const role = synced?.role ?? (isMaster ? "master" : seat === "spectator" ? "spectator" : "player");
      return {
        name: player.name,
        color: synced?.color ?? player.color,
        joinedAt: synced?.joinedAt ?? player.joinedAt,
        connected: is_transport_player_connected(state, player),
        seat,
        isMaster,
        role,
        alive: synced?.alive ?? false,
      };
    });

  const self = players.find((player) => player.name === selfName) ?? null;
  const pendingActions = state.actionRequests.filter((action) => !consumed.has(action.id));

  return {
    room,
    selfName,
    phase: state.phase,
    masterName: state.masterName,
    controllerName,
    players,
    publicState: state.publicState,
    fullState: state.fullState,
    canClaimMaster: state.phase === "lobby" && !state.masterName && self?.seat !== "spectator",
    canBecomeMaster: false,
    swapMode: "none",
    swapVotes: [],
    eligibleNames: [],
    message: state.message,
    pendingActions,
  };
}

function handle_join_post(state: TransportState, post: Extract<NetPost, { $: "join_room" }>): TransportState {
  const next = clone_state(state);
  const existing = next.roster[post.name];

  if (existing) {
    existing.activeSessionId = post.sessionId;
    existing.lastSeenTick = next.clockTick;
    next.message = null;
    return next;
  }

  const joinedAt = next.nextJoinOrder + 1;
  const player: TransportPlayer = {
    name: post.name,
    color: PRESENCE_COLORS[next.nextJoinOrder % PRESENCE_COLORS.length] ?? PRESENCE_COLORS[0],
    joinedAt,
    seat: next.phase === "lobby" ? "participant" : "spectator",
    activeSessionId: post.sessionId,
    lastSeenTick: next.clockTick,
  };

  next.nextJoinOrder += 1;
  next.roster[player.name] = player;
  next.message = next.phase === "lobby" ? null : "Partida em andamento. Novo ingresso como espectador.";
  return next;
}

function handle_heartbeat_post(state: TransportState, post: Extract<NetPost, { $: "heartbeat" }>): TransportState {
  if (!is_current_session(state, post.name, post.sessionId)) {
    return state;
  }

  const next = clone_state(state);
  const player = next.roster[post.name];
  if (!player) {
    return state;
  }
  player.lastSeenTick = next.clockTick;
  return next;
}

function handle_claim_master_post(state: TransportState, post: Extract<NetPost, { $: "claim_master" }>): TransportState {
  if (state.phase !== "lobby" || state.masterName || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }

  const next = clone_state(state);
  next.masterName = post.name;
  next.message = `${post.name} virou mestre.`;
  return next;
}

function handle_unclaim_master_post(state: TransportState, post: Extract<NetPost, { $: "unclaim_master" }>): TransportState {
  if (state.phase !== "lobby" || state.masterName !== post.name || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }

  const next = clone_state(state);
  next.masterName = null;
  next.message = `${post.name} deixou de ser mestre.`;
  if (next.fullState) {
    next.fullState.masterName = null;
  }
  return next;
}

function handle_publish_state_post(state: TransportState, post: Extract<NetPost, { $: "publish_state" }>): TransportState {
  if (transport_controller_name(state) !== post.name || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }

  const next = clone_state(state);
  next.fullState = clone_state(post.fullState);
  next.publicState = clone_state(post.publicState);
  next.phase = post.fullState.phase;
  next.masterName = post.fullState.masterName ?? next.masterName;
  next.message = null;

  const consumed = new Set(next.consumedActionIds);
  for (const actionId of post.consumedActionIds) {
    consumed.add(actionId);
  }
  next.consumedActionIds = [...consumed].slice(-256);
  next.actionRequests = next.actionRequests.filter((action) => !consumed.has(action.id));

  if (next.phase === "lobby") {
    next.actionRequests = [];
    next.consumedActionIds = [];
  }

  for (const fullPlayer of Object.values(next.fullState.players)) {
    const rosterPlayer = next.roster[fullPlayer.name] ?? {
      name: fullPlayer.name,
      color: fullPlayer.color,
      joinedAt: fullPlayer.joinedAt,
      seat: fullPlayer.seat,
      activeSessionId: null,
      lastSeenTick: -99999,
    };

    rosterPlayer.color = fullPlayer.color;
    rosterPlayer.joinedAt = fullPlayer.joinedAt;
    rosterPlayer.seat = fullPlayer.seat;
    next.roster[fullPlayer.name] = rosterPlayer;
  }

  return next;
}

function handle_action_request_post(
  state: TransportState,
  action: ActionRequest,
  actorName: string,
  sessionId: string,
): TransportState {
  if (state.phase !== "running" || !is_current_session(state, actorName, sessionId)) {
    return state;
  }

  if (actorName !== action.actorName && transport_controller_name(state) !== actorName) {
    return state;
  }

  if (state.actionRequests.some((item) => item.id === action.id) || state.consumedActionIds.includes(action.id)) {
    return state;
  }

  const next = clone_state(state);
  next.actionRequests.push(action);
  return next;
}

function is_current_session(state: TransportState, name: string, sessionId: string): boolean {
  return state.roster[name]?.activeSessionId === sessionId;
}

function is_transport_player_connected(state: TransportState, player: TransportPlayer): boolean {
  if (!player.activeSessionId) {
    return false;
  }
  return state.clockTick - player.lastSeenTick <= HEARTBEAT_GRACE_TICKS;
}

function transport_controller_name(state: TransportState): string | null {
  if (state.masterName) {
    const master = state.roster[state.masterName];
    if (master && is_transport_player_connected(state, master)) {
      return state.masterName;
    }
  }

  const fallback = Object.values(state.roster)
    .filter((player) => player.seat === "participant" && is_transport_player_connected(state, player))
    .sort((left, right) => left.joinedAt - right.joinedAt)[0];

  return fallback?.name ?? null;
}

function build_saved_maze(seed: number): Pick<FullGameState, "rooms" | "corridors"> {
  const rng = seeded_rng(seed);
  const rooms = create_default_maze().rooms;
  const corridors: Record<string, Corridor> = {};
  const roomIds = Object.keys(rooms).sort();
  const visited = new Set<string>();
  const frontier: Array<[string, string]> = [];
  const graph = edge_graph(rooms);

  const startRoomId = room_id(1 + Math.floor(rng() * roomIds.length));
  visited.add(startRoomId);
  frontier.push(...graph.get(startRoomId) ?? []);

  while (visited.size < roomIds.length && frontier.length > 0) {
    const choiceIndex = Math.floor(rng() * frontier.length);
    const [fromId, toId] = frontier.splice(choiceIndex, 1)[0] ?? [];
    if (!fromId || !toId || visited.has(toId)) {
      continue;
    }
    visited.add(toId);
    const corridor = make_corridor(rooms[fromId], rooms[toId]);
    corridors[corridor.id] = corridor;
    for (const edge of graph.get(toId) ?? []) {
      if (!visited.has(edge[1])) {
        frontier.push(edge);
      }
    }
  }

  const extraEdges = shuffle_pairs(
    graph_edges(graph),
    rng,
  );
  const extraCount = 3 + Math.floor(rng() * 5);
  for (const [left, right] of extraEdges) {
    if (Object.keys(corridors).length >= roomIds.length - 1 + extraCount) {
      break;
    }
    const corridor = make_corridor(rooms[left], rooms[right]);
    corridors[corridor.id] = corridor;
  }

  const shopCount = 1 + Math.floor(rng() * 3);
  const shuffledRooms = shuffle_pairs(roomIds.map((id) => [id, id] as [string, string]), rng);
  for (let index = 0; index < shopCount; index += 1) {
    const roomName = shuffledRooms[index]?.[0];
    if (roomName) {
      rooms[roomName].type = "shop";
    }
  }

  const loopCount = Math.floor(rng() * 2);
  for (let index = 0; index < loopCount; index += 1) {
    const roomName = shuffledRooms[shopCount + index]?.[0];
    if (!roomName) {
      continue;
    }
    const id = corridor_id(roomName, roomName);
    corridors[id] = {
      id,
      fromRoomId: roomName,
      toRoomId: roomName,
      angleFrom: 0,
      angleTo: 0,
    };
  }

  return {
    rooms,
    corridors,
  };
}

function pick_extreme_room(
  rooms: MazeRoom[],
  axis: "x" | "y",
  direction: 1 | -1,
  preferredCenter: number,
  tieAxis: "x" | "y",
): MazeRoom | null {
  if (rooms.length === 0) {
    return null;
  }

  const ordered = [...rooms].sort((left, right) => {
    const primaryDelta = direction * (left[axis] - right[axis]);
    if (primaryDelta !== 0) {
      return primaryDelta;
    }
    return Math.abs(left[tieAxis] - preferredCenter) - Math.abs(right[tieAxis] - preferredCenter);
  });

  return ordered[0] ?? null;
}

function edge_graph(rooms: Record<string, MazeRoom>): Map<string, Array<[string, string]>> {
  const graph = new Map<string, Array<[string, string]>>();
  const candidatePairs = [
    ...RANDOM_MAZE_EDGE_PAIRS.map(([left, right]) => [room_id(left), room_id(right)] as [string, string]),
    ...extreme_wrap_pairs(rooms),
  ];

  for (const [leftId, rightId] of candidatePairs) {
    graph.set(leftId, [...(graph.get(leftId) ?? []), [leftId, rightId]]);
    graph.set(rightId, [...(graph.get(rightId) ?? []), [rightId, leftId]]);
  }
  return graph;
}

function extreme_wrap_pairs(rooms: Record<string, MazeRoom>): Array<[string, string]> {
  const roomList = Object.values(rooms);
  if (roomList.length < 2) {
    return [];
  }

  const centerX = roomList.reduce((sum, room) => sum + room.x, 0) / roomList.length;
  const centerY = roomList.reduce((sum, room) => sum + room.y, 0) / roomList.length;

  const leftRoom = pick_extreme_room(roomList, "x", 1, centerY, "y");
  const rightRoom = pick_extreme_room(roomList, "x", -1, centerY, "y");
  const topRoom = pick_extreme_room(roomList, "y", 1, centerX, "x");
  const bottomRoom = pick_extreme_room(roomList, "y", -1, centerX, "x");

  const pairs: Array<[string, string]> = [];
  if (leftRoom && rightRoom && leftRoom.id !== rightRoom.id) {
    pairs.push([leftRoom.id, rightRoom.id]);
  }
  if (topRoom && bottomRoom && topRoom.id !== bottomRoom.id) {
    pairs.push([topRoom.id, bottomRoom.id]);
  }
  return pairs;
}

function graph_edges(graph: Map<string, Array<[string, string]>>): Array<[string, string]> {
  const seen = new Set<string>();
  const edges: Array<[string, string]> = [];

  for (const entries of graph.values()) {
    for (const [left, right] of entries) {
      const [a, b] = normalized_id_pair(left, right);
      const key = `${a}:${b}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      edges.push([a, b]);
    }
  }

  return edges;
}

function shuffle_pairs<T>(items: T[], rng: () => number): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex] as T;
    next[swapIndex] = current as T;
  }
  return next;
}

function seeded_rng(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function compute_angle(from: MazeRoom, to: MazeRoom): number {
  const radians = Math.atan2(to.y - from.y, to.x - from.x);
  return Math.round((((radians * 180) / Math.PI) + 360) % 360);
}

export function create_room(id: string, x: number, y: number, type: RoomType = "normal"): MazeRoom {
  return { id, x, y, type };
}

export function create_default_maze(): Pick<FullGameState, "rooms" | "corridors"> {
  const rooms: Record<string, MazeRoom> = {};
  const corridors: Record<string, Corridor> = {};

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const index = row * 3 + col + 1;
      const id = room_id(index);
      rooms[id] = create_room(id, 180 + col * DEFAULT_ROOM_SIZE, 160 + row * DEFAULT_ROOM_SIZE);
    }
  }

  const orthogonal_pairs: Array<[string, string]> = [
    [room_id(1), room_id(2)],
    [room_id(2), room_id(3)],
    [room_id(4), room_id(5)],
    [room_id(5), room_id(6)],
    [room_id(7), room_id(8)],
    [room_id(8), room_id(9)],
    [room_id(1), room_id(4)],
    [room_id(4), room_id(7)],
    [room_id(2), room_id(5)],
    [room_id(5), room_id(8)],
    [room_id(3), room_id(6)],
    [room_id(6), room_id(9)],
    [room_id(1), room_id(5)],
    [room_id(5), room_id(9)],
  ];

  for (const [left, right] of orthogonal_pairs) {
    const corridor = make_corridor(rooms[left], rooms[right]);
    corridors[corridor.id] = corridor;
  }

  return { rooms, corridors };
}

export function create_empty_state(room: string, roster: Presence[], masterName: string | null): FullGameState {
  const { rooms, corridors } = create_default_maze();
  const players: Record<string, FullPlayerState> = {};

  for (const presence of roster) {
    players[presence.name] = {
      name: presence.name,
      color: presence.color,
      joinedAt: presence.joinedAt,
      seat: presence.seat,
      role: presence.isMaster ? "master" : presence.seat === "spectator" ? "spectator" : "player",
      alive: false,
      locationRoomId: null,
      hasFullInfo: presence.isMaster || presence.seat === "spectator",
    };
  }

  return {
    phase: "lobby",
    masterName,
    foxName: null,
    foxCandidateName: null,
    round: 0,
    currentTurnName: null,
    players,
    rooms,
    corridors,
    henOrder: [],
    pendingKillTargets: [],
  };
}

export function sync_state_players(state: FullGameState, roster: Presence[], masterName: string | null): FullGameState {
  const next = clone_state(state);
  next.masterName = masterName;

  for (const presence of roster) {
    const existing = next.players[presence.name];
    const baseRole: PlayerRole = presence.isMaster
      ? "master"
      : presence.seat === "spectator"
        ? "spectator"
        : existing?.role && existing.role !== "spectator"
          ? existing.role
          : "player";

    next.players[presence.name] = {
      name: presence.name,
      color: presence.color,
      joinedAt: presence.joinedAt,
      seat: presence.seat,
      role: baseRole,
      alive: existing?.alive ?? false,
      locationRoomId: existing?.locationRoomId ?? null,
      hasFullInfo:
        presence.isMaster ||
        presence.seat === "spectator" ||
        existing?.hasFullInfo === true,
    };
  }

  for (const name of Object.keys(next.players)) {
    if (!roster.find((presence) => presence.name === name)) {
      next.players[name].seat = "participant";
    }
  }

  if (masterName) {
    for (const player of Object.values(next.players)) {
      if (player.name === masterName) {
        player.role = "master";
        player.hasFullInfo = true;
        player.alive = false;
        player.locationRoomId = null;
      }
    }
  }

  return next;
}

export function make_corridor(fromRoom: MazeRoom, toRoom: MazeRoom): Corridor {
  const fromAngle = compute_angle(fromRoom, toRoom);
  const toAngle = compute_angle(toRoom, fromRoom);
  return {
    id: corridor_id(fromRoom.id, toRoom.id),
    fromRoomId: fromRoom.id,
    toRoomId: toRoom.id,
    angleFrom: fromAngle,
    angleTo: toAngle,
  };
}

export function toggle_corridor(state: FullGameState, leftRoomId: string, rightRoomId: string): FullGameState {
  const next = clone_state(state);
  const [a, b] = normalized_id_pair(leftRoomId, rightRoomId);
  const id = corridor_id(a, b);
  if (next.corridors[id]) {
    delete next.corridors[id];
    return next;
  }
  const left = next.rooms[leftRoomId];
  const right = next.rooms[rightRoomId];
  if (!left || !right) {
    return state;
  }
  next.corridors[id] = make_corridor(left, right);
  return next;
}

export function add_room(state: FullGameState): FullGameState {
  const next = clone_state(state);
  const ids = Object.keys(next.rooms).map((id) => Number(id.split("-")[1] ?? 0));
  const newId = room_id((Math.max(0, ...ids) || 0) + 1);
  next.rooms[newId] = create_room(newId, 320, 320, "normal");
  return next;
}

export function remove_room(state: FullGameState, roomId: string): FullGameState {
  const next = clone_state(state);
  delete next.rooms[roomId];
  for (const corridorId of Object.keys(next.corridors)) {
    const corridor = next.corridors[corridorId];
    if (corridor.fromRoomId === roomId || corridor.toRoomId === roomId) {
      delete next.corridors[corridorId];
    }
  }
  for (const player of Object.values(next.players)) {
    if (player.locationRoomId === roomId) {
      player.locationRoomId = null;
    }
  }
  return next;
}

export function move_room(state: FullGameState, roomId: string, x: number, y: number): FullGameState {
  const next = clone_state(state);
  const room = next.rooms[roomId];
  if (!room) {
    return state;
  }
  room.x = x;
  room.y = y;
  for (const corridor of Object.values(next.corridors)) {
    if (corridor.fromRoomId === roomId || corridor.toRoomId === roomId) {
      const fromRoom = next.rooms[corridor.fromRoomId];
      const toRoom = next.rooms[corridor.toRoomId];
      corridor.angleFrom = compute_angle(fromRoom, toRoom);
      corridor.angleTo = compute_angle(toRoom, fromRoom);
    }
  }
  return next;
}

export function cycle_room_type(state: FullGameState, roomId: string): FullGameState {
  const next = clone_state(state);
  const room = next.rooms[roomId];
  if (!room) {
    return state;
  }
  room.type = room.type === "normal" ? "shop" : "normal";
  return next;
}

export function add_self_loop(state: FullGameState, roomId: string): FullGameState {
  const next = clone_state(state);
  const id = corridor_id(roomId, roomId);
  if (next.corridors[id]) {
    delete next.corridors[id];
    return next;
  }
  next.corridors[id] = {
    id,
    fromRoomId: roomId,
    toRoomId: roomId,
    angleFrom: 0,
    angleTo: 0,
  };
  return next;
}

export function choose_random_fox(state: FullGameState): FullGameState {
  const next = clone_state(state);
  const candidates = Object.values(next.players)
    .filter((player) => player.seat === "participant" && player.role !== "master")
    .sort((left, right) => left.joinedAt - right.joinedAt);

  if (candidates.length === 0) {
    next.foxCandidateName = null;
    return next;
  }

  const index = Math.floor(Math.random() * candidates.length);
  next.foxCandidateName = candidates[index]?.name ?? null;
  return next;
}

export function choose_fox(state: FullGameState, foxName: string): FullGameState {
  const next = clone_state(state);
  next.foxCandidateName = foxName;
  return next;
}

export function start_game(state: FullGameState, roster: Presence[]): FullGameState | null {
  const next = sync_state_players(state, roster, state.masterName);
  const active = roster
    .filter((presence) => presence.seat === "participant" && !presence.isMaster && presence.connected)
    .sort((left, right) => left.joinedAt - right.joinedAt);

  if (active.length < 2 || active.length > 8) {
    return null;
  }

  const foxName = next.foxCandidateName && active.find((presence) => presence.name === next.foxCandidateName)
    ? next.foxCandidateName
    : active[Math.floor(Math.random() * active.length)]?.name ?? null;

  if (!foxName) {
    return null;
  }

  const roomIds = Object.keys(next.rooms);
  if (roomIds.length === 0) {
    return null;
  }

  const shuffledRooms = [...roomIds].sort(() => Math.random() - 0.5);
  const henOrder = active.filter((presence) => presence.name !== foxName).map((presence) => presence.name);

  active.forEach((presence, index) => {
    const player = next.players[presence.name];
    player.alive = true;
    player.locationRoomId = shuffledRooms[index % shuffledRooms.length] ?? roomIds[0] ?? null;
    player.role = presence.name === foxName ? "fox" : "hen";
    player.hasFullInfo = false;
  });

  for (const player of Object.values(next.players)) {
    if (player.role === "spectator") {
      player.alive = false;
      player.hasFullInfo = true;
      player.locationRoomId = null;
    }
    if (player.role === "master") {
      player.hasFullInfo = true;
      player.alive = false;
      player.locationRoomId = null;
    }
  }

  next.phase = "running";
  next.round = 1;
  next.foxName = foxName;
  next.pendingKillTargets = [];
  next.henOrder = henOrder;
  next.currentTurnName = henOrder[0] ?? foxName;
  return next;
}

export function reset_to_lobby(state: FullGameState, roster: Presence[]): FullGameState {
  const next = sync_state_players(state, roster, state.masterName);
  next.phase = "lobby";
  next.foxName = null;
  next.foxCandidateName = null;
  next.round = 0;
  next.currentTurnName = null;
  next.pendingKillTargets = [];
  next.henOrder = [];

  for (const player of Object.values(next.players)) {
    if (player.role !== "master" && player.seat === "participant") {
      player.role = "player";
      player.alive = false;
      player.locationRoomId = null;
      player.hasFullInfo = false;
    } else if (player.seat === "spectator") {
      player.role = "spectator";
      player.alive = false;
      player.locationRoomId = null;
      player.hasFullInfo = true;
    }
  }
  return next;
}

export function build_public_state(
  state: FullGameState,
  roster: Presence[],
): PublicState {
  const screens: PublicState["screens"] = {};
  const watchOrder = Object.values(state.players)
    .filter((player) => player.role === "hen" || player.role === "fox")
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => player.name);

  for (const playerName of watchOrder) {
    const player = state.players[playerName];
    const roomId = player.locationRoomId;
    const room = roomId ? state.rooms[roomId] : null;
    const playersHere = roomId
      ? Object.values(state.players)
          .filter((other) => other.locationRoomId === roomId && other.alive)
          .map((other) => {
            const presence = roster.find((item) => item.name === other.name);
            return {
              name: other.name,
              color: other.color,
              role: other.role,
              alive: other.alive,
              connected: presence?.connected ?? false,
            };
          })
      : [];

    screens[playerName] = {
      name: playerName,
      roomId,
      roomType: room?.type ?? null,
      playersHere,
      exits: roomId ? exits_for_room(state, roomId) : [],
      alive: player.alive,
      connected: roster.find((item) => item.name === playerName)?.connected ?? false,
      canAct: state.currentTurnName === playerName,
    };
  }

  return {
    phase: state.phase,
    round: state.round,
    currentTurnName: state.currentTurnName,
    screens,
    watchOrder,
    pendingKillTargets: [...state.pendingKillTargets],
  };
}

export function exits_for_room(state: FullGameState, roomId: string): ExitInfo[] {
  return Object.values(state.corridors)
    .flatMap((corridor) => {
      if (corridor.fromRoomId === roomId && corridor.toRoomId === roomId) {
        return [{
          corridorId: corridor.id,
          angle: corridor.angleFrom,
          leadsToSelf: true,
        }];
      }
      if (corridor.fromRoomId === roomId) {
        return [{
          corridorId: corridor.id,
          angle: corridor.angleFrom,
          leadsToSelf: false,
        }];
      }
      if (corridor.toRoomId === roomId) {
        return [{
          corridorId: corridor.id,
          angle: corridor.angleTo,
          leadsToSelf: false,
        }];
      }
      return [];
    })
    .sort((left, right) => left.angle - right.angle);
}

export function apply_move(state: FullGameState, actorName: string, corridorId: string | null): FullGameState {
  if (state.phase !== "running" || state.currentTurnName !== actorName || state.pendingKillTargets.length > 0) {
    return state;
  }

  const next = clone_state(state);
  const actor = next.players[actorName];
  if (!actor || !actor.alive) {
    return state;
  }

  if (corridorId === null) {
    return advance_turn(next);
  }

  const corridor = next.corridors[corridorId];
  if (!corridor || !actor.locationRoomId) {
    return state;
  }

  if (corridor.fromRoomId === actor.locationRoomId && corridor.toRoomId === actor.locationRoomId) {
    actor.locationRoomId = corridor.toRoomId;
  } else if (corridor.fromRoomId === actor.locationRoomId) {
    actor.locationRoomId = corridor.toRoomId;
  } else if (corridor.toRoomId === actor.locationRoomId) {
    actor.locationRoomId = corridor.fromRoomId;
  } else {
    return state;
  }

  if (actor.role === "fox") {
    const targets = living_hens_in_room(next, actor.locationRoomId);
    if (targets.length === 0) {
      return advance_turn(next);
    }
    if (targets.length === 1) {
      return eliminate_hen(next, targets[0] ?? "");
    }
    next.pendingKillTargets = targets;
    return next;
  }

  return advance_turn(next);
}

export function apply_kill_choice(state: FullGameState, actorName: string, targetName: string): FullGameState {
  if (state.phase !== "running" || state.currentTurnName !== actorName || state.pendingKillTargets.length === 0) {
    return state;
  }

  if (!state.pendingKillTargets.includes(targetName)) {
    return state;
  }

  const next = clone_state(state);
  return eliminate_hen(next, targetName);
}

function eliminate_hen(state: FullGameState, targetName: string): FullGameState {
  const target = state.players[targetName];
  if (!target) {
    return state;
  }
  target.alive = false;
  target.hasFullInfo = true;
  state.pendingKillTargets = [];

  const anyHenAlive = Object.values(state.players).some((player) => player.role === "hen" && player.alive);
  if (!anyHenAlive) {
    state.phase = "game_over";
    state.currentTurnName = null;
    return state;
  }

  return advance_turn(state);
}

function living_hens_in_room(state: FullGameState, roomId: string | null): string[] {
  if (!roomId) {
    return [];
  }
  return Object.values(state.players)
    .filter((player) => player.role === "hen" && player.alive && player.locationRoomId === roomId)
    .map((player) => player.name);
}

function advance_turn(state: FullGameState): FullGameState {
  const livingHens = state.henOrder.filter((name) => state.players[name]?.alive);
  const order = [
    ...livingHens,
    ...(state.foxName && state.players[state.foxName]?.alive ? [state.foxName] : []),
  ];

  if (order.length === 0) {
    state.phase = "game_over";
    state.currentTurnName = null;
    return state;
  }

  const currentIndex = state.currentTurnName ? order.indexOf(state.currentTurnName) : -1;
  const nextIndex = currentIndex + 1;

  if (currentIndex === -1 || nextIndex >= order.length) {
    state.round = Math.max(1, state.round) + (currentIndex === -1 ? 0 : 1);
    state.currentTurnName = order[0] ?? null;
  } else {
    state.currentTurnName = order[nextIndex] ?? null;
  }

  state.pendingKillTargets = [];
  return state;
}
