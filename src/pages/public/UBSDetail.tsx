import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  Download,
  Search,
  Pill,
  Calendar,
  Building2,
  Loader2
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicChatWidget from "@/components/PublicChatWidget";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Posto {
  id: string;
  nome: string;
  localidade: string;
  horario_funcionamento: string;
  contato: string | null;
  status: string;
  atualizado_em: string | null;
}

interface ArquivoPDF {
  id: string;
  url: string;
  data_upload: string | null;
}

interface Medicamento {
  id: string;
  nome: string;
  quantidade: string | null;
  marcas: string[] | null;
}

const UBSDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const [posto, setPosto] = useState<Posto | null>(null);
  const [arquivo, setArquivo] = useState<ArquivoPDF | null>(null);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [searchMed, setSearchMed] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMeds, setIsLoadingMeds] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      // Fetch posto
      const { data: postoData } = await supabase
        .from("postos")
        .select("*")
        .eq("id", id)
        .single();
      
      if (postoData) {
        setPosto(postoData);
      }

      // Fetch latest PDF
      const { data: arquivoData } = await supabase
        .from("arquivos_pdf")
        .select("id, url, data_upload")
        .eq("posto_id", id)
        .order("data_upload", { ascending: false })
        .limit(1)
        .single();
      
      if (arquivoData) {
        setArquivo(arquivoData);
      }

      // Fetch medicamentos
      setIsLoadingMeds(true);
      const { data: medsData } = await supabase
        .from("medicamentos")
        .select("id, nome, quantidade, marcas")
        .eq("posto_id", id)
        .order("nome");
      
      if (medsData) {
        setMedicamentos(medsData);
      }
      setIsLoadingMeds(false);
      
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const filteredMedicamentos = medicamentos.filter((med) =>
    med.nome.toLowerCase().includes(searchMed.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader showBack />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!posto) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader showBack />
        <div className="container mx-auto px-4 py-12 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">UBS não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A unidade de saúde solicitada não existe ou foi removida.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PublicHeader showBack />
      
      <main className="container mx-auto px-4 py-6">
        {/* UBS Info Card */}
        <Card className="mb-6 border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  {posto.nome}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  {posto.localidade}
                </CardDescription>
              </div>
              <Badge variant={posto.status === "aberto" ? "default" : "secondary"} className="text-sm">
                {posto.status === "aberto" ? "Aberto" : "Fechado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posto.horario_funcionamento && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{posto.horario_funcionamento}</span>
              </div>
            )}
            {posto.contato && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{posto.contato}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Relatório de Medicamentos
            </CardTitle>
            {arquivo?.data_upload && (
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Última atualização: {format(new Date(arquivo.data_upload), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {arquivo ? (
              <div className="space-y-4">
                <a href={arquivo.url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF de Medicamentos
                  </Button>
                </a>
                
                {/* PDF Embed for desktop */}
                <div className="hidden md:block">
                  <iframe
                    src={arquivo.url}
                    className="w-full h-[500px] rounded-lg border"
                    title="PDF de Medicamentos"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum relatório disponível para esta unidade.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medicamentos Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medicamentos Disponíveis
            </CardTitle>
            <CardDescription>
              {medicamentos.length} medicamento(s) cadastrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar medicamento..."
                value={searchMed}
                onChange={(e) => setSearchMed(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoadingMeds ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredMedicamentos.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredMedicamentos.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{med.nome}</p>
                      {med.marcas && med.marcas.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Marcas: {med.marcas.join(", ")}
                        </p>
                      )}
                    </div>
                    {med.quantidade && (
                      <Badge variant="outline" className="ml-2">
                        Qtd: {med.quantidade}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>
                  {searchMed
                    ? `Nenhum medicamento encontrado para "${searchMed}"`
                    : "Nenhum medicamento cadastrado"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <PublicChatWidget postoId={id} postoNome={posto.nome} />
    </div>
  );
};

export default UBSDetail;
