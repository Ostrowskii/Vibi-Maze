# Vibi-Maze

Protótipo de labirinto multiplayer usando `vibinet` para sincronizar apenas inputs.

## O que já está implementado

- entrada automática na sala com `spawn` sincronizado;
- movimento multiplayer por `WASD`/setas;
- emotes rápidos (`1` a `4`) sincronizados;
- objetivo compartilhado: coletar duas relíquias para abrir a saída;
- reinício de rodada com `R`;
- configuração de sala e servidor por query string ou `.env`.

## Rodando

```bash
npm install
npm run dev
```

Por padrão o cliente usa o servidor oficial do `vibinet`.

### Query params úteis

- `?room=minha-sala`
- `?char=A`
- `?server=ws://localhost:8080`

Exemplo:

```text
http://localhost:5173/?room=duo-lab&char=A
http://localhost:5173/?room=duo-lab&char=B
```

## Build

```bash
npm run build
```

## Servidor próprio

Se quiser sair do endpoint oficial, o repo local [`../VibiNet`](../VibiNet) já tem o servidor da lib. Pela documentação da própria lib:

```bash
bun run src/server.ts
```

Depois abra o jogo com `?server=ws://localhost:8080`.
