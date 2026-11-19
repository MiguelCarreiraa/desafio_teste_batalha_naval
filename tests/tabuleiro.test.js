const { Tabuleiro } = require('../src/tabuleiro');
const { vizinhas } = require('../src/coordenadas');
const { rngComSemente, CASAS_DA_FROTA, montarFrota } = require('./helpers');

const AGUA = '~'.repeat(10);

describe('Tabuleiro - posicionamento', () => {
  test('um tabuleiro novo é só água e não tem frota completa', () => {
    const tab = new Tabuleiro();
    expect(tab.mapa()).toEqual(Array(10).fill(AGUA));
    expect(tab.frotaCompleta).toBe(false);
    expect(tab.navios()).toEqual([]);
  });

  test('posicionar coloca o navio nas casas certas', () => {
    const tab = new Tabuleiro();
    tab.posicionar('submarino', 'D8', 'V');
    expect(tab.navioEm('D8')).toBe('submarino');
    expect(tab.navioEm('F8')).toBe('submarino');
    expect(tab.navioEm('G8')).toBeNull();
  });

  test('o mapa do dono mostra a frota padrão com as letras dos navios', () => {
    expect(montarFrota(new Tabuleiro()).mapa()).toEqual([
      'PPPPP~~~~~', AGUA, 'EEEE~~~~~~', AGUA, 'SSS~~~~~~~', AGUA, 'DD~~~~~~~~', AGUA, AGUA, AGUA,
    ]);
  });

  test('com os 4 navios a frota fica completa (14 casas)', () => {
    const tab = montarFrota(new Tabuleiro());
    expect(tab.frotaCompleta).toBe(true);
    expect(tab.navios().reduce((soma, n) => soma + n.tamanho, 0)).toBe(14);
  });

  test('o hidroavião pode substituir o destroier', () => {
    const tab = new Tabuleiro();
    tab.posicionar('porta-avioes', 'A1', 'H');
    tab.posicionar('encouracado', 'C1', 'H');
    tab.posicionar('submarino', 'E1', 'H');
    tab.posicionar('hidroaviao', 'J9', 'H');
    expect(tab.frotaCompleta).toBe(true);
    expect(tab.mapa()[9]).toBe('~~~~~~~~HH');
  });

  test('não aceita destroier E hidroavião na mesma frota', () => {
    const tab = new Tabuleiro();
    tab.posicionar('destroier', 'A1', 'H');
    expect(() => tab.posicionar('hidroaviao', 'J1', 'H')).toThrow(/já foi posicionado/);
  });

  test('cada navio só pode ser posicionado uma vez', () => {
    const tab = new Tabuleiro();
    tab.posicionar('submarino', 'A1', 'H');
    expect(() => tab.posicionar('submarino', 'J1', 'H')).toThrow(/já foi posicionado/);
  });

  test('navios não podem se sobrepor', () => {
    const tab = new Tabuleiro();
    tab.posicionar('porta-avioes', 'C1', 'H');
    expect(() => tab.posicionar('encouracado', 'A3', 'V')).toThrow(/sobrepor/);
  });

  test.each([
    ['ao lado', 'C6', 'H'],
    ['embaixo', 'D1', 'H'],
    ['na diagonal', 'D6', 'V'],
  ])('navios não podem encostar um no outro (%s)', (_nome, inicio, orientacao) => {
    const tab = new Tabuleiro();
    tab.posicionar('porta-avioes', 'C1', 'H'); // C1..C5
    expect(() => tab.posicionar('destroier', inicio, orientacao)).toThrow(/encostar/);
  });

  test('com uma casa de água entre eles, os navios podem ficar próximos', () => {
    const tab = new Tabuleiro();
    tab.posicionar('porta-avioes', 'C1', 'H');
    expect(() => tab.posicionar('destroier', 'C7', 'H')).not.toThrow();
    expect(() => tab.posicionar('submarino', 'E1', 'H')).not.toThrow();
  });

  test('um posicionamento rejeitado não deixa o navio pela metade no tabuleiro', () => {
    const tab = new Tabuleiro();
    tab.posicionar('destroier', 'E5', 'H');
    expect(() => tab.posicionar('porta-avioes', 'E1', 'H')).toThrow();
    expect(tab.navioEm('E1')).toBeNull();
    expect(tab.navios()).toHaveLength(1);
  });

  test('erros de tipo, orientação e coordenada são repassados como RangeError', () => {
    const tab = new Tabuleiro();
    expect(() => tab.posicionar('canoa', 'A1', 'H')).toThrow(RangeError);
    expect(() => tab.posicionar('submarino', 'A1', 'X')).toThrow(RangeError);
    expect(() => tab.posicionar('submarino', 'A9', 'H')).toThrow(RangeError);
  });
});

