# Streamiq — Project Plan & Milestones

**Version**: 1.0
**Date**: 2026-08-01
**Based on**: `PRD.md` (same directory)
**Goal**: Build a client-side React app that searches TMDB and streams via Aether Embed API.

---

## Project Setup (Prerequisite — Do This First)


---

## Milestone 1: Foundation & Data Layer
**Objective**: Set up the project skeleton, API clients, types, and routing. No UI polish yet — just proven data fetching.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/types/tmdb.ts` | All TypeScript interfaces (Movie, TVSeries, Season, Episode, CastMember, SearchResult) — copy from `PRD.md` Section 7 |
| 2 | `src/lib/tmdb.ts` | TMDB API client module with these functions: `searchMulti(query, page)`, `getMovieDetails(id)`, `getTVDetails(id)`, `getSeasonDetails(seriesId, seasonNum)`, `getTrendingMovies()`, `getTrendingTV()`. Use `fetch` with `Authorization: Bearer <token>` header. Add a simple in-memory cache object (`Record<url, {data, ts}>`) with 5-min TTL. Export image URL helpers: `getPosterUrl(path, size?)`, `getBackdropUrl(path, size?)`, `getStillUrl(path, size?)` |
| 3 | `src/lib/utils.ts` | Existing shadcn utility; ensure `cn()` is available |
| 4 | `src/App.tsx` | Set up React Router with routes defined in `PRD.md` Section 8. Use `BrowserRouter`. Render `<Outlet />` inside a layout shell. |
| 5 | `src/components/Layout.tsx` | Stub layout with `<header>`, `<main>`, `<footer>`. Header contains a text logo "Streamiq" and placeholder nav links. |
| 6 | `src/pages/HomePage.tsx` | Stub page that calls `getTrendingMovies()` and `getTrendingTV()` on mount, logs results to console. |
| 7 | `src/pages/SearchPage.tsx` | Stub page that reads `?q=` from URL, calls `searchMulti()`, logs results. |
| 8 | `src/pages/MovieDetailPage.tsx` | Stub that reads `:id` param, calls `getMovieDetails()`, logs result. |
| 9 | `src/pages/TVDetailPage.tsx` | Stub that reads `:id` param, calls `getTVDetails()`, logs result. |
| 10 | `src/pages/WatchPage.tsx` | Stub that reads route params, constructs Aether embed URL, logs it. |

**Acceptance Criteria**:
- [ ] `npm run build` succeeds with zero errors.
- [ ] Navigating to `/` triggers two TMDB API calls (trending movie + TV) and data logs in console.
- [ ] Navigating to `/search?q=inception` triggers a search API call and logs results.
- [ ] Navigating to `/movie/550` fetches movie details for Fight Club.
- [ ] Navigating to `/tv/1399` fetches TV details for Game of Thrones.
- [ ] Navigating to `/watch/movie/550` logs the correct Aether embed URL.
- [ ] All TypeScript types compile without `any`.

**Key Technical Notes**:
- TMDB image base URL: `https://image.tmdb.org/t/p/`
- Default poster size: `w500`
- Default backdrop size: `w1280`
- TMDB access token goes in `.env` as `VITE_TMDB_ACCESS_TOKEN`
- Use `import.meta.env.VITE_TMDB_ACCESS_TOKEN` to read it

---

