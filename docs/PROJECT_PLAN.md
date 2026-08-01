# Streamiq — Project Plan & Milestones

**Version**: 1.1
**Date**: 2026-08-01
**Based on**: `PRD.md` (same directory)
**Goal**: Build a client-side React app that searches a movie/TV catalog (JustWatch) and streams via the VidSrc Embed API.

> **Update (2026-08-01)**: The data layer is the unofficial **JustWatch GraphQL API** (`https://apis.justwatch.com/graphql`) — keyless, no env vars required. Routes use JustWatch node IDs (e.g. `/movie/tm92641`). TMDB has been removed entirely: source files are `src/lib/justwatch.ts`, `src/types/media.ts`, `src/hooks/useMedia.ts`, and the player is keyed by each title's `stream_id` (resolved from JustWatch `externalIds` at runtime). TMDB-specific references below are historical.

---

## Project Setup (Prerequisite — Done)

Scaffolded with Vite + React + TypeScript. See `PRD.md` Section 1.2.

---

## Milestone 1: Foundation & Data Layer
**Objective**: Project skeleton, API client, types, and routing with proven data fetching.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/types/media.ts` | All TypeScript interfaces (Movie, TVSeries, Season, SeasonDetails, Episode, CastMember, SearchResult, PaginatedResponse, TrendingMedia). `id` is a string (JustWatch node ID); `stream_id` holds the numeric stream ID used for Aether. See `PRD.md` Section 7 |
| 2 | `src/lib/justwatch.ts` | Catalog client module backed by the JustWatch GraphQL API (no auth). Functions: `searchMulti(query, page)`, `getMovieDetails(id)`, `getTVDetails(id)`, `getSeasonDetails(seriesId, seasonNum)`, `getTrendingMovies()`, `getTrendingTV()`, plus `getSimilarMovies()`, `getSimilarShows()` for "More Like This". `POST`s to `https://apis.justwatch.com/graphql`, caches responses in-memory with a 5-min TTL. Exports image URL helpers: `getPosterUrl(path, size?)`, `getBackdropUrl(path, size?)`, `getStillUrl(path, size?)` (resolved from `images.justwatch.com`) |
| 3 | `src/lib/utils.ts` | `cn()` class merge utility |
| 4 | `src/lib/media.ts` | Media helpers: `getMediaType(item)`, `getTitle(item)`, `getYear(item)` |
| 5 | `src/App.tsx` | React Router routes defined in `PRD.md` Section 8 using `BrowserRouter`. Render `<Layout />` with an `<Outlet />`. |
| 6 | `src/components/Layout.tsx` | Layout with `<header>`, `<main>`, `<footer>` and header nav. |
| 7 | `src/pages/HomePage.tsx` | Page that fetches trending movies and TV. |
| 8 | `src/pages/SearchPage.tsx` | Page that reads `?q=`, calls `searchMulti()`. |
| 9 | `src/pages/MovieDetailPage.tsx` | Reads `:id` param, calls `getMovieDetails()`. |
| 10 | `src/pages/TVDetailPage.tsx` | Reads `:id` param, calls `getTVDetails()`. |
| 11 | `src/pages/WatchPage.tsx` | Reads route params, constructs the Aether embed URL. |

**Acceptance Criteria**:
- [x] `npm run build` succeeds with zero errors.
- [x] Navigating to `/` triggers two trending calls (movies + TV) and data logs in console.
- [x] Navigating to `/search?q=inception` triggers a search call and logs results.
- [x] Navigating to a movie detail route (e.g. `/movie/tm92641`) fetches details.
- [x] Navigating to a TV detail route (e.g. `/tv/ts2`) fetches details.
- [x] Navigating to a watch route logs the correct Aether embed URL (resolved from `stream_id`).
- [x] All TypeScript types compile without `any`.

**Key Technical Notes**:
- JustWatch image base URL: `https://images.justwatch.com`
- Default poster profile: `s500`; default backdrop profile: `s1200`; default still profile: `s400`
- No API key or env vars needed — the GraphQL endpoint is public and CORS-enabled

---

