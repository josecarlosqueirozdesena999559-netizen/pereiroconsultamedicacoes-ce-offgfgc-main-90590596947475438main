import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Phone, Building2 } from "lucide-react";
import { usePostos } from "@/hooks/usePostos";
import PublicHeader from "@/components/PublicHeader";
import { ChatWidget } from "@/components/ChatWidget";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationPreferences } from "@/components/NotificationPreferences";

const PublicHome = () => {
  const { postos, loading } = usePostos();
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const filteredPostos = useMemo(() => {
    if (!postos) return [];
    return postos.filter(
      (posto) =>
        posto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        posto.localidade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [postos, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <PublicHeader />
      
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
              Nossas Unidades Básicas de Saúde
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-4 sm:mb-6 leading-relaxed px-2 sm:px-4">
              Encontre a UBS mais próxima de você e acesse informações detalhadas sobre horários, responsáveis e listas atualizadas de medicamentos disponíveis.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative px-2 sm:px-4">
              <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
              <Input
                type="text"
                placeholder="Buscar UBS, localidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 sm:pl-12 py-2 sm:py-3 text-sm border-2 border-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* UBS Grid */}
          {loading ? (
            <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse shadow-lg border border-primary/10">
                  <CardHeader className="space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPostos.length === 0 ? (
            <Card className="max-w-md mx-auto shadow-lg border border-primary/10">
              <CardContent className="p-4 sm:p-6 text-center">
                <Building2 className="h-8 sm:h-10 w-8 sm:w-10 text-muted-foreground mx-auto mb-2 sm:mb-3" />
                <h3 className="text-sm sm:text-base font-semibold mb-2">Nenhuma UBS encontrada</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {searchTerm ? `Nenhuma unidade encontrada com "${searchTerm}"` : 'Nenhuma UBS cadastrada no sistema'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {filteredPostos.map((posto) => (
                <Link key={posto.id} to={`/ubs/${posto.id}`}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-primary shadow-lg border border-primary/10 hover:border-primary/30 hover:-translate-y-1">
                    <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex items-center gap-2 text-primary">
                          <Building2 className="h-5 w-5" />
                          {posto.nome}
                        </CardTitle>
                        <Badge 
                          variant={posto.status === "aberto" ? "default" : "secondary"}
                          className={posto.status === "aberto" ? "bg-primary hover:bg-primary/90" : ""}
                        >
                          {posto.status === "aberto" ? "Aberto" : "Fechado"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary/70" />
                        <span>{posto.localidade}</span>
                      </div>
                      {posto.horario_funcionamento && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary/70" />
                          <span>{posto.horario_funcionamento}</span>
                        </div>
                      )}
                      {posto.contato && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 text-primary/70" />
                          <span>{posto.contato}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Notification Preferences Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <NotificationPreferences />
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-6 sm:py-8 md:py-12 bg-card">
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
                      <span className="text-primary-foreground font-bold text-base sm:text-lg">1</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2 text-primary">Localizar UBS</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Encontre a unidade de saúde mais próxima usando nossa busca por localidade ou nome da UBS
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-base sm:text-lg">2</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base mb-2 text-primary">Acessar Detalhes</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Clique na UBS desejada para ver informações completas sobre horários e medicamentos disponíveis
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-primary to-[hsl(120_75%_25%)] rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-base sm:text-lg">3</span>
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

      <ChatWidget />
    </div>
  );
};

export default PublicHome;