## Milestone 2: Global Shell & Reusable Components
**Objective**: Build the layout, navigation, search bar, and core UI primitives that every page will use.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/components/Layout.tsx` | **Full implementation**: Sticky header with dark background (`bg-neutral-950/80 backdrop-blur-md`). Left: "Streamiq" logo (text in `text-indigo-500 font-bold text-xl`). Center: `<SearchBar />`. Right: Nav links (Home, Movies, TV Shows) using React Router `<Link>`. Footer: minimal "Powered by TMDB" attribution. |
| 2 | `src/components/SearchBar.tsx` | Expandable input in header. On desktop: width transitions from `w-48` to `w-72` on focus. On mobile: full-width below logo. **Debounced at 300ms**. Typing navigates to `/search?q={input}`. Pressing Enter navigates. Include a search icon (Lucide `Search`). |
| 3 | `src/components/MediaCard.tsx` | Poster card: `aspect-[2/3]` container with TMDB poster image, title below, year + rating badge. Hover state: `scale-105`, shadow, semi-transparent dark overlay with a play icon (`Lucide Play` centered). Click navigates to `/movie/:id` or `/tv/:id` based on media type. Accepts `SearchResult` or `Movie`/`TVSeries` as prop. |
| 4 | `src/components/MediaGrid.tsx` | Responsive grid wrapper: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4`. Renders children (MediaCards). |
| 5 | `src/components/SkeletonCard.tsx` | Shimmer loading placeholder matching MediaCard dimensions. Use Tailwind `animate-pulse` or custom shimmer with `bg-gradient`. |
| 6 | `src/components/RatingBadge.tsx` | Small pill showing star icon + `vote_average.toFixed(1)`. Green if >= 7, yellow if 5-6.9, red if < 5. |
| 7 | `src/components/ErrorState.tsx` | Centered error message with Lucide `AlertCircle` icon, message text, and a "Retry" button that re-fetches. |
| 8 | `src/components/EmptyState.tsx` | Centered message with Lucide `Film` icon and helpful text (e.g., "No results found. Try a different title."). |
| 9 | `src/components/CastRow.tsx` | Horizontal scroll container (`overflow-x-auto`) of cast member cards: circular headshot (TMDB `profile_path` at `w185`, fallback to initials), actor name, character name below. |
| 10 | `src/hooks/useDebounce.ts` | Custom hook: `useDebounce<T>(value: T, delay: number): T` — returns debounced value. |
| 11 | `src/hooks/useTMDB.ts` | Custom hooks wrapping TMDB calls with loading/error states: `useSearch(query)`, `useMovie(id)`, `useTV(id)`, `useSeason(seriesId, seasonNum)`, `useTrendingMovies()`, `useTrendingTV()`. Return `{ data, loading, error, refetch }`. |

**Acceptance Criteria**:
- [ ] Header is sticky and blurs content behind it on scroll.
- [ ] Search bar debounces correctly (type fast, only one navigation after 300ms of idle).
- [ ] MediaCard hover effect is smooth (CSS transition, not JS).
- [ ] SkeletonCard visually matches MediaCard layout during loading.
- [ ] All new components are TypeScript-typed with zero `any`.
- [ ] `npm run build` succeeds.

**Key Technical Notes**:
- Use `useNavigate()` from `react-router-dom` for programmatic navigation.
- For the search bar, use `useEffect` that watches the debounced value and calls `navigate('/search?q=' + debouncedValue)` only when `debouncedValue.length > 0`.
- Cast headshot fallback: if `profile_path` is null, show a gray circle with the actor's initials.

---

