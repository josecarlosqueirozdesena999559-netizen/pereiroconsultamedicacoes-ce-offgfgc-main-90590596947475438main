import { useEffect, useMemo, useState } from "react";
import { Search, Loader2, PackageSearch } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMedicamentosExtraidos } from "@/lib/storage";
import type { MedicamentoExtraido } from "@/lib/pdfMedicamentos";

interface MedicationInventoryProps {
  ubsId: string;
}

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

const MedicationInventory = ({ ubsId }: MedicationInventoryProps) => {
  const [medications, setMedications] = useState<MedicamentoExtraido[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMedicamentosExtraidos(ubsId).then((data) => {
      if (active) setMedications(data as MedicamentoExtraido[]);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [ubsId]);

  const filtered = useMemo(() => {
    const query = normalizeText(search);
    const sorted = [...medications].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
    if (!query) return sorted;
    return sorted.filter((item) => normalizeText(`${item.nome} ${item.codigo} ${item.unidade}`).includes(query));
  }, [medications, search]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <PackageSearch className="h-5 w-5 text-primary" />
          Lista de medicamentos
        </CardTitle>
        <CardDescription>
          Lista em texto extraída do último PDF enviado pelo posto. Pesquise pelo nome ou código.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" />
            A carregar a lista…
          </div>
        ) : medications.length === 0 ? (
          <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
            Ainda não há uma lista em texto para este posto. O responsável deve enviar novamente o PDF para o sistema extrair os medicamentos.
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
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
                Não encontrámos medicamentos com essa pesquisa.
              </p>
            ) : (
              <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1" aria-label="Medicamentos encontrados">
                {filtered.map((item) => (
                  <li key={`${item.codigo}-${item.nome}`} className="rounded-lg border bg-card p-3">
                    <p className="font-semibold leading-snug">{item.nome}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>Código: {item.codigo}</span>
                      {item.unidade && <span>Unidade: {item.unidade}</span>}
                      {item.quantidade !== null && item.quantidade !== undefined && (
                        <span>Quantidade no relatório: {item.quantidade.toLocaleString("pt-BR")}{item.unidade ? ` ${item.unidade}` : ""}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationInventory;
