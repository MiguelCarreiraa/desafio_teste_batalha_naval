// Tabuleiro 10 x 10: linhas de A a J, colunas de 1 a 10 (ex.: 'A1', 'C7', 'J10')
const TAMANHO = 10;
const LETRAS = 'ABCDEFGHIJ';

const FORMATO = /^([A-J])(10|[1-9])$/;

// 'C7' => { linha: 2, coluna: 6 } (aceita minúsculas e espaços nas pontas)
function lerCoordenada(texto) {
  if (typeof texto !== 'string') throw new TypeError('A coordenada deve ser um texto, ex.: "C7"');
  const encontrado = texto.trim().toUpperCase().match(FORMATO);
  if (!encontrado) throw new RangeError(`Coordenada inválida: ${texto}`);
  return { linha: LETRAS.indexOf(encontrado[1]), coluna: Number(encontrado[2]) - 1 };
}

const dentro = (n) => Number.isInteger(n) && n >= 0 && n < TAMANHO;

// (2, 6) => 'C7'
function escreverCoordenada(linha, coluna) {
  if (!dentro(linha) || !dentro(coluna)) throw new RangeError('Posição fora do tabuleiro');
  return `${LETRAS[linha]}${coluna + 1}`;
}

// Deixa a coordenada no formato padrão: ' c7 ' => 'C7'
const normalizar = (texto) => {
  const { linha, coluna } = lerCoordenada(texto);
  return escreverCoordenada(linha, coluna);
};

// Coordenadas em volta (até 8, incluindo diagonais), só as que existem no tabuleiro
function vizinhas(texto) {
  const { linha, coluna } = lerCoordenada(texto);
  const lista = [];
  for (let dl = -1; dl <= 1; dl++) {
    for (let dc = -1; dc <= 1; dc++) {
      if ((dl !== 0 || dc !== 0) && dentro(linha + dl) && dentro(coluna + dc)) {
        lista.push(escreverCoordenada(linha + dl, coluna + dc));
      }
    }
  }
  return lista;
}

module.exports = { TAMANHO, LETRAS, lerCoordenada, escreverCoordenada, normalizar, vizinhas };
