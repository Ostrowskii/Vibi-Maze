# Vibi-Maze

Branch `open-info`: as informacoes completas do jogo ficam abertas no stream compartilhado do `vibinet`, mas a UI continua mostrando a visao limitada para jogadores vivos.

## O que esta implementado

- entrada por `room` e `nome`;
- lobby com eleicao de mestre;
- editor livre do mestre com salas, corredores, loop e mapa default 3x3;
- escolha ou sorteio da raposa;
- jogo por turnos com visao limitada na interface;
- trilho lateral para acompanhar as telas dos jogadores;
- espectador total para mortes e entradas tardias;
- sincronizacao via `vibinet`, usando o endpoint oficial por padrao.

## Rodando

```bash
npm install
npm run dev
```

Por padrao o cliente usa o servidor oficial do `vibinet`.

### Query params uteis

- `?room=minha-sala`
- `?name=Ana`
- `?server=wss://seu-servidor`

Exemplo:

```text
http://localhost:5173/?room=galinheiro&name=Ana
http://localhost:5173/?room=galinheiro&name=Bruno
```

## Build

```bash
npm run build
```

## GitHub Pages

Na branch `open-info`, o Pages deve usar `GitHub Actions`, nao `Branch / root`.

Motivo:
- `index.html` no root e codigo-fonte do Vite;
- o Pages em `branch + root` serve esse fonte cru e tenta abrir `/src/main.ts`, o que quebra em repositorio publicado em subpasta;
- o workflow em [.github/workflows/deploy-open-info-pages.yml](/home/zorro/Documents/www/vibi-maze/.github/workflows/deploy-open-info-pages.yml) faz o build e publica o `dist` correto.
