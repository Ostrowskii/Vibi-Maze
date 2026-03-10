import "./style.css";
import { OFFICIAL_SERVER_URL, VibiNet } from "vibinet";
import {
  apply_kill_choice,
  apply_map_edit,
  apply_move,
  apply_transport_post,
  clone_state,
  create_transport_state,
  derive_room_sync,
  encode_transport_post,
  normalize_name,
  normalize_room,
  pick_random_fox_name,
  pick_random_saved_maze_seed,
  saved_maze_count,
  tick_transport_state,
} from "./game";
import type {
  FeedEntry,
  FullGameState,
  LimitedPlayerView,
  MapEditAction,
  NetPost,
  Presence,
  RoomSync,
  TransportState,
} from "./protocol";

type UiState = {
  roomInput: string;
  nameInput: string;
  chatInput: string;
  followTurn: boolean;
  watchName: string | null;
  revealFullMap: boolean;
  selectedRoomId: string | null;
  connectSourceRoomId: string | null;
  dragRoomId: string | null;
  editorOpen: boolean;
  toast: string;
};

const NAME_KEY = "vibi-maze-name";
const ROOM_KEY = "vibi-maze-room";
const SESSION_KEY = "vibi-maze-session";
const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 660;
const SYNC_INTERVAL_MS = 200;
const HEARTBEAT_INTERVAL_MS = 2500;
const GAME_OVER_NOTICE_MS = 4200;
const TRANSPORT_PACKER = { $: "String" } as const;
const query = new URLSearchParams(window.location.search);

const uiState: UiState = {
  roomInput: query.get("room") ?? window.localStorage.getItem(ROOM_KEY) ?? "galinheiro-1",
  nameInput: query.get("name") ?? window.localStorage.getItem(NAME_KEY) ?? "",
  chatInput: "",
  followTurn: true,
  watchName: null,
  revealFullMap: false,
  selectedRoomId: null,
  connectSourceRoomId: null,
  dragRoomId: null,
  editorOpen: false,
  toast: "",
};

let game: VibiNet<TransportState, string> | null = null;
let socketState: "idle" | "connecting" | "connected" | "closed" = "idle";
let activeRoom: string | null = null;
let activeName: string | null = null;
let activeSessionId = ensure_session_id();
let syncLoopId: number | null = null;
let heartbeatLoopId: number | null = null;
let returnToLobbyTimerId: number | null = null;
let sharedState: TransportState | null = null;
let lastSync: RoomSync | null = null;
let lastSyncSignature = "";
let editorState: FullGameState | null = null;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Elemento #app nao encontrado.");
}
const root: HTMLDivElement = app;

root.addEventListener("submit", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLFormElement)) {
    return;
  }

  if (target.dataset.form === "join") {
    event.preventDefault();
    join_room();
    return;
  }

  if (target.dataset.form === "chat") {
    event.preventDefault();
    send_chat_message();
  }
});

root.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    return;
  }

  if (target.name === "room") {
    uiState.roomInput = target.value;
  }
  if (target.name === "name") {
    uiState.nameInput = target.value;
  }
  if (target.name === "chat") {
    uiState.chatInput = target.value;
  }
});

root.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const actionEl = target.closest<HTMLElement>("[data-action]");
  if (!actionEl) {
    return;
  }

  const action = actionEl.dataset.action;
  if (!action) {
    return;
  }

  switch (action) {
    case "claim-master":
      if (!lastSync) return;
      post_transport(
        is_self_master()
          ? { $: "unclaim_master", name: lastSync.selfName, sessionId: activeSessionId }
          : { $: "claim_master", name: lastSync.selfName, sessionId: activeSessionId },
      );
      break;
    case "toggle-ready":
      if (!lastSync) return;
      post_transport({ $: "toggle_ready", name: lastSync.selfName, sessionId: activeSessionId });
      break;
    case "copy-link":
      await copy_room_link();
      break;
    case "toggle-follow-turn":
      uiState.followTurn = !uiState.followTurn;
      if (uiState.followTurn) {
        uiState.watchName = lastSync?.publicState?.currentTurnName ?? lastSync?.selfName ?? null;
      }
      render();
      break;
    case "watch-screen":
      uiState.watchName = actionEl.dataset.name ?? lastSync?.selfName ?? null;
      uiState.followTurn = false;
      render();
      break;
    case "reveal-full-map":
      uiState.revealFullMap = true;
      render();
      break;
    case "random-map":
      if (!lastSync) return;
      post_transport({
        $: "set_random_map",
        name: lastSync.selfName,
        sessionId: activeSessionId,
        seed: pick_random_saved_maze_seed(),
      });
      flash(`Mapa aleatorio aplicado. Biblioteca: ${saved_maze_count()} mapas.`);
      break;
    case "shuffle-fox":
      if (!lastSync) return;
      post_transport({
        $: "set_random_fox",
        name: lastSync.selfName,
        sessionId: activeSessionId,
        foxName: pick_random_fox_name(lastSync.players, lastSync.masterName),
      });
      break;
    case "toggle-self-fox":
      if (!lastSync) return;
      post_transport({ $: "toggle_self_fox", name: lastSync.selfName, sessionId: activeSessionId });
      break;
    case "start-game":
      if (!lastSync) return;
      post_transport({ $: "start_game", name: lastSync.selfName, sessionId: activeSessionId, seed: random_seed() });
      break;
    case "back-to-lobby":
      if (!lastSync) return;
      post_transport({ $: "return_to_lobby", name: lastSync.selfName, sessionId: activeSessionId });
      break;
    case "open-editor":
      open_editor();
      break;
    case "close-modal":
      close_editor();
      break;
    case "editor-add-room":
      handle_editor_action({ type: "add_room" });
      break;
    case "editor-default":
      handle_editor_action({ type: "set_default_map" });
      break;
    case "editor-connect":
      uiState.connectSourceRoomId = uiState.selectedRoomId;
      render();
      break;
    case "editor-cycle-type":
      if (!uiState.selectedRoomId) return;
      handle_editor_action({ type: "cycle_room_type", roomId: uiState.selectedRoomId });
      break;
    case "editor-remove-room":
      if (!uiState.selectedRoomId) return;
      {
        const roomId = uiState.selectedRoomId;
        uiState.selectedRoomId = null;
        uiState.connectSourceRoomId = null;
        handle_editor_action({ type: "remove_room", roomId });
      }
      break;
    case "editor-loop":
      if (!uiState.selectedRoomId) return;
      handle_editor_action({ type: "toggle_loop", roomId: uiState.selectedRoomId });
      break;
    case "submit-pass":
      handle_move(null);
      break;
    case "submit-move":
      handle_move(actionEl.dataset.corridorId ?? null);
      break;
    case "kill-target":
      handle_kill(actionEl.dataset.targetName ?? "");
      break;
    default:
      break;
  }
});

