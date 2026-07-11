const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

// The game is a single self-contained file; load it directly via file://
const GAME_URL = pathToFileURL(path.join(__dirname, "..", "index.html")).href;

let pageErrors;

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") pageErrors.push("console: " + m.text());
  });
  // Start from a clean save so state (deaths/infinite/best) is deterministic
  await page.addInitScript(() => {
    try {
      localStorage.clear();
    } catch (e) {}
  });
  await page.goto(GAME_URL);
  await page.waitForFunction(() => typeof S !== "undefined" && S.mode === "menu");
});

async function startGame(page) {
  await page.click("#btnStart");
  await page.waitForFunction(() => S.mode === "run");
}

test("smoke: carrega no menu sem erros de JS", async ({ page }) => {
  await expect(page).toHaveTitle("Mongo e Drongo — Corrida Maluca");
  await expect(page.locator("#menu")).toBeVisible();
  // Controles de jogo escondidos no menu
  await expect(page.locator("#gameControls")).toBeHidden();
  await expect(page.locator("#pauseOverlay")).toBeHidden();
  expect(pageErrors).toEqual([]);
});

test("vida infinita: sempre habilitada e alterna ON/OFF sem mortes", async ({ page }) => {
  // Save novo => 0 mortes
  expect(await page.evaluate(() => SAVE.data.deaths || 0)).toBe(0);

  const btn = page.locator("#btnInfinite");
  await expect(btn).toBeVisible();
  // Sem cadeado, opacidade cheia e texto de toggle
  await expect(btn).toHaveText(/Vida ∞: OFF/);
  expect(await btn.evaluate((el) => el.style.opacity)).toBe("1");
  expect(await page.evaluate(() => !!SAVE.data.infinite)).toBe(false);

  // Liga
  await btn.click();
  expect(await page.evaluate(() => !!SAVE.data.infinite)).toBe(true);
  await expect(btn).toHaveText(/Vida ∞: ON/);

  // Desliga
  await btn.click();
  expect(await page.evaluate(() => !!SAVE.data.infinite)).toBe(false);
  await expect(btn).toHaveText(/Vida ∞: OFF/);

  expect(pageErrors).toEqual([]);
});

test("controles de jogo aparecem só durante a partida", async ({ page }) => {
  await expect(page.locator("#gameControls")).toBeHidden();
  await startGame(page);
  await expect(page.locator("#gameControls")).toBeVisible();
  await expect(page.locator("#btnPause")).toBeVisible();
  await expect(page.locator("#btnHome")).toBeVisible();
});

test("pause congela o jogo e mostra a tela de pausa", async ({ page }) => {
  await startGame(page);
  await page.click("#btnPause");

  expect(await page.evaluate(() => S.paused)).toBe(true);
  await expect(page.locator("#pauseOverlay")).toBeVisible();
  await expect(page.locator("#gameControls")).toBeHidden();

  // Simulação congelada: S.t não avança enquanto pausado
  const t1 = await page.evaluate(() => S.t);
  await page.waitForTimeout(350);
  const t2 = await page.evaluate(() => S.t);
  expect(t2).toBe(t1);
});

test("continuar retoma a partida", async ({ page }) => {
  await startGame(page);
  await page.click("#btnPause");
  await page.click("#btnResume");

  expect(await page.evaluate(() => S.paused)).toBe(false);
  await expect(page.locator("#pauseOverlay")).toBeHidden();
  await expect(page.locator("#gameControls")).toBeVisible();

  // Simulação voltou a rodar: S.t avança
  const t3 = await page.evaluate(() => S.t);
  await page.waitForTimeout(300);
  const t4 = await page.evaluate(() => S.t);
  expect(t4).toBeGreaterThan(t3);
});

test("botão menu volta para a tela inicial durante o jogo", async ({ page }) => {
  await startGame(page);
  await page.click("#btnHome");

  await page.waitForFunction(() => S.mode === "menu");
  await expect(page.locator("#menu")).toBeVisible();
  await expect(page.locator("#gameControls")).toBeHidden();
});

test("teclado: P pausa e Esc retoma", async ({ page }) => {
  await startGame(page);

  await page.keyboard.press("KeyP");
  await page.waitForFunction(() => S.paused === true);
  expect(await page.evaluate(() => S.paused)).toBe(true);

  await page.keyboard.press("Escape");
  await page.waitForFunction(() => S.paused === false);
  expect(await page.evaluate(() => S.paused)).toBe(false);
});

test("entrada de jogo é ignorada enquanto pausado", async ({ page }) => {
  await startGame(page);
  await page.click("#btnPause");

  const laneBefore = await page.evaluate(() => S.player.lane);
  // Tenta mudar de faixa via teclado enquanto pausado
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  const laneAfter = await page.evaluate(() => S.player.lane);
  expect(laneAfter).toBe(laneBefore);
});
