# Streamiq

A lightweight, client-side web app for browsing, searching, and streaming movies and TV series. No accounts, no backend — everything runs in the browser.

## Features

- Browse trending movies and TV series on the home page
- Search the full catalog with movie/TV filters
- Rich detail pages: backdrop hero, poster, synopsis, rating, genres
- TV series detail pages with a season selector and per-episode list
- Stream any movie or episode via the Aether Embed player (iframe)

## Data Sources

- **Catalog & metadata**: [JustWatch GraphQL API](https://apis.justwatch.com/graphql) (unofficial, no API key required). Search, trending, details, seasons, episodes, and images all come from here.
- **Streaming**: [Aether Embed](https://embed.aether.mom) — the player takes TMDB IDs, which JustWatch returns as `externalIds.tmdbId`, so each title resolves directly to a playable Aether URL (e.g. `tmdb-movie-27205`).

## Getting Started

No API keys or environment variables are required.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check with `tsc` and build the production bundle |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview the production build |

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS · React Router · Lucide React

## Notes

- Routes use JustWatch node IDs (e.g. `/movie/tm92641`); the TMDB ID needed for streaming is resolved at runtime.
- JustWatch is an undocumented, unofficial API intended for non-commercial projects — it may change or throttle. All responses are cached for 5 minutes to be polite.
- Cast/similarity data is not exposed by JustWatch's public schema; the "More Like This" rows use genre-matched trending instead.
