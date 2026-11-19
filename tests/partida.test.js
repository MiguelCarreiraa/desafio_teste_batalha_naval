const { Partida } = require('../src/partida');
const { rngComSemente, FROTA_PADRAO, CASAS_DA_FROTA } = require('./helpers');

function posicionarFrota(partida, jogador) {
  FROTA_PADRAO.forEach(([tipo, inicio, orientacao]) => partida.posicionar(jogador, tipo, inicio, orientacao));
}

function partidaPronta() {
  const partida = new Partida();
  posicionarFrota(partida, 1);
  posicionarFrota(partida, 2);
  return partida;
}

describe('Partida - preparação', () => {
  test("começa em 'preparacao', sem vez e sem vencedor", () => {
    const partida = new Partida();
    expect(partida.estado).toBe('preparacao');
    expect(partida.vez).toBeNull();
    expect(partida.vencedor).toBeNull();
  });

  test('cada jogador tem o seu próprio tabuleiro', () => {
    const partida = new Partida();
    partida.posicionar(1, 'submarino', 'A1', 'H');
    expect(partida.tabuleiroDe(1).navioEm('A1')).toBe('submarino');
    expect(partida.tabuleiroDe(2).navioEm('A1')).toBeNull();
  });

  test('não é possível atirar antes das duas frotas estarem completas', () => {
    const partida = new Partida();
    posicionarFrota(partida, 1);
    expect(partida.estado).toBe('preparacao');
    expect(() => partida.atirar(1, 'A1')).toThrow();
  });

  test('quando as duas frotas ficam completas, a partida começa com o jogador 1', () => {
    const partida = partidaPronta();
    expect(partida.estado).toBe('em andamento');
    expect(partida.vez).toBe(1);
  });

  test('também começa com o posicionamento aleatório', () => {
    const partida = new Partida();
    partida.posicionarAleatorio(1, rngComSemente(1));
    partida.posicionarAleatorio(2, rngComSemente(2));
    expect(partida.estado).toBe('em andamento');
  });

  test('não é possível posicionar navios depois que a partida começou', () => {
    const partida = partidaPronta();
    expect(() => partida.posicionar(1, 'hidroaviao', 'J1', 'H')).toThrow();
    expect(() => partida.posicionarAleatorio(2)).toThrow();
  });

  test.each([0, 3, '1', null])('rejeita o jogador %p', (jogador) => {
    const partida = new Partida();
    expect(() => partida.posicionar(jogador, 'submarino', 'A1', 'H')).toThrow(RangeError);
    expect(() => partida.tabuleiroDe(jogador)).toThrow(RangeError);
  });
});

describe('Partida - turnos', () => {
  test('o tiro vai para o tabuleiro do adversário', () => {
    const partida = partidaPronta();
    partida.atirar(1, 'A1');
    expect(partida.tabuleiroDe(2).jaRecebeuTiro('A1')).toBe(true);
    expect(partida.tabuleiroDe(1).jaRecebeuTiro('A1')).toBe(false);
  });

  test('só o jogador da vez pode atirar', () => {
    expect(() => partidaPronta().atirar(2, 'A1')).toThrow(/vez/);
  });

  test('tiro na água passa a vez para o adversário', () => {
    const partida = partidaPronta();
    expect(partida.atirar(1, 'J10').resultado).toBe('agua');
    expect(partida.vez).toBe(2);
  });

  test('quem acerta joga de novo (acerto e afundou)', () => {
    const partida = partidaPronta();
    expect(partida.atirar(1, 'G1').resultado).toBe('acerto');
    expect(partida.vez).toBe(1);
    expect(partida.atirar(1, 'G2').resultado).toBe('afundou');
    expect(partida.vez).toBe(1);
  });

  test('tiro repetido é erro e não passa a vez', () => {
    const partida = partidaPronta();
    partida.atirar(1, 'J10'); // água: vez do 2
    partida.atirar(2, 'J10'); // água: vez do 1
    expect(() => partida.atirar(1, 'J10')).toThrow();
    expect(partida.vez).toBe(1);
  });

  test('o histórico guarda cada tiro, com a coordenada no formato padrão', () => {
    const partida = partidaPronta();
    partida.atirar(1, 'g1');
    partida.atirar(1, 'B9');
    expect(partida.historico).toEqual([
      { jogador: 1, coordenada: 'G1', resultado: 'acerto', navio: null },
      { jogador: 1, coordenada: 'B9', resultado: 'agua', navio: null },
    ]);
  });

  test('estatísticas contam tiros, acertos e tiros na água', () => {
    const partida = partidaPronta();
    partida.atirar(1, 'A1');
    partida.atirar(1, 'A2');
    partida.atirar(1, 'B1');
    expect(partida.estatisticas(1)).toEqual({ tiros: 3, acertos: 2, agua: 1 });
    expect(partida.estatisticas(2)).toEqual({ tiros: 0, acertos: 0, agua: 0 });
  });
});

describe('Partida - fim de jogo', () => {
  test('o jogador 1 vence ao afundar a frota inteira (sem errar, nunca passa a vez)', () => {
    const partida = partidaPronta();
    CASAS_DA_FROTA.forEach((casa) => partida.atirar(1, casa));
    expect(partida.estado).toBe('encerrada');
    expect(partida.vencedor).toBe(1);
    expect(partida.vez).toBeNull();
  });

  test('o jogador 2 também pode vencer', () => {
    const partida = partidaPronta();
    partida.atirar(1, 'J10'); // erra e passa a vez
    CASAS_DA_FROTA.forEach((casa) => partida.atirar(2, casa));
    expect(partida.vencedor).toBe(2);
  });

  test('a partida não termina enquanto restar uma casa de navio', () => {
    const partida = partidaPronta();
    CASAS_DA_FROTA.slice(0, 13).forEach((casa) => partida.atirar(1, casa));
    expect(partida.estado).toBe('em andamento');
    expect(partida.tabuleiroDe(2).naviosRestantes).toBe(1);
  });

  test('depois do fim ninguém mais atira', () => {
    const partida = partidaPronta();
    CASAS_DA_FROTA.forEach((casa) => partida.atirar(1, casa));
    expect(() => partida.atirar(1, 'J10')).toThrow(/terminou/);
    expect(() => partida.atirar(2, 'J10')).toThrow(/terminou/);
  });
});
