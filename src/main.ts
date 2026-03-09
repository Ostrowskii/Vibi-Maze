import "./style.css";
import {
  add_room,
  add_self_loop,
  apply_kill_choice,
  apply_move,
  build_public_state,
  choose_fox,
  choose_random_fox,
  clone_state,
  create_default_maze,
  create_empty_state,
  cycle_room_type,
  move_room,
  normalize_name,
  normalize_room,
  remove_room,
  reset_to_lobby,
  start_game,
  sync_state_players,
  toggle_corridor,
} from "./game";
import type {
  ClientToServerMessage,
  FullGameState,
  LimitedPlayerView,
  MazeRoom,
  Presence,
  PublicState,
  RoomSync,
  ServerToClientMessage,
} from "./protocol";

type UiState = {
  roomInput: string;
  nameInput: string;
  followTurn: boolean;
  watchName: string | null;
  sideRailOpen: boolean;
  revealFullMap: boolean;
  selectedRoomId: string | null;
  connectSourceRoomId: string | null;
  dragRoomId: string | null;
  toast: string;
};

const NAME_KEY = "vibi-maze-name";
const ROOM_KEY = "vibi-maze-room";
const VIEWBOX_WIDTH = 900;
const VIEWBOX_HEIGHT = 660;
const query = new URLSearchParams(window.location.search);

const uiState: UiState = {
  roomInput: query.get("room") ?? window.localStorage.getItem(ROOM_KEY) ?? "galinheiro-1",
  nameInput: query.get("name") ?? window.localStorage.getItem(NAME_KEY) ?? "",
  followTurn: true,
  watchName: null,
  sideRailOpen: true,
  revealFullMap: false,
  selectedRoomId: null,
  connectSourceRoomId: null,
  dragRoomId: null,
  toast: "",
};

let socket: WebSocket | null = null;
let socketState: "idle" | "connecting" | "connected" | "closed" = "idle";
let lastSync: RoomSync | null = null;
let masterState: FullGameState | null = null;
let lastPublishedSignature = "";
let lastServerFullSignature = "";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("Elemento #app não encontrado.");
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
  }
});

root.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.name === "room") {
    uiState.roomInput = target.value;
  }
  if (target.name === "name") {
    uiState.nameInput = target.value;
  }
});

