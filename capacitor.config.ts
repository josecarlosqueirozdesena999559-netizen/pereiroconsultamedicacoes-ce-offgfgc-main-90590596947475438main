import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.consultmedpereiro.app',
  appName: 'ConsultMed Pereiro',
  webDir: 'dist',
  /**
   * Configuração do servidor para o app Android
   * O app abre diretamente a URL pública app.consultmedpereiro.com
   * Isso permite atualizações em tempo real sem rebuild do APK
   */
  server: {
    url: 'https://app.consultmedpereiro.com',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    // Configurações de WebView
    webContentsDebuggingEnabled: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a5f2a",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    },
    StatusBar: {
      backgroundColor: "#1a5f2a",
      style: "LIGHT"
    }
  }
};

export default config;
