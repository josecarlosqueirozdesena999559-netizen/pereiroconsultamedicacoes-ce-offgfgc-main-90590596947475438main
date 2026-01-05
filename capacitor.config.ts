import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.consultmedpereiro.app',
  appName: 'ConsultMed Pereiro',
  webDir: 'dist',
  // Para desenvolvimento: hot-reload via preview do Lovable
  // Para produção: comente esta seção e use os assets locais
  server: {
    url: 'https://app.consultmedpereiro.com',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a5f2a",
      showSpinner: false
    }
  }
};

export default config;
