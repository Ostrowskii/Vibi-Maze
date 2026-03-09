import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";
const COLORS = [
  "#f25f5c",
  "#247ba0",
  "#70c1b3",
  "#f7b267",
  "#8e6c88",
  "#5c80bc",
  "#9bc53d",
  "#f18f01",
];

const rooms = new Map();

function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function roomFor(name) {
  let room = rooms.get(name);
  if (!room) {
    room = {
      name,
      phase: "lobby",
      masterName: null,
      players: new Map(),
      publicState: null,
      fullState: null,
      swapMode: "none",
      swapVotes: new Set(),
      swapUnlocked: false,
      message: null,
    };
    rooms.set(name, room);
  }
  return room;
}

function listPlayers(room) {
  return [...room.players.values()]
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => {
      const synced = room.fullState?.players?.[player.name];
      return {
        name: player.name,
        color: player.color,
        joinedAt: player.joinedAt,
        connected: player.connected,
        seat: player.seat,
        isMaster: room.masterName === player.name,
        role: synced?.role ?? (room.masterName === player.name ? "master" : player.seat === "spectator" ? "spectator" : "player"),
        alive: synced?.alive ?? false,
      };
    });
}

function eligibleSwapNames(room) {
  const fullPlayers = room.fullState?.players ?? {};
  return Object.values(fullPlayers)
    .filter((player) => player.role === "hen" && !player.alive && player.hasFullInfo)
    .map((player) => player.name)
    .filter((name) => room.players.get(name)?.connected);
}

function connectedNonMasterNames(room) {
  return [...room.players.values()]
    .filter((player) => player.connected && player.name !== room.masterName)
    .map((player) => player.name);
}

function canReceiveFullState(room, playerName) {
  if (!playerName) return false;
  if (room.masterName === playerName) return true;
  const presence = room.players.get(playerName);
  if (!presence) return false;
  if (presence.seat === "spectator") return true;
  const fullPlayer = room.fullState?.players?.[playerName];
  return fullPlayer?.hasFullInfo === true;
}

function payloadFor(room, playerName) {
  const eligible = eligibleSwapNames(room);
  const self = room.players.get(playerName);
  return {
    room: room.name,
    selfName: playerName,
    phase: room.phase,
    masterName: room.masterName,
    players: listPlayers(room),
    publicState: room.publicState,
    fullState: canReceiveFullState(room, playerName) ? room.fullState : null,
    canClaimMaster: room.phase === "lobby" && !room.masterName && self?.seat !== "spectator",
    canBecomeMaster:
      room.phase === "paused_master_disconnect" &&
      room.swapUnlocked &&
      eligible.includes(playerName),
    swapMode: room.swapMode,
    swapVotes: [...room.swapVotes],
    eligibleNames: eligible,
    message: room.message,
  };
}

function broadcastSync(room) {
  for (const player of room.players.values()) {
    if (!player.socket || !player.connected) continue;
    send(player.socket, { type: "sync", payload: payloadFor(room, player.name) });
  }
}

function markMasterDisconnected(room) {
  if (room.phase !== "running" && room.phase !== "game_over") {
    room.masterName = null;
    room.message = "Mestre saiu da sala.";
    return;
  }

  room.phase = "paused_master_disconnect";
  if (room.fullState) {
    room.fullState.phase = "paused_master_disconnect";
  }
  room.swapVotes.clear();
  room.swapUnlocked = false;
  const eligible = eligibleSwapNames(room);

  if (eligible.length > 0) {
    room.swapMode = "swap";
    room.message = 'Mestre desconectado, trocar mestre?';
  } else {
    room.swapMode = "quit";
    room.message = 'Mestre desconectado, deseja desistir da partida?';
  }
}

function bindSocketToPlayer(ws, room, player) {
  ws.roomName = room.name;
  ws.playerName = player.name;
  player.socket = ws;
  player.connected = true;
}

function handleJoin(ws, message) {
  const room = roomFor(message.room);
  const name = message.name;
  if (!name || !room.name) {
    send(ws, { type: "error", message: "Sala e nome são obrigatórios." });
    return;
  }

  let player = room.players.get(name);
  if (player) {
    if (player.socket && player.socket !== ws) {
      send(player.socket, { type: "force_logout", reason: "Outra aba assumiu esta identidade." });
      try {
        player.socket.close();
      } catch {}
    }
    bindSocketToPlayer(ws, room, player);
    if (room.phase === "paused_master_disconnect" && room.masterName === name) {
      room.phase = room.fullState?.phase === "game_over" ? "game_over" : "running";
      room.swapMode = "none";
      room.swapVotes.clear();
      room.swapUnlocked = false;
      room.message = "Mestre reconectado.";
      if (room.fullState) {
        room.fullState.phase = room.phase;
      }
    }
    broadcastSync(room);
    return;
  }

  const joinIndex = room.players.size;
  player = {
    name,
    joinedAt: Date.now(),
    color: COLORS[joinIndex % COLORS.length],
    seat: room.phase === "lobby" ? "participant" : "spectator",
    connected: true,
    socket: ws,
  };
  room.players.set(name, player);
  bindSocketToPlayer(ws, room, player);
  room.message = room.phase === "lobby" ? null : "Partida em andamento. Novo ingresso como espectador.";
  broadcastSync(room);
}

