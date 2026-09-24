# کنج · Konj

A Persian-first new-tab dashboard built with Vue, Pinia and Vite. Includes a solar Hijri date and clock, selected Hafez couplets, tasks, notes, custom shortcuts and Google search.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Normal development runs as a web app with hot reload.

## Install the new-tab extension

```sh
npm run build
```

In Chrome, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select this project's `dist` directory. Open a new tab. After rebuilding, reload the extension. The production build works without a development server.

`npm run dev:extension` enables CRXJS extension development when needed; keep that server running while using its development build. For the regular preview use `npm run dev`.

## Dashboard flow

- **افزودن ابزارک** opens the widget library; multiple instances are supported.
- **چیدمان** enables dragging by widget titles, resizing from the bottom-left corner, and removal. **پایان ویرایش** locks the layout again.
- Arrow controls provide keyboard and mobile reordering. The resize handle also supports keyboard arrow keys. These arrange widgets vertically in the new reading order.
- Removed widgets can be restored with **بازگردانی**. Undo is available for the most recently removed widget until dismissed or reloaded.
- Settings offer Persian/English language switching, a name, six palettes (desert dusk, forest mist, indigo night, Persian carpet, amber tea and Caspian blue), Tehran/device time, and reduced transparency. Language changes save immediately and switch layout direction, UI labels, numerals and date formatting. Hafez verses remain in Persian; user content is preserved.
- Smaller screens display a single column without changing saved desktop positions.

State is stored locally in this browser using `localStorage`. The web preview and installed extension have separate storage. Removing every widget intentionally leaves an empty dashboard. No account, tracking, server, remote fonts or API keys are required. Search submits to Google; shortcuts navigate to the user-specified site. Hafez is a small offline selection of couplets, not a complete divination collection. Clearing browser/extension storage removes saved data.

## Design

The visual direction adapts [Apple's Liquid Glass guidance](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass) to the web: glass for the main controls, restrained highlights, legible content surfaces, rounded nested forms, and reduced-motion/transparency support. This is a CSS interpretation, not Apple's native Liquid Glass renderer. Persian typography, RTL interaction, a solar Hijri date and desert/forest/night palettes ground it in Iranian culture.

## Verify

```sh
npm run build
# With the development server running and Google Chrome installed:
npm run test:dashboard
npm run test:i18n
# If the server uses another address:
BASE_URL=http://127.0.0.1:5180 npm run test:dashboard
```

The browser regression check uses a fresh temporary profile. It covers tasks and notes across reloads, widget add/remove/undo, drag/resize persistence, keyboard ordering, shortcuts, settings, mobile overflow and an intentionally empty dashboard. Desktop and mobile screenshots are written to the system temporary directory. It does not alter your personal Chrome profile.
