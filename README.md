# کنج · Konj

A Persian-first new-tab page made of widgets, built with Vue, Pinia and Vite.

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

## Dashboard

Everything on the page is a widget, including the greeting and the search bar. **افزودن ابزارک** opens the widget list (any widget can be added more than once) and **چیدمان** switches to layout mode: drag a widget by its title, resize it from the bottom corner, reorder with the arrow buttons (keyboard and mobile), or remove it. Removed widgets can be brought back with **بازگردانی**.

Widgets: welcome (greeting, today's solar Hijri date and any fixed occasion), clock, Hafez, tasks, shortcuts, note, search, Pomodoro, calendar, weather, countdown and ambient sound.

The calendar prints Fridays and official holidays of the solar calendar in red, the way Iranian wall calendars do, and marks cultural dates such as Yalda and Hafez Day. Lunar (Hijri) holidays move every year and are not included.

Settings: Persian/English (switches direction, numerals and date formats; Hafez stays in Persian), your name, six colour schemes (کاغذ، کاهگل، فیروزه، لاجورد، شب، انار) and Tehran or device time. Saved dashboards from earlier versions load as before, and old theme names map to the closest new one.

State lives in `localStorage` in this browser only. The web preview and the installed extension keep separate storage. No account, tracking, server, remote fonts or API keys. Search goes to Google, the weather widget calls Open-Meteo, and shortcuts open the sites you add.

## Design

Contemporary and secular Persian: closer to Tehran street signs, cinema posters and a glass of tea than to tilework.

- **Logo:** a note with its corner folded over (a literal «کنج», *corner*) and «ک» in Lalezar (`src/components/ui/KonjMark.vue`). Extension icons are in `public/icons/`.
- **Fonts:**
  - **Lalezar**, a Persian display face named after Tehran's old cinema street, for the greeting, the clock and the wordmark.
  - **Vazirmatn** for everything else, including Hafez.
  - Both are bundled locally, so the extension works offline.
- **Colours:** six schemes named after everyday Iranian things (کاغذ، کاهگل، فیروزه، لاجورد، شب، انار). Each has a main colour and a playful second one: pomegranate with pistachio, clay with teal, turquoise with saffron, and so on.
- **Cards:** rounded, with a small solid lip underneath, and they lift slightly on hover.
- **Welcome stamp:** a postage stamp of Tehran (Damavand, Azadi Tower, Milad Tower) under a sky that follows the time of day. The sun and moon move across it, the moon shows its actual phase, and stars and city windows light up at night. A postmark carries today's date. Beside it:
  - the greeting in Lalezar
  - the Persian name for the part of the day (سحر، صبح، ظهر، عصر، غروب، شب، نیمه‌شب)
  - the date and any occasion
  - a countdown to Nowruz
  - a proverb of the day (`src/data/proverbs.ts`)
- **Fal-e Hafez:** «فال بگیر» pauses for a moment («نیت کنید…») and turns up a different couplet.
- **Small rewards:**
  - An empty task list shows a steaming estekan of tea.
  - Finishing a task sends out a little confetti burst, and the list congratulates you when everything is done.
  - Widgets rise in one by one on load.
- **Reduced motion:** all of this is turned off for people who choose "reduce motion" in their system settings.

## Verify

```sh
npm run build
# With the development server running (uses Google Chrome if installed, otherwise Playwright's Chromium):
npm run test:dashboard
npm run test:i18n
npm run test:extras
# If the server uses another address:
BASE_URL=http://127.0.0.1:5180 npm run test:dashboard
```

The browser regression check uses a fresh temporary profile. It covers tasks and notes across reloads, widget add/remove/undo, drag/resize persistence, keyboard ordering, shortcuts, settings, mobile overflow and an intentionally empty dashboard. Desktop and mobile screenshots are written to the system temporary directory. It does not alter your personal Chrome profile.
