const { TAMANHO, normalizar, vizinhas, escreverCoordenada } = require('./coordenadas');
const { FROTA, VAGAS, dadosDoNavio, casasDoNavio } = require('./navios');

class Tabuleiro {
  constructor() {
    this.frota = new Map(); // tipo => { casas, atingidas: Set }
    this.ocupacao = new Map(); // coordenada => tipo
    this.tiros = new Set(); // coordenadas que já receberam tiro
  }

  posicionar(tipo, inicio, orientacao) {
    const casas = casasDoNavio(tipo, inicio, orientacao);
    const { vaga } = dadosDoNavio(tipo);
    if ([...this.frota.keys()].some((t) => dadosDoNavio(t).vaga === vaga)) {
      throw new Error('Este navio (ou outro da mesma vaga) já foi posicionado');
    }
    if (casas.some((casa) => this.ocupacao.has(casa))) throw new Error('Os navios não podem se sobrepor');
    if (casas.some((casa) => vizinhas(casa).some((v) => this.ocupacao.has(v)))) {
      throw new Error('Os navios não podem encostar um no outro');
    }
    this.frota.set(tipo, { casas, atingidas: new Set() });
    casas.forEach((casa) => this.ocupacao.set(casa, tipo));
  }

  // Completa a frota com posições sorteadas (o 4º navio é o destroier)
  posicionarAleatorio(rng = Math.random) {
    VAGAS.forEach((vaga, i) => {
      if ([...this.frota.keys()].some((t) => dadosDoNavio(t).vaga === vaga)) return;
      for (let tentativa = 0; tentativa < 1000; tentativa++) {
        const orientacao = rng() < 0.5 ? 'H' : 'V';
        const inicio = escreverCoordenada(Math.floor(rng() * TAMANHO), Math.floor(rng() * TAMANHO));
        try {
          this.posicionar(FROTA[i], inicio, orientacao);
          return;
        } catch (erro) {
          // posição inválida: tenta outra
        }
      }
      throw new Error('Não foi possível posicionar a frota');
    });
  }

  get frotaCompleta() {
    return this.frota.size === VAGAS.length;
  }

  navioEm(coordenada) {
    return this.ocupacao.get(normalizar(coordenada)) || null;
  }

  receberTiro(coordenada) {
    const casa = normalizar(coordenada);
    if (this.tiros.has(casa)) throw new Error(`Já houve tiro em ${casa}`);
    this.tiros.add(casa);
    const tipo = this.ocupacao.get(casa);
    if (!tipo) return { resultado: 'agua', navio: null };
    const navio = this.frota.get(tipo);
    navio.atingidas.add(casa);
    if (navio.atingidas.size === navio.casas.length) return { resultado: 'afundou', navio: tipo };
    return { resultado: 'acerto', navio: null };
  }

  jaRecebeuTiro(coordenada) {
    return this.tiros.has(normalizar(coordenada));
  }

  navios() {
    return [...this.frota.entries()].map(([tipo, { casas, atingidas }]) => ({
      tipo,
      tamanho: casas.length,
      casas: [...casas],
      atingidas: atingidas.size,
      afundado: atingidas.size === casas.length,
    }));
  }

  get naviosRestantes() {
    return this.navios().filter((n) => !n.afundado).length;
  }

  get todosAfundados() {
    return this.frotaCompleta && this.naviosRestantes === 0;
  }

  // 'dono': vê os navios. 'adversario': vê só o resultado dos tiros.
  // ~ água/desconhecido | o tiro na água | X acerto | # navio afundado (adversário) | P E S D H navios (dono)
  mapa(visao = 'dono') {
    if (visao !== 'dono' && visao !== 'adversario') throw new RangeError('Visão deve ser "dono" ou "adversario"');
    const linhas = [];
    for (let l = 0; l < TAMANHO; l++) {
      let texto = '';
      for (let c = 0; c < TAMANHO; c++) {
        const casa = escreverCoordenada(l, c);
        const tipo = this.ocupacao.get(casa);
        const atingida = this.tiros.has(casa);
        if (!tipo) texto += atingida ? 'o' : '~';
        else if (visao === 'dono') texto += atingida ? 'X' : dadosDoNavio(tipo).simbolo;
        else if (!atingida) texto += '~';
        else {
          const navio = this.frota.get(tipo);
          texto += navio.atingidas.size === navio.casas.length ? '#' : 'X';
        }
      }
      linhas.push(texto);
    }
    return linhas;
  }
}

module.exports = { Tabuleiro };