window.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

  if (event.key === "Escape") {
    if (uiState.editorOpen) {
      close_editor();
      return;
    }
    if (lastSync) {
      uiState.watchName = lastSync.selfName;
      uiState.followTurn = false;
      render();
    }
    return;
  }

  if (!typing && event.key.toLowerCase() === "m" && lastSync?.phase === "lobby" && is_self_master()) {
    event.preventDefault();
    open_editor();
  }
});

render();

function join_room(): void {
  const room = normalize_room(uiState.roomInput);
  const name = normalize_name(uiState.nameInput);

  if (!room || !name) {
    flash("Informe room e nome.");
    return;
  }

  uiState.roomInput = room;
  uiState.nameInput = name;
  window.localStorage.setItem(ROOM_KEY, room);
  window.localStorage.setItem(NAME_KEY, name);
  activeRoom = room;
  activeName = name;
  activeSessionId = refresh_session_id();

  close_transport();
  lastSync = null;
  lastSyncSignature = "";
  sharedState = null;
  editorState = null;
  clear_return_to_lobby_timer();
  uiState.watchName = null;
  uiState.revealFullMap = false;
  uiState.editorOpen = false;
  uiState.selectedRoomId = null;
  uiState.connectSourceRoomId = null;
  uiState.dragRoomId = null;

  socketState = "connecting";
  const options: {
    room: string;
    initial: TransportState;
    on_tick: (state: TransportState) => TransportState;
    on_post: (post: string, state: TransportState) => TransportState;
    packer: typeof TRANSPORT_PACKER;
    tick_rate: number;
    tolerance: number;
    server?: string;
  } = {
    room,
    initial: create_transport_state(),
    on_tick: tick_transport_state,
    on_post: apply_transport_post,
    packer: TRANSPORT_PACKER,
    tick_rate: 6,
    tolerance: 300,
  };
  const explicitServer = resolve_ws_url();
  if (explicitServer !== OFFICIAL_SERVER_URL) {
    options.server = explicitServer;
  }

  game = new VibiNet.game(options);
  game.on_sync(() => {
    socketState = "connected";
    post_transport({ $: "join_room", name, sessionId: activeSessionId });
    start_transport_loops();
    sync_from_transport();
    render();
  });

  render();
}

function sync_from_transport(): void {
  if (!game || !activeRoom || !activeName) {
    return;
  }

  sharedState = game.compute_render_state();
  lastSync = derive_room_sync(activeRoom, activeName, sharedState);
  on_sync();

  const signature = JSON.stringify(lastSync);
  if (signature !== lastSyncSignature) {
    lastSyncSignature = signature;
    render();
  }
}

function on_sync(): void {
  if (!lastSync) {
    return;
  }

  const self = self_presence();
  if (self && self.seat === "spectator" && lastSync.phase !== "lobby") {
    uiState.revealFullMap = true;
  }
  if (lastSync.phase === "lobby") {
    uiState.revealFullMap = false;
  }

  if (lastSync.phase !== "lobby") {
    if (uiState.followTurn) {
      uiState.watchName = lastSync.publicState?.currentTurnName ?? lastSync.selfName;
    } else if (!uiState.watchName) {
      uiState.watchName = lastSync.selfName;
    }
  } else {
    uiState.watchName = lastSync.selfName;
  }

  if (uiState.editorOpen && lastSync.phase === "lobby" && !uiState.dragRoomId) {
    editorState = clone_state(lastSync.fullState);
  }
  if (lastSync.phase !== "lobby") {
    uiState.editorOpen = false;
    editorState = null;
  }

  if (lastSync.phase === "game_over") {
    schedule_return_to_lobby();
  } else {
    clear_return_to_lobby_timer();
  }
}

function post_transport(post: NetPost): void {
  if (!game) {
    flash("Sem conexao com o VibiNet.");
    return;
  }
  game.post(encode_transport_post(post));
}

