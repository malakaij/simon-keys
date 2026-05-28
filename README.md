# Simon Keys

A minimal browser game that teaches the QWERTY home-row keys through a Simon-style memory sequence.

Two SVG hands light up fingers one at a time. Match the pattern by pressing the corresponding home-row keys. Each successful round extends the sequence by one. One wrong key ends the game.

## Home row layout

```
Left hand          Right hand
A  S  D  F    J  K  L  ;
│  │  │  │    │  │  │  │
pinky           pinky
```

## How to play

1. Open `index.html` in any modern browser — no build step, no dependencies.
2. Press **Start** (or any home-row key) to begin.
3. Watch the finger sequence light up.
4. Reproduce the sequence on your keyboard.
5. The sequence grows by one key each round. Speed increases gradually.

## Controls

| Key | Finger | Hand |
|-----|--------|------|
| `A` | Pinky  | Left |
| `S` | Ring   | Left |
| `D` | Middle | Left |
| `F` | Index  | Left |
| `J` | Index  | Right |
| `K` | Middle | Right |
| `L` | Ring   | Right |
| `;` | Pinky  | Right |

Any home-row key also starts or restarts the game.

## Development

```sh
npm install
npx playwright install chromium
npm test          # run the Playwright test suite
npm run serve     # serve on http://localhost:3000
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## Files

```
index.html                          — the entire app (no build tooling)
tests/game.spec.js                  — Playwright end-to-end tests
playwright.config.js                — test runner config
.github/workflows/ci.yml            — CI (runs tests on every PR)
.github/PULL_REQUEST_TEMPLATE.md
.github/ISSUE_TEMPLATE/
```

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
