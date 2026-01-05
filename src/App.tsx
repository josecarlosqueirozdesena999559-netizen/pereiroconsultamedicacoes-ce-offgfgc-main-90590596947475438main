import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MedicacoesAutoCusto from "./pages/MedicacoesAutoCusto";
import ConsultaSUS from "./pages/ConsultaSUS";
import NotFound from "./pages/NotFound";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { AuthProvider } from "./hooks/useAuth";
import { ChatWidget } from "./components/ChatWidget";

// Public app pages
import PublicHome from "./pages/public/PublicHome";
import UBSDetail from "./pages/public/UBSDetail";

/**
 * Detecta se estamos no subdomínio do app público (app.consultmedpereiro.com)
 * Retorna TRUE apenas para hosts que começam com "app."
 * O domínio www.consultmedpereiro.com NÃO é afetado - continua com rotas admin
 */
const isPublicAppHost = (): boolean => {
  const hostname = window.location.hostname;
  // Apenas hosts que começam com "app." são tratados como app público
  return hostname.startsWith("app.");
};

// Wrapper para ocultar ChatWidget no Dashboard
const ChatWidgetWrapper = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  if (isDashboard) return null;
  return <ChatWidget />;
};

const queryClient = new QueryClient();

/**
 * Rotas do app público (vitrine sem login)
 * Acessíveis APENAS via app.consultmedpereiro.com
 * Somente leitura - sem endpoints de escrita
 */
const PublicAppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicHome />} />
    <Route path="/ubs/:id" element={<UBSDetail />} />
    <Route path="*" element={<PublicHome />} />
  </Routes>
);

/**
 * Rotas do site administrativo (com login)
 * Acessíveis via www.consultmedpereiro.com
 * Mantém comportamento original - NÃO alterado
 */
const AdminRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/medicacoes-auto-custo" element={<MedicacoesAutoCusto />} />
      <Route path="/consulta-sus" element={<ConsultaSUS />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <PWAInstallPrompt />
    <ChatWidgetWrapper />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          {isPublicAppHost() ? <PublicAppRoutes /> : <AdminRoutes />}
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
