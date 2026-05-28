# Contributing

## Getting started

```sh
git clone https://github.com/malakaij/simon-keys.git
cd simon-keys
npm install
npx playwright install chromium
```

## Running the app

No build step. Open `index.html` directly in a browser, or serve it locally:

```sh
npm run serve
# http://localhost:3000
```

## Running tests

```sh
npm test               # headless (same as CI)
npm run test:headed    # watch the browser run
npm run test:ui        # Playwright interactive UI
```

Tests use [Playwright](https://playwright.dev). The `webServer` config in `playwright.config.js` spins up a static file server automatically.

## Making changes

- The entire app lives in `index.html` — keep it self-contained with no runtime dependencies.
- Game logic and SVG constants are in the inline `<script>` block.
- Add or update tests in `tests/game.spec.js` for any changed behaviour.
- Run `npm test` before pushing.

## Code style

- Plain ES2020, no transpilation, no bundler.
- `const`/`let`, arrow functions, `async`/`await`.
- Comments only for non-obvious *why*, not *what*.

## Submitting a PR

Use the PR template. All CI checks must pass before merging.