describe('Tabuleiro - posicionamento aleatório', () => {
  const ocupadas = (tab) => tab.navios().flatMap((n) => n.casas);

  test('completa a frota com 14 casas sem sobreposição', () => {
    const tab = new Tabuleiro();
    tab.posicionarAleatorio(rngComSemente(1));
    expect(tab.frotaCompleta).toBe(true);
    expect(new Set(ocupadas(tab)).size).toBe(14);
  });

  test('em 100 sementes, nenhum navio encosta em outro', () => {
    for (let semente = 1; semente <= 100; semente++) {
      const tab = new Tabuleiro();
      tab.posicionarAleatorio(rngComSemente(semente));
      tab.navios().forEach((navio) => {
        navio.casas.forEach((casa) => {
          vizinhas(casa).forEach((v) => {
            const outro = tab.navioEm(v);
            expect(outro === null || outro === navio.tipo).toBe(true);
          });
        });
      });
    }
  });

  test('a mesma semente gera a mesma disposição', () => {
    const gerar = () => {
      const tab = new Tabuleiro();
      tab.posicionarAleatorio(rngComSemente(9));
      return tab.mapa();
    };
    expect(gerar()).toEqual(gerar());
  });

  test('mantém os navios que já estavam posicionados', () => {
    const tab = new Tabuleiro();
    tab.posicionar('hidroaviao', 'J9', 'H');
    tab.posicionarAleatorio(rngComSemente(3));
    expect(tab.frotaCompleta).toBe(true);
    expect(tab.navioEm('J9')).toBe('hidroaviao');
    expect(tab.navios().map((n) => n.tipo)).not.toContain('destroier');
  });

  test('funciona com Math.random', () => {
    const tab = new Tabuleiro();
    tab.posicionarAleatorio();
    expect(tab.frotaCompleta).toBe(true);
  });
});

describe('Tabuleiro - tiros', () => {
  test("tiro na água => { resultado: 'agua' }", () => {
    expect(montarFrota(new Tabuleiro()).receberTiro('B5')).toEqual({ resultado: 'agua', navio: null });
  });

  test("tiro em navio => 'acerto' (sem revelar qual navio)", () => {
    expect(montarFrota(new Tabuleiro()).receberTiro('A3')).toEqual({ resultado: 'acerto', navio: null });
  });

  test("o tiro que atinge a última casa do navio => 'afundou' com o tipo do navio", () => {
    const tab = montarFrota(new Tabuleiro());
    expect(tab.receberTiro('G1').resultado).toBe('acerto');
    expect(tab.receberTiro('G2')).toEqual({ resultado: 'afundou', navio: 'destroier' });
  });

  test('o porta-aviões só afunda com 5 acertos', () => {
    const tab = montarFrota(new Tabuleiro());
    ['A1', 'A2', 'A3', 'A4'].forEach((casa) => expect(tab.receberTiro(casa).resultado).toBe('acerto'));
    expect(tab.receberTiro('A5')).toEqual({ resultado: 'afundou', navio: 'porta-avioes' });
  });

  test('aceita a coordenada em minúsculas', () => {
    const tab = montarFrota(new Tabuleiro());
    expect(tab.receberTiro('e2').resultado).toBe('acerto');
    expect(tab.jaRecebeuTiro('E2')).toBe(true);
  });

  test('não é possível atirar duas vezes na mesma casa (água ou navio)', () => {
    const tab = montarFrota(new Tabuleiro());
    tab.receberTiro('J10');
    tab.receberTiro('A1');
    expect(() => tab.receberTiro('J10')).toThrow(/Já houve tiro/);
    expect(() => tab.receberTiro('a1')).toThrow(/Já houve tiro/);
  });

  test('rejeita tiro fora do tabuleiro', () => {
    expect(() => montarFrota(new Tabuleiro()).receberTiro('K1')).toThrow(RangeError);
  });
});

describe('Tabuleiro - situação da frota e mapas', () => {
  test('navios() informa tamanho, acertos e se afundou', () => {
    const tab = montarFrota(new Tabuleiro());
    tab.receberTiro('E1');
    tab.receberTiro('G1');
    tab.receberTiro('G2');
    const porTipo = Object.fromEntries(tab.navios().map((n) => [n.tipo, n]));
    expect(porTipo.submarino).toEqual(expect.objectContaining({ tamanho: 3, atingidas: 1, afundado: false }));
    expect(porTipo.destroier).toEqual(expect.objectContaining({ tamanho: 2, atingidas: 2, afundado: true }));
    expect(tab.naviosRestantes).toBe(3);
  });

  test('todosAfundados só é verdadeiro depois de acertar as 14 casas', () => {
    const tab = montarFrota(new Tabuleiro());
    CASAS_DA_FROTA.slice(0, 13).forEach((casa) => tab.receberTiro(casa));
    expect(tab.todosAfundados).toBe(false);
    tab.receberTiro(CASAS_DA_FROTA[13]);
    expect(tab.todosAfundados).toBe(true);
    expect(tab.naviosRestantes).toBe(0);
  });

  test('um tabuleiro sem frota não conta como todos afundados', () => {
    expect(new Tabuleiro().todosAfundados).toBe(false);
  });

  test("o mapa do dono marca 'X' nos acertos e 'o' nos tiros na água", () => {
    const tab = montarFrota(new Tabuleiro());
    ['A1', 'B5', 'G1', 'G2'].forEach((casa) => tab.receberTiro(casa));
    const mapa = tab.mapa('dono');
    expect(mapa[0]).toBe('XPPPP~~~~~');
    expect(mapa[1]).toBe('~~~~o~~~~~');
    expect(mapa[6]).toBe('XX~~~~~~~~');
  });

  test("o mapa do adversário esconde os navios: 'X' acerto, '#' afundado, 'o' água", () => {
    const tab = montarFrota(new Tabuleiro());
    ['A1', 'B5', 'G1', 'G2'].forEach((casa) => tab.receberTiro(casa));
    expect(tab.mapa('adversario')).toEqual([
      'X~~~~~~~~~', '~~~~o~~~~~', AGUA, AGUA, AGUA, AGUA, '##~~~~~~~~', AGUA, AGUA, AGUA,
    ]);
  });

  test('rejeita uma visão de mapa desconhecida', () => {
    expect(() => new Tabuleiro().mapa('espiao')).toThrow(RangeError);
  });
});
