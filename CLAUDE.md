# Simon Keys — Claude context

## What this is

A single-file browser game (`index.html`) that teaches QWERTY home-row keys via a Simon-style memory sequence. No build tooling, no dependencies, no server required.

## Architecture

Everything lives in `index.html`:

- **SVG** — two hand illustrations built programmatically from JS. Fingers are `<path>` elements with rounded tops and flat bases that tuck into the palm rects.
- **CSS** — dark theme, monospace font, single-file inline.
- **JS** — plain ES2020, no frameworks.

## Key constants (in `<script>`)

| Constant | Value | Purpose |
|----------|-------|---------|
| `KEYS` | array of 8 objects | Maps key id → SVG coordinates |
| `FINGER_BOTTOM` | `172` | y where finger base meets palm (10px overlap with palm top at 162) |
| `BASE_COLOR` | `#16162a` | Default fill for fingers and palms |

## Game state machine

```
idle ──► showing ──► input ──► wait ──► showing (loop)
                        │
                        └──► gameover ──► idle (on keypress/start)
```

The `gen` counter increments on every `startGame()` call. All async functions check `if (gen !== g) return` before advancing state — this prevents stale promise chains from corrupting a restarted game.

## SVG coordinate system

ViewBox `0 0 700 310`. Palm tops at y=162. Finger tips range from y=72 (middle) to y=102 (pinky). Fingers extend to y=172 (10px into palms).

Left palm: `x=60, w=228`. Right palm: `x=412, w=228`.

Left fingers x-positions (pinky→index): 65, 113, 161, 209  
Right fingers x-positions (index→pinky): 453, 501, 549, 597  
All fingers 38px wide with 10px gaps.

## Changing difficulty

Sequence playback speed is computed from level:
```js
const onMs  = Math.max(260, 580 - lvl * 14);  // lit duration
const offMs = Math.max(55,  125 - lvl *  5);  // gap between
```
Adjust the floor values or slopes to tune difficulty.

## Running locally

```sh
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or serve with any static file server — no special headers required.
