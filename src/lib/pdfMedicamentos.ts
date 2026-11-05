import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { parseInventoryPages, inventoryLines, type InventoryLine } from './pdfInventoryParser';
export type { LoteExtraido, MedicamentoExtraido } from './pdfInventoryParser';
GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
export type ExtractionProgress = (message: string) => void;
/** Lê texto nativo primeiro; páginas digitalizadas são reconhecidas localmente com OCR. */
export async function extractMedicamentosFromPdf(file: File, onProgress?: ExtractionProgress) {
  const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: InventoryLine[][] = [];
  let worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | null = null;
  let usedOcr = false;
  try {
    for (let n = 1; n <= pdf.numPages; n++) {
      onProgress?.(`Lendo página ${n} de ${pdf.numPages}…`);
      const page = await pdf.getPage(n); const content = await page.getTextContent();
      const lines = inventoryLines(content.items.filter(item => "str" in item));
      const hasText = lines.map(line => line.text).join(' ').replace(/\s/g, '').length > 60;
      if (hasText) pages.push(lines);
      else {
        usedOcr = true;
        if (!worker) {
          onProgress?.('Preparando reconhecimento de texto em português…');
          const { createWorker } = await import('tesseract.js');
          worker = await createWorker('por', 1, { workerPath: '/ocr/worker.min.js', corePath: '/ocr/core', langPath: '/ocr/lang', logger: info => { if (info.status === 'recognizing text') onProgress?.(`Reconhecendo página ${n} de ${pdf.numPages}: ${Math.round(info.progress * 100)}%`); } });
          await worker.setParameters({ preserve_interword_spaces: '1' });
        }
        const viewport = page.getViewport({ scale: 2.4 });
        const canvas = document.createElement('canvas'); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d'); if (!context) throw new Error('Não foi possível preparar a imagem para leitura.');
        try {
          await page.render({ canvasContext: context, viewport }).promise;
          const result = await worker.recognize(canvas);
          pages.push(result.data.text.split(/\r?\n/).map(text => ({ text })));
        } finally { canvas.width = 0; canvas.height = 0; }
      }
      page.cleanup();
    }
    const medications = parseInventoryPages(pages);
    return medications.map(medication => ({ ...medication, origem: usedOcr ? 'ocr' as const : 'texto' as const }));
  } finally { if (worker) await worker.terminate(); await pdf.destroy(); }
}