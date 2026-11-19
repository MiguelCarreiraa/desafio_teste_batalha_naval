const {
  NAVIOS, FROTA, VAGAS, dadosDoNavio, casasDoNavio,
} = require('../src/navios');

describe('Tipos de navio (requisitos do desafio)', () => {
  test.each([
    ['porta-avioes', 'Porta-aviões', 5],
    ['encouracado', 'Encouraçado', 4],
    ['submarino', 'Submarino', 3],
    ['destroier', 'Destroier', 2],
    ['hidroaviao', 'Hidroavião', 2],
  ])('%s (%s) ocupa %i casas', (tipo, nome, tamanho) => {
    expect(dadosDoNavio(tipo)).toEqual(expect.objectContaining({ nome, tamanho }));
  });

  test('destroier e hidroavião disputam a mesma vaga na frota (um OU outro)', () => {
    expect(NAVIOS.destroier.vaga).toBe(NAVIOS.hidroaviao.vaga);
  });

  test('cada tipo tem um símbolo diferente para o mapa', () => {
    const simbolos = Object.values(NAVIOS).map((n) => n.simbolo);
    expect(new Set(simbolos).size).toBe(simbolos.length);
  });

  test('a frota tem 4 navios, um de cada vaga, somando 14 casas', () => {
    expect(FROTA).toEqual(['porta-avioes', 'encouracado', 'submarino', 'destroier']);
    expect(VAGAS).toHaveLength(4);
    expect(FROTA.reduce((soma, tipo) => soma + dadosDoNavio(tipo).tamanho, 0)).toBe(14);
  });

  test('rejeita tipo de navio desconhecido', () => {
    expect(() => dadosDoNavio('canoa')).toThrow(RangeError);
    expect(() => dadosDoNavio('toString')).toThrow(RangeError);
  });
});

describe('casasDoNavio', () => {
  test("na horizontal ('H') ocupa casas para a direita", () => {
    expect(casasDoNavio('porta-avioes', 'B2', 'H')).toEqual(['B2', 'B3', 'B4', 'B5', 'B6']);
  });

  test("na vertical ('V') ocupa casas para baixo", () => {
    expect(casasDoNavio('submarino', 'D8', 'V')).toEqual(['D8', 'E8', 'F8']);
  });

  test('pode encostar na borda direita e na borda de baixo', () => {
    expect(casasDoNavio('encouracado', 'A7', 'H')).toEqual(['A7', 'A8', 'A9', 'A10']);
    expect(casasDoNavio('hidroaviao', 'I10', 'V')).toEqual(['I10', 'J10']);
  });

  test.each([
    ['porta-avioes', 'A7', 'H'],
    ['encouracado', 'H1', 'V'],
    ['destroier', 'J10', 'H'],
  ])('rejeita %s em %s (%s): não cabe no tabuleiro', (tipo, inicio, orientacao) => {
    expect(() => casasDoNavio(tipo, inicio, orientacao)).toThrow(RangeError);
  });

  test('rejeita orientação inválida e coordenada inválida', () => {
    expect(() => casasDoNavio('submarino', 'A1', 'diagonal')).toThrow(RangeError);
    expect(() => casasDoNavio('submarino', 'Z1', 'H')).toThrow(RangeError);
  });
});
