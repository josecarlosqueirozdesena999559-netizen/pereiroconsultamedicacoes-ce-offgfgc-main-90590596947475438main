import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MapPin, ChevronDown, Pill, Phone, MapPin as LocationIcon } from 'lucide-react';
import Header from '@/components/Header';
import UBSCard from '@/components/UBSCard';
import { UBS } from '@/types';
import { getUBS, getMedicamentosExtraidos, getPDF, initializeStorage } from '@/lib/storage';
import { extractMedicamentosFromPdf, MedicamentoExtraido } from '@/lib/pdfMedicamentos';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [ubsList, setUbsList] = useState<UBS[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicationsByPost, setMedicationsByPost] = useState<Record<string, MedicamentoExtraido[]>>({});
  const [loadingMedications, setLoadingMedications] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    initializeStorage();
    loadUBS();
  }, []);

  useEffect(() => {
    if (!ubsList.length) return;
    let active = true;
    setLoadingMedications(true);

    Promise.all(ubsList.map(async (ubs) => {
      const cached = await getMedicamentosExtraidos(ubs.id);
      if (cached.length > 0) return [ubs.id, cached as MedicamentoExtraido[]] as const;
      try {
        const pdf = await getPDF(ubs.id);
        if (!pdf?.url) return [ubs.id, []] as const;
        const response = await fetch(pdf.url);
        if (!response.ok) return [ubs.id, []] as const;
        const blob = await response.blob();
        const extracted = await extractMedicamentosFromPdf(new File([blob], 'medicamentos.pdf', { type: 'application/pdf' }));
        return [ubs.id, extracted] as const;
      } catch (error) {
        console.error(`Erro ao ler medicamentos da UBS ${ubs.nome}:`, error);
        return [ubs.id, []] as const;
      }
    })).then((entries) => {
      if (active) setMedicationsByPost(Object.fromEntries(entries) as Record<string, MedicamentoExtraido[]>);
    }).finally(() => {
      if (active) setLoadingMedications(false);
    });

    return () => { active = false; };
  }, [ubsList]);

  const loadUBS = async () => {
    try {
      const data = await getUBS();
      setUbsList(data);
    } catch (error) {
      console.error('Erro ao carregar UBS:', error);
    }
  };

  const medicationResults = useMemo(() => {
    const query = searchTerm.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
    if (!query) return [];
    return ubsList.flatMap((ubs) => (medicationsByPost[ubs.id] || [])
      .filter((medication) => `${medication.nome} ${medication.codigo}`
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').includes(query))
      .map((medication) => ({ ubs, medication })));
  }, [ubsList, medicationsByPost, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-[hsl(120_75%_25%)] to-primary text-primary-foreground py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            Consulta de Medicamentos
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-95 mb-2 sm:mb-3 font-medium">
            Sistema Integrado de Saúde Pública
          </p>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-85 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4">
            Acesse informações atualizadas sobre medicamentos disponíveis em todas as Unidades Básicas de Saúde do município de Pereiro. Sistema oficial da Prefeitura Municipal para garantir transparência e facilitar o acesso aos serviços de saúde.
          </p>
        </div>
      </section>

      {/* UBS Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-3 sm:mb-4">
              Pesquisar medicamentos
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 leading-relaxed px-2 sm:px-4">
              Digite o nome do medicamento para ver quais postos possuem o produto, a quantidade, o lote e a validade.
            </p>
            
            <div className="max-w-lg mx-auto relative px-2 sm:px-4">
              <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                type="search"
                placeholder="Digite o nome do medicamento..."
                aria-label="Digite o nome do medicamento"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 py-2 sm:py-3 text-sm border-2 border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {searchTerm.trim() ? (
            <div className="mx-auto max-w-4xl">
              {loadingMedications ? (
                <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Pesquisando medicamentos nas unidades...</CardContent></Card>
              ) : medicationResults.length === 0 ? (
                <Card><CardContent className="p-6 text-center"><h3 className="text-sm font-semibold">Medicamento não encontrado</h3><p className="mt-1 text-xs text-muted-foreground">Não encontramos “{searchTerm}” nas listas das unidades.</p></CardContent></Card>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Encontrado em {medicationResults.length} {medicationResults.length === 1 ? 'posto' : 'postos'}:</p>
                  {medicationResults.map(({ ubs, medication }) => (
                    <Card key={`${ubs.id}-${medication.codigo}-${medication.nome}`} className="border-l-4 border-l-primary shadow-md">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div><h3 className="font-semibold text-primary">{medication.nome}</h3><p className="mt-1 text-xs text-muted-foreground">Código: {medication.codigo}</p></div>
                          <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">{ubs.nome}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>Quantidade: <strong className="text-foreground">{medication.quantidade ?? 'Não informada'}{medication.unidade ? ` ${medication.unidade}` : ''}</strong></span>
                        </div>
                        {medication.lotes?.length > 0 && <div className="mt-3 space-y-1 rounded-md bg-muted/40 p-2 text-xs text-muted-foreground"><p className="font-semibold text-primary">Lotes e validades:</p>{medication.lotes.map((lote) => <p key={`${lote.lote}-${lote.validade}`}><strong>Lote:</strong> {lote.lote} — <strong>Validade:</strong> {lote.validade}{lote.quantidade !== null && lote.quantidade !== undefined ? ` — Quantidade: ${lote.quantidade} ${medication.unidade || ''}` : ''}</p>)}</div>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : ubsList.length === 0 ? (
            <Card className="max-w-md mx-auto mx-4">
              <CardContent className="p-4 sm:p-6 text-center">
                <MapPin className="h-8 sm:h-10 w-8 sm:w-10 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                <h3 className="text-sm sm:text-base font-semibold mb-2">Nenhum medicamento encontrado</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Nenhuma lista de medicamentos cadastrada no sistema.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {ubsList.map((ubs) => (
                <UBSCard key={ubs.id} ubs={ubs} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-lg border border-primary/10">
              <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-primary/10 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl md:text-2xl text-primary mb-2">
                  Como Utilizar o Sistema
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm md:text-base text-muted-foreground">
                  Processo simples e rápido para consultar medicamentos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg">1</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2 text-primary">Localizar UBS</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Encontre a unidade de saúde mais próxima usando nossa busca por localidade ou nome da UBS
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg">2</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2 text-primary">Acessar Lista</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Baixe o PDF atualizado clicando no botão de download ou escaneie o QR Code com seu smartphone
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg">3</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2 text-primary">Consultar Medicamentos</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Visualize a lista completa e sempre atualizada de todos os medicamentos disponíveis na unidade escolhida
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 text-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-1 text-sm">Informação Importante</h4>
                  <p className="text-xs text-muted-foreground">
                    As listas são atualizadas regularmente pelas equipes das UBS. Recomendamos sempre verificar a data da última atualização antes de se dirigir à unidade.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
