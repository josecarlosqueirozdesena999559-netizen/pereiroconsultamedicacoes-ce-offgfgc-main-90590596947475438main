import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Phone, Building2 } from "lucide-react";
import { usePostos } from "@/hooks/usePostos";
import PublicHeader from "@/components/PublicHeader";
import PublicChatWidget from "@/components/PublicChatWidget";

const PublicHome = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith("/app");
  const ubsBasePath = isAppRoute ? "/app/ubs" : "/ubs";
  const { postos, loading } = usePostos();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPostos = useMemo(() => {
    if (!postos) return [];
    return postos.filter(
      (posto) =>
        posto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        posto.localidade.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [postos, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Consulta de Medicamentos
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Encontre medicamentos disponíveis nas Unidades Básicas de Saúde de Pereiro.
            Selecione uma UBS para ver os medicamentos disponíveis.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nome ou localidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* UBS Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPostos.map((posto) => (
              <Link key={posto.id} to={`${ubsBasePath}/${posto.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {posto.nome}
                      </CardTitle>
                      <Badge variant={posto.status === "aberto" ? "default" : "secondary"}>
                        {posto.status === "aberto" ? "Aberto" : "Fechado"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{posto.localidade}</span>
                    </div>
                    {posto.horario_funcionamento && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{posto.horario_funcionamento}</span>
                      </div>
                    )}
                    {posto.contato && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{posto.contato}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredPostos.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma unidade encontrada com "{searchTerm}"
            </p>
          </div>
        )}
      </main>

      <PublicChatWidget />
    </div>
  );
};

export default PublicHome;
