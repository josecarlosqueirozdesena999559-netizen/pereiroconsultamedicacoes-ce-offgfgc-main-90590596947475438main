import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import SplashScreen from "./components/SplashScreen";

// Lazy load para separação completa
const Index = React.lazy(() => import("./pages/Index"));
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const MedicacoesAutoCusto = React.lazy(() => import("./pages/MedicacoesAutoCusto"));
const ConsultaSUS = React.lazy(() => import("./pages/ConsultaSUS"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const PWAInstallPrompt = React.lazy(() => import("./components/PWAInstallPrompt"));
const ChatWidget = React.lazy(() => import("./components/ChatWidget").then(m => ({ default: m.ChatWidget })));

// Public app pages - carregados apenas no subdomínio app.
const PublicHome = React.lazy(() => import("./pages/public/PublicHome"));
const UBSDetail = React.lazy(() => import("./pages/public/UBSDetail"));

/**
 * Detecta se estamos no subdomínio do app público (app.consultmedpereiro.com)
 * Retorna TRUE apenas para hosts que começam com "app."
 */
const isPublicAppHost = (): boolean => {
  const hostname = window.location.hostname;
  return hostname.startsWith("app.");
};

const queryClient = new QueryClient();

/**
 * APP PÚBLICO - Vitrine somente leitura
 * Renderizado APENAS quando hostname começa com "app."
 * SEM AuthProvider, SEM guards, SEM rotas admin
 */
const PublicApp = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/ubs/:id" element={<UBSDetail />} />
            <Route path="*" element={<PublicHome />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Wrapper para ocultar ChatWidget no Dashboard (apenas admin)
const ChatWidgetWrapper = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  if (isDashboard) return null;
  return (
    <React.Suspense fallback={null}>
      <ChatWidget />
    </React.Suspense>
  );
};

/**
 * APP ADMIN - Site com login
 * Renderizado para www, domínio raiz, localhost, etc.
 * Mantém comportamento original com AuthProvider
 */
const AdminApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
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
            </React.Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

/**
 * DECISÃO DE RENDERIZAÇÃO POR HOST
 * app.* => PublicApp (vitrine pública) com splash screen
 * qualquer outro => AdminApp (site admin) sem splash
 */
const App = () => {
  const isPublic = isPublicAppHost();
  const [showSplash, setShowSplash] = useState(isPublic);
  console.log('[ConsultMed] Host:', window.location.hostname, '| Modo:', isPublic ? 'PÚBLICO' : 'ADMIN');

  if (showSplash && isPublic) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  if (isPublic) {
    return <PublicApp />;
  }
  return <AdminApp />;
};

export default App;
