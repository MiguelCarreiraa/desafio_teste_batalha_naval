# Desafio Teste — Batalha Naval 10 x 10 (TDD)

Casos de teste em **JavaScript** (Jest) para uma **Batalha Naval** com tabuleiro **10 x 10** para 2 jogadores.

Desenvolvido no estilo **TDD**: primeiro foram escritos os testes (`tests/`) e depois a implementação (`src/`)
que faz todos eles passarem, seguindo o contrato descrito abaixo.

## Colaborador

- Miguel Carreira — [@MiguelCarreiraa](https://github.com/MiguelCarreiraa)

---

## Especificação do desafio

- Casos de teste para testar **tabuleiro 10 x 10** com a frota:
  - 1 **Porta-aviões** (ocupa 5 casas)
  - 1 **Encouraçado** (ocupa 4 casas)
  - 1 **Submarino** (ocupa 3 casas)
  - 1 **Destroier ou Hidroavião** (ocupa 2 casas)
- Casos de teste em **JavaScript** para testar **JavaScript**.

### Regras adotadas

| Item | Regra |
|---|---|
| Tabuleiro | 10 x 10. Linhas de **A** a **J**, colunas de **1** a **10** (ex.: `A1`, `C7`, `J10`). Aceita minúsculas. |
| Frota | 4 navios por jogador, **14 casas** no total. O 4º navio é **destroier OU hidroavião** (os dois ocupam a mesma vaga). |
| Posicionamento | A partir de uma casa, na horizontal (`H`, para a direita) ou vertical (`V`, para baixo). O navio precisa caber no tabuleiro. |
| Sobreposição | Dois navios não podem ocupar a mesma casa. |
| Distância | Navios **não podem encostar** um no outro, nem na diagonal (precisa ter água entre eles). |
| Tiros | Resultado `agua`, `acerto` ou `afundou` (só ao afundar é revelado qual navio). Não pode atirar duas vezes na mesma casa. |
| Turnos | O jogador 1 começa. **Água passa a vez; quem acerta joga de novo.** |
| Fim | Vence quem afundar toda a frota do adversário. Depois disso ninguém mais atira. |
| Aleatório | Posicionamento aleatório opcional, com gerador injetável (`rng`) para testes reprodutíveis. |

---

## Funcionamento dos casos de teste

### Como rodar

Requer [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install
npm test
```

Resultado esperado: **4 suítes e 98 testes passando**.

### Estrutura

```
src/
├── coordenadas.js        # A1..J10 <-> linha/coluna e casas vizinhas
├── navios.js             # tipos de navio, frota e casas ocupadas
├── tabuleiro.js          # classe Tabuleiro (posicionar, tiros, mapas)
└── partida.js            # classe Partida (2 jogadores, turnos, vencedor)
tests/
├── helpers.js            # gerador aleatório com semente e frota padrão dos testes
├── coordenadas.test.js
├── navios.test.js
├── tabuleiro.test.js
└── partida.test.js
```

### O que cada arquivo testa

| Arquivo | O que verifica |
|---|---|
| `coordenadas.test.js` | Tabuleiro 10 x 10 (A–J, 1–10); leitura dos 4 cantos e do meio; minúsculas e espaços; rejeição de `K1`, `A0`, `A11` e outros formatos (`RangeError`) e de quem não é texto (`TypeError`); conversão de volta para texto; vizinhas no meio (8), nos cantos (3) e nas bordas (5). |
| `navios.test.js` | Tamanho e nome de cada navio do requisito (5, 4, 3, 2 e 2); destroier e hidroavião na mesma vaga; símbolos diferentes; frota com 4 navios e 14 casas; tipo desconhecido; casas ocupadas na horizontal e vertical; encostar na borda é permitido; navio que não cabe, orientação inválida e coordenada inválida. |
| `tabuleiro.test.js` | Tabuleiro novo vazio; posicionamento e mapa da frota; frota completa; hidroavião no lugar do destroier (mas não os dois); navio repetido; **sobreposição**; **encostar ao lado, embaixo e na diagonal**; navios próximos com água entre eles; posicionamento rejeitado não deixa navio pela metade. Aleatório: 14 casas, **100 sementes sem navios encostados**, reprodutível, mantém navios já colocados. Tiros: água, acerto, afundou, porta-aviões com 5 acertos, minúsculas, tiro repetido, fora do tabuleiro. Situação da frota e mapas do dono e do adversário. |
| `partida.test.js` | Preparação, tabuleiros separados, não atira com frota incompleta, início automático com o jogador 1 (manual e aleatório), não reposiciona depois do início, jogador inválido; o tiro vai para o adversário; só o jogador da vez atira; **água passa a vez, acerto joga de novo**; tiro repetido não passa a vez; histórico e estatísticas; vitória do jogador 1 e do 2; não termina com uma casa restante; ninguém atira depois do fim. |

### Frota padrão usada nos testes (`tests/helpers.js`)

```
   1 2 3 4 5 6 7 8 9 10
A  P P P P P ~ ~ ~ ~ ~      P = porta-aviões (A1, H)
B  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
C  E E E E ~ ~ ~ ~ ~ ~      E = encouraçado  (C1, H)
D  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
E  S S S ~ ~ ~ ~ ~ ~ ~      S = submarino    (E1, H)
F  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
G  D D ~ ~ ~ ~ ~ ~ ~ ~      D = destroier    (G1, H)
H  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
I  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
J  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
```

### Símbolos do `mapa()`

| Símbolo | Visão do dono | Visão do adversário |
|---|---|---|
| `~` | água sem tiro | casa ainda desconhecida |
| `o` | tiro na água | tiro na água |
| `X` | parte do navio atingida | acerto |
| `#` | — | navio afundado |
| `P` `E` `S` `D` `H` | navio (porta-aviões, encouraçado, submarino, destroier, hidroavião) | — |

---

## Contrato (o que o código exporta)

Módulos em CommonJS (`module.exports`).

| Arquivo | Exporta |
|---|---|
| `src/coordenadas.js` | `TAMANHO` (10), `LETRAS`, `lerCoordenada('C7')` → `{ linha, coluna }`, `escreverCoordenada(l, c)` → `'C7'`, `normalizar(texto)`, `vizinhas(texto)` |
| `src/navios.js` | `NAVIOS` (`{ nome, tamanho, simbolo, vaga }` por tipo), `FROTA`, `VAGAS`, `dadosDoNavio(tipo)`, `casasDoNavio(tipo, inicio, 'H' \| 'V')` |
| `src/tabuleiro.js` | classe `Tabuleiro` |
| `src/partida.js` | classe `Partida` |

Tipos de navio: `porta-avioes` (5), `encouracado` (4), `submarino` (3), `destroier` (2), `hidroaviao` (2).

### `Tabuleiro`

- `posicionar(tipo, inicio, orientacao)`, `posicionarAleatorio(rng?)`
- `receberTiro(coordenada)` → `{ resultado: 'agua' | 'acerto' | 'afundou', navio: tipo | null }`
- `navioEm(coordenada)`, `jaRecebeuTiro(coordenada)`, `navios()` → `[{ tipo, tamanho, casas, atingidas, afundado }]`
- `frotaCompleta`, `naviosRestantes`, `todosAfundados`
- `mapa('dono' | 'adversario')` → 10 textos de 10 símbolos

### `Partida`

- `estado` (`'preparacao' | 'em andamento' | 'encerrada'`), `vez` (1, 2 ou `null`), `vencedor`, `historico`
- `tabuleiroDe(j)`, `posicionar(j, tipo, inicio, orientacao)`, `posicionarAleatorio(j, rng?)`
- `atirar(j, coordenada)` → resultado do tiro no tabuleiro do adversário
- `estatisticas(j)` → `{ tiros, acertos, agua }`
- Jogador diferente de 1 ou 2 → `RangeError`
