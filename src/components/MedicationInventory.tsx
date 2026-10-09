import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getMedicamentosExtraidos } from "@/lib/storage";
import { extractMedicamentosFromPdf, type MedicamentoExtraido } from "@/lib/pdfMedicamentos";

interface MedicationInventoryProps {
  ubsId: string;
  pdfUrl?: string;
}

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

const sortByValidity = (a: { validade: string }, b: { validade: string }) => {
  const toDate = (value: string) => {
    const parts = value.split(/[/-]/).map(Number);
    if (parts.length !== 3) return Number.MAX_SAFE_INTEGER;
    const [day, month, year] = parts;
    return new Date(year < 100 ? 2000 + year : year, month - 1, day).getTime();
  };
  return toDate(a.validade) - toDate(b.validade);
};

const MedicationInventory = ({ ubsId, pdfUrl }: MedicationInventoryProps) => {
  const [medications, setMedications] = useState<MedicamentoExtraido[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadMedications = async () => {
      setLoading(true);
      try {
        const cached = await getMedicamentosExtraidos(ubsId);
        if (!active) return;

        if (cached.length > 0) {
          setMedications(cached as MedicamentoExtraido[]);
          return;
        }

        // PDFs enviados antes da criação do cache também são extraídos sob demanda.
        if (!pdfUrl) return;
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`Falha ao carregar o PDF (${response.status})`);
        const blob = await response.blob();
        const file = new File([blob], "medicamentos.pdf", { type: "application/pdf" });
        const extracted = await extractMedicamentosFromPdf(file);
        if (active) setMedications(extracted);
      } catch (error) {
        console.error("Erro ao extrair medicamentos do PDF:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadMedications();
    return () => {
      active = false;
    };
  }, [ubsId, pdfUrl]);

  const filtered = useMemo(() => {
    const query = normalizeText(search);
    const sorted = [...medications].sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
    );
    if (!query) return sorted;
    return sorted.filter((item) =>
      normalizeText(`${item.nome} ${item.codigo} ${item.unidade}`).includes(query)
    );
  }, [medications, search]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={loading || medications.length === 0}
          className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Carregando medicamentos…" : "Pesquisar medicamentos extraídos"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <PackageSearch className="h-5 w-5" />
            Pesquisar medicamentos extraídos
          </DialogTitle>
          <DialogDescription>
            Pesquise pelo nome, código ou unidade. A lista é exibida somente nesta janela.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar medicamento ou código…"
            aria-label="Pesquisar medicamento ou código"
            className="pl-9"
          />
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "medicamento" : "medicamentos"}
          {search ? " encontrados" : " na lista"}
        </p>
        {filtered.length === 0 ? (
          <p className="rounded-lg bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Não encontramos medicamentos com essa pesquisa.
          </p>
        ) : (
          <ul className="max-h-[55vh] space-y-2 overflow-y-auto pr-1" aria-label="Medicamentos encontrados">
            {filtered.map((item) => (
              <li key={`${item.codigo}-${item.nome}`} className="rounded-lg border bg-card p-3">
                <p className="font-semibold leading-snug">{item.nome}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Código: {item.codigo}</span>
                  {item.unidade && <span>Unidade: {item.unidade}</span>}
                  {item.quantidade !== null && item.quantidade !== undefined && (
                    <span>
                      Quantidade no relatório: {item.quantidade.toLocaleString("pt-BR")}
                      {item.unidade ? ` ${item.unidade}` : ""}
                    </span>
                  )}
                </div>
                {item.lotes?.length > 0 && (
                  <div className="mt-3 rounded-md bg-muted/40 p-2">
                    <p className="mb-2 text-xs font-semibold text-primary">Lotes e validades</p>
                    <div className="space-y-1.5">
                      {[...item.lotes].sort(sortByValidity).map((lote) => (
                        <div
                          key={`${lote.lote}-${lote.validade}`}
                          className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/60 pb-1 text-xs last:border-0 last:pb-0"
                        >
                          <span><strong>Lote:</strong> {lote.lote}</span>
                          <span><strong>Validade:</strong> {lote.validade}</span>
                          {lote.quantidade !== null && lote.quantidade !== undefined && (
                            <span><strong>Qtd:</strong> {lote.quantidade.toLocaleString("pt-BR")}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MedicationInventory;
