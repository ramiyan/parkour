# Conversation Summary (2026-02-23)

## Goal
- Build a web-based grapple platformer prototype inspired by SANABI-like movement, but with an original pixel-art forest style based on `ref.png`.
- Focus on parkour/grapple traversal, remove lethal hazards/enemies.

## Current Status
- Working HTML/CSS/JS prototype running in browser via `index.html`.
- Map redesigned to require grappling; hazards and enemies removed.
- Grapple mechanics tuned for larger swing arcs and 180+ degree swings.
- Left/right input behavior recently inverted so that input direction matches expected swing direction; swing responsiveness halved on request.

## Controls
- Move: WASD / Arrows
- Jump: Space
- Grapple: Mouse / E
- Dash: Shift
- Release: E or R

## Files
- index.html
- style.css
- game.js
- ref.png
- STATE.md
- snapshot/ (full file copy)

## Important Grapple Parameters (game.js)
- Rope length min 10, max 1200
- Pull force 680
- Swing accel 550 (reduced to half)
- Release boost: min(320, speed * 0.6)
- No vx clamp while grappling

## Map / World
- World size: 2600x2000
- Platforms: 10 (wide gaps, grapple required)
- Anchors: 10 (placed to guide ascent)
- Checkpoints: 2
- Goal near upper-left

## Visual Style
- Pastel forest pixel-art theme (sky, clouds, mountains, hills)
- Trees, bushes, flowers, rocks, falling leaves
- Foreground grass layer
- Character sprites: idle/run/jump/grapple

## Open Issues
- User reported ongoing asymmetry/odd feel in left/right swing response. Latest change flips input sign to match expected direction; further tuning may be needed.

## How to Resume
- Open `index.html` in a browser.
- Reference this summary plus `STATE.md` and `snapshot/` for restoration.
