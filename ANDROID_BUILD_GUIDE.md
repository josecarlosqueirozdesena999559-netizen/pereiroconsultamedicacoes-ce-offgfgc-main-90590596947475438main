# Guia de Build - App Android (Capacitor)

Este documento contém instruções para gerar o APK/AAB do app **ConsultMed Pereiro** para publicação na Google Play Store.

## Arquitetura do App

O app Android funciona como um "wrapper" nativo que carrega a vitrine pública em `https://app.consultmedpereiro.com`.

**Características:**
- ✅ Atualizações automáticas sem rebuild do APK
- ✅ Somente leitura (consulta de UBS e medicamentos)
- ✅ Sem login necessário
- ✅ Funciona offline via cache do WebView

**Importante:** O domínio `www.consultmedpereiro.com` NÃO é afetado. Ele continua funcionando como painel administrativo com login.

---

## Pré-requisitos

- Node.js 18+
- Android Studio instalado (Arctic Fox ou superior)
- JDK 17+
- Git

---

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

---

## Desenvolvimento (Hot Reload)

O app está configurado para carregar `https://app.consultmedpereiro.com` diretamente.
Mudanças no código refletem automaticamente no app sem rebuild.

### Executar no emulador ou dispositivo

```bash
npx cap run android
```

Ou abra no Android Studio:

```bash
npx cap open android
```

---

## Modos de Operação

### Modo 1: App Conectado (Recomendado para Produção)

O `capacitor.config.ts` está configurado para carregar a URL pública:

```typescript
server: {
  url: 'https://app.consultmedpereiro.com',
  cleartext: true
}
```

**Vantagens:**
- Atualizações instantâneas sem rebuild
- Menor tamanho do APK
- Dados sempre atualizados

**Desvantagem:**
- Requer conexão com internet

### Modo 2: App Offline (Assets Locais)

Para distribuição offline, comente a seção `server`:

```typescript
// server: {
//   url: 'https://app.consultmedpereiro.com',
//   cleartext: true
// },
```

Depois:

```bash
npm run build
npx cap sync android
```

---

## Build para Produção (Google Play)

### 1. Gerar AAB (Android App Bundle)

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

### 2. Gerar APK (para testes)

Para gerar um APK para testes (não para Play Store):

```bash
cd android
./gradlew assembleRelease
```

O APK estará em:
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## Configurações do App

### Ícones

Os ícones devem ser atualizados em:
- `android/app/src/main/res/mipmap-*`

Use o [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/) para gerar ícones em todas as densidades.

### Splash Screen

Configurado em `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#1a5f2a",  // Verde institucional
    showSpinner: false,
    androidScaleType: "CENTER_CROP"
  }
}
```

### Cores da Status Bar

```typescript
StatusBar: {
  backgroundColor: "#1a5f2a",
  style: "LIGHT"
}
```

---

## Publicação na Play Store

1. Acesse o [Google Play Console](https://play.google.com/console)
2. Crie um novo app
3. Preencha as informações:
   - **Nome:** ConsultMed Pereiro
   - **Categoria:** Saúde e Fitness > Médico
   - **Descrição curta:** Consulte medicamentos nas UBS de Pereiro
4. Faça upload do AAB gerado
5. Configure preços (Gratuito)
6. Preencha a política de privacidade
7. Envie para revisão

---

## Troubleshooting

### Erro: "SDK location not found"

Crie o arquivo `android/local.properties`:
```
sdk.dir=/caminho/para/seu/Android/Sdk
```

### Erro de versão do Gradle

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

### App não carrega a URL

1. Verifique se `app.consultmedpereiro.com` está acessível
2. Certifique-se que `cleartext: true` está no config
3. Verifique a conexão de internet do dispositivo

---

## Estrutura do Projeto

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

---

## Subdomínios

| Domínio | Função |
|---------|--------|
| `app.consultmedpereiro.com` | Vitrine pública (somente leitura) |
| `www.consultmedpereiro.com` | Painel administrativo (com login) |

---

## Dúvidas?

Consulte a documentação oficial:
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Lovable Mobile Development](https://docs.lovable.dev/mobile-apps)
- [Android Studio Guide](https://developer.android.com/studio)
