import { VibiNet } from "vibinet";
import "./style.css";

type DirectionTag = "up" | "right" | "down" | "left";
type Direction = { $: DirectionTag };

type EmoteTag = "oi" | "vem" | "espera" | "chave";
type Emote = { $: EmoteTag };

type Post =
  | { $: "spawn"; pid: number }
  | { $: "down"; pid: number; dir: Direction }
  | { $: "up"; pid: number; dir: Direction }
  | { $: "emote"; pid: number; emote: Emote }
  | { $: "restart"; pid: number };

type Player = {
  pid: number;
  x: number;
  y: number;
  up: number;
  right: number;
  down: number;
  left: number;
  facing: DirectionTag;
  move_cooldown: number;
  emote: EmoteTag | "";
  emote_ttl: number;
  steps: number;
};

type State = {
  players: Record<string, Player>;
  relics_mask: number;
  winner_pid: number;
  round: number;
};

type Point = { x: number; y: number };

const MAP = [
  "###############",
  "#...#.....#..R#",
  "#.#.#.###.#.#.#",
  "#.#...#...#.#.#",
  "#.#####.###.#.#",
  "#.....#...#...#",
  "###.#.###.###.#",
  "#...#...#.....#",
  "#.###.#.#####.#",
  "#R....#.....E.#",
  "###############",
] as const;

const SPAWN_POINTS: readonly Point[] = [
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 1, y: 2 },
  { x: 1, y: 3 },
  { x: 2, y: 3 },
] as const;

const RELICS = [
  { x: 13, y: 1, bit: 1, label: "Sol" },
  { x: 1, y: 9, bit: 2, label: "Lua" },
] as const;

const EXIT_TILE = { x: 12, y: 9 } as const;
const ALL_RELICS_MASK = RELICS.reduce((mask, relic) => mask | relic.bit, 0);
const DIRECTION_ORDER: readonly DirectionTag[] = ["up", "right", "down", "left"];
const PLAYER_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";
const TILE_SIZE = 48;
const CANVAS_WIDTH = MAP[0].length * TILE_SIZE;
const CANVAS_HEIGHT = MAP.length * TILE_SIZE;
const TICK_RATE = 10;
const TOLERANCE_MS = 240;
const MOVE_COOLDOWN = 2;
const EMOTE_TTL = 18;
const PLAYER_STORAGE_KEY = "vibi-maze-player-char";
const COLOR_PALETTE = [
  "#f25f5c",
  "#247ba0",
  "#70c1b3",
  "#f7b267",
  "#8e6c88",
  "#5c80bc",
  "#9bc53d",
  "#f18f01",
] as const;

const EMOTE_LABELS: Record<EmoteTag, string> = {
  oi: "OI",
  vem: "VEM",
  espera: "ESPERA",
  chave: "CHAVE",
};

const EMOTE_SHORTCUTS: Array<{ key: string; emote: EmoteTag }> = [
  { key: "Digit1", emote: "oi" },
  { key: "Digit2", emote: "vem" },
  { key: "Digit3", emote: "espera" },
  { key: "Digit4", emote: "chave" },
];

const initial: State = {
  players: {},
  relics_mask: 0,
  winner_pid: 0,
  round: 1,
};

const direction_packer: VibiNet.Packed = {
  $: "Union",
  variants: {
    up: { $: "Struct", fields: {} },
    right: { $: "Struct", fields: {} },
    down: { $: "Struct", fields: {} },
    left: { $: "Struct", fields: {} },
  },
};

const emote_packer: VibiNet.Packed = {
  $: "Union",
  variants: {
    oi: { $: "Struct", fields: {} },
    vem: { $: "Struct", fields: {} },
    espera: { $: "Struct", fields: {} },
    chave: { $: "Struct", fields: {} },
  },
};

const packer: VibiNet.Packed = {
  $: "Union",
  variants: {
    spawn: {
      $: "Struct",
      fields: {
        pid: { $: "UInt", size: 8 },
      },
    },
    down: {
      $: "Struct",
      fields: {
        pid: { $: "UInt", size: 8 },
        dir: direction_packer,
      },
    },
    up: {
      $: "Struct",
      fields: {
        pid: { $: "UInt", size: 8 },
        dir: direction_packer,
      },
    },
    emote: {
      $: "Struct",
      fields: {
        pid: { $: "UInt", size: 8 },
        emote: emote_packer,
      },
    },
    restart: {
      $: "Struct",
      fields: {
        pid: { $: "UInt", size: 8 },
      },
    },
  },
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Elemento #app não encontrado.");
}