root.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target instanceof HTMLSelectElement && target.dataset.action === "fox-select") {
    if (!masterState) {
      return;
    }
    masterState = choose_fox(masterState, target.value);
    publish_master_state();
    render();
  }

  if (target instanceof HTMLInputElement && target.dataset.action === "follow-toggle") {
    uiState.followTurn = target.checked;
    if (uiState.followTurn) {
      uiState.watchName = lastSync?.publicState?.currentTurnName ?? lastSync?.selfName ?? null;
    }
    render();
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
      send({ type: "claim_master" });
      break;
    case "copy-link":
      await copy_room_link();
      break;
    case "toggle-rail":
      uiState.sideRailOpen = !uiState.sideRailOpen;
      render();
      break;
    case "watch-screen":
      uiState.watchName = actionEl.dataset.name ?? lastSync?.selfName ?? null;
      uiState.followTurn = false;
      render();
      break;
    case "self-screen":
      uiState.watchName = lastSync?.selfName ?? null;
      uiState.followTurn = false;
      render();
      break;
    case "reveal-full-map":
      uiState.revealFullMap = true;
      render();
      break;
    case "vote-swap-master":
      send({ type: "vote_swap_master" });
      break;
    case "become-master":
      send({ type: "become_master" });
      break;
    case "abandon-match":
      send({ type: "abandon_match" });
      break;
    case "editor-add-room":
      if (!masterState) return;
      masterState = add_room(masterState);
      publish_master_state();
      render();
      break;
    case "editor-default":
      if (!masterState) return;
      {
        const maze = create_default_maze();
        masterState = {
          ...masterState,
          rooms: maze.rooms,
          corridors: maze.corridors,
        };
      }
      publish_master_state();
      render();
      break;
    case "editor-connect":
      uiState.connectSourceRoomId = uiState.selectedRoomId;
      render();
      break;
    case "editor-cycle-type":
      if (!masterState || !uiState.selectedRoomId) return;
      masterState = cycle_room_type(masterState, uiState.selectedRoomId);
      publish_master_state();
      render();
      break;
    case "editor-remove-room":
      if (!masterState || !uiState.selectedRoomId) return;
      masterState = remove_room(masterState, uiState.selectedRoomId);
      uiState.selectedRoomId = null;
      uiState.connectSourceRoomId = null;
      publish_master_state();
      render();
      break;
    case "editor-loop":
      if (!masterState || !uiState.selectedRoomId) return;
      masterState = add_self_loop(masterState, uiState.selectedRoomId);
      publish_master_state();
      render();
      break;
    case "shuffle-fox":
      if (!masterState) return;
      masterState = choose_random_fox(masterState);
      publish_master_state();
      render();
      break;
    case "start-game":
      if (!masterState || !lastSync) return;
      {
        const next = start_game(masterState, lastSync.players);
        if (!next) {
          flash("Precisa de pelo menos 2 jogadores ativos além do mestre para iniciar.");
          return;
        }
        masterState = next;
        uiState.revealFullMap = false;
      }
      publish_master_state();
      render();
      break;
    case "back-to-lobby":
      if (!masterState || !lastSync) return;
      masterState = reset_to_lobby(masterState, lastSync.players);
      uiState.revealFullMap = false;
      publish_master_state();
      render();
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
  if (event.key === "Escape" && lastSync) {
    uiState.watchName = lastSync.selfName;
    uiState.followTurn = false;
    render();
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

  if (socket) {
    socket.close();
  }

  socketState = "connecting";
  const wsUrl = resolve_ws_url();
  socket = new WebSocket(wsUrl);

  socket.addEventListener("open", () => {
    socketState = "connected";
    send({ type: "join_room", room, name });
    render();
  });

  socket.addEventListener("close", () => {
    socketState = "closed";
    render();
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(String(event.data)) as ServerToClientMessage;
    handle_server_message(message);
  });

  render();
}

function handle_server_message(message: ServerToClientMessage): void {
  switch (message.type) {
    case "sync":
      lastSync = message.payload;
      on_sync();
      render();
      break;
    case "action_request":
      if (!is_self_master() || !masterState) {
        return;
      }
      if (message.action.type === "move") {
        masterState = apply_move(masterState, message.action.actorName, message.action.corridorId);
      } else {
        masterState = apply_kill_choice(masterState, message.action.actorName, message.action.targetName);
      }
      publish_master_state();
      render();
      break;
    case "force_logout":
      flash(message.reason);
      socket?.close();
      break;
    case "error":
      flash(message.message);
      break;
  }
}

function on_sync(): void {
  if (!lastSync) {
    return;
  }

  if (lastSync.fullState) {
    const fullSignature = JSON.stringify(lastSync.fullState);
    lastServerFullSignature = fullSignature;
    if (!masterState || !is_self_master()) {
      masterState = clone_state(lastSync.fullState);
    }
  }

  if (is_self_master()) {
    const base = masterState ?? lastSync.fullState ?? create_empty_state(lastSync.room, lastSync.players, lastSync.masterName);
    const withRoster = sync_state_players(base, lastSync.players, lastSync.masterName);
    masterState = withRoster;
    publish_master_state();
  }

  const self = self_presence();
  if (self && self.seat === "spectator" && lastSync.phase !== "lobby") {
    uiState.revealFullMap = true;
  }

  if (uiState.followTurn) {
    uiState.watchName = lastSync.publicState?.currentTurnName ?? lastSync.selfName;
  } else if (!uiState.watchName) {
    uiState.watchName = lastSync.selfName;
  }
}

function publish_master_state(): void {
  if (!lastSync || !masterState || !is_self_master()) {
    return;
  }
  const publicState = build_public_state(masterState, lastSync.players);
  const fullState = clone_state(masterState);
  const signature = JSON.stringify({ fullState, publicState });
  if (signature === lastPublishedSignature) {
    return;
  }
  lastPublishedSignature = signature;
  send({
    type: "publish_state",
    fullState,
    publicState,
  });
}

function handle_move(corridorId: string | null): void {
  if (!lastSync) {
    return;
  }
  const actorName = action_actor_name();
  if (!actorName) {
    return;
  }

  if (is_self_master()) {
    if (!masterState) return;
    masterState = apply_move(masterState, actorName, corridorId);
    publish_master_state();
    render();
    return;
  }

  send({ type: "submit_move", corridorId });
}

function handle_kill(targetName: string): void {
  if (!lastSync || !targetName) {
    return;
  }
  const actorName = action_actor_name();
  if (!actorName) {
    return;
  }

  if (is_self_master()) {
    if (!masterState) return;
    masterState = apply_kill_choice(masterState, actorName, targetName);
    publish_master_state();
    render();
    return;
  }

  send({ type: "select_kill_target", targetName });
}

function action_actor_name(): string | null {
  if (!lastSync?.publicState?.currentTurnName) {
    return null;
  }
  if (can_self_act()) {
    return lastSync.selfName;
  }
  if (can_master_override()) {
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

function can_master_override(): boolean {
  if (!is_self_master() || !lastSync?.publicState?.currentTurnName) {
    return false;
  }
  const sync = lastSync;
  const actor = sync.players.find((player) => player.name === sync.publicState?.currentTurnName);
  return actor?.connected === false;
}

function send(message: ClientToServerMessage): void {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    flash("Sem conexão com o relay.");
    return;
  }
  socket.send(JSON.stringify(message));
}

function render(): void {
  if (!lastSync) {
    root.innerHTML = render_join_screen();
    return;
  }

  root.innerHTML = `
    <main class="app-shell">
      ${render_side_rail()}
      <section class="main-column">
        ${render_header()}
        ${render_turn_banner()}
        ${render_phase_content()}
      </section>
      <aside class="right-column">
        ${render_roster_panel()}
        ${render_controls_panel()}
        ${render_connection_panel()}
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
          Entre em uma sala, escolha um mestre e monte o labirinto antes da raposa sair caçando.
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
        <p class="helper">
          Relay padrão: <code>${escape_html(resolve_ws_url())}</code>
        </p>
        ${uiState.toast ? `<p class="toast">${escape_html(uiState.toast)}</p>` : ""}
      </section>
    </main>
  `;
}

function render_header(): string {
  if (!lastSync) return "";
  const self = self_presence();
  const role = self?.role ?? "player";

  return `
    <header class="header-card">
      <div>
        <p class="eyebrow">Host Authoritative</p>
        <h1 class="title">Vibi-Maze</h1>
        <p class="subtitle">
          Room <code>${escape_html(lastSync.room)}</code> • voce é
          <strong>${escape_html(role_label(role))}</strong>
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" data-action="copy-link" type="button">Copiar link</button>
        ${lastSync.canClaimMaster ? '<button class="btn btn-primary" data-action="claim-master" type="button">Virar mestre</button>' : ""}
      </div>
    </header>
  `;
}

function render_turn_banner(): string {
  if (!lastSync) return "";
  const sync = lastSync;
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
        <p class="turn-label">VEZ</p>
        <strong style="${current ? `color:${current.color}` : ""}">
          ${escape_html(current?.name ?? "Aguardando")}
        </strong>
      </div>
      <label class="follow-toggle">
        <input data-action="follow-toggle" type="checkbox" ${uiState.followTurn ? "checked" : ""} />
        acompanhar a vez automaticamente
      </label>
    </section>
  `;
}

function render_phase_content(): string {
  if (!lastSync) return "";
  if (lastSync.phase === "lobby") {
    return `
      <section class="phase-grid">
        <div class="panel spacious">
          ${is_self_master() ? render_master_editor() : render_waiting_lobby()}
        </div>
        <div class="panel">
          ${render_lobby_controls()}
        </div>
      </section>
    `;
  }

  const showFull = should_show_full_map();
  return `
    <section class="phase-grid running">
      <div class="panel spacious">
        ${showFull ? render_full_map_panel() : render_room_view_panel()}
      </div>
      <div class="panel">
        ${render_runtime_info()}
      </div>
    </section>
  `;
}

function render_waiting_lobby(): string {
  return `
    <div class="empty-panel">
      <h2>Aguardando mestre</h2>
      <p>
        Quando alguem assumir o papel de mestre, essa pessoa vai editar o labirinto e escolher
        quem sera a raposa.
      </p>
    </div>
  `;
}

function render_lobby_controls(): string {
  if (!lastSync) return "";
  const candidateNames = lastSync.players
    .filter((player) => !player.isMaster && player.seat === "participant")
    .sort((left, right) => left.joinedAt - right.joinedAt)
    .map((player) => `<option value="${escape_html(player.name)}">${escape_html(player.name)}</option>`)
    .join("");

  return `
    <section class="stack">
      <h2 class="section-title">Sala</h2>
      <p class="metric"><strong>Jogadores ativos:</strong> ${lastSync.players.filter((player) => player.seat === "participant").length}</p>
      <p class="metric"><strong>Mestre:</strong> ${escape_html(lastSync.masterName ?? "ninguem")}</p>
      ${
        is_self_master()
          ? `
            <label class="field">
              <span>Raposa</span>
              <select data-action="fox-select">
                <option value="">Escolher depois</option>
                ${candidateNames}
              </select>
            </label>
            <div class="button-row">
              <button class="btn btn-secondary" data-action="shuffle-fox" type="button">Sortear raposa</button>
              <button class="btn btn-primary" data-action="start-game" type="button">Play</button>
            </div>
          `
          : `
            <p class="helper">Voce continua esperando no lobby enquanto o mestre desenha o mapa.</p>
          `
      }
    </section>
  `;
}

function render_master_editor(): string {
  if (!masterState || !lastSync) return "";
  const selectedRoom = uiState.selectedRoomId ? masterState.rooms[uiState.selectedRoomId] : null;
  return `
    <section class="editor-shell">
      <div class="panel-header">
        <div>
          <h2 class="section-title">Editor do mestre</h2>
          <p class="helper">Arraste salas, conecte pares e monte o labirinto antes do inicio.</p>
        </div>
        <div class="button-row tight">
          <button class="btn btn-secondary" data-action="editor-add-room" type="button">Nova sala</button>
          <button class="btn btn-secondary" data-action="editor-default" type="button">Mapa 3x3</button>
        </div>
      </div>
      <svg class="editor-map" data-editor-svg viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}">
        ${render_maze_svg(masterState, true)}
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
  `;
}

function render_full_map_panel(): string {
  if (!masterState) {
    return '<div class="empty-panel"><h2>Sem mapa completo</h2></div>';
  }

  const canReturnToLobby = is_self_master();
  return `
    <section class="stack">
      <div class="panel-header">
        <div>
          <h2 class="section-title">${is_self_master() ? "Mapa mestre" : "Visao completa"}</h2>
          <p class="helper">
            ${is_self_master() ? "Voce enxerga tudo o tempo todo." : "Agora voce pode assistir a partida inteira."}
          </p>
        </div>
        ${canReturnToLobby ? '<button class="btn btn-secondary" data-action="back-to-lobby" type="button">Voltar ao lobby</button>' : ""}
      </div>
      <svg class="editor-map readonly" viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}">
        ${render_maze_svg(masterState, false)}
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
  const selfFull = lastSync.fullState?.players[lastSync.selfName];
  const showSpectatorButton = Boolean(selfFull && !selfFull.alive && selfFull.seat === "participant" && !uiState.revealFullMap);

  if (!view) {
    return `
      <div class="empty-panel">
        <h2>Sem tela para acompanhar</h2>
        ${showSpectatorButton ? '<button class="btn btn-primary" data-action="reveal-full-map" type="button">Ficar de espectador</button>' : ""}
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
        ${showSpectatorButton ? '<button class="btn btn-secondary" data-action="reveal-full-map" type="button">Ficar de espectador</button>' : ""}
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
          .map((exit, index) => `
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

function render_runtime_info(): string {
  if (!lastSync) return "";
  const watchedName = uiState.watchName ?? lastSync.selfName;
  const current = lastSync.publicState?.currentTurnName ?? "Aguardando";
  const self = self_presence();
  const canOverride = can_master_override();

  return `
    <section class="stack">
      <h2 class="section-title">Partida</h2>
      <p class="metric"><strong>Rodada:</strong> ${lastSync.publicState?.round ?? 0}</p>
      <p class="metric"><strong>Na tela:</strong> ${escape_html(watchedName)}</p>
      <p class="metric"><strong>Turno atual:</strong> ${escape_html(current)}</p>
      <p class="metric"><strong>Status:</strong> ${escape_html(phase_label(lastSync.phase))}</p>
      ${
        canOverride
          ? `<p class="notice">Jogador atual caiu. O mestre pode agir por <strong>${escape_html(current)}</strong>.</p>`
          : ""
      }
      ${
        self && self.role === "spectator"
          ? `<p class="helper">Voce entrou depois do inicio e esta vendo a partida como espectador total.</p>`
          : ""
      }
      ${
        uiState.toast
          ? `<p class="toast">${escape_html(uiState.toast)}</p>`
          : ""
      }
    </section>
  `;
}

function render_roster_panel(): string {
  if (!lastSync) return "";
  const sync = lastSync;
  return `
    <section class="panel stack">
      <h2 class="section-title">Jogadores</h2>
      <ul class="roster">
        ${sync.players
          .map((player) => {
            const isSelf = player.name === sync.selfName;
            return `
              <li class="roster-item ${isSelf ? "is-self" : ""}">
                <span class="legend-color" style="background:${player.color}"></span>
                <div>
                  <strong>${escape_html(player.name)}</strong>
                  <div class="helper">${escape_html(role_label(player.role))} • ${player.connected ? "online" : "offline"}</div>
                </div>
                <span class="tag">${player.alive ? "vivo" : player.seat === "spectator" ? "spec" : "fora"}</span>
              </li>
            `;
          })
          .join("")}
      </ul>
    </section>
  `;
}

function render_controls_panel(): string {
  if (!lastSync) return "";
  return `
    <section class="panel stack">
      <h2 class="section-title">Visoes</h2>
      <p class="helper">A barra da esquerda mostra as telas limitadas de cada jogador ativo.</p>
      <div class="button-row">
        <button class="btn btn-secondary" data-action="toggle-rail" type="button">
          ${uiState.sideRailOpen ? "Fechar telas" : "Abrir telas"}
        </button>
        <button class="btn btn-secondary" data-action="self-screen" type="button">
          Voltar para minha tela
        </button>
      </div>
      <p class="helper">Pressione <code>Esc</code> para voltar imediatamente para a propria tela.</p>
    </section>
  `;
}

function render_connection_panel(): string {
  if (!lastSync) return "";
  return `
    <section class="panel stack">
      <h2 class="section-title">Conexao</h2>
      <p class="metric"><strong>Relay:</strong> ${escape_html(resolve_ws_url())}</p>
      <p class="metric"><strong>Socket:</strong> ${escape_html(socketState)}</p>
      ${lastSync.message ? `<p class="notice">${escape_html(lastSync.message)}</p>` : ""}
    </section>
  `;
}

function render_side_rail(): string {
  if (!lastSync?.publicState) {
    return `<aside class="side-rail ${uiState.sideRailOpen ? "" : "collapsed"}"></aside>`;
  }
  const sync = lastSync;
  const publicState = sync.publicState!;

  const orderedNames = [
    sync.selfName,
    ...publicState.watchOrder.filter((name) => name !== sync.selfName),
  ];

  return `
    <aside class="side-rail ${uiState.sideRailOpen ? "" : "collapsed"}">
      <div class="side-rail-header">
        <strong>Telas</strong>
        <button class="ghost-btn" data-action="toggle-rail" type="button">${uiState.sideRailOpen ? "←" : "→"}</button>
      </div>
      ${orderedNames
        .map((name) => {
          const view = publicState.screens[name];
          const player = sync.players.find((item) => item.name === name);
          return `
            <button
              class="screen-card ${uiState.watchName === name ? "active" : ""}"
              data-action="watch-screen"
              data-name="${escape_html(name)}"
              type="button"
            >
              <div class="screen-card-header">
                <span class="legend-color" style="background:${player?.color ?? "#000"}"></span>
                <strong>${escape_html(name)}</strong>
              </div>
              <div class="screen-card-body">
                <span>${escape_html(role_label(player?.role ?? "player"))}</span>
                <span>${escape_html(view?.roomType ? room_type_label(view.roomType) : "sem sala")}</span>
                <span>${escape_html(view ? `${view.exits.length} saidas` : "-")}</span>
              </div>
            </button>
          `;
        })
        .join("")}
    </aside>
  `;
}

function render_modal(): string {
  if (!lastSync || lastSync.phase !== "paused_master_disconnect") {
    return "";
  }
  const sync = lastSync;

  if (sync.swapMode === "quit") {
    return `
      <div class="modal-backdrop">
        <div class="modal-card">
          <h2>Mestre desconectado</h2>
          <p>Deseja desistir da partida?</p>
          <div class="button-row">
            <button class="btn btn-danger" data-action="abandon-match" type="button">Desistir</button>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div class="modal-backdrop">
      <div class="modal-card">
        <h2>Mestre desconectado</h2>
        <p>Trocar mestre?</p>
        <p class="helper">Votos: ${sync.swapVotes.length}/${sync.players.filter((player) => player.connected && player.name !== sync.masterName).length}</p>
        <div class="button-row">
          <button class="btn btn-primary" data-action="vote-swap-master" type="button">Trocar mestre</button>
          ${sync.canBecomeMaster ? '<button class="btn btn-secondary" data-action="become-master" type="button">Me tornar mestre</button>' : ""}
        </div>
      </div>
    </div>
  `;
}

function render_maze_svg(state: FullGameState, editable: boolean): string {
  const playersByRoom = new Map<string, Array<{ name: string; color: string; role: string }>>();
  for (const player of Object.values(state.players)) {
    if (!player.locationRoomId) continue;
    if (!playersByRoom.has(player.locationRoomId)) {
      playersByRoom.set(player.locationRoomId, []);
    }
    playersByRoom.get(player.locationRoomId)?.push({
      name: player.name,
      color: player.color,
      role: player.role,
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
        const selected = uiState.selectedRoomId === room.id;
        const connectArmed = uiState.connectSourceRoomId === room.id;
        const tokens = playersByRoom.get(room.id) ?? [];
        return `
          <g
            data-room-node="${escape_html(room.id)}"
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
    ${editable ? `<rect class="drag-layer" x="0" y="0" width="${VIEWBOX_WIDTH}" height="${VIEWBOX_HEIGHT}" fill="transparent" />` : ""}
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
  if (!svg || !is_self_master() || lastSync?.phase !== "lobby" || !masterState) {
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

    if (uiState.connectSourceRoomId && uiState.connectSourceRoomId !== roomId && masterState) {
      masterState = toggle_corridor(masterState, uiState.connectSourceRoomId, roomId);
      uiState.connectSourceRoomId = null;
      publish_master_state();
      render();
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
    if (!uiState.dragRoomId || uiState.connectSourceRoomId || !masterState) {
      return;
    }
    const point = toPoint(event);
    masterState = move_room(masterState, uiState.dragRoomId, point.x, point.y);
    render();
  };

  svg.onpointerup = () => {
    if (uiState.dragRoomId) {
      uiState.dragRoomId = null;
      publish_master_state();
      render();
    }
  };
}

function should_show_full_map(): boolean {
  if (!lastSync) return false;
  if (is_self_master()) return true;
  const self = lastSync.fullState?.players[lastSync.selfName];
  const presence = self_presence();
  if (presence?.seat === "spectator" && lastSync.phase !== "lobby") {
    return true;
  }
  return Boolean(self && !self.alive && uiState.revealFullMap);
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
      return "jogador";
  }
}

function phase_label(phase: string): string {
  switch (phase) {
    case "lobby":
      return "lobby";
    case "running":
      return "partida em andamento";
    case "paused_master_disconnect":
      return "pausado";
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
    const radiusX = 40 + ring * 8;
    const radiusY = 28 + ring * 6;
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
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.hostname || "localhost";
  return `${protocol}//${host}:8787`;
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
