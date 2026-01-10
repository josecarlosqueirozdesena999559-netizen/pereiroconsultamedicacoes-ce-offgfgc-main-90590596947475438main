import React from "react";
import { createRoot } from "react-dom/client";
import { StatusBar, Style } from '@capacitor/status-bar';
import App from "./App.tsx";
import "./index.css";

// Configuração do StatusBar para Android/iOS
StatusBar.setBackgroundColor({
  color: '#000000' // MESMA COR DO APP
});

StatusBar.setStyle({
  style: Style.Dark // ícones brancos
});

// Força reload quando o Service Worker for atualizado
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("[SW] New service worker activated, reloading page...");
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
