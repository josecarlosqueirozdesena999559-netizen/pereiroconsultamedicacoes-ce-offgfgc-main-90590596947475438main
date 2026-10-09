import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface MedicamentoExtraido {
  codigo: string;
  nome: string;
  unidade: string;
  quantidade: number | null;
}

type PdfTextItem = {
  str?: string;
  transform?: number[];
};

const normalizeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();

const parseQuantity = (value: string): number | null => {
  const normalized = value.replace(/\./g, "").replace(/,/g, "").trim();
  const quantity = Number.parseInt(normalized, 10);
  return Number.isFinite(quantity) ? quantity : null;
};

const medicationFromLine = (line: string): MedicamentoExtraido | null => {
  const productMatch = line.match(/Produto\s*:\s*(.+?)\s+Unidade\s*:\s*(.*)$/i);
  if (!productMatch) return null;

  const productText = productMatch[1].replace(/\s+/g, " ").trim();
  const codeMatch = productText.match(/^([A-Z]{1,4}[A-Z0-9.-]*)\s+(.+)$/i);
  if (!codeMatch) return null;

  const nome = codeMatch[2]
    .replace(/\s+ELENCO\s+ESTADUAL\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!nome) return null;

  const unitMatch = productMatch[2].match(/^([A-Z.]+)/i);
  return {
    codigo: codeMatch[1],
    nome,
    unidade: unitMatch?.[1]?.replace(/\.$/, "") || "",
    quantidade: null,
  };
};

/** Extrai os produtos e as respetivas quantidades de um PDF de inventário com texto selecionável. */
export const extractMedicamentosFromPdf = async (file: File): Promise<MedicamentoExtraido[]> => {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const extracted: MedicamentoExtraido[] = [];
  let current: MedicamentoExtraido | null = null;

  const saveCurrent = () => {
    if (current) extracted.push(current);
    current = null;
  };

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const rows = new Map<number, Array<{ x: number; text: string }>>();

      for (const rawItem of content.items as PdfTextItem[]) {
        const text = rawItem.str?.trim();
        const transform = rawItem.transform;
        if (!text || !transform) continue;
        const y = Math.round(transform[5] * 2) / 2;
        const row = rows.get(y) || [];
        row.push({ x: transform[4], text });
        rows.set(y, row);
      }

      const lines = [...rows.entries()]
        .sort(([yA], [yB]) => yB - yA)
        .map(([, row]) => row.sort((a, b) => a.x - b.x).map((item) => item.text).join(" ").replace(/\s+/g, " ").trim());

      for (const line of lines) {
        const product = medicationFromLine(line);
        if (product) {
          saveCurrent();
          current = product;
          continue;
        }

        if (current && /Total\s*:/i.test(line)) {
          const totalMatch = line.match(/Total\s*:\s*([\d.]+)(?:\s+[\d.,]+)?/i);
          if (totalMatch) current.quantidade = parseQuantity(totalMatch[1]);
        }
      }
    }
    saveCurrent();
  } finally {
    await pdf.destroy();
  }

  // O cabeçalho de um produto pode repetir-se na quebra entre páginas. Mantemos
  // uma entrada por código/nome e preferimos a cópia que inclui quantidade total.
  const unique = new Map<string, MedicamentoExtraido>();
  for (const medication of extracted) {
    const key = `${medication.codigo}|${normalizeName(medication.nome)}`;
    const previous = unique.get(key);
    if (!previous || (medication.quantidade !== null && (previous.quantidade === null || medication.quantidade > previous.quantidade))) {
      unique.set(key, medication);
    }
  }

  return [...unique.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
};
