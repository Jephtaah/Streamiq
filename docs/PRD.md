# Streamiq — Product Requirements Document (PRD)

**Version**: 1.1
**Date**: 2026-08-01
**Status**: Draft — Ready for Development

---

## 1. Overview

Streamiq is a lightweight, client-side web application that allows users to browse, search, and stream movies and TV series. It uses the JustWatch GraphQL API (unofficial, keyless) as the content catalog and metadata source, and the Aether Embed API as the video streaming provider. There is no authentication, no user accounts, and no backend server — everything runs in the browser.

> **Update (2026-08-01)**: TMDB has been removed entirely. The catalog comes from JustWatch, and the streaming player (Aether) is keyed by the title's `stream_id`, which is resolved from JustWatch's `externalIds` at runtime. All TMDB-specific references are historical.

### 1.1 Design Philosophy
- **Simplicity first**: Clean, minimal UI with zero clutter.
- **Speed**: Instant search, fast navigation, no loading spinners where skeletons suffice.
- **Dark mode by default**: Streaming is a lean-back, low-light experience.
- **Content-forward**: Posters and backdrops are the visual heroes; UI chrome stays subtle.

### 1.2 Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Routing | React Router v7 |
| Data Fetching | Native `fetch` + custom hooks |
| Icons | Lucide React |
| Linting | oxlint |

---

## 2. Goals & Non-Goals

### Goals
- [ ] Users can search for movies and TV series by title.
- [ ] Users can view rich detail pages with metadata, poster, backdrop, and synopsis.
- [ ] Users can start watching a movie in one click.
- [ ] Users can browse seasons and episodes of a TV series and pick any episode to watch.
- [ ] The site works on desktop, tablet, and mobile (responsive).
- [ ] The site is deployable as a static bundle (no server required).

### Non-Goals
- No user authentication or accounts.
- No watch history, favorites, or playlists.
- No user ratings or reviews.
- No backend API or database.
- No ad integration or monetization features.
- No offline support or PWA features (stretch).

---

## 3. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Streamiq (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ JustWatch    │  │ Aether Embed │  │  React Router    │  │
│  │  (GraphQL)   │  │   (iframe)   │  │   (Navigation)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 External APIs

#### JustWatch GraphQL API (Data Source)
- **Endpoint**: `https://apis.justwatch.com/graphql` (POST; no auth, no API key required)
- **Image Base URL**: `https://images.justwatch.com` (poster profiles `s92`–`s780`, backdrops `s400`–`s1200`, etc.)
- **Key Operations** (via two queries — `popularTitles` for lists, `node(id)` for details):
  - Search: `popularTitles(filter: { searchQuery })` — movies + TV.
  - Trending movies / TV (homepage): `popularTitles(filter: { objectTypes })` with `sortBy: TRENDING`.
  - Movie / series details: `node(id)` — includes seasons + episodes for series.
  - "More Like This": `popularTitles(filter: { genres: [code] })`.
- **Stream ID**: every title result includes `externalIds.tmdbId`, mapped into the app's `stream_id` field, which the Aether player requires. (The field name is internal; TMDB itself is not used.)

#### Aether Embed API (Video Player)
- **Base URL**: `https://embed.aether.mom/embed/`
- **Movie Pattern**: `tmdb-movie-{stream_id}`
- **TV Pattern**: `tmdb-tv-{stream_id}/{season}/{episode}`
- **Optional Query Parameters**:
  - `theme` — Color theme for player UI (`dark`).
  - `downloads` — Show/hide download toggle (`false`).
  - `watchparty` — Show/hide watch party toggle (`false`).
- **Embedding**: Rendered in a full-width `<iframe>` with `allowFullScreen`, `allow="autoplay; fullscreen; encrypted-media"`, and `referrerPolicy="origin"`.

### 3.2 State Management
- **Global State**: None — pages fetch their own data via hooks.
- **Local State**: Component-level state for UI toggles, dropdowns, selected season, loading states.
- **Data Caching**: Simple in-memory cache in `src/lib/justwatch.ts` keyed by query, with a 5-minute TTL for JustWatch responses.

---

## 4. Pages & UI Specification

### 4.1 Layout Shell (Global) — `src/components/Layout.tsx`
- **Sticky Header**: `sticky top-0 z-50` with `backdrop-blur-md`. Logo left, search bar center, nav links right (Home, Movies, TV Shows).
- **Search Bar**: Debounced (300ms) input; typing navigates to `/search?q={query}`.
- **Footer**: "Powered by JustWatch".
- **Background**: `bg-neutral-950` (very dark gray, not pure black).
- **Text**: `text-neutral-100` primary, `text-neutral-400` secondary.
- **Accent**: `text-indigo-500` / `bg-indigo-600` for CTAs.

