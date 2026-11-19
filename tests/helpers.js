// Gerador pseudoaleatório com semente (Park-Miller): mesma semente => mesma sequência
function rngComSemente(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 16807) % 2147483647;
    return estado / 2147483647;
  };
}

// Frota padrão usada nos testes (navios separados por uma linha de água):
//    1 2 3 4 5 6 7 8 9 10
// A  P P P P P ~ ~ ~ ~ ~
// B  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// C  E E E E ~ ~ ~ ~ ~ ~
// D  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// E  S S S ~ ~ ~ ~ ~ ~ ~
// F  ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
// G  D D ~ ~ ~ ~ ~ ~ ~ ~
const FROTA_PADRAO = [
  ['porta-avioes', 'A1', 'H'],
  ['encouracado', 'C1', 'H'],
  ['submarino', 'E1', 'H'],
  ['destroier', 'G1', 'H'],
];

// As 14 casas ocupadas pela frota padrão
const CASAS_DA_FROTA = [
  'A1', 'A2', 'A3', 'A4', 'A5',
  'C1', 'C2', 'C3', 'C4',
  'E1', 'E2', 'E3',
  'G1', 'G2',
];

function montarFrota(tabuleiro) {
  FROTA_PADRAO.forEach(([tipo, inicio, orientacao]) => tabuleiro.posicionar(tipo, inicio, orientacao));
  return tabuleiro;
}

module.exports = { rngComSemente, FROTA_PADRAO, CASAS_DA_FROTA, montarFrota };
