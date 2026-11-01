import { describe, expect, it } from 'vitest';
import { iniciais, indiceCor } from './avatar-iniciais';

describe('iniciais', () => {
  it('usa o primeiro e o último nome', () => {
    expect(iniciais('Maria da Silva Costa')).toBe('MC');
  });

  it('usa uma letra quando há um só nome', () => {
    expect(iniciais('Carla')).toBe('C');
  });

  it('ignora espaços extras e põe em maiúsculas, inclusive acentuadas', () => {
    expect(iniciais('  érica   ávila ')).toBe('ÉÁ');
  });

  it('devolve vazio para nome vazio', () => {
    expect(iniciais('   ')).toBe('');
  });
});

describe('indiceCor', () => {
  it('é estável para a mesma chave', () => {
    const chave = '7b74a62b-5480-4fd1-9ed0-a6691d50bb99';
    expect(indiceCor(chave)).toBe(indiceCor(chave));
  });

  it('fica entre 0 e 5', () => {
    for (const chave of ['a', 'b', 'c', 12345, 'ec39ccce-d28d-4ae8-9847-53327795eb28']) {
      expect(indiceCor(chave)).toBeGreaterThanOrEqual(0);
      expect(indiceCor(chave)).toBeLessThan(6);
    }
  });
});