## Milestone 3: Home Page & Search Results
**Objective**: Implement the landing experience and search results with real data.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/pages/HomePage.tsx` | **Full implementation**: Hero carousel at top (auto-rotate every 8s, manual prev/next arrows). Displays 5 trending items (mix of movies + TV). Each slide: full-width backdrop image with gradient overlay, title, short tagline/overview (truncate to 2 lines), "Watch Now" button. Below hero: "Trending Movies" horizontal scroll row (MediaCards). Below that: "Trending TV" horizontal scroll row. Use `useTrendingMovies()` and `useTrendingTV()`. Show skeletons while loading. |
| 2 | `src/components/HeroCarousel.tsx` | Props: `items: TrendingMedia[]`. Auto-advances with `setInterval`. Pause on hover. Slide transition: CSS `opacity` or `transform`. Show dot indicators at bottom. Each slide has a backdrop image (TMDB `w1280`), gradient overlay (`bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent`), title, overview (line-clamp-2), and CTA button. |
| 3 | `src/pages/SearchPage.tsx` | **Full implementation**: Read `?q=` with `useSearchParams`. Display "Results for '{query}' — {count} found". Filter tabs: All (default) | Movies | TV Shows. Use `shadcn/ui Tabs` component. Render `MediaGrid` with `MediaCard`s. Show skeleton grid while loading. Show `<EmptyState>` if no results. |
| 4 | `src/components/FilterTabs.tsx` | (Optional — can inline in SearchPage) Three tabs that filter the search results locally by `media_type`. |

**Acceptance Criteria**:
- [ ] Home page loads and displays a hero carousel with 5 items rotating every 8s.
- [ ] Hero carousel has working prev/next arrows and dot indicators.
- [ ] Trending rows are horizontally scrollable on all screen sizes.
- [ ] Clicking "Watch Now" on a hero slide navigates to the correct watch page.
- [ ] Search page shows results within 2 seconds of page load.
- [ ] Filter tabs correctly filter results without re-fetching.
- [ ] Empty search query shows the empty state.
- [ ] Responsive: works on 375px mobile up to 1920px desktop.

**Key Technical Notes**:
- Hero carousel: store `currentIndex` in state. Use `useEffect` with `setInterval(8000)`. Clear interval on unmount and on manual navigation.
- For horizontal scrolling rows, use `overflow-x-auto` with `scroll-snap-type: x mandatory` and `snap-center` on cards for a polished feel.
- Search filter tabs should filter the already-fetched `results` array in memory — do NOT make separate API calls per tab.

---

## Milestone 4: Detail Pages (Movie & TV)
**Objective**: Rich detail pages with metadata, cast, and season/episode browsing for TV.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/pages/MovieDetailPage.tsx` | **Full implementation**: Top section with full-width backdrop (TMDB `w1280`, CSS `object-cover`, max-height `60vh`, gradient fade to background). Poster positioned overlapping backdrop bottom edge (left side, desktop; centered above info, mobile). Title (H1), tagline (italic muted), metadata row (year, runtime, rating badge, genres as `shadcn/ui Badge`s). Synopsis paragraph. "▶ Watch Now" large button (`size="lg"`, `className="bg-indigo-600 hover:bg-indigo-700"`) → `/watch/movie/:id`. Cast row. "More Like This" row (from `similar` data). |
| 2 | `src/pages/TVDetailPage.tsx` | **Full implementation**: Same top section as Movie Detail but with TV-specific fields (number of seasons, first air date). Below info block: Season selector using `shadcn/ui Select` (dropdown) or horizontal tabs. Default to Season 1. Episode list rendered below selector. |
| 3 | `src/components/SeasonSelector.tsx` | Props: `seasons: Season[], selectedSeason: number, onSelect: (seasonNum) => void`. Dropdown using `shadcn/ui Select`. Options like "Season 1 (10 episodes)". |
| 4 | `src/components/EpisodeList.tsx` | Props: `episodes: Episode[], seriesId: number, seasonNumber: number`. Vertical list. Each row: episode still (TMDB `still_path` at `w300`, fallback to series poster), episode number + title, runtime + air date, overview (line-clamp-2). Right side: "▶ Watch" button linking to `/watch/tv/:id/:season/:episode`. Hover: subtle background highlight. |
| 5 | `src/components/VideoPlayer.tsx` | Props: `src: string`. Responsive iframe wrapper. Container has `aspect-video` (16:9). iframe has `width="100%"`, `height="100%"`, `frameborder="0"`, `allowfullscreen`, `allow="fullscreen; autoplay"`. |

**Acceptance Criteria**:
- [ ] Movie detail page loads Fight Club (`/movie/550`) with all metadata, poster, backdrop, cast, and similar movies.
- [ ] TV detail page loads Game of Thrones (`/tv/1399`) with all seasons listed.
- [ ] Selecting a season fetches and displays episodes for that season.
- [ ] Each episode has a working "Watch" button that navigates to the correct watch URL.
- [ ] Backdrop images use gradient overlay so text remains readable.
- [ ] Poster overlaps backdrop on desktop for a cinematic look.
- [ ] All loading states use skeletons, not blank screens.
- [ ] Cast row scrolls horizontally with touch/drag support.

**Key Technical Notes**:
- Backdrop gradient: `bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent` overlaid on the backdrop image.
- Episode still fallback: if `still_path` is null, use the series poster or a generic dark placeholder.
- When switching seasons, call `getSeasonDetails()` and replace the episode list. Show a skeleton list during the fetch.
- For the "More Like This" row, use the `similar.results` array from TMDB details (already fetched via `append_to_response=similar`).