### 4.2 Home Page (`/`) — `src/pages/HomePage.tsx`
- **Hero Section**: Full-width backdrop carousel (auto-rotate 8s) of trending titles (3 movies + 2 TV, interleaved). Overlaid with title, synopsis (2-line clamp), and a **"Watch Now"** button.
- **Trending Movies Row**: Horizontal scrolling poster grid. Title + rating. Click → Movie Detail.
- **Trending TV Row**: Same as above for TV series. Click → TV Detail.
- **Skeleton Loading**: `animate-pulse` placeholders while catalog data loads.

### 4.3 Search Results Page (`/search?q={query}`) — `src/pages/SearchPage.tsx`
- **Header**: "Search results" + "Results for '{query}' — {count} found".
- **Filter Tabs**: All (default) | Movies | TV Shows. Filters the fetched results locally (no re-fetch).
- **Grid**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`.
- **Card Design**:
  - Poster image (aspect-ratio 2/3).
  - Title below poster.
  - Year + rating pill.
  - Hover: slight scale-up, shadow, play icon overlay.
- **Empty State**: Friendly message + "Enter a search term above…" when no query, or "No results" state.
- **Pagination**: "Load More" button (infinite scroll optional stretch).

### 4.4 Movie Detail Page (`/movie/{id}`) — `src/pages/MovieDetailPage.tsx`
- **Backdrop**: Full-width backdrop (`object-cover`, max-height `60vh`) with gradient fade to background.
- **Poster**: Large poster overlapping backdrop bottom edge (desktop) / centered above info (mobile).
- **Info Block**:
  - Title (H1).
  - Metadata row: Year | Runtime | Rating badge | Genres.
  - Synopsis.
- **Primary CTA**: Large **"▶ Watch Now"** button → `/watch/movie/{id}`.
- **More Like This**: Bottom row of genre-matched trending titles (uses `useSimilarMovies`).

### 4.5 TV Series Detail Page (`/tv/{id}`) — `src/pages/TVDetailPage.tsx`
- **Top Section**: Same layout as Movie Detail (backdrop, poster, info, synopsis), plus season count.
- **Season Selector**: Horizontal tab buttons (role `tablist`), default Season 1.
- **Episode List**: Vertical list per selected season (`src/components/EpisodeList.tsx`).
  - Episode thumbnail (series poster fallback — JustWatch exposes no per-episode stills).
  - Episode number + title.
  - Runtime + air date.
  - Short overview (2-line clamp).
  - **"▶ Watch"** link per episode → `/watch/tv/{id}/{season}/{episode}`.
- **Default Selection**: Season 1 on page load.

### 4.6 Watch Page (`/watch/movie/{id}` or `/watch/tv/{id}/{season}/{episode}`) — `src/pages/WatchPage.tsx`
- **Video Player**: Full-width Aether iframe in an `aspect-video` container.
  - Max-width `1200px` (`max-w-6xl`), centered.
  - Black background for the player.
- **Player Controls**: Native to Aether iframe (no custom controls needed).
- **Info Bar Below Player**: Title (and for TV, episode context).
- **Notes**: `id` is a JustWatch node ID (e.g. `tm92641`); the `stream_id` needed for Aether is resolved from the title details (`stream_id`) before building the embed URL.

---

## 5. Component Inventory

### Layout & Navigation
| Component | File | Description |
|---|---|---|
| `Layout` | `src/components/Layout.tsx` | Sticky header, `<Outlet />`, footer |
| `SearchBar` | `src/components/SearchBar.tsx` | Debounced (300ms) search input; navigates to `/search?q=` |

### Media Display
| Component | File | Description |
|---|---|---|
| `MediaCard` | `src/components/MediaCard.tsx` | Poster card with hover play overlay, rating, links to detail page |
| `MediaGrid` | `src/components/MediaGrid.tsx` | Responsive grid wrapper |
| `SkeletonCard` | `src/components/SkeletonCard.tsx` | Shimmer loading placeholder |
| `RatingBadge` | `src/components/RatingBadge.tsx` | Star + score pill (green ≥ 7, yellow 5–6.9, red < 5) |
| `HeroCarousel` | `src/components/HeroCarousel.tsx` | Auto-rotating hero (8s), prev/next arrows, dot indicators, pause on hover |

### States & Lists
| Component | File | Description |
|---|---|---|
| `ErrorState` | `src/components/ErrorState.tsx` | Centered error message + Retry |
| `EmptyState` | `src/components/EmptyState.tsx` | Empty results display |
| `EpisodeList` | `src/components/EpisodeList.tsx` | Vertical episode list with "Watch" links |
| `CastRow` | `src/components/CastRow.tsx` | Horizontal cast strip. *(Not rendered — JustWatch exposes no cast data.)* |

### Hooks & Utilities
| Hook / Util | File | Description |
|---|---|---|
| `useDebounce` | `src/hooks/useDebounce.ts` | `useDebounce<T>(value, delay)` |
| `useMedia` hooks | `src/hooks/useMedia.ts` | `useSearch`, `useMovie`, `useTV`, `useSeason`, `useTrendingMovies`, `useTrendingTV`, `useSimilarMovies`, `useSimilarShows` — return `{ data, loading, error, refetch }` |
| JustWatch client | `src/lib/justwatch.ts` | GraphQL queries, caching, image URL helpers |
| Media helpers | `src/lib/media.ts` | `getMediaType`, `getTitle`, `getYear` |

---

## 6. API Integration Spec

All metadata requests are a single `POST https://apis.justwatch.com/graphql` with a JSON body `{ query, variables }` and `Content-Type: application/json`. No auth headers. Every title node carries `id` (JustWatch node ID, e.g. `tm92641` / `ts2`).

