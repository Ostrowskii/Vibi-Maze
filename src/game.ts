import type {
  Corridor,
  ExitInfo,
  FullGameState,
  FullPlayerState,
  MazeRoom,
  PlayerRole,
  Presence,
  PublicState,
  RoomType,
  SeatType,
} from "./protocol";

const DEFAULT_ROOM_SIZE = 220;

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