## Milestone 2: Global Shell & Reusable Components
**Objective**: Layout, navigation, search bar, and core UI primitives used by every page.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/components/Layout.tsx` | **Full implementation**: Sticky header (`bg-neutral-950/80 backdrop-blur-md`). Left: "Streamiq" logo (`text-indigo-500 font-bold text-xl`). Center: `<SearchBar />`. Right: Nav links (Home, Movies, TV Shows) using React Router `<Link>`. Footer: "Powered by JustWatch". |
| 2 | `src/components/SearchBar.tsx` | Debounced input (300ms via `useDebounce`). Typing navigates to `/search?q={input}`; Enter submits. Lucide `Search` icon. |
| 3 | `src/components/MediaCard.tsx` | Poster card: `aspect-[2/3]` container with poster image (JustWatch), title below, year + rating badge. Hover: `scale-105`, shadow, semi-transparent dark overlay with a play icon. Click navigates to `/movie/:id` or `/tv/:id` based on media type. Accepts `SearchResult` or `Movie`/`TVSeries` via `MediaCardItem`. |
| 4 | `src/components/MediaGrid.tsx` | Responsive grid wrapper: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4`. |
| 5 | `src/components/SkeletonCard.tsx` | `animate-pulse` loading placeholder matching MediaCard dimensions. |
| 6 | `src/components/RatingBadge.tsx` | Pill with star icon + `vote_average.toFixed(1)`. Green if >= 7, yellow if 5-6.9, red if < 5. |
| 7 | `src/components/ErrorState.tsx` | Centered error message with retry button. |
| 8 | `src/components/EmptyState.tsx` | Centered empty-results message. |
| 9 | `src/components/HeroCarousel.tsx` | Auto-rotating hero (8s), prev/next arrows, dot indicators, pause on hover. |
| 10 | `src/hooks/useDebounce.ts` | `useDebounce<T>(value, delay)` hook. |
| 11 | `src/hooks/useMedia.ts` | Custom hooks wrapping catalog calls with loading/error states: `useSearch(query)`, `useMovie(id)`, `useTV(id)`, `useSeason(seriesId, seasonNum)`, `useTrendingMovies()`, `useTrendingTV()`, `useSimilarMovies()`, `useSimilarShows()`. Return `{ data, loading, error, refetch }`. |

**Acceptance Criteria**:
- [x] Header is sticky and blurs content behind it on scroll.
- [x] Search bar debounces correctly (one navigation after 300ms of idle).
- [x] MediaCard hover effect is smooth (CSS transition).
- [x] SkeletonCard visually matches MediaCard layout during loading.
- [x] All components are TypeScript-typed with zero `any`.
- [x] `npm run build` succeeds.

**Key Technical Notes**:
- Use `useNavigate()` from `react-router-dom` for programmatic navigation.
- `useDebounce` is used in `SearchBar` to delay navigation until the user pauses typing.

---

