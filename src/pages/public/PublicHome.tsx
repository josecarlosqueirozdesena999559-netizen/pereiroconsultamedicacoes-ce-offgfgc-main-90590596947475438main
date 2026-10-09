import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Phone, Building2 } from "lucide-react";
import { usePostos } from "@/hooks/usePostos";
import { getMedicamentosExtraidos, getPDF } from "@/lib/storage";
import { extractMedicamentosFromPdf, type MedicamentoExtraido } from "@/lib/pdfMedicamentos";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { formatContactInfo } from "@/lib/contact";
import { useIsMobile } from "@/hooks/use-mobile";


const PublicHome = () => {
  const { postos, loading } = usePostos();
  const [searchTerm, setSearchTerm] = useState("");
  const [medicationsByPost, setMedicationsByPost] = useState<Record<string, MedicamentoExtraido[]>>({});
  const [loadingMedications, setLoadingMedications] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!postos.length) return;

    let active = true;
    setLoadingMedications(true);
    Promise.all(
      postos.map(async (posto) => {
        const cached = await getMedicamentosExtraidos(posto.id);
        if (cached.length > 0) return [posto.id, cached as MedicamentoExtraido[]] as const;

        try {
          const pdf = await getPDF(posto.id);
          if (!pdf?.url) return [posto.id, []] as const;
          const response = await fetch(pdf.url);
          if (!response.ok) return [posto.id, []] as const;
          const blob = await response.blob();
          const extracted = await extractMedicamentosFromPdf(
            new File([blob], "medicamentos.pdf", { type: "application/pdf" })
          );
          return [posto.id, extracted] as const;
        } catch (error) {
          console.error(`Erro ao ler medicamentos da UBS ${posto.nome}:`, error);
          return [posto.id, []] as const;
        }
      })
    )
      .then((entries) => {
        if (active) setMedicationsByPost(Object.fromEntries(entries) as Record<string, MedicamentoExtraido[]>);
      })
      .finally(() => {
        if (active) setLoadingMedications(false);
      });

    return () => {
      active = false;
    };
  }, [postos]);

  const normalizeSearch = (value: string) =>
    value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();

  const medicationResults = useMemo(() => {
    const query = normalizeSearch(searchTerm);
    if (!query) return [];

    return postos.flatMap((posto) =>
      (medicationsByPost[posto.id] || [])
        .filter((medication) => normalizeSearch(`${medication.nome} ${medication.codigo}`).includes(query))
        .map((medication) => ({ posto, medication }))
    );
  }, [postos, medicationsByPost, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-[hsl(120_75%_20%)] to-primary text-primary-foreground py-6 sm:py-10 md:py-14 safe-area-inset">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 leading-tight">
            Consulta de Medicamentos
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-95 mb-2 font-medium">
            Sistema Integrado de Saúde Pública
          </p>
          <p className="text-xs sm:text-sm md:text-base opacity-85 max-w-3xl mx-auto leading-relaxed">
            Acesse informações atualizadas sobre medicamentos disponíveis em todas as Unidades Básicas de Saúde do município de Pereiro.
          </p>
        </div>
      </section>

      {/* UBS Section */}
      <section className="flex-1 py-4 sm:py-6 md:py-10 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-4 sm:mb-6 md:mb-10">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary mb-2 sm:mb-3">
              Pesquisar medicamentos
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed">
              Digite o nome do medicamento para ver quais postos possuem o produto, a quantidade, o lote e a validade.
            </p>
            
            {/* Busca global de medicamentos */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Digite o nome do medicamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 py-2 text-sm border-2 border-primary/20 focus:border-primary"
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Digite o nome da UBS ou do medicamento para consultar todos os postos, quantidade, lote e validade.
            </p>
          </div>

          {searchTerm.trim() ? (
            <div className="mx-auto max-w-3xl">
              {loadingMedications ? (
                <Card className="border-primary/10 shadow-md">
                  <CardContent className="p-6 text-center text-sm text-muted-foreground">
                    Pesquisando medicamentos nas unidades...
                  </CardContent>
                </Card>
              ) : medicationResults.length === 0 ? (
                <Card className="border-primary/10 shadow-md">
                  <CardContent className="p-6 text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Medicamento não encontrado</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Não encontramos “{searchTerm}” nas listas das unidades.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Medicamento encontrado em {medicationResults.length} {medicationResults.length === 1 ? "posto" : "postos"}:
                  </p>
                  {medicationResults.map(({ posto, medication }) => (
                    <Link key={`${posto.id}-${medication.codigo}-${medication.nome}`} to={`/ubs/${posto.id}`}>
                      <Card className="mb-3 border-l-4 border-l-primary shadow-md transition-all hover:border-primary/30 hover:shadow-lg">
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-primary">{medication.nome}</h3>
                              <p className="mt-1 text-xs text-muted-foreground">Código: {medication.codigo}</p>
                            </div>
                            <Badge className="bg-primary hover:bg-primary/90">{posto.nome}</Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>Local: {posto.localidade}</span>
                            <span className="font-semibold text-foreground">
                              Quantidade: {medication.quantidade ?? "Não informada"}{medication.unidade ? ` ${medication.unidade}` : ""}
                            </span>
                          </div>
                          {medication.lotes?.length > 0 && (
                            <div className="mt-3 space-y-1 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground">
                              <p className="font-semibold text-primary">Lotes e validades:</p>
                              {medication.lotes.map((lote) => (
                                <p key={`${lote.lote}-${lote.validade}`}>
                                  <strong>Lote:</strong> {lote.lote} — <strong>Validade:</strong> {lote.validade}
                                  {lote.quantidade !== null && lote.quantidade !== undefined && ` — Quantidade: ${lote.quantidade} ${medication.unidade || ""}`}
                                </p>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
          /* UBS Grid */
          loading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse shadow-md border border-primary/10">
                  <CardHeader className="p-3 sm:p-4 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : postos.length === 0 ? (
            <Card className="max-w-sm mx-auto shadow-md border border-primary/10">
              <CardContent className="p-4 sm:p-6 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-1">Nenhum medicamento encontrado</h3>
                <p className="text-xs text-muted-foreground">
                  Nenhuma lista de medicamentos cadastrada no sistema.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {postos.map((posto) => (
                <Link key={posto.id} to={`/ubs/${posto.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary shadow-md border border-primary/10 hover:border-primary/30 active:scale-[0.98]">
                    <CardHeader className="p-3 sm:p-4 pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-primary leading-tight">
                          <Building2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                          <span className="line-clamp-2">{posto.nome}</span>
                        </CardTitle>
                        <Badge 
                          variant={posto.status === "aberto" ? "default" : "secondary"}
                          className={`shrink-0 text-xs ${posto.status === "aberto" ? "bg-primary hover:bg-primary/90" : ""}`}
                        >
                          {posto.status === "aberto" ? "Aberto" : "Fechado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                        <span className="line-clamp-1">{posto.localidade}</span>
                      </div>
                      {posto.horario_funcionamento && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                          <span className="line-clamp-1">{posto.horario_funcionamento}</span>
                        </div>
                      )}
                      {posto.contato && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                          <span className="line-clamp-1">{formatContactInfo(posto.contato)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-4 sm:py-6 md:py-10 bg-card">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="shadow-md border border-primary/10">
              <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-3 sm:p-4 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl text-primary mb-1">
                  Como Utilizar o Sistema
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Processo simples e rápido para consultar medicamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                  <div className="text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm sm:text-base">1</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-primary">Localizar UBS</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Encontre a unidade mais próxima usando a busca
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm sm:text-base">2</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-primary">Acessar Detalhes</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Clique na UBS para ver horários e informações
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm sm:text-base">3</span>
                    </div>
                    <h3 className="font-bold text-sm mb-1 text-primary">Consultar Medicamentos</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Visualize a lista atualizada de medicamentos
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 text-center p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-primary">Dica:</strong> Verifique a data da última atualização antes de se dirigir à unidade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default PublicHome;