function start_transport_loops(): void {
  if (syncLoopId !== null) {
    window.clearInterval(syncLoopId);
  }
  if (heartbeatLoopId !== null) {
    window.clearInterval(heartbeatLoopId);
  }

  syncLoopId = window.setInterval(() => {
    sync_from_transport();
  }, SYNC_INTERVAL_MS);

  heartbeatLoopId = window.setInterval(() => {
    if (!lastSync) {
      return;
    }
    post_transport({
      $: "heartbeat",
      name: lastSync.selfName,
      sessionId: activeSessionId,
    });
  }, HEARTBEAT_INTERVAL_MS);
}

function close_transport(): void {
  if (syncLoopId !== null) {
    window.clearInterval(syncLoopId);
    syncLoopId = null;
  }
  if (heartbeatLoopId !== null) {
    window.clearInterval(heartbeatLoopId);
    heartbeatLoopId = null;
  }
  game?.close();
  game = null;
  socketState = "closed";
  clear_return_to_lobby_timer();
}

function schedule_return_to_lobby(): void {
  if (returnToLobbyTimerId !== null || !lastSync) {
    return;
  }
  returnToLobbyTimerId = window.setTimeout(() => {
    returnToLobbyTimerId = null;
    if (!lastSync || lastSync.phase !== "game_over") {
      return;
    }
    post_transport({
      $: "return_to_lobby",
      name: lastSync.selfName,
      sessionId: activeSessionId,
    });
  }, GAME_OVER_NOTICE_MS);
}

function clear_return_to_lobby_timer(): void {
  if (returnToLobbyTimerId !== null) {
    window.clearTimeout(returnToLobbyTimerId);
    returnToLobbyTimerId = null;
  }
}

function ensure_session_id(): string {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }
  return refresh_session_id();
}

function refresh_session_id(): string {
  const next = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function random_seed(): number {
  return Math.floor(Math.random() * 0xffffffff);
}

function render(): void {
  if (!lastSync) {
    root.innerHTML = render_join_screen();
    return;
  }

  root.innerHTML = `
    <main class="app-shell phase-${lastSync.phase}">
      ${render_left_sidebar()}
      <section class="main-column">
        ${render_turn_banner()}
        ${lastSync.phase === "lobby" ? render_lobby_content() : render_game_content()}
      </section>
      <aside class="right-column">
        ${render_action_panel()}
        ${render_feed_panel()}
      </aside>
      ${render_modal()}
    </main>
  `;

  bind_editor_canvas();
}

function render_join_screen(): string {
  return `
    <main class="join-shell">
      <section class="join-card">
        <p class="eyebrow">Room + Nome</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Entre numa sala, escolha seus papeis no lobby e prepare o labirinto antes da raposa sair cacando.
        </p>
        <form data-form="join" class="join-form">
          <label class="field">
            <span>Room</span>
            <input name="room" value="${escape_html(uiState.roomInput)}" maxlength="36" />
          </label>
          <label class="field">
            <span>Nome</span>
            <input name="name" value="${escape_html(uiState.nameInput)}" maxlength="24" />
          </label>
          <button class="btn btn-primary" type="submit">
            ${socketState === "connecting" ? "Conectando..." : "Entrar"}
          </button>
        </form>
        ${uiState.toast ? `<p class="toast">${escape_html(uiState.toast)}</p>` : ""}
      </section>
    </main>
  `;
}

function render_turn_banner(): string {
  if (!lastSync) return "";
  const sync = lastSync;
  const readyText = sync.lobbyState
    ? `${sync.lobbyState.readyCount}/${sync.lobbyState.connectedParticipantCount} ready`
    : `Rodada ${sync.publicState?.round ?? 0}`;
  const current = sync.publicState?.currentTurnName
    ? sync.players.find((player) => player.name === sync.publicState?.currentTurnName)
    : null;

  return `
    <section class="turn-banner">
      <div>
        <p class="turn-label">FASE</p>
        <strong>${escape_html(phase_label(sync.phase))}</strong>
      </div>
      <div>
        <p class="turn-label">${sync.phase === "lobby" ? "PRONTOS" : "VEZ"}</p>
        <strong style="${current ? `color:${current.color}` : ""}">
          ${escape_html(sync.phase === "lobby" ? readyText : current?.name ?? "Aguardando")}
        </strong>
      </div>
    </section>
  `;
}

function render_left_sidebar(): string {
  if (!lastSync) return "";
  const self = self_presence();
  const activeName = uiState.watchName ?? lastSync.selfName;

  return `
    <aside class="left-sidebar">
      <section class="panel compact-stack">
        <div class="mini-metric">
          <span>Ping</span>
          <strong>${Math.round(game?.ping?.() ?? 0)} ms</strong>
        </div>
        <button class="btn btn-secondary btn-block" data-action="copy-link" type="button">Copiar link</button>
        ${
          lastSync.phase === "lobby"
            ? `
              <button
                class="btn ${self?.ready ? "btn-danger" : "btn-primary"} btn-block"
                data-action="toggle-ready"
                type="button"
                ${self?.seat === "participant" ? "" : "disabled"}
              >
                ${self?.ready ? "Remover ready" : "Ready"}
              </button>
            `
            : `
              <div class="mini-metric">
                <span>Visao</span>
                <strong>${escape_html(activeName)}</strong>
              </div>
            `
        }
      </section>
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Pessoas na sala</h2>
          <span class="tag">${lastSync.players.length}</span>
        </div>
        <ul class="roster">
          ${lastSync.players
            .map((player) => render_roster_item(player, activeName))
            .join("")}
        </ul>
      </section>
    </aside>
  `;
}

function render_roster_item(player: Presence, activeName: string): string {
  const isSelf = player.name === lastSync?.selfName;
  const isActive = player.name === activeName;
  const canWatch = Boolean(lastSync?.phase !== "lobby" && lastSync?.publicState?.screens[player.name]);
  const body = `
    <span class="legend-color" style="background:${player.color}"></span>
    <div class="roster-copy">
      <strong>${escape_html(player.name)}</strong>
      <div class="helper">
        ${escape_html(role_label(player.role))} • ${player.connected ? "online" : "offline"}
      </div>
    </div>
    <span class="tag">${player.ready && lastSync?.phase === "lobby" ? "ready" : player.alive ? "vivo" : player.seat === "spectator" ? "spec" : "fora"}</span>
  `;

  if (!canWatch) {
    return `<li class="roster-item ${isSelf ? "is-self" : ""} ${isActive ? "is-active" : ""}">${body}</li>`;
  }

  return `
    <li>
      <button
        class="roster-item roster-button ${isSelf ? "is-self" : ""} ${isActive ? "is-active" : ""}"
        data-action="watch-screen"
        data-name="${escape_html(player.name)}"
        type="button"
      >
        ${body}
      </button>
    </li>
  `;
}

function render_lobby_content(): string {
  if (!lastSync) return "";
  const showLobbyMapPreview = is_self_master();
  return `
    <section class="lobby-layout">
      <section class="panel stack spacious">
        <div class="panel-header">
          <div>
            <h2 class="section-title">Lobby da sala</h2>
            <p class="helper">
              ${escape_html(lastSync.room)} • ${lastSync.lobbyState?.readyCount ?? 0}/${lastSync.lobbyState?.connectedParticipantCount ?? 0} ready
            </p>
          </div>
          <span class="tag">${escape_html(lastSync.masterName ?? "sem mestre")}</span>
        </div>
        <div class="lobby-summary-grid">
          <div class="metric-card">
            <span>Mestre</span>
            <strong>${escape_html(lastSync.masterName ?? "ninguem")}</strong>
          </div>
          <div class="metric-card">
            <span>Raposa</span>
            <strong>${escape_html(lastSync.fullState.foxName ?? "nao escolhida")}</strong>
          </div>
          <div class="metric-card">
            <span>Participantes</span>
            <strong>${lastSync.lobbyState?.connectedParticipantCount ?? 0}</strong>
          </div>
          <div class="metric-card">
            <span>Inicio</span>
            <strong>${lastSync.lobbyState?.allConnectedReady ? "automatico" : "aguardando"}</strong>
          </div>
        </div>
        <div class="panel-note">
          ${
            is_self_master()
              ? "Voce e o mestre. Use o botao ou aperte M para abrir o editor do mapa."
              : "O mapa fica oculto no lobby para jogadores normais. Aqui voce organiza papeis, ready e conversa antes da partida."
          }
        </div>
        ${
          showLobbyMapPreview
            ? `
              <svg class="editor-map readonly" viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}">
                ${render_maze_svg(lastSync.fullState, false)}
              </svg>
            `
            : `
              <div class="fog-card">
                <div class="fog-copy">
                  <h3>Mapa oculto</h3>
                  <p class="helper">So o mestre enxerga a pre-visualizacao do labirinto no lobby.</p>
                </div>
              </div>
            `
        }
      </section>
    </section>
  `;
}

