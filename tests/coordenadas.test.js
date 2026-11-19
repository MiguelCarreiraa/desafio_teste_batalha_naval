const {
  TAMANHO, LETRAS, lerCoordenada, escreverCoordenada, normalizar, vizinhas,
} = require('../src/coordenadas');

describe('Tabuleiro 10 x 10', () => {
  test('tem 10 linhas (A a J) e 10 colunas (1 a 10)', () => {
    expect(TAMANHO).toBe(10);
    expect(LETRAS).toBe('ABCDEFGHIJ');
  });
});

describe('lerCoordenada', () => {
  test.each([
    ['A1', 0, 0],
    ['A10', 0, 9],
    ['J1', 9, 0],
    ['J10', 9, 9],
    ['C7', 2, 6],
  ])('%s => linha %i, coluna %i', (texto, linha, coluna) => {
    expect(lerCoordenada(texto)).toEqual({ linha, coluna });
  });

  test('aceita letras minúsculas e espaços nas pontas', () => {
    expect(lerCoordenada(' c7 ')).toEqual({ linha: 2, coluna: 6 });
  });

  test.each(['K1', 'A0', 'A11', 'AA1', '1A', 'A', '', 'A 1', 'B-2'])('rejeita "%s"', (texto) => {
    expect(() => lerCoordenada(texto)).toThrow(RangeError);
  });

  test('rejeita o que não é texto', () => {
    expect(() => lerCoordenada(3)).toThrow(TypeError);
  });
});

describe('escreverCoordenada e normalizar', () => {
  test('converte linha e coluna para o formato do jogo', () => {
    expect(escreverCoordenada(0, 0)).toBe('A1');
    expect(escreverCoordenada(2, 6)).toBe('C7');
    expect(escreverCoordenada(9, 9)).toBe('J10');
  });

  test.each([[-1, 0], [0, 10], [10, 0], [1.5, 2]])('rejeita a posição (%p, %p)', (l, c) => {
    expect(() => escreverCoordenada(l, c)).toThrow(RangeError);
  });

  test('normalizar deixa a coordenada no formato padrão', () => {
    expect(normalizar(' j10 ')).toBe('J10');
  });
});

describe('vizinhas (inclui diagonais)', () => {
  test('uma casa do meio tem 8 vizinhas', () => {
    expect(vizinhas('C3').sort()).toEqual(['B2', 'B3', 'B4', 'C2', 'C4', 'D2', 'D3', 'D4'].sort());
  });

  test.each([
    ['A1', ['A2', 'B1', 'B2']],
    ['A10', ['A9', 'B9', 'B10']],
    ['J1', ['I1', 'I2', 'J2']],
    ['J10', ['I9', 'I10', 'J9']],
  ])('o canto %s tem 3 vizinhas', (casa, esperado) => {
    expect(vizinhas(casa).sort()).toEqual(esperado.sort());
  });

  test('uma casa de borda tem 5 vizinhas', () => {
    expect(vizinhas('A5')).toHaveLength(5);
    expect(vizinhas('E10')).toHaveLength(5);
  });
});
