# Konj — RTL Drag & Resize Prototype

Quick spike to validate `grid-layout-plus` behaves correctly in RTL before committing
the real widget system architecture on top of it.

## Run it

```bash
npm install
npm run dev
```

Open the local URL Vite prints. The page starts in RTL (فارسی) by default — use the
toggle button to compare against LTR.

## What to check while dragging/resizing

- Drag a widget left vs. right — does it move in the direction your hand moves,
  or does it feel mirrored/wrong?
- Resize from the corner handle — is the handle in the visually correct corner for RTL
  (bottom-left, not bottom-right)?
- Drag two widgets into each other — does collision behavior feel sane
  (`preventCollision: false` + `verticalCompact: true` is currently set, meaning
  items get pushed down rather than blocked — tune this once real widgets exist)?
- Toggle direction mid-session — does the grid re-flow correctly, or does it need
  a page reload to pick up the new `dir`?

## Notes

- `grid-layout-plus` ships no separate CSS file in this version — its styles are
  injected via the components themselves, so no `import 'grid-layout-plus/style.css'`
  is needed.
- The library reads `direction` from computed style automatically; it isn't necessary
  to pass an explicit `rtl` prop unless you want to override document direction
  per-item (that's what `isMirrored` is for).
- The `DemoWidget` shape (`i/x/y/w/h` + `widgetId`) is a direct stand-in for the
  `WidgetInstance` model from the architecture doc — `i` ↔ `instanceId`,
  `x/y` ↔ `GridPosition`, `w/h` ↔ `WidgetSize`.