## Milestone 3: Home Page & Search Results
**Objective**: Landing experience and search results with real data.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/pages/HomePage.tsx` | **Full implementation**: Hero carousel at top (auto-rotate 8s, manual prev/next arrows) showing trending titles (3 movies + 2 TV interleaved). Below: "Trending Movies" and "Trending TV" horizontal scroll rows (`MediaCard`s, `scroll-snap-type: x mandatory`). Uses `useTrendingMovies()` and `useTrendingTV()`. Skeletons while loading. |
| 2 | `src/components/HeroCarousel.tsx` | (from M2) Props: `items: TrendingMedia[]`. Auto-advances with `setInterval(8000)`, pauses on hover. Each slide: backdrop (`s1200`), gradient overlay, title, overview (line-clamp-2), "Watch Now" CTA → watch route. |
| 3 | `src/pages/SearchPage.tsx` | **Full implementation**: Reads `?q=` with `useSearchParams`. Header shows count. Filter tabs (All | Movies | TV Shows) filter results locally by `media_type`. Renders `MediaGrid` with `MediaCard`s. Skeleton grid while loading, `EmptyState` when no results. |

**Acceptance Criteria**:
- [x] Home page loads and displays a hero carousel with 5 items rotating every 8s.
- [x] Hero carousel has working prev/next arrows and dot indicators.
- [x] Trending rows are horizontally scrollable on all screen sizes.
- [x] Clicking "Watch Now" on a hero slide navigates to the correct watch page.
- [x] Search page shows results within 2 seconds of page load.
- [x] Filter tabs correctly filter results without re-fetching.
- [x] Empty search query shows the empty state.
- [x] Responsive: works on 375px mobile up to 1920px desktop.

**Key Technical Notes**:
- Hero carousel: store `currentIndex` in state; clear interval on unmount and manual navigation.
- Horizontal rows use `overflow-x-auto` with `[scroll-snap-type:x_mandatory]`.
- Filter tabs filter the in-memory `results` array — no separate API calls per tab.

---

## Milestone 4: Detail Pages (Movie & TV)
**Objective**: Rich detail pages with metadata and season/episode browsing for TV.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/pages/MovieDetailPage.tsx` | **Full implementation**: Full-width backdrop (`s1200`, `object-cover`, max-height `60vh`, gradient fade). Poster overlapping backdrop bottom edge. Title (H1), metadata row (year, runtime, rating badge, genre badges), synopsis. "▶ Watch Now" button → `/watch/movie/:id`. "More Like This" row (genre-matched trending via `useSimilarMovies`). |
| 2 | `src/pages/TVDetailPage.tsx` | **Full implementation**: Same top section with TV fields (season count). Season selector as horizontal tab buttons, default Season 1. Episode list per selected season. "Watch Season 1" CTA → `/watch/tv/:id/1/1`. "More Like This" via `useSimilarShows`. |
| 3 | `src/components/EpisodeList.tsx` | Props: `episodes: Episode[]`, `seriesId: string`, `seasonNumber: number`, `fallbackPoster`. Vertical list: thumbnail (series poster fallback — no per-episode stills from JustWatch), episode number + title, runtime + air date, overview (line-clamp-2). "▶ Watch" link → `/watch/tv/:id/:season/:episode`. |

**Acceptance Criteria**:
- [x] Movie detail page loads any movie (`/movie/{node_id}`) with metadata, poster, backdrop, and similar titles.
- [x] TV detail page loads a series with all seasons listed.
- [x] Selecting a season fetches and displays episodes for that season.
- [x] Each episode has a working "Watch" button that navigates to the correct watch URL.
- [x] Backdrop images use gradient overlay so text remains readable.
- [x] Poster overlaps backdrop on desktop for a cinematic look.
- [x] All loading states use skeletons, not blank screens.
- [x] Episode list is keyboard-navigable.

**Key Technical Notes**:
- Backdrop gradient: `bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent`.
- Episode thumbnail fallback: series poster or a dark placeholder.
- Switching seasons calls `useSeason()` (cached) and shows a skeleton list while fetching.
- "More Like This" uses `getSimilarMovies()`/`getSimilarShows()` (genre-matched trending).

---

## Milestone 5: Watch Page & Player Integration
**Objective**: The core streaming experience — full-width player with episode navigation.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/pages/WatchPage.tsx` | **Full implementation**: Determines route type from URL (`/watch/movie/:id` vs `/watch/tv/:id/:season/:episode`). Fetches title details (via `useMovie()`/`useTV()`) to resolve `stream_id`, then renders the video iframe in an `aspect-video` container, max-width `1200px`, black player background. Shows a "Loading stream..." state and an error state with retry if the title can't be resolved. |
| 2 | `src/components/VideoPlayer.tsx` | *(Optional — the iframe is currently inlined in `WatchPage`.)* Could extract a reusable wrapper later. |

**Acceptance Criteria**:
- [x] `/watch/movie/{node_id}` loads an iframe with `src=https://vidsrc.to/embed/movie/{stream_id}` (stream ID resolved from details).
- [x] `/watch/tv/{node_id}/1/1` loads an iframe with the correct TV URL pattern.
- [x] Player fills available width while maintaining 16:9 aspect ratio.
- [x] On mobile, player is edge-to-edge with no side padding.
- [x] Page title updates to "Watch {title} — Streamiq" (via `useDocumentTitle`).

