const { Tabuleiro } = require('./tabuleiro');
const { normalizar } = require('./coordenadas');

const adversario = (j) => (j === 1 ? 2 : 1);

class Partida {
  constructor() {
    this.tabuleiros = { 1: new Tabuleiro(), 2: new Tabuleiro() };
    this.estado = 'preparacao'; // 'preparacao' | 'em andamento' | 'encerrada'
    this.vez = null;
    this.vencedor = null;
    this.historico = [];
  }

  validarJogador(j) {
    if (j !== 1 && j !== 2) throw new RangeError('Jogador deve ser 1 ou 2');
  }

  tabuleiroDe(j) {
    this.validarJogador(j);
    return this.tabuleiros[j];
  }

  verificarPreparacao(j) {
    this.validarJogador(j);
    if (this.estado !== 'preparacao') throw new Error('Os navios só podem ser posicionados antes da partida');
  }

  // Quando as duas frotas estão completas, a partida começa com o jogador 1
  tentarIniciar() {
    if (this.tabuleiros[1].frotaCompleta && this.tabuleiros[2].frotaCompleta) {
      this.estado = 'em andamento';
      this.vez = 1;
    }
  }

  posicionar(j, tipo, inicio, orientacao) {
    this.verificarPreparacao(j);
    this.tabuleiros[j].posicionar(tipo, inicio, orientacao);
    this.tentarIniciar();
  }

  posicionarAleatorio(j, rng) {
    this.verificarPreparacao(j);
    this.tabuleiros[j].posicionarAleatorio(rng);
    this.tentarIniciar();
  }

  // Atira no tabuleiro do adversário. Água passa a vez; acerto ou afundou joga de novo.
  atirar(j, coordenada) {
    this.validarJogador(j);
    if (this.estado === 'preparacao') throw new Error('As duas frotas precisam estar posicionadas');
    if (this.estado === 'encerrada') throw new Error('A partida já terminou');
    if (j !== this.vez) throw new Error('Não é a vez deste jogador');

    const alvo = this.tabuleiros[adversario(j)];
    const tiro = alvo.receberTiro(coordenada);
    this.historico.push({ jogador: j, coordenada: normalizar(coordenada), ...tiro });

    if (alvo.todosAfundados) {
      this.estado = 'encerrada';
      this.vencedor = j;
      this.vez = null;
    } else if (tiro.resultado === 'agua') {
      this.vez = adversario(j);
    }
    return tiro;
  }

  estatisticas(j) {
    this.validarJogador(j);
    const tiros = this.historico.filter((t) => t.jogador === j);
    const acertos = tiros.filter((t) => t.resultado !== 'agua').length;
    return { tiros: tiros.length, acertos, agua: tiros.length - acertos };
  }
}

module.exports = { Partida };
