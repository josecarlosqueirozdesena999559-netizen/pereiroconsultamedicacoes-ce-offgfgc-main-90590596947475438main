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

// Detecta se estamos no subdomínio do app público
const isPublicAppHost = () => {
  const hostname = window.location.hostname;
  return hostname.startsWith("app.") || hostname.includes("app.consultmedpereiro");
};

// Wrapper para ocultar ChatWidget no Dashboard
const ChatWidgetWrapper = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  
  if (isDashboard) return null;
  return <ChatWidget />;
};

const queryClient = new QueryClient();

// Rotas do app público (vitrine sem login)
const PublicAppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicHome />} />
    <Route path="/ubs/:id" element={<UBSDetail />} />
    <Route path="*" element={<PublicHome />} />
  </Routes>
);

// Rotas do site administrativo (com login)
const AdminRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/medicacoes-auto-custo" element={<MedicacoesAutoCusto />} />
      <Route path="/consulta-sus" element={<ConsultaSUS />} />
      {/* Rotas públicas para teste: /app/* */}
      <Route path="/app" element={<PublicHome />} />
      <Route path="/app/ubs/:id" element={<UBSDetail />} />
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
