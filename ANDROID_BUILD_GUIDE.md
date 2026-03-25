# Guia de Build - App Android (Capacitor)

Este documento traz as instrucoes para gerar o APK ou AAB do app **ConsultMed Pereiro** para distribuicao e publicacao na Google Play Store.

## Arquitetura do app

O app Android funciona como um wrapper nativo que carrega a vitrine publica em `https://app.consultmedpereiro.com`.

Caracteristicas:

- Atualizacoes automaticas sem rebuild do APK
- Somente leitura para consulta de UBS e medicamentos
- Sem login necessario
- Funciona offline via cache do WebView

Importante: o dominio `www.consultmedpereiro.com` continua funcionando como painel administrativo com login.

## Pre-requisitos

- Node.js 18+
- Android Studio
- JDK 17+
- Git

## Configuracao inicial

### 1. Clonar o repositorio

```bash
git clone https://github.com/SEU_USUARIO/consultmed-pereiro.git
cd consultmed-pereiro
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Adicionar plataforma Android

```bash
npx cap add android
```

### 4. Gerar build web

```bash
npm run build
```

### 5. Sincronizar com o Capacitor

```bash
npx cap sync android
```

## Desenvolvimento

Para executar no emulador ou dispositivo:

```bash
npx cap run android
```

Para abrir no Android Studio:

```bash
npx cap open android
```

## Modos de operacao

### Modo 1: app conectado

O `capacitor.config.ts` pode carregar a URL publica:

```typescript
server: {
  url: 'https://app.consultmedpereiro.com',
  cleartext: true
}
```

Vantagens:

- Atualizacoes instantaneas sem rebuild
- Menor tamanho do APK
- Dados sempre atualizados

Desvantagem:

- Requer conexao com internet

### Modo 2: app offline

Para distribuir com assets locais, comente a secao `server` e rode:

```bash
npm run build
npx cap sync android
```

## Build para producao

### Gerar AAB

```bash
npx cap open android
```

No Android Studio:

1. Menu **Build** -> **Generate Signed Bundle / APK**
2. Selecione **Android App Bundle**
3. Crie ou selecione sua keystore
4. Escolha a variante **release**
5. Clique em **Create**

Saida esperada:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

### Gerar APK para testes

```bash
cd android
./gradlew assembleRelease
```

Saida esperada:

```text
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Configuracoes visuais

### Icones

Atualize os icones em:

- `android/app/src/main/res/mipmap-*`

Uma opcao pratica para gerar os tamanhos necessarios:

- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)

### Splash Screen

Configurado em `capacitor.config.ts`:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#1a5f2a",
    showSpinner: false,
    androidScaleType: "CENTER_CROP"
  }
}
```

### Status Bar

```typescript
StatusBar: {
  backgroundColor: "#1a5f2a",
  style: "LIGHT"
}
```

## Publicacao na Play Store

1. Acesse o Google Play Console.
2. Crie um novo app.
3. Preencha nome, categoria e descricao.
4. Faca upload do AAB.
5. Configure precos e politica de privacidade.
6. Envie para revisao.

## Troubleshooting

### SDK location not found

Crie o arquivo `android/local.properties`:

```text
sdk.dir=/caminho/para/seu/Android/Sdk
```

### Erro de versao do Gradle

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

### App nao carrega a URL

1. Verifique se `app.consultmedpereiro.com` esta acessivel.
2. Confira a configuracao `cleartext`.
3. Valide a conexao de internet do dispositivo.

## Estrutura do projeto

```text
/
|-- capacitor.config.ts
|-- android/
|   |-- app/
|   |   |-- src/main/
|   |   |   |-- AndroidManifest.xml
|   |   |   `-- res/
|   |   `-- build.gradle
|   `-- build.gradle
`-- dist/
```

## Subdominios

| Dominio | Funcao |
|---------|--------|
| `app.consultmedpereiro.com` | Vitrine publica |
| `www.consultmedpereiro.com` | Painel administrativo |

## Referencias

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio)
