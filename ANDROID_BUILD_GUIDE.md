# Guia de Build - App Android (Capacitor)

Este documento contém instruções para gerar o APK/AAB do app ConsultMed Pereiro para publicação na Google Play Store.

## Pré-requisitos

- Node.js 18+
- Android Studio instalado
- JDK 17+
- Git

## Configuração Inicial

### 1. Clonar o repositório

```bash
# Via GitHub (após exportar do Lovable)
git clone https://github.com/SEU_USUARIO/consultmed-pereiro.git
cd consultmed-pereiro
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Adicionar plataforma Android

```bash
npx cap add android
```

### 4. Build do projeto web

```bash
npm run build
```

### 5. Sincronizar com Capacitor

```bash
npx cap sync android
```

## Desenvolvimento (Hot Reload)

Durante o desenvolvimento, o app abrirá diretamente o URL do Lovable Preview.
Isso permite testar mudanças em tempo real sem rebuild.

### Executar no emulador ou dispositivo

```bash
npx cap run android
```

Ou abra no Android Studio:

```bash
npx cap open android
```

## Build para Produção

### 1. Atualizar capacitor.config.ts

Para produção, remova ou comente a seção `server`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.consultmedpereiro',
  appName: 'ConsultMed Pereiro',
  webDir: 'dist',
  // Remover server para produção - o app usará os assets locais
  // server: {
  //   url: 'https://app.consultmedpereiro.com',
  //   cleartext: true
  // },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

### 2. Rebuild

```bash
npm run build
npx cap sync android
```

### 3. Gerar AAB (Android App Bundle)

Abra o projeto no Android Studio:

```bash
npx cap open android
```

No Android Studio:
1. Menu **Build** → **Generate Signed Bundle / APK**
2. Selecione **Android App Bundle**
3. Crie ou selecione sua keystore
4. Escolha a variante **release**
5. Clique em **Create**

O arquivo `.aab` será gerado em:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Configurações do App

### Ícones

Os ícones devem ser atualizados em:
- `android/app/src/main/res/mipmap-*`

Use o [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) para gerar ícones em todas as densidades.

### Splash Screen

Configure em:
- `android/app/src/main/res/drawable/splash.xml`

### Permissões

O arquivo `AndroidManifest.xml` está em:
- `android/app/src/main/AndroidManifest.xml`

Permissões padrão para este app:
- INTERNET (acesso à rede)

## Publicação na Play Store

1. Acesse o [Google Play Console](https://play.google.com/console)
2. Crie um novo app
3. Preencha as informações do app
4. Faça upload do AAB gerado
5. Configure preços e distribuição
6. Envie para revisão

## Troubleshooting

### Erro: "SDK location not found"

Crie o arquivo `android/local.properties`:
```
sdk.dir=/caminho/para/seu/Android/Sdk
```

### Erro de versão do Gradle

Atualize o Gradle wrapper:
```bash
cd android
./gradlew wrapper --gradle-version 8.0
```

### Limpar cache

```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

## Estrutura do App

```
/
├── capacitor.config.ts    # Configuração do Capacitor
├── android/               # Projeto Android (gerado)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── res/       # Recursos (ícones, splash, etc.)
│   │   └── build.gradle
│   └── build.gradle
└── dist/                  # Build do app web (gerado por npm run build)
```

## Configuração do Subdomínio

Para produção, configure o subdomínio `app.consultmedpereiro.com` apontando para o deploy do Lovable ou seu servidor de hospedagem.

O app Android usará este subdomínio quando configurado com a URL no `capacitor.config.ts`.

---

**Dúvidas?** Consulte a documentação oficial:
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Lovable Mobile Development](https://docs.lovable.dev/mobile-apps)
