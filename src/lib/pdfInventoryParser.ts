export interface LoteExtraido { lote: string; validade: string; quantidade: number | null; }
export interface MedicamentoExtraido { codigo: string; nome: string; unidade: string; quantidade: number | null; lotes: LoteExtraido[]; avisos?: string[]; origem?: 'texto' | 'ocr'; }
export interface InventoryLine { text: string; title?: boolean; }
export const normalizeName = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ').trim();
export function parseQuantity(value: string): number | null {
  const text = value.trim().replace(/\s/g, '');
  if (!/^\d+(?:[.,]\d+)*$/.test(text)) return null;
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : /^\d{1,3}(?:\.\d{3})+$/.test(text) ? text.replace(/\./g, '') : text;
  const n = Number(normalized); return Number.isFinite(n) ? n : null;
}
function medication(text: string, quantity: number | null = null): MedicamentoExtraido | null {
  let nome = text.replace(/\s+ELENCO\s+ESTADUAL\s*$/i, '').trim();
  let codigo = ''; let unidade = '';
  const unit = nome.match(/\s+Unidade\s*:\s*(.+)$/i);
  if (unit) { unidade = unit[1].trim(); nome = nome.slice(0, unit.index).trim(); }
  const code = nome.match(/^(?:C[oó]d(?:igo)?\.?\s*:\s*)?([A-Z0-9.-]*\d[A-Z0-9.-]*)\s+(.+)$/i);
  if (code) { codigo = code[1]; nome = code[2]; }
  if (!/[A-Za-zÀ-ÿ]{3}/.test(nome)) return null;
  return { codigo, nome, unidade, quantidade: quantity, lotes: [] };
}
function parseLote(line: string): LoteExtraido | null {
  // Relatório de posição de estoque: fabricante / lote / validade / programa / valor / estoque.
  const modern = line.match(/(?:^|\s)([A-Z0-9][A-Z0-9./-]*)\s+(\d{2}[/-]\d{2}[/-]\d{2,4})\s+.*?R\s*\$\s*[\d.,]+\s+(?:[—–-]\s*)?([\d.,]+)\s*$/i);
  if (modern) return { lote: modern[1], validade: modern[2], quantidade: parseQuantity(modern[3]) };
  const labeled = line.match(/Lote\s*(?:n[º°o]?\s*)?:?\s*([A-Z0-9][A-Z0-9.-]*)\s*[,;|]?\s*(?:Validade|Vencimento|Dura[çc][ãa]o)\s*:?\s*(\d{2}[/-]\d{2}[/-]\d{2,4})\s*[,;|]?\s*(?:(?:Quantidade|Qtd|Estoque)\s*:?\s*)?([\d.,]+)/i);
  if (labeled) return { lote: labeled[1], validade: labeled[2], quantidade: parseQuantity(labeled[3]) };
  const reordered = line.match(/(?:Validade|Vencimento|Dura[çc][ãa]o)\s*:?\s*(\d{2}[/-]\d{2}[/-]\d{2,4})\s*[,;|]?\s*Lote\s*:?\s*([A-Z0-9][A-Z0-9.-]*)\s*[,;|]?\s*(?:(?:Quantidade|Qtd|Estoque)\s*:?\s*)?([\d.,]+)/i);
  if (reordered) return { lote: reordered[2], validade: reordered[1], quantidade: parseQuantity(reordered[3]) };
  const horus = line.match(/(?:^|\s)(\d{2}[/-]\d{2}[/-]\d{2,4})\s+([A-Z0-9][A-Z0-9.-]*)\s+\d+(?:,\d+)?\s+(?:[A-Z]+)?\s*([\d.,]+)(?:\s+[\d.,]+)?\s*$/i);
  return horus ? { lote: horus[2], validade: horus[1], quantidade: parseQuantity(horus[3]) } : null;
}
function titleBefore(lines: InventoryLine[], index: number): string {
  const parts: string[] = [];
  for (let i = index - 1; i >= 0 && parts.length < 5; i--) {
    const line = lines[i]; const text = line.text.trim();
    if (!text) { if (parts.length) break; else continue; }
    if (line.title === false) break;
    if (line.title === undefined && (/Qtd\s*(?:total|estoque)|Fabricante|N[°ºo]\s*do lote|Data de validade|ASSIST[EÊ]NCIA|FARMAC[EÊ]UTICA|LTDA|Relat[oó]rio|Estabelecimento|Emitido por|Lote com|Programa de|Endere[çc]amento|R\s*\$|\d{2}\/\d{2}\/\d{4}/i.test(text) || !/[A-ZÀ-Ý]{3}/.test(text))) break;
    parts.unshift(text);
  }
  return parts.join(' ');
}
export function parseInventoryPages(pages: InventoryLine[][]): MedicamentoExtraido[] {
  const extracted: MedicamentoExtraido[] = []; let current: MedicamentoExtraido | null = null;
  const save = () => { if (current) extracted.push(current); current = null; };
  for (const lines of pages) {
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index].text.replace(/[\uE000-\uF8FF]/g, '').replace(/\s+/g, ' ').trim();
      const total = line.match(/^Qtd\.?\s*total\s*:?\s*([\d.,]+)/i);
      if (total) {
        const name = titleBefore(lines, index); const product = medication(name, parseQuantity(total[1]));
        if (product) { save(); current = product; }
        continue;
      }
      const header = line.match(/^(?:Produto|Medicamento|Item|Prod)\s*:\s*(.+)$/i);
      if (header) { save(); current = medication(header[1]); continue; }
      if (!current) continue;
      const lot = parseLote(line); if (lot) current.lotes.push(lot);
      const totalOld = line.match(/^Total\s*:\s*([\d.,]+)/i);
      if (totalOld) current.quantidade = parseQuantity(totalOld[1]);
    }
  }
  save();
  const unique = new Map<string, MedicamentoExtraido>();
  for (const item of extracted) {
    const key = `${item.codigo}|${normalizeName(item.nome)}`; const previous = unique.get(key);
    if (previous) { previous.lotes.push(...item.lotes); if (item.quantidade !== null) previous.quantidade = Math.max(previous.quantidade ?? 0, item.quantidade); }
    else unique.set(key, { ...item, lotes: [...item.lotes] });
  }
  for (const item of unique.values()) {
    item.lotes = [...new Map(item.lotes.map(lot => [`${lot.lote}|${lot.validade}|${lot.quantidade}`, lot])).values()];
    const sum = item.lotes.reduce((n, lot) => n + (lot.quantidade ?? 0), 0);
    if (item.quantidade === null && item.lotes.length && item.lotes.every(lot => lot.quantidade !== null)) item.quantidade = sum;
    if (item.quantidade !== null && item.lotes.length && Math.abs(sum - item.quantidade) > .001) item.avisos = ['A soma dos lotes difere do total do relatório. Confira o PDF.'];
  }
  return [...unique.values()].sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}
type TextItem = { str?: string; transform?: number[]; fontName?: string };
export function inventoryLines(items: TextItem[]): InventoryLine[] {
  const rows: { y: number; items: TextItem[] }[] = [];
  for (const item of items.filter(item => item.str?.trim() && item.transform).sort((a,b) => b.transform![5] - a.transform![5])) {
    let row = rows.find(row => Math.abs(row.y - item.transform![5]) <= 1.5);
    if (!row) { row = { y: item.transform![5], items: [] }; rows.push(row); }
    row.items.push(item);
  }
  const totalStyles = items.filter(item => /^Qtd\.?\s*total/i.test(item.str || ''));
  return rows.map(row => {
    row.items.sort((a,b) => a.transform![4] - b.transform![4]);
    const first = row.items[0];
    const title = totalStyles.length ? totalStyles.some(total => total.fontName === first.fontName && Math.abs(Math.abs(total.transform![0]) - Math.abs(first.transform![0])) < .5 && Math.abs(total.transform![4] - first.transform![4]) < 5) : undefined;
    return { text: row.items.map(item => item.str).join(' ').replace(/\s+/g, ' ').trim(), title };
  });
}