**Key Technical Notes**:
- Use `useParams()` from React Router to extract `:id`, `:season`, `:episode`.
- Resolve `stream_id` from the title details response before building the embed URL; show an error if missing.
- Embed URL construction:
  ```ts
  const url = type === 'movie'
    ? `https://vidsrc.to/embed/movie/${streamId}`
    : `https://vidsrc.to/embed/tv/${streamId}/${season}/${episode}`;
  ```

---

## Milestone 6: Polish, Responsiveness & Final QA
**Objective**: Production-ready across all devices; fix visual bugs and optimize performance.

**Deliverables**:
| # | Task | Description |
|---|---|---|
| 1 | Responsive audit | Test every page at 375px, 768px, 1024px, 1440px, 1920px. Fix any layout breaks. **Done** — verified no horizontal overflow at all breakpoints (Playwright + Chrome); header/nav fit on 375px; watch player is edge-to-edge on mobile, centered `max-w-6xl` with `rounded-lg` on desktop. |
| 2 | Dark mode consistency | Ensure all pages use `bg-neutral-950` / `text-neutral-100`. No white backgrounds anywhere. **Done** — audited; only intentional white is the carousel dot indicator. |
| 3 | Image optimization | Add `loading="lazy"` to all non-hero images. Use appropriate JustWatch image profiles. **Done** — `MediaCard`, `EpisodeList`, `CastRow`, and both detail-page posters lazy-load; hero backdrops stay eager. |
| 4 | Loading states | Every async operation has a skeleton or spinner. No blank screens during fetching. **Done** — audited all pages (hero + card skeletons, detail/season skeletons, watch "Loading stream..."). |
| 5 | Error boundaries | Add a simple error boundary component (e.g. `react-error-boundary` or a class component with `componentDidCatch`) with a "Reload" button. **Done** — `src/components/ErrorBoundary.tsx` (class component) wraps the app in `main.tsx`. |
| 6 | SEO basics | Update `index.html` `<title>` to "Streamiq — Watch Movies & TV Series". Add `<meta name="description">`. **Done**. |
| 7 | 404 page | Create `src/pages/NotFoundPage.tsx`. Route: `*` catch-all in the router. **Done**. |
| 8 | Keyboard navigation | Ensure all interactive elements are focusable. Episode list navigable with arrow keys (optional). **Done** — focus-visible rings across all controls (carousel arrows + dots, tabs, cards, buttons); episode list supports ↑/↓ arrow navigation with roving focus. |
| 9 | Build verification | `npm run build` produces a `dist/` folder. `npm run preview` serves it correctly. Note: SPA routing on static hosts may need `_redirects` or `404.html` fallback. **Done** — build + lint clean; added `public/_redirects` (`/* /index.html 200`) for Netlify-style hosts. |
| 10 | README update | Keep `README.md` accurate: description, tech stack, data sources, `npm run dev`, `npm run build`. No API key setup required. **Done**. |

**Acceptance Criteria**:
- [x] App looks great and functions correctly on mobile, tablet, and desktop.
- [x] No console errors or warnings in production build.
- [x] All images lazy-load.
- [x] 404 page displays for unknown routes.
- [x] Build output is a clean static site in `dist/`.
- [x] README is accurate and helpful.

**Key Technical Notes**:
- For static hosting (Vercel, Netlify, GitHub Pages), add SPA fallback:
  - **Netlify**: `public/_redirects` with `/* /index.html 200` (added)
  - **Vercel**: `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Performance: bundle size target under 500KB gzipped (currently ~91KB gzipped JS).
- **Observed (2026-08-01)**: `apis.justwatch.com` intermittently returns `403` on the CORS preflight (`OPTIONS`) for rapid automated browser traffic — a rate-limit/bot-protection behaviour, not an app bug. The API serves proper CORS headers normally (verified via curl and browsers after a cooldown). The app degrades gracefully to the `ErrorState` retry UI. The 5-minute in-memory cache helps absorb repeated navigations within a session.

---

## Milestone 7: Deployment (Optional / Stretch)
**Objective**: Deploy the static site to a hosting platform.

**Deliverables**:
| # | Task | Description |
|---|---|---|
| 1 | Choose host | Vercel (recommended), Netlify, or GitHub Pages. |
| 2 | Environment variables | None required — JustWatch needs no API key. |
| 3 | SPA routing config | Add the redirect config file for the chosen host (see M6 notes). |
| 4 | Deploy | Push to Git + connect host, or drag-drop `dist/` folder. |
| 5 | Verify | Test live URL on mobile and desktop. |

---

## Dependency Graph (What Blocks What)

```
Milestone 1 (Foundation)
    │
    ├─→ Milestone 2 (Shell + Components)
    │       │
    │       ├─→ Milestone 3 (Home + Search)
    │       │
    │       └─→ Milestone 4 (Detail Pages)
    │               │
    │               └─→ Milestone 5 (Watch Page)
    │                       │
    │                       └─→ Milestone 6 (Polish + QA)
    │                               │
    │                               └─→ Milestone 7 (Deploy)
```

**Parallelization opportunities**:
- M1 and M2 can partially overlap if the agent is confident — but M1's types should be stable before M2 consumes them.
- M3 and M4 are independent once M2 is done.

---

## File Structure (Target)

```
webapp/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── CastRow.tsx        # not rendered (no cast data from JustWatch)
│   │   ├── EmptyState.tsx
│   │   ├── EpisodeList.tsx
│   │   ├── ErrorState.tsx
│   │   ├── HeroCarousel.tsx
│   │   ├── Layout.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── RatingBadge.tsx
│   │   ├── SearchBar.tsx
│   │   └── SkeletonCard.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useMedia.ts
│   ├── lib/
│   │   ├── justwatch.ts
│   │   ├── media.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── MovieDetailPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── TVDetailPage.tsx
│   │   └── WatchPage.tsx
│   ├── types/
│   │   └── media.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

---

## Quick Reference: JustWatch GraphQL (Metadata)

Single `POST https://apis.justwatch.com/graphql` with body `{ query, variables }` and `Content-Type: application/json`. No auth.

| Purpose | Query / Filter |
|---|---|
| Search | `popularTitles(filter: { searchQuery: "{q}", includeTitlesWithoutUrl: true }, sortBy: POPULAR)` |
| Movie Detail | `node(id: "{node_id}")` — content + `externalIds` |
| TV Detail | `node(id: "{node_id}")` — includes seasons + episodes |
| Season Detail | from the series `node(id)` response (filter by `seasonNumber`) |
| Trending Movies | `popularTitles(filter: { objectTypes: ["MOVIE"], includeTitlesWithoutUrl: true }, sortBy: TRENDING)` |
| Trending TV | `popularTitles(filter: { objectTypes: ["SHOW"], includeTitlesWithoutUrl: true }, sortBy: TRENDING)` |
| More Like This | `popularTitles(filter: { objectTypes: ["MOVIE"], genres: ["{code}"] })` |

**Common fields**: `edges[].node.id` (JustWatch node ID), `node.content.title`, `node.content.posterUrl`, `node.content.backdrops[].backdropUrl`, `node.content.externalIds.tmdbId` (aliased to `streamId`), `node.content.scoring.imdbScore`.

No headers required for JustWatch calls.

---

## Quick Reference: VidSrc Embed URLs

| Type | URL Pattern |
|---|---|
| Movie | `https://vidsrc.to/embed/movie/{stream_id}` |
| TV Episode | `https://vidsrc.to/embed/tv/{stream_id}/{season}/{episode}` |

---

## Definition of Done (Full Project)

- [ ] User can visit `/`, see trending content, and click into any item.
- [ ] User can search for any movie or TV show by title.
- [ ] User can view rich detail pages with poster, backdrop, synopsis, and similar titles.
- [ ] User can start watching a movie in one click from the detail page.
- [ ] User can browse seasons and episodes of a TV series and watch any episode.
- [ ] The app is fully responsive (mobile, tablet, desktop).
- [ ] The app has no authentication and requires no backend.
- [ ] `npm run build` produces a working static site.
