# Mongo e Drongo — Corrida Maluca

Jogo HTML autocontido (todos os recursos embutidos em base64, sem dependências externas), hospedado no **GitHub Pages**.

🎮 **Jogar:** https://oliverbill.github.io/MongoDringo/

## Arquivos

- `index.html` — o jogo completo
- `icon.png` — ícone 180×180 (usado no manifest e como `apple-touch-icon`)
- `manifest.webmanifest` — manifesto PWA (Android / navegadores compatíveis)
- `.github/workflows/deploy.yml` — deploy automático para o GitHub Pages
- `.github/workflows/tests.yml` — testes de regressão (CI)
- `tests/game.spec.js` — testes de regressão (Playwright)

## Testes de regressão

Testes end-to-end (Playwright) que abrem o jogo num navegador headless e verificam:

- smoke: carrega no menu sem erros de JS;
- vida infinita sempre habilitada (liga/desliga sem mortes);
- controles de jogo (pause/menu) aparecem só durante a partida;
- pause congela a simulação e mostra a tela de pausa;
- continuar retoma a partida;
- botão menu volta à tela inicial;
- atalhos de teclado P (pausa) e Esc (retoma);
- entrada de jogo ignorada enquanto pausado.

Rodar localmente:

```bash
npm install
npx playwright install chromium   # baixa o navegador do Playwright
npm test
```

Rodam automaticamente no CI a cada push na `main` e em cada pull request.

## Publicação (GitHub Pages)

O deploy é automático via GitHub Actions a cada push na branch `main`.

**Ativação (uma vez só):** em **Settings → Pages**, defina **Build and deployment → Source = "GitHub Actions"**.

## Adicionar à tela inicial do iPhone

O jogo já inclui as meta tags do iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-title` = "Corrida Maluca" e `apple-touch-icon`), então basta:

1. Abra a URL acima no **Safari** (o "Adicionar à Tela de Início" só funciona no Safari).
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Selecione **Adicionar à Tela de Início**.
4. Confirme — o atalho aparece com o nome **"Corrida Maluca"** e o ícone do jogo, abrindo em tela cheia (sem a barra do navegador).