---

## Milestone 5: Watch Page & Player Integration
**Objective**: The core streaming experience — fullscreen-ish player with episode navigation.

**Deliverables**:
| # | File | Description |
|---|---|---|
| 1 | `src/pages/WatchPage.tsx` | **Full implementation**: Determines route type from URL (`/watch/movie/:id` vs `/watch/tv/:id/:season/:episode`). Fetches movie or TV details to get the title. Renders `<VideoPlayer src={aetherUrl} />` centered, max-width `1200px`, full black background (`bg-black`). Below player: info bar with back button (← Lucide `ArrowLeft`), title, and for TV: "S1 E5: Episode Title". For TV: Previous / Next episode buttons (disabled if first/last episode). |
| 2 | `src/components/VideoPlayer.tsx` | (From M4, refine if needed) Ensure it handles iframe `onLoad` to show/hide a loading spinner. Add a subtle loading state (centered spinner or pulse) while the iframe loads. |
| 3 | `src/hooks/useAetherUrl.ts` | Custom hook: `useAetherUrl(type, tmdbId, season?, episode?)` returns the constructed Aether URL with query params (`theme=dark`, `downloads=false`, `watchparty=false`). |

**Acceptance Criteria**:
- [ ] `/watch/movie/550` loads an iframe with `src=https://embed.aether.mom/embed/tmdb-movie-550?theme=dark&downloads=false&watchparty=false`.
- [ ] `/watch/tv/1399/1/1` loads an iframe with the correct TV URL pattern.
- [ ] Player fills available width while maintaining 16:9 aspect ratio.
- [ ] On mobile, player is edge-to-edge with no side padding.
- [ ] Back button returns to the detail page (movie or TV).
- [ ] TV watch page has working Previous/Next episode buttons that navigate without a full page reload (use `navigate()` with new params).
- [ ] Page title updates to "Watch {title} — Streamiq" (optional stretch: use `document.title`).

**Key Technical Notes**:
- Use `useParams()` from React Router to extract `:id`, `:season`, `:episode`.
- Previous episode logic: if current is S1E1, Previous is disabled. If current is S2E1, Previous goes to S1 last episode. This requires knowing the episode count per season — either fetch all seasons upfront or only enable Previous/Next within the current season for simplicity.
  - **Simplification for MVP**: Only show Previous/Next within the SAME season. Disable at SxE1 and SxElast. Document this as a known limitation.