### 6.1 JustWatch — Search
```
query {
  popularTitles(country: "US", filter: { searchQuery: "{query}", includeTitlesWithoutUrl: true }, first: 20, sortBy: POPULAR, sortRandomSeed: 0) {
    edges { node { id objectType content(country: "US", language: "en") { title originalReleaseYear ... on MovieOrShowContent { externalIds { tmdbId: streamId } } } } }
  }
}
```
Filter results to `objectType === 'MOVIE'` or `objectType === 'SHOW'` only.

### 6.2 JustWatch — Movie / Series Details
```
query {
  node(id: "{node_id}") {
    id objectType
    content(country: "US", language: "en") { title overview ... }
    ... on Show { seasons { ... episodes { ... } } }
  }
}
```
Series details include all seasons and episodes in one response.

### 6.3 JustWatch — Season Details (for episodes)
Extracted from the series `node(id)` response by matching `seasonNumber` (no separate query).

### 6.4 JustWatch — Trending
```
query {
  popularTitles(country: "US", filter: { objectTypes: ["MOVIE"], includeTitlesWithoutUrl: true }, first: 20, sortBy: TRENDING, sortRandomSeed: 0) { ... }
  popularTitles(country: "US", filter: { objectTypes: ["SHOW"], includeTitlesWithoutUrl: true }, first: 20, sortBy: TRENDING, sortRandomSeed: 0) { ... }
}
```

### 6.5 JustWatch — More Like This
```
query {
  popularTitles(country: "US", filter: { objectTypes: ["MOVIE"], genres: ["{genre_code}"], includeTitlesWithoutUrl: true }, first: 20, sortBy: POPULAR, sortRandomSeed: 0) { ... }
}
```

### 6.6 Aether Embed — Movie
```
https://embed.aether.mom/embed/tmdb-movie-{stream_id}?theme=dark&downloads=false&watchparty=false
```
Rendered as:
```html
<iframe
  src="{url}"
  title="Watch"
  allow="autoplay; fullscreen; encrypted-media"
  allowFullScreen
  referrerPolicy="origin"
  class="h-full w-full"
></iframe>
```

### 6.7 Aether Embed — TV Episode
```
https://embed.aether.mom/embed/tmdb-tv-{stream_id}/{season}/{episode}?theme=dark&downloads=false&watchparty=false
```
Same iframe rendering as above.

---

## 7. TypeScript Types

```typescript
// types/media.ts

export interface Movie {
  id: string;                  // JustWatch node ID, e.g. "tm92641"
  stream_id: number | null;    // used for Aether embed URLs
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  runtime?: number;
  vote_average: number;
  genres?: { id: number; name: string; code: string }[];
  credits?: { cast: CastMember[] };
  similar?: { results: Movie[] };
}

export interface TVSeries {
  id: string;                  // JustWatch node ID, e.g. "ts2"
  stream_id: number | null;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  number_of_seasons: number;
  vote_average: number;
  genres?: { id: number; name: string; code: string }[];
  seasons: Season[];
  credits?: { cast: CastMember[] };
  similar?: { results: TVSeries[] };
}

export interface Season {
  id: string;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

export interface SeasonDetails extends Season {
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
  air_date: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export type MediaType = 'movie' | 'tv';

export type TrendingMedia = Movie | TVSeries;

export interface SearchResult {
  id: string;
  stream_id: number | null;
  media_type: MediaType;
  title?: string;        // movie
  name?: string;         // tv
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
```

