import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  FileText, 
  Download,
  ExternalLink,
  Calendar,
  Building2,
  Loader2
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import { NotificationPreferences } from "@/components/NotificationPreferences";
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

const UBSDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  const [posto, setPosto] = useState<Posto | null>(null);
  const [arquivo, setArquivo] = useState<ArquivoPDF | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

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
                {/* Mobile: Show action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={arquivo.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                    <Button className="w-full sm:w-auto" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visualizar PDF
                    </Button>
                  </a>
                  <a href={arquivo.url} download className="flex-1 sm:flex-none">
                    <Button className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </a>
                </div>

                {/* Mobile: Info card */}
                <div className="md:hidden bg-muted/50 rounded-lg p-4 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Toque em "Visualizar PDF" para abrir o relatório completo de medicamentos em uma nova aba.
                  </p>
                </div>
                
                {/* Desktop: PDF Embed */}
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

        {/* Notification Preferences Widget */}
        <NotificationPreferences />
      </main>

      <PublicChatWidget />
    </div>
  );
};

export default UBSDetail;
