const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const moedaCurta = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const mesCurto = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const mesExtenso = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

export function formatarMoeda(valor: number): string {
  return moeda.format(valor);
}

// Para rótulos de eixo: sem centavos
export function formatarMoedaCurta(valor: number): string {
  return moedaCurta.format(valor);
}

// "Out", "Nov"... (mes de 1 a 12)
export function rotuloMesCurto(ano: number, mes: number): string {
  return capitalizar(mesCurto.format(new Date(ano, mes - 1, 1)).replace('.', ''));
}

// "Outubro de 2025"
export function rotuloMesExtenso(ano: number, mes: number): string {
  return capitalizar(mesExtenso.format(new Date(ano, mes - 1, 1)));
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
