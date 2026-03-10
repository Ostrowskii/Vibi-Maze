import type {
  Corridor,
  ExitInfo,
  FeedEntry,
  FullGameState,
  FullPlayerState,
  LimitedPlayerView,
  LobbyState,
  MapEditAction,
  MazeRoom,
  NetPost,
  PlayerRole,
  Presence,
  PublicState,
  RoomType,
  RoomSync,
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
const FEED_LIMIT = 120;
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

function feed_id(state: FullGameState, prefix: string): string {
  return `${prefix}-${state.feed.length + 1}-${state.round}-${state.currentTurnName ?? "none"}`;
}

function trim_feed(state: FullGameState): void {
  if (state.feed.length > FEED_LIMIT) {
    state.feed = state.feed.slice(-FEED_LIMIT);
  }
}

function append_feed(state: FullGameState, entry: FeedEntry): void {
  state.feed.push(entry);
  trim_feed(state);
}

function append_system_entry(state: FullGameState, actorName: string | null, text: string): void {
  append_feed(state, {
    id: feed_id(state, "system"),
    kind: "system",
    actorName,
    text,
    createdAt: state.feed.length + 1,
  });
}

function append_chat_entry(state: FullGameState, actorName: string, text: string): void {
  append_feed(state, {
    id: feed_id(state, "chat"),
    kind: "chat",
    actorName,
    text,
    createdAt: state.feed.length + 1,
  });
}

function connected_lobby_players(roster: Presence[]): Presence[] {
  return roster.filter((player) => player.seat === "participant" && player.connected);
}

function active_game_players(roster: Presence[], masterName: string | null): Presence[] {
  return roster.filter((player) => (
    player.seat === "participant" &&
    player.connected &&
    player.name !== masterName
  ));
}

function auto_start_seed(state: TransportState, name: string): number {
  const source = `${state.clockTick}:${name}:${Object.keys(state.roster).join("|")}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
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

function shuffle_with_rng<T>(items: T[], rng: () => number): T[] {
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

function is_transport_player_connected(state: TransportState, player: TransportPlayer): boolean {
  if (!player.activeSessionId) {
    return false;
  }
  return state.clockTick - player.lastSeenTick <= HEARTBEAT_GRACE_TICKS;
}

function is_current_session(state: TransportState, name: string, sessionId: string): boolean {
  return state.roster[name]?.activeSessionId === sessionId;
}

function make_presence(state: TransportState, player: TransportPlayer): Presence {
  const fullPlayer = state.fullState.players[player.name];
  return {
    name: player.name,
    color: fullPlayer?.color ?? player.color,
    joinedAt: fullPlayer?.joinedAt ?? player.joinedAt,
    connected: is_transport_player_connected(state, player),
    seat: fullPlayer?.seat ?? player.seat,
    role: fullPlayer?.role ?? "hen",
    alive: fullPlayer?.alive ?? false,
    ready: fullPlayer?.ready ?? false,
  };
}

function roster_list(state: TransportState): Presence[] {
  return Object.values(state.roster)
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => make_presence(state, player));
}

function sync_lobby_roles(state: FullGameState): void {
  if (state.masterName && state.foxName === state.masterName) {
    state.foxName = null;
  }

  for (const player of Object.values(state.players)) {
    player.alive = false;
    player.locationRoomId = null;
    if (player.seat === "spectator") {
      player.role = "spectator";
      player.ready = false;
      player.hasFullInfo = true;
      continue;
    }
    if (state.masterName === player.name) {
      player.role = "master";
      player.hasFullInfo = true;
      continue;
    }
    player.role = state.foxName === player.name ? "fox" : "hen";
    player.hasFullInfo = false;
  }
}

function should_auto_start(state: TransportState): boolean {
  if (state.fullState.phase !== "lobby") {
    return false;
  }
  const players = connected_lobby_players(roster_list(state));
  return players.length >= 2 && players.every((player) => player.ready);
}

function sync_full_player(state: TransportState, transportPlayer: TransportPlayer): void {
  const existing = state.fullState.players[transportPlayer.name];
  if (existing) {
    existing.color = transportPlayer.color;
    existing.joinedAt = transportPlayer.joinedAt;
    existing.seat = transportPlayer.seat;
    if (transportPlayer.seat === "spectator") {
      existing.role = "spectator";
      existing.ready = false;
      existing.alive = false;
      existing.locationRoomId = null;
      existing.hasFullInfo = true;
    }
    return;
  }

  state.fullState.players[transportPlayer.name] = {
    name: transportPlayer.name,
    color: transportPlayer.color,
    joinedAt: transportPlayer.joinedAt,
    seat: transportPlayer.seat,
    role: transportPlayer.seat === "spectator" ? "spectator" : "hen",
    alive: false,
    locationRoomId: null,
    hasFullInfo: transportPlayer.seat === "spectator",
    ready: false,
  };
}

function apply_random_map(state: FullGameState, seed: number): void {
  const maze = build_saved_maze(seed);
  state.rooms = maze.rooms;
  state.corridors = maze.corridors;
  for (const player of Object.values(state.players)) {
    player.locationRoomId = null;
  }
}

function set_selected_fox(state: FullGameState, foxName: string | null): void {
  const player = foxName ? state.players[foxName] : null;
  if (!player || player.seat !== "participant" || player.role === "master") {
    state.foxName = null;
  } else {
    state.foxName = foxName;
  }
  if (state.phase === "lobby") {
    sync_lobby_roles(state);
  }
}

function start_game_with_seed(base: TransportState, seed: number, reason: string): TransportState {
  const next = clone_state(base);
  const roster = roster_list(next);
  const active = active_game_players(roster, next.fullState.masterName);

  if (active.length < 2 || active.length > 8) {
    return base;
  }

  const roomIds = Object.keys(next.fullState.rooms);
  if (roomIds.length === 0) {
    return base;
  }

  const rng = seeded_rng(seed);
  const orderedActive = [...active].sort((left, right) => left.joinedAt - right.joinedAt);
  const foxName = next.fullState.foxName && orderedActive.some((player) => player.name === next.fullState.foxName)
    ? next.fullState.foxName
    : orderedActive[Math.floor(rng() * orderedActive.length)]?.name ?? null;

  if (!foxName) {
    return base;
  }

  const shuffledRooms = shuffle_with_rng(roomIds, rng);
  const henOrder = orderedActive.filter((player) => player.name !== foxName).map((player) => player.name);

  for (const player of Object.values(next.fullState.players)) {
    if (player.seat === "spectator") {
      player.role = "spectator";
      player.alive = false;
      player.locationRoomId = null;
      player.hasFullInfo = true;
      player.ready = false;
      continue;
    }

    if (player.name === next.fullState.masterName) {
      player.role = "master";
      player.alive = false;
      player.locationRoomId = null;
      player.hasFullInfo = true;
      player.ready = false;
      continue;
    }

    const activeIndex = orderedActive.findIndex((presence) => presence.name === player.name);
    if (activeIndex === -1) {
      player.role = "hen";
      player.alive = false;
      player.locationRoomId = null;
      player.hasFullInfo = false;
      player.ready = false;
      continue;
    }

    player.role = player.name === foxName ? "fox" : "hen";
    player.alive = true;
    player.locationRoomId = shuffledRooms[activeIndex % shuffledRooms.length] ?? roomIds[0] ?? null;
    player.hasFullInfo = false;
    player.ready = false;
  }

  next.fullState.phase = "running";
  next.fullState.round = 1;
  next.fullState.currentTurnName = henOrder[0] ?? foxName;
  next.fullState.henOrder = henOrder;
  next.fullState.pendingKillTargets = [];
  next.fullState.foxName = foxName;
  append_system_entry(next.fullState, null, reason);
  return next;
}

function reset_to_lobby_state(base: TransportState, actorName: string | null, text: string): TransportState {
  const next = clone_state(base);
  next.fullState.phase = "lobby";
  next.fullState.round = 0;
  next.fullState.currentTurnName = null;
  next.fullState.henOrder = [];
  next.fullState.pendingKillTargets = [];
  next.fullState.foxName = null;
  for (const player of Object.values(next.fullState.players)) {
    player.alive = false;
    player.locationRoomId = null;
    player.ready = false;
    if (player.seat === "spectator") {
      player.role = "spectator";
      player.hasFullInfo = true;
    } else if (next.fullState.masterName === player.name) {
      player.role = "master";
      player.hasFullInfo = true;
    } else {
      player.role = "hen";
      player.hasFullInfo = false;
    }
  }
  append_system_entry(next.fullState, actorName, text);
  return next;
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
    append_system_entry(state, null, "Partida encerrada.");
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

function eliminate_hen(state: FullGameState, targetName: string): FullGameState {
  const target = state.players[targetName];
  if (!target) {
    return state;
  }
  target.alive = false;
  target.hasFullInfo = true;
  state.pendingKillTargets = [];
  append_system_entry(state, state.foxName, `${targetName} foi capturada.`);

  const anyHenAlive = Object.values(state.players).some((player) => player.role === "hen" && player.alive);
  if (!anyHenAlive) {
    state.phase = "game_over";
    state.currentTurnName = null;
    append_system_entry(state, state.foxName, "A raposa venceu a partida.");
    return state;
  }

  return advance_turn(state);
}

function can_post_as_actor(state: TransportState, postName: string, actorName: string): boolean {
  if (postName === actorName) {
    return true;
  }
  return state.fullState.masterName === postName;
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

export function saved_maze_count(): number {
  return SAVED_MAZE_SEEDS.length;
}

export function pick_random_saved_maze_seed(): number {
  return SAVED_MAZE_SEEDS[Math.floor(Math.random() * SAVED_MAZE_SEEDS.length)] ?? SAVED_MAZE_SEEDS[0];
}

export function pick_random_fox_name(players: Presence[], masterName: string | null): string | null {
  const candidates = players.filter((player) => (
    player.seat === "participant" &&
    player.connected &&
    player.name !== masterName
  ));
  if (candidates.length === 0) {
    return null;
  }
  return candidates[Math.floor(Math.random() * candidates.length)]?.name ?? null;
}

export function compute_angle(from: MazeRoom, to: MazeRoom): number {
  const radians = Math.atan2(to.y - from.y, to.x - from.x);
  return Math.round((((radians * 180) / Math.PI) + 360) % 360);
}

export function create_room(id: string, x: number, y: number, type: RoomType = "normal"): MazeRoom {
  return { id, x, y, type };
}

export function make_corridor(fromRoom: MazeRoom, toRoom: MazeRoom): Corridor {
  return {
    id: corridor_id(fromRoom.id, toRoom.id),
    fromRoomId: fromRoom.id,
    toRoomId: toRoom.id,
    angleFrom: compute_angle(fromRoom, toRoom),
    angleTo: compute_angle(toRoom, fromRoom),
  };
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

  const defaultPairs: Array<[string, string]> = [
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

  for (const [left, right] of defaultPairs) {
    const corridor = make_corridor(rooms[left], rooms[right]);
    corridors[corridor.id] = corridor;
  }

  return { rooms, corridors };
}

export function create_empty_state(masterName: string | null = null): FullGameState {
  const { rooms, corridors } = create_default_maze();
  return {
    phase: "lobby",
    masterName,
    foxName: null,
    round: 0,
    currentTurnName: null,
    players: {},
    rooms,
    corridors,
    henOrder: [],
    pendingKillTargets: [],
    feed: [],
  };
}

export function apply_map_edit(state: FullGameState, action: MapEditAction): FullGameState {
  const next = clone_state(state);

  switch (action.type) {
    case "add_room": {
      const ids = Object.keys(next.rooms).map((id) => Number(id.split("-")[1] ?? 0));
      const newId = room_id((Math.max(0, ...ids) || 0) + 1);
      next.rooms[newId] = create_room(newId, 320, 320, "normal");
      return next;
    }
    case "set_default_map": {
      const maze = create_default_maze();
      next.rooms = maze.rooms;
      next.corridors = maze.corridors;
      for (const player of Object.values(next.players)) {
        player.locationRoomId = null;
      }
      return next;
    }
    case "set_random_map":
      apply_random_map(next, action.seed);
      return next;
    case "toggle_corridor": {
      const [a, b] = normalized_id_pair(action.leftRoomId, action.rightRoomId);
      const id = corridor_id(a, b);
      if (next.corridors[id]) {
        delete next.corridors[id];
        return next;
      }
      const left = next.rooms[action.leftRoomId];
      const right = next.rooms[action.rightRoomId];
      if (!left || !right) {
        return state;
      }
      next.corridors[id] = make_corridor(left, right);
      return next;
    }
    case "cycle_room_type": {
      const room = next.rooms[action.roomId];
      if (!room) {
        return state;
      }
      room.type = room.type === "normal" ? "shop" : "normal";
      return next;
    }
    case "remove_room": {
      delete next.rooms[action.roomId];
      for (const corridorId of Object.keys(next.corridors)) {
        const corridor = next.corridors[corridorId];
        if (corridor.fromRoomId === action.roomId || corridor.toRoomId === action.roomId) {
          delete next.corridors[corridorId];
        }
      }
      for (const player of Object.values(next.players)) {
        if (player.locationRoomId === action.roomId) {
          player.locationRoomId = null;
        }
      }
      return next;
    }
    case "toggle_loop": {
      const id = corridor_id(action.roomId, action.roomId);
      if (next.corridors[id]) {
        delete next.corridors[id];
        return next;
      }
      next.corridors[id] = {
        id,
        fromRoomId: action.roomId,
        toRoomId: action.roomId,
        angleFrom: 0,
        angleTo: 0,
      };
      return next;
    }
    case "move_room": {
      const room = next.rooms[action.roomId];
      if (!room) {
        return state;
      }
      room.x = action.x;
      room.y = action.y;
      for (const corridor of Object.values(next.corridors)) {
        if (corridor.fromRoomId === action.roomId || corridor.toRoomId === action.roomId) {
          const fromRoom = next.rooms[corridor.fromRoomId];
          const toRoom = next.rooms[corridor.toRoomId];
          if (!fromRoom || !toRoom) {
            continue;
          }
          corridor.angleFrom = compute_angle(fromRoom, toRoom);
          corridor.angleTo = compute_angle(toRoom, fromRoom);
        }
      }
      return next;
    }
    default:
      return next;
  }
}

function pick_extreme_wrap_pairs(rooms: Record<string, MazeRoom>): Array<[string, string]> {
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

function edge_graph(rooms: Record<string, MazeRoom>): Map<string, Array<[string, string]>> {
  const graph = new Map<string, Array<[string, string]>>();
  const candidatePairs = [
    ...RANDOM_MAZE_EDGE_PAIRS.map(([left, right]) => [room_id(left), room_id(right)] as [string, string]),
    ...pick_extreme_wrap_pairs(rooms),
  ];

  for (const [leftId, rightId] of candidatePairs) {
    graph.set(leftId, [...(graph.get(leftId) ?? []), [leftId, rightId]]);
    graph.set(rightId, [...(graph.get(rightId) ?? []), [rightId, leftId]]);
  }

  return graph;
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

  const extraEdges = shuffle_with_rng(graph_edges(graph), rng);
  const extraCount = 3 + Math.floor(rng() * 5);
  for (const [left, right] of extraEdges) {
    if (Object.keys(corridors).length >= roomIds.length - 1 + extraCount) {
      break;
    }
    const corridor = make_corridor(rooms[left], rooms[right]);
    corridors[corridor.id] = corridor;
  }

  const shopCount = 1 + Math.floor(rng() * 3);
  const shuffledRooms = shuffle_with_rng(roomIds, rng);
  for (let index = 0; index < shopCount; index += 1) {
    const roomName = shuffledRooms[index];
    if (roomName) {
      rooms[roomName].type = "shop";
    }
  }

  const loopCount = Math.floor(rng() * 2);
  for (let index = 0; index < loopCount; index += 1) {
    const roomName = shuffledRooms[shopCount + index];
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

  return { rooms, corridors };
}

export function create_transport_state(): TransportState {
  return {
    roster: {},
    fullState: create_empty_state(),
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

function handle_join_post(state: TransportState, post: Extract<NetPost, { $: "join_room" }>): TransportState {
  const next = clone_state(state);
  const existing = next.roster[post.name];

  if (existing) {
    existing.activeSessionId = post.sessionId;
    existing.lastSeenTick = next.clockTick;
    return next;
  }

  const joinedAt = next.nextJoinOrder + 1;
  const seat = next.fullState.phase === "lobby" ? "participant" : "spectator";
  const player: TransportPlayer = {
    name: post.name,
    color: PRESENCE_COLORS[next.nextJoinOrder % PRESENCE_COLORS.length] ?? PRESENCE_COLORS[0],
    joinedAt,
    seat,
    activeSessionId: post.sessionId,
    lastSeenTick: next.clockTick,
  };

  next.nextJoinOrder += 1;
  next.roster[player.name] = player;
  sync_full_player(next, player);
  if (next.fullState.phase === "lobby") {
    sync_lobby_roles(next.fullState);
  } else {
    append_system_entry(next.fullState, post.name, `${post.name} entrou como espectador.`);
  }
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
  if (state.fullState.phase !== "lobby" || state.fullState.masterName || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const player = state.fullState.players[post.name];
  if (!player || player.seat !== "participant") {
    return state;
  }
  const next = clone_state(state);
  next.fullState.masterName = post.name;
  sync_lobby_roles(next.fullState);
  append_system_entry(next.fullState, post.name, `${post.name} virou mestre.`);
  return next;
}

function handle_unclaim_master_post(state: TransportState, post: Extract<NetPost, { $: "unclaim_master" }>): TransportState {
  if (state.fullState.phase !== "lobby" || state.fullState.masterName !== post.name || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const next = clone_state(state);
  next.fullState.masterName = null;
  sync_lobby_roles(next.fullState);
  append_system_entry(next.fullState, post.name, `${post.name} deixou de ser mestre.`);
  return next;
}

function handle_toggle_ready_post(state: TransportState, post: Extract<NetPost, { $: "toggle_ready" }>): TransportState {
  if (state.fullState.phase !== "lobby" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const player = state.fullState.players[post.name];
  if (!player || player.seat !== "participant") {
    return state;
  }
  const next = clone_state(state);
  next.fullState.players[post.name].ready = !next.fullState.players[post.name].ready;
  append_system_entry(
    next.fullState,
    post.name,
    next.fullState.players[post.name].ready ? `${post.name} ficou ready.` : `${post.name} removeu o ready.`,
  );
  if (should_auto_start(next)) {
    return start_game_with_seed(next, auto_start_seed(next, post.name), "Todos ficaram ready. Partida iniciada.");
  }
  return next;
}

function handle_random_map_post(state: TransportState, post: Extract<NetPost, { $: "set_random_map" }>): TransportState {
  if (state.fullState.phase !== "lobby" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const player = state.fullState.players[post.name];
  if (!player || player.seat !== "participant") {
    return state;
  }
  const next = clone_state(state);
  apply_random_map(next.fullState, post.seed);
  append_system_entry(next.fullState, post.name, `${post.name} aplicou um mapa aleatorio.`);
  return next;
}

function handle_set_random_fox_post(state: TransportState, post: Extract<NetPost, { $: "set_random_fox" }>): TransportState {
  if (state.fullState.phase !== "lobby" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const actor = state.fullState.players[post.name];
  if (!actor || actor.seat !== "participant") {
    return state;
  }
  const next = clone_state(state);
  set_selected_fox(next.fullState, post.foxName);
  if (next.fullState.foxName) {
    append_system_entry(next.fullState, post.name, `${next.fullState.foxName} virou a raposa.`);
  } else {
    append_system_entry(next.fullState, post.name, "A raposa foi removida.");
  }
  return next;
}

function handle_toggle_self_fox_post(state: TransportState, post: Extract<NetPost, { $: "toggle_self_fox" }>): TransportState {
  if (state.fullState.phase !== "lobby" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const player = state.fullState.players[post.name];
  if (!player || player.seat !== "participant" || player.role === "master") {
    return state;
  }
  const next = clone_state(state);
  const nextFox = next.fullState.foxName === post.name ? null : post.name;
  set_selected_fox(next.fullState, nextFox);
  append_system_entry(
    next.fullState,
    post.name,
    nextFox ? `${post.name} virou a raposa.` : `${post.name} deixou de ser raposa.`,
  );
  return next;
}

function handle_start_game_post(state: TransportState, post: Extract<NetPost, { $: "start_game" }>): TransportState {
  if (
    state.fullState.phase !== "lobby" ||
    state.fullState.masterName !== post.name ||
    !is_current_session(state, post.name, post.sessionId)
  ) {
    return state;
  }
  return start_game_with_seed(state, post.seed, `${post.name} iniciou a partida.`);
}

function handle_chat_post(state: TransportState, post: Extract<NetPost, { $: "lobby_chat_message" }>): TransportState {
  if (!is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  const text = post.text.trim().slice(0, 280);
  if (!text) {
    return state;
  }
  const next = clone_state(state);
  append_chat_entry(next.fullState, post.name, text);
  return next;
}

function handle_map_edit_post(state: TransportState, post: Extract<NetPost, { $: "map_edit" }>): TransportState {
  if (
    state.fullState.phase !== "lobby" ||
    state.fullState.masterName !== post.name ||
    !is_current_session(state, post.name, post.sessionId)
  ) {
    return state;
  }
  const next = clone_state(state);
  next.fullState = apply_map_edit(next.fullState, post.action);
  append_system_entry(next.fullState, post.name, "Mapa atualizado pelo mestre.");
  return next;
}

function handle_move_post(state: TransportState, post: Extract<NetPost, { $: "submit_move" }>): TransportState {
  if (state.fullState.phase !== "running" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  if (!can_post_as_actor(state, post.name, post.actorName)) {
    return state;
  }
  return apply_move(state, post.actorName, post.corridorId);
}

function handle_kill_post(state: TransportState, post: Extract<NetPost, { $: "select_kill_target" }>): TransportState {
  if (state.fullState.phase !== "running" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  if (!can_post_as_actor(state, post.name, post.actorName)) {
    return state;
  }
  return apply_kill_choice(state, post.actorName, post.targetName);
}

function handle_return_to_lobby_post(state: TransportState, post: Extract<NetPost, { $: "return_to_lobby" }>): TransportState {
  if (state.fullState.phase !== "game_over" || !is_current_session(state, post.name, post.sessionId)) {
    return state;
  }
  return reset_to_lobby_state(state, post.name, `${post.name} voltou a sala para o lobby.`);
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
    case "toggle_ready":
      return handle_toggle_ready_post(state, post);
    case "set_random_map":
      return handle_random_map_post(state, post);
    case "set_random_fox":
      return handle_set_random_fox_post(state, post);
    case "toggle_self_fox":
      return handle_toggle_self_fox_post(state, post);
    case "start_game":
      return handle_start_game_post(state, post);
    case "lobby_chat_message":
      return handle_chat_post(state, post);
    case "map_edit":
      return handle_map_edit_post(state, post);
    case "submit_move":
      return handle_move_post(state, post);
    case "select_kill_target":
      return handle_kill_post(state, post);
    case "return_to_lobby":
      return handle_return_to_lobby_post(state, post);
    default:
      return state;
  }
}

function build_lobby_state(players: Presence[], fullState: FullGameState): LobbyState {
  const connectedParticipants = connected_lobby_players(players);
  const participantCount = players.filter((player) => player.seat === "participant").length;
  return {
    readyCount: connectedParticipants.filter((player) => player.ready).length,
    connectedParticipantCount: connectedParticipants.length,
    totalParticipantCount: participantCount,
    allConnectedReady: connectedParticipants.length >= 2 && connectedParticipants.every((player) => player.ready),
    foxName: fullState.foxName,
  };
}

export function derive_room_sync(room: string, selfName: string, state: TransportState): RoomSync {
  const players = roster_list(state);
  return {
    room,
    selfName,
    phase: state.fullState.phase,
    masterName: state.fullState.masterName,
    players,
    lobbyState: state.fullState.phase === "lobby" ? build_lobby_state(players, state.fullState) : null,
    publicState: state.fullState.phase === "lobby" ? null : build_public_state(state.fullState, players),
    fullState: clone_state(state.fullState),
    feed: [...state.fullState.feed],
  };
}

export function build_public_state(state: FullGameState, roster: Presence[]): PublicState {
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

export function apply_move(state: TransportState, actorName: string, corridorId: string | null): TransportState {
  if (state.fullState.phase !== "running" || state.fullState.currentTurnName !== actorName || state.fullState.pendingKillTargets.length > 0) {
    return state;
  }

  const next = clone_state(state);
  const actor = next.fullState.players[actorName];
  if (!actor || !actor.alive) {
    return state;
  }

  if (corridorId === null) {
    next.fullState = advance_turn(next.fullState);
    return next;
  }

  const corridor = next.fullState.corridors[corridorId];
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
    const targets = living_hens_in_room(next.fullState, actor.locationRoomId);
    if (targets.length === 0) {
      next.fullState = advance_turn(next.fullState);
      return next;
    }
    if (targets.length === 1) {
      next.fullState = eliminate_hen(next.fullState, targets[0] ?? "");
      return next;
    }
    next.fullState.pendingKillTargets = targets;
    return next;
  }

  next.fullState = advance_turn(next.fullState);
  return next;
}

export function apply_kill_choice(state: TransportState, actorName: string, targetName: string): TransportState {
  if (state.fullState.phase !== "running" || state.fullState.currentTurnName !== actorName || state.fullState.pendingKillTargets.length === 0) {
    return state;
  }

  if (!state.fullState.pendingKillTargets.includes(targetName)) {
    return state;
  }

  const next = clone_state(state);
  next.fullState = eliminate_hen(next.fullState, targetName);
  return next;
}