app.innerHTML = `
  <main class="shell">
    <section class="board-panel">
      <div class="masthead">
        <div class="title-wrap">
          <p class="eyebrow">Deterministic Multiplayer Maze</p>
          <h1 class="title">Vibi-Maze</h1>
          <p class="subtitle">
            Colete as duas relíquias, abra a saída e sincronize tudo via <code>vibinet</code>.
          </p>
        </div>
        <p class="status" id="status">
          <span class="status-dot" id="status-dot"></span>
          <span id="status-text">Sincronizando com a sala...</span>
        </p>
      </div>
      <div class="board-wrap">
        <canvas
          id="maze"
          class="board-canvas"
          width="${CANVAS_WIDTH}"
          height="${CANVAS_HEIGHT}"
        ></canvas>
      </div>
      <div class="board-caption">
        <span>Objetivo cooperativo com relíquias compartilhadas e saída global.</span>
        <span>Movimento contínuo por input sync, sem snapshot de estado.</span>
      </div>
    </section>
    <aside class="side-panel">
      <section class="panel-card">
        <h2 class="panel-title">Sessão</h2>
        <p class="metric">Sala: <strong><code id="room-label"></code></strong></p>
        <p class="metric">Jogador: <strong><span class="badge" id="player-badge"></span></strong></p>
        <p class="metric">Servidor: <strong><code id="server-label"></code></strong></p>
        <p class="metric">Rodada: <strong id="round-label">1</strong></p>
      </section>
      <section class="panel-card">
        <h2 class="panel-title">Objetivo</h2>
        <p class="objective" id="objective-text"></p>
        <p class="objective-note" id="objective-note"></p>
      </section>
      <section class="panel-card">
        <h2 class="panel-title">Time na Sala</h2>
        <ul class="player-list" id="player-list"></ul>
      </section>
      <section class="panel-card controls">
        <h2 class="panel-title">Controles</h2>
        <ul class="hotkeys">
          <li><code>W A S D</code> ou setas para andar</li>
          <li><code>1</code> a <code>4</code> para emotes rápidos</li>
          <li><code>R</code> para reiniciar a rodada</li>
        </ul>
        <div class="action-row">
          <button id="restart-btn" class="btn btn-primary" type="button">Reiniciar</button>
          <button id="copy-room-btn" class="btn btn-secondary" type="button">Copiar link</button>
        </div>
        <p class="copy-feedback" id="copy-feedback"></p>
      </section>
      <p class="footer-note">
        Abra duas abas com a mesma <code>room</code> e <code>char</code> diferentes para testar o multiplayer.
      </p>
    </aside>
  </main>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#maze");
const statusDot = document.querySelector<HTMLSpanElement>("#status-dot");
const statusText = document.querySelector<HTMLSpanElement>("#status-text");
const roomLabel = document.querySelector<HTMLElement>("#room-label");
const playerBadge = document.querySelector<HTMLElement>("#player-badge");
const serverLabel = document.querySelector<HTMLElement>("#server-label");
const roundLabel = document.querySelector<HTMLElement>("#round-label");
const objectiveText = document.querySelector<HTMLElement>("#objective-text");
const objectiveNote = document.querySelector<HTMLElement>("#objective-note");
const playerList = document.querySelector<HTMLUListElement>("#player-list");
const restartButton = document.querySelector<HTMLButtonElement>("#restart-btn");
const copyRoomButton = document.querySelector<HTMLButtonElement>("#copy-room-btn");
const copyFeedback = document.querySelector<HTMLElement>("#copy-feedback");

if (
  !canvas ||
  !statusDot ||
  !statusText ||
  !roomLabel ||
  !playerBadge ||
  !serverLabel ||
  !roundLabel ||
  !objectiveText ||
  !objectiveNote ||
  !playerList ||
  !restartButton ||
  !copyRoomButton ||
  !copyFeedback
) {
  throw new Error("Estrutura da interface inválida.");
}

const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Canvas 2D indisponível.");
}

const statusDotEl: HTMLSpanElement = statusDot;
const statusTextEl: HTMLSpanElement = statusText;
const roomLabelEl: HTMLElement = roomLabel;
const playerBadgeEl: HTMLElement = playerBadge;
const serverLabelEl: HTMLElement = serverLabel;
const roundLabelEl: HTMLElement = roundLabel;
const objectiveTextEl: HTMLElement = objectiveText;
const objectiveNoteEl: HTMLElement = objectiveNote;
const playerListEl: HTMLUListElement = playerList;
const restartButtonEl: HTMLButtonElement = restartButton;
const copyRoomButtonEl: HTMLButtonElement = copyRoomButton;
const copyFeedbackEl: HTMLElement = copyFeedback;
const ctx: CanvasRenderingContext2D = context;

const query = new URLSearchParams(window.location.search);
const room = resolve_room(query.get("room"), import.meta.env.VITE_VIBINET_ROOM);
const playerChar = resolve_player_char(query.get("char"));
const pid = playerChar.charCodeAt(0);
const server = resolve_server(query.get("server"), import.meta.env.VITE_VIBINET_SERVER);

roomLabelEl.textContent = room;
playerBadgeEl.textContent = playerChar;
serverLabelEl.textContent = server ? normalize_server_label(server) : "oficial";

const game = new VibiNet.game<State, Post>({
  room,
  server,
  initial,
  on_tick,
  on_post,
  packer,
  tick_rate: TICK_RATE,
  tolerance: TOLERANCE_MS,
  smooth: (remote_state, local_state) => {
    const me = local_state.players[playerChar];
    if (!me) {
      return remote_state;
    }
    return {
      ...remote_state,
      players: {
        ...remote_state.players,
        [playerChar]: me,
      },
    };
  },
});

const pressedDirections = new Set<DirectionTag>();
let synced = false;
let spawned = false;

game.on_sync(() => {
  synced = true;
  statusDotEl.classList.add("is-live");
  statusTextEl.textContent = `Conectado na sala ${room}`;

  if (!spawned) {
    spawned = true;
    game.post({ $: "spawn", pid });
  }
});

window.addEventListener("keydown", (event) => {
  const direction = key_to_direction(event.code);
  if (direction) {
    event.preventDefault();
    if (pressedDirections.has(direction)) {
      return;
    }
    pressedDirections.add(direction);
    post_if_synced({ $: "down", pid, dir: { $: direction } });
    return;
  }

  if (event.code === "KeyR") {
    event.preventDefault();
    post_if_synced({ $: "restart", pid });
    return;
  }

  const shortcut = EMOTE_SHORTCUTS.find((item) => item.key === event.code);
  if (shortcut && !event.repeat) {
    event.preventDefault();
    post_if_synced({ $: "emote", pid, emote: { $: shortcut.emote } });
  }
});

window.addEventListener("keyup", (event) => {
  const direction = key_to_direction(event.code);
  if (!direction || !pressedDirections.has(direction)) {
    return;
  }
  event.preventDefault();
  pressedDirections.delete(direction);
  post_if_synced({ $: "up", pid, dir: { $: direction } });
});

window.addEventListener("blur", () => {
  release_all_directions();
});

restartButtonEl.addEventListener("click", () => {
  post_if_synced({ $: "restart", pid });
});

copyRoomButtonEl.addEventListener("click", async () => {
  const share_url = build_room_url(room);
  try {
    await navigator.clipboard.writeText(share_url);
    copyFeedbackEl.textContent = "Link da sala copiado.";
  } catch {
    copyFeedbackEl.textContent = share_url;
  }
});

render_loop();

function render_loop(): void {
  requestAnimationFrame(render_loop);

  if (!synced) {
    draw_waiting_screen();
    return;
  }

  const state = game.compute_render_state();
  draw_state(state);
  update_sidebar(state);
}

function draw_waiting_screen(): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#08161c";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let y = 0; y < MAP.length; y += 1) {
    for (let x = 0; x < MAP[0].length; x += 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
  ctx.fillStyle = "#fff5e8";
  ctx.font = '700 28px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("Sincronizando sala...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 8);
  ctx.fillStyle = "rgba(255, 245, 232, 0.72)";
  ctx.font = '600 14px "JetBrains Mono", "IBM Plex Mono", monospace';
  ctx.fillText("VibiNet aguardando clock oficial", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
}

function draw_state(state: State): void {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  draw_floor();
  draw_relics(state);
  draw_exit(state);
  draw_players(state);

  if (state.winner_pid !== 0) {
    draw_victory_overlay(pid_to_char(state.winner_pid));
  }
}

function draw_floor(): void {
  for (let y = 0; y < MAP.length; y += 1) {
    for (let x = 0; x < MAP[0].length; x += 1) {
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      const tile = MAP[y][x];

      if (tile === "#") {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#16333a" : "#10262c";
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      } else {
        ctx.fillStyle = (x + y) % 2 === 0 ? "#efe0bd" : "#e8d5ac";
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = "rgba(19, 33, 31, 0.05)";
        ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function draw_relics(state: State): void {
  for (const relic of RELICS) {
    const collected = (state.relics_mask & relic.bit) !== 0;
    if (collected) {
      continue;
    }

    const center = tile_center(relic);
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = relic.bit === 1 ? "#f0a54b" : "#79b8d1";
    ctx.fillRect(-10, -10, 20, 20);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }
}

function draw_exit(state: State): void {
  const px = EXIT_TILE.x * TILE_SIZE;
  const py = EXIT_TILE.y * TILE_SIZE;
  const open = state.relics_mask === ALL_RELICS_MASK;

  ctx.fillStyle = open ? "#9bd174" : "#7c3a2c";
  ctx.fillRect(px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 12);
  ctx.fillStyle = open ? "rgba(255, 255, 255, 0.22)" : "rgba(255, 244, 232, 0.12)";
  ctx.fillRect(px + 14, py + 10, TILE_SIZE - 28, TILE_SIZE - 20);
  if (open) {
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 12, py + 8, TILE_SIZE - 24, TILE_SIZE - 16);
  }
}

function draw_players(state: State): void {
  const ids = sorted_player_ids(state.players);
  for (const id of ids) {
    const player = state.players[id];
    if (!player) {
      continue;
    }

    const center = tile_center(player);
    const color = color_for_pid(player.pid);

    ctx.beginPath();
    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
    ctx.ellipse(center.x, center.y + 13, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(center.x, center.y, 15, 0, Math.PI * 2);
    ctx.fill();

    if (id === playerChar) {
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#fff6df";
      ctx.arc(center.x, center.y, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#082028";
    ctx.font = '800 14px "JetBrains Mono", "IBM Plex Mono", monospace';
    ctx.textAlign = "center";
    ctx.fillText(id, center.x, center.y + 5);

    if (player.emote && player.emote_ttl > 0) {
      draw_emote_bubble(center.x, center.y - 28, EMOTE_LABELS[player.emote]);
    }
  }
}

function draw_emote_bubble(x: number, y: number, text: string): void {
  const padding_x = 9;
  const bubble_height = 22;
  ctx.font = '700 11px "JetBrains Mono", "IBM Plex Mono", monospace';
  const width = Math.max(34, ctx.measureText(text).width + padding_x * 2);
  const left = x - width / 2;
  const top = y - bubble_height / 2;

  ctx.fillStyle = "rgba(255, 248, 235, 0.95)";
  round_rect(ctx, left, top, width, bubble_height, 11);
  ctx.fill();

  ctx.fillStyle = "#103038";
  ctx.textAlign = "center";
  ctx.fillText(text, x, top + 14);
}

function draw_victory_overlay(winner: string): void {
  ctx.fillStyle = "rgba(6, 15, 18, 0.44)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#fff7e8";
  ctx.textAlign = "center";
  ctx.font = '800 34px "Avenir Next", "Trebuchet MS", sans-serif';
  ctx.fillText(`${winner} escapou do labirinto`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
  ctx.font = '700 14px "JetBrains Mono", "IBM Plex Mono", monospace';
  ctx.fillText("Pressione R para reiniciar a rodada", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
}

function update_sidebar(state: State): void {
  roundLabelEl.textContent = String(state.round);
  const relic_count = RELICS.filter((relic) => (state.relics_mask & relic.bit) !== 0).length;

  if (state.winner_pid !== 0) {
    objectiveTextEl.textContent = `${pid_to_char(state.winner_pid)} venceu a rodada.`;
    objectiveNoteEl.textContent = "Pressione R para recolocar todo mundo na entrada.";
  } else if (relic_count < RELICS.length) {
    objectiveTextEl.textContent = `Relíquias ativadas: ${relic_count}/${RELICS.length}`;
    objectiveNoteEl.textContent = "Pegue Sol e Lua para liberar a porta final.";
  } else {
    objectiveTextEl.textContent = "Saída aberta.";
    objectiveNoteEl.textContent = "Agora basta qualquer jogador alcançar a porta verde.";
  }

  const ids = sorted_player_ids(state.players);
  playerListEl.innerHTML =
    ids.length === 0
      ? `<li class="player-item"><p class="player-name">Aguardando jogadores...</p></li>`
      : ids
          .map((id) => {
            const player = state.players[id];
            if (!player) {
              return "";
            }
            const is_me = id === playerChar;
            const emote = player.emote ? ` • ${EMOTE_LABELS[player.emote]}` : "";
            return `
              <li class="player-item ${is_me ? "is-me" : ""}">
                <span class="player-token" style="background:${color_for_pid(player.pid)}"></span>
                <div>
                  <p class="player-name">${id}</p>
                  <p class="player-meta">${player.steps} passos${emote}</p>
                </div>
                <span class="player-tag">${is_me ? "voce" : "ally"}</span>
              </li>
            `;
          })
          .join("");
}

function on_tick(state: State): State {
  let relics_mask = state.relics_mask;
  let winner_pid = state.winner_pid;
  let players_changed = false;
  const next_players: State["players"] = {};

  for (const id of sorted_player_ids(state.players)) {
    const player = state.players[id];
    if (!player) {
      continue;
    }

    let x = player.x;
    let y = player.y;
    let facing = player.facing;
    let move_cooldown = player.move_cooldown > 0 ? player.move_cooldown - 1 : 0;
    let steps = player.steps;
    let emote_ttl = player.emote_ttl > 0 ? player.emote_ttl - 1 : 0;
    let emote: Player["emote"] = emote_ttl === 0 ? "" : player.emote;

    if (winner_pid === 0 && move_cooldown === 0) {
      const direction = pick_move_direction(player);
      if (direction) {
        const target = offset_for_direction(x, y, direction);
        facing = direction;
        if (is_walkable(target.x, target.y)) {
          x = target.x;
          y = target.y;
          steps += 1;
          move_cooldown = MOVE_COOLDOWN;
          const relic_bit = relic_bit_at(x, y);
          if (relic_bit !== 0) {
            relics_mask |= relic_bit;
          }
          if (x === EXIT_TILE.x && y === EXIT_TILE.y && relics_mask === ALL_RELICS_MASK) {
            winner_pid = player.pid;
          }
        } else {
          move_cooldown = 1;
        }
      }
    }

    const changed =
      x !== player.x ||
      y !== player.y ||
      facing !== player.facing ||
      move_cooldown !== player.move_cooldown ||
      steps !== player.steps ||
      emote !== player.emote ||
      emote_ttl !== player.emote_ttl;

    next_players[id] = changed
      ? {
          ...player,
          x,
          y,
          facing,
          move_cooldown,
          steps,
          emote,
          emote_ttl,
        }
      : player;

    players_changed = players_changed || changed;
  }

  if (!players_changed && relics_mask === state.relics_mask && winner_pid === state.winner_pid) {
    return state;
  }

  return {
    ...state,
    players: next_players,
    relics_mask,
    winner_pid,
  };
}

function on_post(post: Post, state: State): State {
  switch (post.$) {
    case "spawn": {
      const id = pid_to_char(post.pid);
      if (state.players[id]) {
        return state;
      }
      const spawn = find_spawn_point(post.pid, state.players);
      return {
        ...state,
        players: {
          ...state.players,
          [id]: create_player(post.pid, spawn),
        },
      };
    }

    case "down":
      return patch_player(state, pid_to_char(post.pid), (player) => {
        const key = post.dir.$;
        if (player[key] === 1 && player.facing === key) {
          return player;
        }
        return {
          ...player,
          [key]: 1,
          facing: key,
        };
      });

    case "up":
      return patch_player(state, pid_to_char(post.pid), (player) => {
        const key = post.dir.$;
        if (player[key] === 0) {
          return player;
        }
        return {
          ...player,
          [key]: 0,
        };
      });

    case "emote":
      return patch_player(state, pid_to_char(post.pid), (player) => ({
        ...player,
        emote: post.emote.$,
        emote_ttl: EMOTE_TTL,
      }));

    case "restart":
      return restart_round(state);
  }
}

function create_player(pid_value: number, spawn: Point): Player {
  return {
    pid: pid_value,
    x: spawn.x,
    y: spawn.y,
    up: 0,
    right: 0,
    down: 0,
    left: 0,
    facing: "right",
    move_cooldown: 0,
    emote: "",
    emote_ttl: 0,
    steps: 0,
  };
}

function restart_round(state: State): State {
  const next_players: State["players"] = {};

  for (const id of sorted_player_ids(state.players)) {
    const current = state.players[id];
    if (!current) {
      continue;
    }
    const spawn = find_spawn_point(current.pid, next_players);
    next_players[id] = create_player(current.pid, spawn);
  }

  return {
    players: next_players,
    relics_mask: 0,
    winner_pid: 0,
    round: state.round + 1,
  };
}

function patch_player(
  state: State,
  id: string,
  apply: (player: Player) => Player,
): State {
  const player = state.players[id];
  if (!player) {
    return state;
  }

  const next = apply(player);
  if (next === player) {
    return state;
  }

  return {
    ...state,
    players: {
      ...state.players,
      [id]: next,
    },
  };
}

function find_spawn_point(pid_value: number, players: Record<string, Player>): Point {
  const occupied = new Set(Object.values(players).map((player) => `${player.x}:${player.y}`));
  const start = pid_value % SPAWN_POINTS.length;

  for (let offset = 0; offset < SPAWN_POINTS.length; offset += 1) {
    const candidate = SPAWN_POINTS[(start + offset) % SPAWN_POINTS.length];
    if (!occupied.has(`${candidate.x}:${candidate.y}`)) {
      return candidate;
    }
  }

  return SPAWN_POINTS[start];
}

function pick_move_direction(player: Player): DirectionTag | null {
  if (player[player.facing] === 1) {
    return player.facing;
  }

  for (const direction of DIRECTION_ORDER) {
    if (player[direction] === 1) {
      return direction;
    }
  }

  return null;
}

function offset_for_direction(x: number, y: number, direction: DirectionTag): Point {
  switch (direction) {
    case "up":
      return { x, y: y - 1 };
    case "right":
      return { x: x + 1, y };
    case "down":
      return { x, y: y + 1 };
    case "left":
      return { x: x - 1, y };
  }
}

function key_to_direction(code: string): DirectionTag | null {
  switch (code) {
    case "ArrowUp":
    case "KeyW":
      return "up";
    case "ArrowRight":
    case "KeyD":
      return "right";
    case "ArrowDown":
    case "KeyS":
      return "down";
    case "ArrowLeft":
    case "KeyA":
      return "left";
    default:
      return null;
  }
}

function release_all_directions(): void {
  for (const direction of [...pressedDirections]) {
    post_if_synced({ $: "up", pid, dir: { $: direction } });
  }
  pressedDirections.clear();
}

function post_if_synced(post: Post): void {
  if (!synced) {
    return;
  }
  game.post(post);
}

function is_walkable(x: number, y: number): boolean {
  return MAP[y]?.[x] !== undefined && MAP[y][x] !== "#";
}

function relic_bit_at(x: number, y: number): number {
  for (const relic of RELICS) {
    if (relic.x === x && relic.y === y) {
      return relic.bit;
    }
  }
  return 0;
}

function tile_center(point: Point): Point {
  return {
    x: point.x * TILE_SIZE + TILE_SIZE / 2,
    y: point.y * TILE_SIZE + TILE_SIZE / 2,
  };
}

function color_for_pid(pid_value: number): string {
  return COLOR_PALETTE[pid_value % COLOR_PALETTE.length];
}

function pid_to_char(pid_value: number): string {
  return String.fromCharCode(pid_value);
}

function sorted_player_ids(players: Record<string, Player>): string[] {
  return Object.keys(players).sort((left, right) => players[left]!.pid - players[right]!.pid);
}

function resolve_room(query_room: string | null, env_room: string | undefined): string {
  const candidate = query_room?.trim() || env_room?.trim() || "maze-lobby";
  return candidate.replace(/\s+/g, "-").slice(0, 48);
}

function resolve_player_char(query_char: string | null): string {
  const candidate = (query_char ?? window.localStorage.getItem(PLAYER_STORAGE_KEY) ?? "")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  if (is_valid_player_char(candidate)) {
    window.localStorage.setItem(PLAYER_STORAGE_KEY, candidate);
    return candidate;
  }

  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  const generated = PLAYER_CHARS[bytes[0] % PLAYER_CHARS.length];
  window.localStorage.setItem(PLAYER_STORAGE_KEY, generated);
  return generated;
}

function resolve_server(query_server: string | null, env_server: string | undefined): string | undefined {
  const candidate = query_server?.trim() || env_server?.trim();
  return candidate || undefined;
}

function is_valid_player_char(value: string): boolean {
  return PLAYER_CHARS.includes(value);
}

function normalize_server_label(value: string): string {
  return value.replace(/^wss?:\/\//, "");
}

function build_room_url(next_room: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set("room", next_room);
  url.searchParams.delete("char");
  return url.toString();
}

function round_rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
