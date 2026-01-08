import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export function useStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupStatusBar = async () => {
      try {
        // Cor primária do app: HSL 120 90% 15% = verde escuro (#042f04 aproximadamente)
        await StatusBar.setBackgroundColor({ color: '#042f04' });
        await StatusBar.setStyle({ style: Style.Dark }); // Ícones claros no fundo escuro
      } catch (error) {
        console.error('Erro ao configurar StatusBar:', error);
      }
    };

    setupStatusBar();
  }, []);
}