---

## 8. Routing Table

| Route | Page | Params |
|---|---|---|
| `/` | Home | — |
| `/search` | Search Results | `?q={query}` |
| `/movie/:id` | Movie Detail | `id` = JustWatch node ID |
| `/tv/:id` | TV Detail | `id` = JustWatch node ID |
| `/watch/movie/:id` | Watch Movie | `id` = JustWatch node ID |
| `/watch/tv/:id/:season/:episode` | Watch TV Episode | `id` = JustWatch node ID |

**404 Fallback**: Redirect to `/` or show a "Page Not Found" with a link home (not yet implemented).

---

## 9. Environment Variables

No environment variables are required. The JustWatch API needs no API key, and the Aether embed URLs are built from the `stream_id` returned by JustWatch. Any leftover `.env` file can be deleted — the app never reads it.

---

## 10. Design Tokens

The app uses Tailwind v4 default dark palette (no custom theme config):
- **Background**: `bg-neutral-950` (`#0a0a0a`), pure black only behind the player.
- **Foreground**: `text-neutral-100`.
- **Muted**: `text-neutral-400` / `text-neutral-500`.
- **Surface**: `bg-neutral-900` (cards, inputs), borders `border-neutral-800`.
- **Accent**: indigo (`text-indigo-500`, `bg-indigo-600 hover:bg-indigo-700`).
- **Radius**: `rounded-lg` for cards/buttons, `rounded-full` for pills/tabs.
- **Focus**: `focus-visible:ring-2 ring-indigo-500` with `ring-offset-neutral-950`.

### Typography Scale
| Element | Class |
|---|---|
| Hero Title | `text-2xl font-bold md:text-4xl` |
| Page Title | `text-2xl font-bold` / `text-3xl font-bold md:text-4xl` |
| Section Title | `text-xl font-bold` |
| Card Title | `text-sm font-medium` |
| Body | `text-sm text-neutral-300 leading-relaxed` |
| Caption | `text-xs text-neutral-400` / `text-neutral-500` |

---

## 11. Performance & UX Requirements

- **Image Optimization**: Use `loading="lazy"` for below-fold images; JustWatch image profiles (`s500` posters, `s1200` backdrops, `s400` stills).
- **Debounced Search**: 300ms debounce on search input to avoid excessive API calls.
- **Error Handling**: Graceful fallbacks for failed API calls — `ErrorState` with a Retry button.
- **Responsive Breakpoints**:
  - Mobile: `< 640px` (1–2 columns)
  - Tablet: `640px–1024px` (3–4 columns)
  - Desktop: `> 1024px` (5–6 columns)
- **Accessibility**:
  - All images have `alt` text (empty `alt` for decorative).
  - Buttons have clear focus states.
  - Color contrast meets WCAG AA.
  - Semantic landmarks, `role="tablist"` for filters/seasons, `aria-current` on carousel dots.

---

## 12. Assets Needed

| Asset | Source | Notes |
|---|---|---|
| Posters | JustWatch `images.justwatch.com` | Lazy loaded |
| Backdrops | JustWatch `images.justwatch.com` | Preload hero only |
| Logo | Custom text logo | "Streamiq" wordmark in indigo-500 |
| Favicon | `/public/favicon.svg` | Existing |

No custom illustrations needed beyond Lucide icons.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| JustWatch GraphQL changes/breaks (unofficial) | High | Keep queries isolated in `src/lib/justwatch.ts`; add graceful errors + retry |
| Aether embed stops working | High | Display "Source unavailable" message; allow user to try again |
| JustWatch image CDN slow | Medium | Use smaller image profiles; lazy load; placeholder skeletons |
| JustWatch throttling | Medium | In-memory cache with 5-min TTL; keep request volume low |
| No results for niche queries | Low | Show helpful empty state with suggestions |

---

## 14. Open Questions

1. Should we support multiple languages for the UI? (Default: English; stretch: i18n)
2. Should we add a "Recently Viewed" list using `localStorage`? (Stretch)
3. Should the hero carousel auto-play with muted video previews? (Stretch — GIFs only, no video)