function handleClaimMaster(ws) {
  const room = rooms.get(ws.roomName);
  if (!room || room.masterName || room.phase !== "lobby") {
    return;
  }
  const player = room.players.get(ws.playerName);
  if (!player || player.seat === "spectator") {
    return;
  }
  room.masterName = player.name;
  room.message = `${player.name} virou mestre.`;
  broadcastSync(room);
}

function handlePublishState(ws, message) {
  const room = rooms.get(ws.roomName);
  if (!room || room.masterName !== ws.playerName) {
    return;
  }
  room.fullState = message.fullState;
  room.publicState = message.publicState;
  room.phase = message.fullState.phase;
  room.message = null;

  for (const synced of Object.values(message.fullState.players)) {
    if (!room.players.has(synced.name)) {
      room.players.set(synced.name, {
        name: synced.name,
        joinedAt: synced.joinedAt,
        color: synced.color,
        seat: synced.seat,
        connected: false,
        socket: null,
      });
    }
    const player = room.players.get(synced.name);
    player.seat = synced.seat;
    if (room.phase !== "lobby" && synced.seat === "spectator") {
      player.seat = "spectator";
    }
  }

  if (room.phase !== "paused_master_disconnect") {
    room.swapMode = "none";
    room.swapVotes.clear();
    room.swapUnlocked = false;
  }

  broadcastSync(room);
}

function routeActionToMaster(ws, action) {
  const room = rooms.get(ws.roomName);
  if (!room || !room.masterName) {
    return;
  }
  const master = room.players.get(room.masterName);
  if (!master?.connected || !master.socket) {
    return;
  }
  send(master.socket, {
    type: "action_request",
    action,
  });
}

function handleVoteSwapMaster(ws) {
  const room = rooms.get(ws.roomName);
  if (!room || room.phase !== "paused_master_disconnect" || room.swapMode !== "swap") {
    return;
  }
  room.swapVotes.add(ws.playerName);
  const needed = connectedNonMasterNames(room);
  room.swapUnlocked = needed.every((name) => room.swapVotes.has(name));
  broadcastSync(room);
}

function handleBecomeMaster(ws) {
  const room = rooms.get(ws.roomName);
  if (!room || !room.swapUnlocked) {
    return;
  }
  const eligible = eligibleSwapNames(room);
  if (!eligible.includes(ws.playerName)) {
    return;
  }
  room.masterName = ws.playerName;
  room.swapUnlocked = false;
  room.swapVotes.clear();
  room.swapMode = "none";
  room.phase = room.fullState?.phase === "game_over" ? "game_over" : "running";
  room.message = `${ws.playerName} assumiu como mestre.`;
  if (room.fullState) {
    room.fullState.masterName = ws.playerName;
    room.fullState.phase = room.phase;
  }
  broadcastSync(room);
}

function handleAbandonMatch(ws) {
  const room = rooms.get(ws.roomName);
  if (!room || room.phase !== "paused_master_disconnect") {
    return;
  }
  room.phase = "lobby";
  room.masterName = null;
  room.publicState = null;
  room.fullState = null;
  room.swapMode = "none";
  room.swapUnlocked = false;
  room.swapVotes.clear();
  room.message = "Partida encerrada. Sala voltou ao lobby.";
  for (const player of room.players.values()) {
    player.seat = "participant";
  }
  broadcastSync(room);
}

const wss = new WebSocketServer({ port: PORT, host: HOST });

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: "error", message: "Mensagem inválida." });
      return;
    }

    switch (message.type) {
      case "join_room":
        handleJoin(ws, message);
        break;
      case "claim_master":
        handleClaimMaster(ws);
        break;
      case "publish_state":
        handlePublishState(ws, message);
        break;
      case "submit_move":
        routeActionToMaster(ws, {
          type: "move",
          actorName: ws.playerName,
          corridorId: message.corridorId ?? null,
        });
        break;
      case "select_kill_target":
        routeActionToMaster(ws, {
          type: "kill",
          actorName: ws.playerName,
          targetName: message.targetName,
        });
        break;
      case "vote_swap_master":
        handleVoteSwapMaster(ws);
        break;
      case "become_master":
        handleBecomeMaster(ws);
        break;
      case "abandon_match":
        handleAbandonMatch(ws);
        break;
      default:
        send(ws, { type: "error", message: "Tipo de mensagem não suportado." });
        break;
    }
  });

  ws.on("close", () => {
    const room = rooms.get(ws.roomName);
    if (!room) {
      return;
    }
    const player = room.players.get(ws.playerName);
    if (!player) {
      return;
    }
    player.connected = false;
    player.socket = null;
    if (room.masterName === player.name) {
      markMasterDisconnected(room);
    }
    broadcastSync(room);
  });
});

console.log(`Vibi-Maze relay listening on ws://${HOST}:${PORT}`);
