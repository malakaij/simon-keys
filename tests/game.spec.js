// @ts-check
import { test, expect } from '@playwright/test';

// Fix Math.random to always return 0 so the sequence is always key 'a'.
// KEYS[Math.floor(0 * 8)] === KEYS[0] === { id:'a', ... }
const mockRandom = (page) => page.evaluate(() => { Math.random = () => 0; });

// Timing helpers — generous to survive slow CI runners.
const SEQUENCE_DONE = { timeout: 6_000 };   // wait for 'your turn'
const ROUND_ADVANCE  = { timeout: 4_000 };   // wait for round counter change
const FEEDBACK       = { timeout: 2_500 };   // wait for status flash

test.describe('Simon Keys', () => {

  // ── Initial state ────────────────────────────────────────────────────────────

  test.describe('initial state', () => {
    test('renders page title', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle('Simon Keys');
      await expect(page.locator('h1')).toHaveText('Simon Keys');
    });

    test('renders all eight finger elements', async ({ page }) => {
      await page.goto('/');
      for (const id of ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']) {
        await expect(page.locator(`#fp-${id}`)).toBeAttached();
      }
    });

    test('shows idle UI before any interaction', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#round-num')).toHaveText('—');
      await expect(page.locator('#status-msg')).toHaveText('home row trainer');
      await expect(page.locator('#best-num')).toHaveText('—');
      await expect(page.locator('#start-btn')).toHaveText('Start');
    });
  });

  // ── Starting the game ────────────────────────────────────────────────────────

  test.describe('starting the game', () => {
    test('Start button begins round 1 and relabels button', async ({ page }) => {
      await page.goto('/');
      await page.click('#start-btn');
      await expect(page.locator('#round-num')).toHaveText('1');
      await expect(page.locator('#start-btn')).toHaveText('Restart');
    });

    test('any home-row key starts the game from idle', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('j');
      await expect(page.locator('#round-num')).toHaveText('1');
    });

    test('status shows "watch..." during sequence playback', async ({ page }) => {
      await page.goto('/');
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('watch...');
    });

    test('status shows "your turn" once sequence has finished', async ({ page }) => {
      await page.goto('/');
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);
    });
  });

  // ── Correct input ────────────────────────────────────────────────────────────

  test.describe('correct input', () => {
    test('completing round 1 advances to round 2', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);

      await page.keyboard.press('a');

      await expect(page.locator('#round-num')).toHaveText('2', ROUND_ADVANCE);
    });

    test('"nice!" feedback appears after a completed round', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);

      await page.keyboard.press('a');

      await expect(page.locator('#status-msg')).toHaveText('nice!', FEEDBACK);
    });

    test('best score updates after the first completed round', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);

      await page.keyboard.press('a');

      await expect(page.locator('#best-num')).toHaveText('1', ROUND_ADVANCE);
    });

    test('round 2 requires two correct keys in sequence', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);  // sequence is always ['a', 'a', ...]
      await page.click('#start-btn');

      // Round 1
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);
      await page.keyboard.press('a');

      // Round 2
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);
      await page.keyboard.press('a');
      await page.keyboard.press('a');

      await expect(page.locator('#round-num')).toHaveText('3', ROUND_ADVANCE);
    });
  });

  // ── Wrong input ──────────────────────────────────────────────────────────────

  test.describe('wrong input', () => {
    test('wrong key triggers game-over message', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);  // correct key is 'a'
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);

      await page.keyboard.press('s');  // wrong

      await expect(page.locator('#status-msg'))
        .toHaveText('wrong key — press start', FEEDBACK);
    });

    test('Start button restarts from game-over state', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);
      await page.keyboard.press('s');
      await expect(page.locator('#status-msg'))
        .toHaveText('wrong key — press start', FEEDBACK);

      await page.click('#start-btn');

      await expect(page.locator('#round-num')).toHaveText('1');
      await expect(page.locator('#status-msg')).toHaveText('watch...', { timeout: 1_000 });
    });

    test('any home-row key restarts from game-over state', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);
      await page.keyboard.press('s');
      await expect(page.locator('#status-msg'))
        .toHaveText('wrong key — press start', FEEDBACK);

      await page.keyboard.press('f');

      await expect(page.locator('#round-num')).toHaveText('1');
    });
  });

  // ── Input blocking ───────────────────────────────────────────────────────────

  test.describe('input blocking', () => {
    test('key presses during sequence playback are ignored', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);  // correct key is 'a'
      await page.click('#start-btn');

      // Press immediately — we're in the 'showing' phase (400 ms initial delay)
      await page.keyboard.press('a');

      // Wait for the sequence to finish; round should still be 1 (premature press ignored)
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);
      await expect(page.locator('#round-num')).toHaveText('1');
    });

    test('non-home-row keys are ignored at all times', async ({ page }) => {
      await page.goto('/');
      await mockRandom(page);
      await page.click('#start-btn');
      await expect(page.locator('#status-msg')).toHaveText('your turn', SEQUENCE_DONE);

      // Press keys that are not in the home row
      await page.keyboard.press('z');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');

      // Status should not have changed to game-over
      await expect(page.locator('#status-msg')).toHaveText('your turn');
      await expect(page.locator('#round-num')).toHaveText('1');
    });
  });

});
