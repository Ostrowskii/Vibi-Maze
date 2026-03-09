# Vibi-Maze

Jogo multiplayer com `room + nome`, mestre fixo, editor de labirinto e partida por turnos entre raposa e galinhas.

## O que esta implementado

- entrada por `room` e `nome`;
- lobby com eleição de mestre;
- editor livre do mestre com salas, corredores, loop e mapa default 3x3;
- escolha ou sorteio da raposa;
- jogo por turnos com visão limitada por sala;
- trilho lateral para acompanhar as telas dos jogadores;
- espectador total para mortes e entradas tardias;
- relay websocket próprio com reconexão por `nome + room`.

## Rodando

```bash
npm install
npm run server
npm run dev
```

O cliente assume por padrão o relay local em `ws://127.0.0.1:8787`.

### Query params úteis

- `?room=minha-sala`
- `?name=Ana`
- `?server=ws://127.0.0.1:8787`

Exemplo:

```text
http://localhost:5173/?room=galinheiro&name=Ana
http://localhost:5173/?room=galinheiro&name=Bruno
```

## Build

```bash
npm run build
```