- Aether URL construction:
  ```ts
  const base = type === 'movie'
    ? `https://embed.aether.mom/embed/tmdb-movie-${tmdbId}`
    : `https://embed.aether.mom/embed/tmdb-tv-${tmdbId}/${season}/${episode}`;
  const url = `${base}?theme=dark&lang=en&downloads=false&watchparty=false`;
  ```

---

## Milestone 6: Polish, Responsiveness & Final QA
**Objective**: Ensure the app feels production-ready across all devices, fix visual bugs, and optimize performance.

**Deliverables**:
| # | Task | Description |
|---|---|---|
| 1 | Responsive audit | Test every page at 375px, 768px, 1024px, 1440px, 1920px. Fix any layout breaks. |
| 2 | Dark mode consistency | Ensure all pages use `bg-neutral-950`, `text-neutral-100`. No pure white backgrounds anywhere. |
| 3 | Image optimization | Add `loading="lazy"` to all non-hero images. Add `decoding="async"`. Use appropriate TMDB sizes (not `original` for posters). |
| 4 | Loading states | Every async operation has a skeleton or spinner. No blank white screens during data fetching. |
| 5 | Error boundaries | Add a simple error boundary component that catches React render errors and shows a friendly message with a "Reload" button. |
| 6 | SEO basics | Update `index.html` `<title>` to "Streamiq — Watch Movies & TV Series". Add `<meta name="description">`. |
| 7 | 404 page | Create `src/pages/NotFoundPage.tsx`. Friendly message + link back to home. Route: `*` catch-all in router. |
| 8 | Keyboard navigation | Ensure all interactive elements are focusable. Episode list navigable with arrow keys (optional but nice). |
| 9 | Build verification | `npm run build` produces a `dist/` folder. `npm run preview` serves it correctly. Verify all routes work in production build (note: SPA routing on static hosts may need `_redirects` or `404.html` fallback). |
| 10 | README update | Update the project `README.md` with: description, tech stack, how to get TMDB key, how to run locally (`npm run dev`), how to build (`npm run build`). |

**Acceptance Criteria**:
- [ ] App looks great and functions correctly on mobile, tablet, and desktop.
- [ ] No console errors or warnings in production build.
- [ ] All images lazy-load.
- [ ] 404 page displays for unknown routes.
- [ ] Build output is a clean static site in `dist/`.
- [ ] README is accurate and helpful.

**Key Technical Notes**:
- For static hosting (Vercel, Netlify, GitHub Pages), add a `_redirects` file or configure the host to serve `index.html` for all routes (SPA fallback).
  - **Netlify**: Create `public/_redirects` with `/* /index.html 200`
  - **Vercel**: Create `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Error boundary: use `react-error-boundary` package or a simple class component with `componentDidCatch`.
- Performance: Bundle size should be under 500KB gzipped. If larger, audit with `npm run build` output.

---

## Milestone 7: Deployment (Optional / Stretch)
**Objective**: Deploy the static site to a hosting platform.

**Deliverables**:
| # | Task | Description |
|---|---|---|
| 1 | Choose host | Vercel (recommended), Netlify, or GitHub Pages. |
| 2 | Environment variables | Add `VITE_TMDB_ACCESS_TOKEN` to the host's environment variable settings. |
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
│   └── _redirects          # SPA fallback for static hosts
├── src/
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── SearchBar.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── SkeletonCard.tsx
│   │   ├── RatingBadge.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   ├── CastRow.tsx
│   │   ├── HeroCarousel.tsx
│   │   ├── SeasonSelector.tsx
│   │   ├── EpisodeList.tsx
│   │   └── VideoPlayer.tsx
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useTMDB.ts
│   ├── lib/
│   │   ├── tmdb.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── MovieDetailPage.tsx
│   │   ├── TVDetailPage.tsx
│   │   ├── WatchPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── types/
│   │   └── tmdb.ts
│   ├── App.tsx
│   └── main.tsx
├── .env                    # Gitignored — TMDB credentials
├── index.html
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

---

## Quick Reference: TMDB Endpoints

| Purpose | Endpoint | Append Params |
|---|---|---|
| Search | `GET /search/multi?query={q}&page={p}&include_adult=false` | — |
| Movie Detail | `GET /movie/{id}` | `append_to_response=credits,similar` |
| TV Detail | `GET /tv/{id}` | `append_to_response=credits,similar` |
| Season Detail | `GET /tv/{id}/season/{s}` | — |
| Trending Movies | `GET /trending/movie/week` | — |
| Trending TV | `GET /trending/tv/week` | — |

**Headers for all TMDB calls**:
```
Authorization: Bearer {VITE_TMDB_ACCESS_TOKEN}
Accept: application/json
```

---

## Quick Reference: Aether Embed URLs

| Type | URL Pattern |
|---|---|
| Movie | `https://embed.aether.mom/embed/tmdb-movie-{tmdb_id}?theme=dark&downloads=false&watchparty=false` |
| TV Episode | `https://embed.aether.mom/embed/tmdb-tv-{tmdb_id}/{season}/{episode}?theme=dark&downloads=false&watchparty=false` |

---

## Definition of Done (Full Project)

- [ ] User can visit `/`, see trending content, and click into any item.
- [ ] User can search for any movie or TV show by title.
- [ ] User can view rich detail pages with poster, backdrop, synopsis, cast, and similar titles.
- [ ] User can start watching a movie in one click from the detail page.
- [ ] User can browse seasons and episodes of a TV series and watch any episode.
- [ ] The app is fully responsive (mobile, tablet, desktop).
- [ ] The app has no authentication and requires no backend.
- [ ] `npm run build` produces a working static site.
