import { calcularAtalho, formatarData, rotuloPeriodo } from './periodo';

describe('calcularAtalho', () => {
  const hoje = new Date(2026, 8, 27, 15, 30);

  it('últimos 30 dias inclui hoje e os 29 dias anteriores', () => {
    const periodo = calcularAtalho('ultimos30', hoje);
    expect(formatarData(periodo.inicio)).toBe('29/08/2026');
    expect(formatarData(periodo.fim)).toBe('27/09/2026');
    expect(periodo.atalho).toBe('ultimos30');
  });

  it('últimos 90 dias inclui hoje e os 89 dias anteriores', () => {
    const periodo = calcularAtalho('ultimos90', hoje);
    expect(formatarData(periodo.inicio)).toBe('30/06/2026');
    expect(formatarData(periodo.fim)).toBe('27/09/2026');
  });

  it('últimos 12 meses começa no dia seguinte ao mesmo dia do ano anterior', () => {
    const periodo = calcularAtalho('ultimos12meses', hoje);
    expect(formatarData(periodo.inicio)).toBe('28/09/2025');
  });

  it('zera o horário do fim do período', () => {
    const periodo = calcularAtalho('ultimos30', hoje);
    expect(periodo.fim.getHours()).toBe(0);
    expect(periodo.fim.getMinutes()).toBe(0);
  });

  it('atravessa a virada de ano', () => {
    const periodo = calcularAtalho('ultimos30', new Date(2027, 0, 10));
    expect(formatarData(periodo.inicio)).toBe('12/12/2026');
  });

  it('últimos 12 meses a partir de 29/02 começa em 01/03 do ano anterior', () => {
    const periodo = calcularAtalho('ultimos12meses', new Date(2028, 1, 29));
    expect(formatarData(periodo.inicio)).toBe('01/03/2027');
  });

  it('últimos 12 meses a partir de 31/12 começa em 01/01 do mesmo ano', () => {
    const periodo = calcularAtalho('ultimos12meses', new Date(2026, 11, 31));
    expect(formatarData(periodo.inicio)).toBe('01/01/2026');
  });
});

describe('rotuloPeriodo', () => {
  it('com atalho exibe o nome do atalho seguido das datas', () => {
    const periodo = calcularAtalho('ultimos90', new Date(2026, 8, 27));
    expect(rotuloPeriodo(periodo)).toEqual({ atalho: 'Últimos 90 dias', datas: '30/06/2026 – 27/09/2026' });
  });

  it('com datas manuais exibe apenas as datas', () => {
    const periodo = { inicio: new Date(2026, 6, 1), fim: new Date(2026, 6, 15), atalho: null };
    expect(rotuloPeriodo(periodo)).toEqual({ atalho: null, datas: '01/07/2026 – 15/07/2026' });
  });
});