function render_game_content(): string {
  return `
    <section class="game-layout">
      ${lastSync?.phase === "game_over" ? render_result_panel() : ""}
      <section class="panel spacious">
        ${should_show_full_map() ? render_full_map_panel() : render_room_view_panel()}
      </section>
    </section>
  `;
}

function render_result_panel(): string {
  if (!lastSync || lastSync.phase !== "game_over") {
    return "";
  }

  const winner = lastSync.fullState.winner;
  const winnerLabel = winner === "fox" ? "A raposa venceu" : winner === "hens" ? "As galinhas venceram" : "Partida encerrada";
  const winnerClass = winner === "fox" ? "fox" : winner === "hens" ? "hens" : "neutral";
  const reason = winner === "fox"
    ? "Todas as galinhas foram capturadas."
    : winner === "hens"
      ? `O limite de ${lastSync.fullState.henOrder.length * 10} rodadas foi ultrapassado.`
      : "A partida foi encerrada.";

  return `
    <section class="panel result-panel ${winnerClass}">
      <div class="result-copy">
        <p class="eyebrow">Fim da partida</p>
        <h2 class="result-title">${escape_html(winnerLabel)}</h2>
        <p class="result-text">${escape_html(reason)}</p>
        <p class="helper">Voltando para o lobby da sala em instantes.</p>
      </div>
      <button class="btn btn-primary" data-action="back-to-lobby" type="button">Voltar agora</button>
    </section>
  `;
}

function render_full_map_panel(): string {
  if (!lastSync) {
    return '<div class="empty-panel"><h2>Sem mapa completo</h2></div>';
  }

  return `
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${is_self_master() ? "Mapa completo" : "Visao completa"}</h2>
          <p class="helper">
            ${is_self_master() ? "Como mestre, voce enxerga o labirinto inteiro." : "Voce liberou o mapa completo para assistir."}
          </p>
        </div>
        ${lastSync.phase === "game_over" ? '<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>' : ""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}">
        ${render_maze_svg(lastSync.fullState, false)}
      </svg>
      ${render_full_map_legend()}
    </section>
  `;
}

