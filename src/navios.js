const { TAMANHO, lerCoordenada, escreverCoordenada } = require('./coordenadas');

// Tipos de navio. Destroier e hidroavião ocupam a mesma vaga na frota (um ou outro).
const NAVIOS = {
  'porta-avioes': { nome: 'Porta-aviões', tamanho: 5, simbolo: 'P', vaga: 'porta-avioes' },
  encouracado: { nome: 'Encouraçado', tamanho: 4, simbolo: 'E', vaga: 'encouracado' },
  submarino: { nome: 'Submarino', tamanho: 3, simbolo: 'S', vaga: 'submarino' },
  destroier: { nome: 'Destroier', tamanho: 2, simbolo: 'D', vaga: 'leve' },
  hidroaviao: { nome: 'Hidroavião', tamanho: 2, simbolo: 'H', vaga: 'leve' },
};

// A frota de cada jogador: 4 navios, 14 casas
const FROTA = ['porta-avioes', 'encouracado', 'submarino', 'destroier'];
const VAGAS = ['porta-avioes', 'encouracado', 'submarino', 'leve'];

function dadosDoNavio(tipo) {
  if (!Object.prototype.hasOwnProperty.call(NAVIOS, tipo)) throw new RangeError(`Navio desconhecido: ${tipo}`);
  return NAVIOS[tipo];
}

// Casas ocupadas a partir da casa inicial: 'H' anda para a direita, 'V' para baixo
function casasDoNavio(tipo, inicio, orientacao) {
  const { tamanho } = dadosDoNavio(tipo);
  if (orientacao !== 'H' && orientacao !== 'V') throw new RangeError('Orientação deve ser "H" ou "V"');
  const { linha, coluna } = lerCoordenada(inicio);
  const fim = (orientacao === 'H' ? coluna : linha) + tamanho - 1;
  if (fim >= TAMANHO) throw new RangeError('O navio não cabe no tabuleiro');
  return Array.from({ length: tamanho }, (_, i) =>
    (orientacao === 'H' ? escreverCoordenada(linha, coluna + i) : escreverCoordenada(linha + i, coluna)));
}

module.exports = { NAVIOS, FROTA, VAGAS, dadosDoNavio, casasDoNavio };
