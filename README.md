# HueCast

**Air quality monitoring for any city, with an LLM assistant that reads the current numbers.**

Search a city, get its live AQI broken down by pollutant, see the trend on a chart
and the region on a map — then ask a chatbot what it actually means for going
outside, with the current reading in its context.

Data comes from the [World Air Quality Index](https://aqicn.org) project. The
assistant runs on Google Gemini.

---

## Features

- **Live AQI by city** — current index plus the pollutant breakdown behind it.
- **Pollutant detail** — the individual measurements the index is computed from.
- **Map view** — station locations and readings rendered with Leaflet.
- **Historical chart** — trend over time via Chart.js.
- **Favourites** — pin cities you check often; persisted in `localStorage`.
- **Health guidance** — plain-language advice keyed to the current AQI band.
- **Gemini assistant** — chat that answers in context of the loaded reading.
- **Light/dark theme** and a responsive layout.

## Stack

| Layer | Choice |
|---|---|
| UI | React 18 + TypeScript 5.5 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Maps | Leaflet 1.9 |
| Charts | Chart.js 4 via `react-chartjs-2` |
| Motion | Framer Motion |
| Icons | `lucide-react` |
| Routing | React Router 7 |
| HTTP | axios |
| LLM | `@google/generative-ai` — `gemini-1.5-pro` |
| AQI data | WAQI (`api.waqi.info`) |

## Setup

**Prerequisites:** Node 18+.

```bash
git clone https://github.com/Zephyr4772/HueCast.git
cd HueCast
npm install
```

Both keys are read from the environment — **nothing is bundled as a default.**
Create `.env.local`:

```bash
# required — free token from https://aqicn.org/data-platform/token
VITE_WAQI_API_TOKEN=your_waqi_token

# optional — omit to run without the assistant
# https://aistudio.google.com/apikey
VITE_GEMINI_API_KEY=your_gemini_key
```

```bash
npm run dev          # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run type-check`.

> **Note:** this is a client-only app, so both keys ship to the browser in the
> built bundle. That's acceptable for a rate-limited public AQI token, but it
> means **the Gemini key is exposed to anyone using a deployed instance.** For a
> real deployment, proxy Gemini through a small backend and keep the key server-side.

## Project layout

```
src/
  pages/        Dashboard, CityDetail, About
  components/   AQICard, AQIMap, HistoricalChart, SearchBar,
                FavoriteCities, GeminiChat, CitiesViewToggle, Header
  context/      AQIContext — shared city/reading state
  utils/        aqiApi (WAQI client), aqiLevels (AQI bands), storage
  types/        aqi.ts
```

## Limitations

- **Coverage follows WAQI's station network.** Cities without a nearby station return nothing; this is a data limitation, not a bug.
- **No offline mode.** There's no service worker — the app needs a connection.
- **Accessibility is not audited.** Keyboard and screen-reader support have not been tested; contributions welcome.
- **No tests.**

## Credits

AQI data from the [World Air Quality Index project](https://aqicn.org). Initial UI
scaffolded with [Bolt](https://bolt.new), then extended by hand.

## License

MIT — see [`LICENSE`](LICENSE).