function render_full_map_legend(): string {
  if (!lastSync) return "";
  return `
    <div class="legend-grid">
      ${lastSync.players
        .map((player) => `
          <div class="legend-chip">
            <span class="legend-color" style="background:${player.color}"></span>
            <strong>${escape_html(player.name)}</strong>
            <span>${escape_html(role_label(player.role))}</span>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function render_room_view_panel(): string {
  if (!lastSync?.publicState) {
    return '<div class="empty-panel"><h2>Aguardando dados da partida</h2></div>';
  }

  const watchedName = uiState.watchName ?? lastSync.selfName;
  const view = lastSync.publicState.screens[watchedName] ?? null;
  const selfFull = lastSync.fullState.players[lastSync.selfName];
  const showSpectatorButton = Boolean(selfFull && !selfFull.alive && selfFull.seat === "participant" && !uiState.revealFullMap);

  if (!view) {
    return `
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${showSpectatorButton ? '<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>' : ""}
        ${lastSync.phase === "game_over" ? '<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>' : ""}
      </div>
    `;
  }

  const controlActorName = action_actor_name();
  const isControlledView = controlActorName === watchedName;
  const canMove = isControlledView && lastSync.publicState.pendingKillTargets.length === 0;
  const canKill = isControlledView && lastSync.publicState.pendingKillTargets.length > 0;

  return `
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Tela de ${escape_html(view.name)}</h2>
          <p class="helper">
            ${escape_html(view.roomType ? `Sala ${room_type_label(view.roomType)}` : "Sem posicao visivel")}
          </p>
        </div>
        <div class="button-row tight">
          ${showSpectatorButton ? '<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>' : ""}
          ${lastSync.phase === "game_over" ? '<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>' : ""}
        </div>
      </div>
      ${render_scene(view, canMove)}
      ${
        canKill
          ? render_kill_picker(lastSync.publicState.pendingKillTargets)
          : `
            <div class="button-row">
              <button class="btn btn-secondary" data-action="submit-pass" type="button" ${canMove ? "" : "disabled"}>Passar</button>
            </div>
          `
      }
    </section>
  `;
}

function render_kill_picker(targets: string[]): string {
  return `
    <div class="kill-picker">
      <strong>Raposa escolhe quem cai:</strong>
      <div class="button-row">
        ${targets
          .map((target) => `
            <button class="btn btn-danger" data-action="kill-target" data-target-name="${escape_html(target)}" type="button">
              ${escape_html(target)}
            </button>
          `)
          .join("")}
      </div>
    </div>
  `;
}

function render_scene(view: LimitedPlayerView, canMove: boolean): string {
  const exits = position_exits(view.exits);
  return `
    <section class="scene-panel">
      <div class="scene-box">
        <div class="room-label">${escape_html(view.roomType ? room_type_label(view.roomType) : "Sem sala")}</div>
        ${exits
          .map((exit) => `
            <button
              class="exit-btn"
              style="left:${exit.left}%;top:${exit.top}%;"
              data-action="submit-move"
              data-corridor-id="${escape_html(exit.corridorId)}"
              type="button"
              ${canMove ? "" : "disabled"}
            >
              <span class="exit-arrow" style="transform:rotate(${exit.angle}deg)">➜</span>
              <small>${exit.angle}°</small>
            </button>
          `)
          .join("")}
        <div class="stickman-row">
          ${view.playersHere
            .map((player) => render_stickman(player.name, player.color))
            .join("")}
        </div>
      </div>
      <div class="scene-meta">
        <p><strong>Jogadores na sala:</strong> ${view.playersHere.length || 0}</p>
        <p><strong>Saidas:</strong> ${view.exits.map((exit) => `${exit.angle}°`).join(", ") || "nenhuma"}</p>
      </div>
    </section>
  `;
}

function render_action_panel(): string {
  if (!lastSync) return "";
  const self = self_presence();
  const foxButtonLabel = self?.role === "fox" ? "Deixar de ser raposa" : "Ser raposa";

  if (lastSync.phase === "lobby") {
    return `
      <section class="panel stack">
        <div class="panel-header">
          <h2 class="section-title">Acoes do lobby</h2>
          <span class="tag">${lastSync.lobbyState?.allConnectedReady ? "auto start" : "manual"}</span>
        </div>
        <div class="action-stack">
          <button class="btn ${is_self_master() ? "btn-danger" : "btn-primary"} btn-block" data-action="claim-master" type="button">
            ${is_self_master() ? "Deixar de ser mestre" : "Virar mestre"}
          </button>
          <button class="btn btn-secondary btn-block" data-action="random-map" type="button" ${self?.seat === "participant" ? "" : "disabled"}>
            Mapa aleatorio
          </button>
          <button class="btn btn-secondary btn-block" data-action="shuffle-fox" type="button" ${self?.seat === "participant" ? "" : "disabled"}>
            Sortear raposa
          </button>
          <button class="btn btn-secondary btn-block" data-action="toggle-self-fox" type="button" ${self?.seat === "participant" && !is_self_master() ? "" : "disabled"}>
            ${foxButtonLabel}
          </button>
          <div class="action-split">
            <button class="btn btn-secondary btn-block" data-action="open-editor" type="button" ${is_self_master() ? "" : "disabled"}>
              Abrir editor
            </button>
            <button class="btn btn-primary btn-block" data-action="start-game" type="button" ${is_self_master() ? "" : "disabled"}>
              Play
            </button>
          </div>
        </div>
      </section>
    `;
  }

  return `
    <section class="panel stack">
      <div class="panel-header">
        <h2 class="section-title">Partida</h2>
        <span class="tag">${lastSync.publicState?.round ?? 0}</span>
      </div>
      <p class="metric"><strong>Na tela:</strong> ${escape_html(uiState.watchName ?? lastSync.selfName)}</p>
      <p class="metric"><strong>Turno:</strong> ${escape_html(lastSync.publicState?.currentTurnName ?? "Aguardando")}</p>
      <div class="action-stack">
        <button class="btn btn-secondary btn-block" data-action="toggle-follow-turn" type="button">
          ${uiState.followTurn ? "Parar de acompanhar a vez" : "Acompanhar a vez"}
        </button>
        <button
          class="btn btn-secondary btn-block"
          data-action="reveal-full-map"
          type="button"
          ${can_reveal_full_map() ? "" : "disabled"}
        >
          Ficar de espectador
        </button>
        ${
          lastSync.phase === "game_over"
            ? '<button class="btn btn-primary btn-block" data-action="back-to-lobby" type="button">Voltar ao lobby</button>'
            : ""
        }
      </div>
      ${uiState.toast ? `<p class="toast">${escape_html(uiState.toast)}</p>` : ""}
    </section>
  `;
}

function render_feed_panel(): string {
  if (!lastSync) return "";
  return `
    <section class="panel stack feed-panel">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Chat e log</h2>
          <p class="helper">Mensagens digitadas e avisos do sistema ficam juntos, com estilos diferentes.</p>
        </div>
      </div>
      <div class="feed-list">
        ${
          lastSync.feed.length > 0
            ? lastSync.feed.map((entry) => render_feed_entry(entry)).join("")
            : '<div class="empty-panel feed-empty">Sem mensagens ainda.</div>'
        }
      </div>
      <form data-form="chat" class="chat-form">
        <textarea
          name="chat"
          rows="3"
          maxlength="280"
          placeholder="Digite algo para a sala..."
        >${escape_html(uiState.chatInput)}</textarea>
        <button class="btn btn-primary btn-block" type="submit">Enviar</button>
      </form>
    </section>
  `;
}

function render_feed_entry(entry: FeedEntry): string {
  const isSelf = entry.kind === "chat" && entry.actorName && entry.actorName === lastSync?.selfName;
  if (entry.kind === "system") {
    return `
      <article class="feed-entry system">
        <p class="feed-line"><strong>sistema</strong> - ${escape_html(entry.text)}</p>
      </article>
    `;
  }

  return `
    <article class="feed-entry chat ${isSelf ? "is-self" : ""}">
      <p class="feed-line"><strong>${escape_html(entry.actorName ?? "anon")}</strong> - ${escape_html(entry.text)}</p>
    </article>
  `;
}

function render_modal(): string {
  if (!uiState.editorOpen || !editorState || !lastSync || !is_self_master()) {
    return "";
  }

  const selectedRoom = uiState.selectedRoomId ? editorState.rooms[uiState.selectedRoomId] : null;

  return `
    <div class="modal-backdrop">
      <section class="modal-card modal-wide">
        <div class="panel-header">
          <div>
            <h2 class="section-title">Editor do mestre</h2>
            <p class="helper">Use o mouse para arrastar salas e conectar corredores.</p>
          </div>
          <button class="btn btn-secondary" data-action="close-modal" type="button">Fechar</button>
        </div>
        <div class="button-row">
          <button class="btn btn-secondary" data-action="editor-add-room" type="button">Nova sala</button>
          <button class="btn btn-secondary" data-action="editor-default" type="button">Mapa 3x3</button>
        </div>
        <svg class="editor-map" data-editor-svg viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}">
          ${render_maze_svg(editorState, true)}
        </svg>
        <div class="editor-toolbar">
          <div class="metric-block">
            <strong>Sala selecionada</strong>
            <span>${escape_html(selectedRoom?.id ?? "nenhuma")}</span>
          </div>
          <div class="metric-block">
            <strong>Tipo</strong>
            <span>${escape_html(selectedRoom?.type ?? "-")}</span>
          </div>
          <div class="button-row">
            <button class="btn btn-secondary" data-action="editor-connect" type="button" ${selectedRoom ? "" : "disabled"}>
              ${uiState.connectSourceRoomId ? "Clique em outra sala" : "Conectar"}
            </button>
            <button class="btn btn-secondary" data-action="editor-cycle-type" type="button" ${selectedRoom ? "" : "disabled"}>
              Alternar tipo
            </button>
            <button class="btn btn-secondary" data-action="editor-loop" type="button" ${selectedRoom ? "" : "disabled"}>
              Loop
            </button>
            <button class="btn btn-danger" data-action="editor-remove-room" type="button" ${selectedRoom ? "" : "disabled"}>
              Remover
            </button>
          </div>
        </div>
      </section>
    </div>
  `;
}

function render_maze_svg(state: FullGameState, editable: boolean): string {
  const playersByRoom = new Map<string, Array<{ name: string; color: string }>>();
  for (const player of Object.values(state.players)) {
    if (!player.locationRoomId) continue;
    if (!playersByRoom.has(player.locationRoomId)) {
      playersByRoom.set(player.locationRoomId, []);
    }
    playersByRoom.get(player.locationRoomId)?.push({
      name: player.name,
      color: player.color,
    });
  }

  return `
    ${Object.values(state.corridors)
      .map((corridor) => {
        const fromRoom = state.rooms[corridor.fromRoomId];
        const toRoom = state.rooms[corridor.toRoomId];
        if (!fromRoom || !toRoom) return "";
        if (fromRoom.id === toRoom.id) {
          return `
            <path
              class="corridor-loop"
              d="M ${fromRoom.x} ${fromRoom.y - 44} C ${fromRoom.x + 48} ${fromRoom.y - 120}, ${fromRoom.x - 48} ${fromRoom.y - 120}, ${fromRoom.x} ${fromRoom.y - 44}"
            />
          `;
        }
        return `
          <line
            class="corridor-line"
            x1="${fromRoom.x}"
            y1="${fromRoom.y}"
            x2="${toRoom.x}"
            y2="${toRoom.y}"
          />
        `;
      })
      .join("")}
    ${Object.values(state.rooms)
      .map((room) => {
        const selected = editable && uiState.selectedRoomId === room.id;
        const connectArmed = editable && uiState.connectSourceRoomId === room.id;
        const tokens = playersByRoom.get(room.id) ?? [];
        return `
          <g
            ${editable ? `data-room-node="${escape_html(room.id)}"` : ""}
            class="room-node ${selected ? "selected" : ""} ${connectArmed ? "armed" : ""}"
            transform="translate(${room.x}, ${room.y})"
          >
            <rect x="-54" y="-36" width="108" height="72" rx="22" class="room-shape ${room.type}" />
            <text class="room-title" text-anchor="middle" y="4">${escape_html(room.id)}</text>
            <text class="room-type" text-anchor="middle" y="24">${escape_html(room_type_label(room.type))}</text>
            ${tokens
              .map((token, index) => `
                <circle cx="${-18 + index * 18}" cy="-12" r="6" fill="${token.color}" />
              `)
              .join("")}
          </g>
        `;
      })
      .join("")}
  `;
}

function render_stickman(name: string, color: string): string {
  return `
    <div class="stickman">
      <svg viewBox="0 0 64 84" class="stickman-svg" aria-hidden="true">
        <circle cx="32" cy="14" r="10" fill="${color}" />
        <line x1="32" y1="24" x2="32" y2="52" stroke="${color}" stroke-width="6" stroke-linecap="round" />
        <line x1="16" y1="36" x2="48" y2="36" stroke="${color}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="18" y2="74" stroke="${color}" stroke-width="6" stroke-linecap="round" />
        <line x1="32" y1="52" x2="46" y2="74" stroke="${color}" stroke-width="6" stroke-linecap="round" />
      </svg>
      <span>${escape_html(name)}</span>
    </div>
  `;
}

function bind_editor_canvas(): void {
  const svg = root.querySelector<SVGSVGElement>("[data-editor-svg]");
  if (!svg || !uiState.editorOpen || !editorState || !lastSync || lastSync.phase !== "lobby" || !is_self_master()) {
    return;
  }

  const toPoint = (event: PointerEvent): { x: number; y: number } => {
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEWBOX_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * VIEWBOX_HEIGHT;
    return {
      x: Math.max(60, Math.min(VIEWBOX_WIDTH - 60, x)),
      y: Math.max(60, Math.min(VIEWBOX_HEIGHT - 60, y)),
    };
  };

  svg.onpointerdown = (event) => {
    const target = event.target;
    if (!(target instanceof SVGElement)) {
      return;
    }
    const group = target.closest<SVGGElement>("[data-room-node]");
    const roomId = group?.dataset.roomNode;
    if (!roomId) {
      return;
    }

    if (uiState.connectSourceRoomId && uiState.connectSourceRoomId !== roomId) {
      const sourceRoomId = uiState.connectSourceRoomId;
      uiState.connectSourceRoomId = null;
      handle_editor_action({
        type: "toggle_corridor",
        leftRoomId: sourceRoomId,
        rightRoomId: roomId,
      });
      return;
    }

    if (uiState.connectSourceRoomId === roomId) {
      uiState.connectSourceRoomId = null;
      render();
      return;
    }

    uiState.selectedRoomId = roomId;
    uiState.dragRoomId = roomId;
    render();
    svg.setPointerCapture(event.pointerId);
  };

  svg.onpointermove = (event) => {
    if (!uiState.dragRoomId || uiState.connectSourceRoomId || !editorState) {
      return;
    }
    const point = toPoint(event);
    editorState = apply_map_edit(editorState, {
      type: "move_room",
      roomId: uiState.dragRoomId,
      x: point.x,
      y: point.y,
    });
    render();
  };

  svg.onpointerup = () => {
    if (!uiState.dragRoomId || !editorState) {
      return;
    }
    const room = editorState.rooms[uiState.dragRoomId];
    const roomId = uiState.dragRoomId;
    uiState.dragRoomId = null;
    if (room) {
      handle_editor_action({
        type: "move_room",
        roomId,
        x: room.x,
        y: room.y,
      });
    } else {
      render();
    }
  };
}

function open_editor(): void {
  if (!lastSync || lastSync.phase !== "lobby" || !is_self_master()) {
    return;
  }
  uiState.editorOpen = true;
  uiState.selectedRoomId = null;
  uiState.connectSourceRoomId = null;
  editorState = clone_state(lastSync.fullState);
  render();
}

function close_editor(): void {
  uiState.editorOpen = false;
  uiState.dragRoomId = null;
  uiState.selectedRoomId = null;
  uiState.connectSourceRoomId = null;
  editorState = null;
  render();
}

function handle_editor_action(action: MapEditAction, rerender = true): void {
  if (!lastSync || lastSync.phase !== "lobby" || !is_self_master() || !editorState) {
    return;
  }
  editorState = apply_map_edit(editorState, action);
  post_transport({
    $: "map_edit",
    name: lastSync.selfName,
    sessionId: activeSessionId,
    action,
  });
  if (rerender) {
    render();
  }
}

function send_chat_message(): void {
  if (!lastSync) {
    return;
  }
  const text = uiState.chatInput.trim();
  if (!text) {
    return;
  }
  post_transport({
    $: "lobby_chat_message",
    name: lastSync.selfName,
    sessionId: activeSessionId,
    text,
  });
  uiState.chatInput = "";
  render();
}

function handle_move(corridorId: string | null): void {
  if (!lastSync) {
    return;
  }
  const actorName = action_actor_name();
  if (!actorName) {
    return;
  }

  post_transport({
    $: "submit_move",
    name: lastSync.selfName,
    sessionId: activeSessionId,
    actorName,
    corridorId,
  });
}

function handle_kill(targetName: string): void {
  if (!lastSync || !targetName) {
    return;
  }
  const actorName = action_actor_name();
  if (!actorName) {
    return;
  }

  post_transport({
    $: "select_kill_target",
    name: lastSync.selfName,
    sessionId: activeSessionId,
    actorName,
    targetName,
  });
}

function action_actor_name(): string | null {
  if (!lastSync?.publicState?.currentTurnName) {
    return null;
  }
  if (can_self_act()) {
    return lastSync.selfName;
  }
  if (is_self_master()) {
    return lastSync.publicState.currentTurnName;
  }
  return null;
}

function can_self_act(): boolean {
  if (!lastSync?.publicState?.currentTurnName) {
    return false;
  }
  return lastSync.publicState.currentTurnName === lastSync.selfName;
}

function should_show_full_map(): boolean {
  if (!lastSync) return false;
  if (is_self_master()) return true;
  const self = lastSync.fullState.players[lastSync.selfName];
  const presence = self_presence();
  if (presence?.seat === "spectator" && lastSync.phase !== "lobby") {
    return true;
  }
  return Boolean(self && !self.alive && uiState.revealFullMap);
}

function can_reveal_full_map(): boolean {
  if (!lastSync) return false;
  const self = lastSync.fullState.players[lastSync.selfName];
  return Boolean(self && !self.alive && self.seat === "participant" && !uiState.revealFullMap);
}

function self_presence(): Presence | null {
  return lastSync?.players.find((player) => player.name === lastSync?.selfName) ?? null;
}

function is_self_master(): boolean {
  return Boolean(lastSync && lastSync.masterName === lastSync.selfName);
}

function role_label(role: string): string {
  switch (role) {
    case "master":
      return "mestre";
    case "fox":
      return "raposa";
    case "hen":
      return "galinha";
    case "spectator":
      return "espectador";
    default:
      return "galinha";
  }
}

function phase_label(phase: string): string {
  switch (phase) {
    case "lobby":
      return "lobby";
    case "running":
      return "partida";
    case "game_over":
      return "fim da partida";
    default:
      return phase;
  }
}

function room_type_label(roomType: string): string {
  return roomType === "shop" ? "loja" : "normal";
}

function position_exits(exits: LimitedPlayerView["exits"]): Array<{
  corridorId: string;
  angle: number;
  left: number;
  top: number;
}> {
  const sorted = [...exits].sort((left, right) => left.angle - right.angle);
  let previousAngle = -999;
  let ring = 0;
  return sorted.map((exit) => {
    if (Math.abs(exit.angle - previousAngle) < 18) {
      ring += 1;
    } else {
      ring = 0;
    }
    previousAngle = exit.angle;
    const radians = (exit.angle * Math.PI) / 180;
    const radiusX = 40 + ring * 9;
    const radiusY = 28 + ring * 7;
    const left = 50 + Math.cos(radians) * radiusX;
    const top = 50 + Math.sin(radians) * radiusY;
    return {
      corridorId: exit.corridorId,
      angle: exit.angle,
      left,
      top,
    };
  });
}

function resolve_ws_url(): string {
  const explicit = query.get("server") ?? import.meta.env.VITE_MAZE_SERVER;
  if (explicit) {
    return explicit;
  }
  return OFFICIAL_SERVER_URL;
}

async function copy_room_link(): Promise<void> {
  if (!lastSync) return;
  const url = new URL(window.location.href);
  url.searchParams.set("room", lastSync.room);
  const text = url.toString();
  try {
    await navigator.clipboard.writeText(text);
    flash("Link da room copiado.");
  } catch {
    flash(text);
  }
}

function flash(message: string): void {
  uiState.toast = message;
  render();
  window.clearTimeout((flash as unknown as { timer?: number }).timer);
  (flash as unknown as { timer?: number }).timer = window.setTimeout(() => {
    uiState.toast = "";
    render();
  }, 2600);
}

function escape_html(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
