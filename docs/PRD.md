# Streamiq — Product Requirements Document (PRD)

**Version**: 1.0
**Date**: 2026-08-01
**Status**: Draft — Ready for Development

---

## 1. Overview

Streamiq is a lightweight, client-side web application that allows users to browse, search, and stream movies and TV series. It uses The Movie Database (TMDB) as the content catalog and metadata source, and the Aether Embed API as the video streaming provider. There is no authentication, no user accounts, and no backend server — everything runs in the browser.

### 1.1 Design Philosophy
- **Simplicity first**: Clean, minimal UI with zero clutter.
- **Speed**: Instant search, fast navigation, no loading spinners where skeletons suffice.
- **Dark mode by default**: Streaming is a lean-back, low-light experience.
- **Content-forward**: Posters and backdrops are the visual heroes; UI chrome stays subtle.

### 1.2 Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Routing | React Router v6 |
| Data Fetching | Native `fetch` + custom hooks |
| Icons | Lucide React |

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
│  │   TMDB API   │  │ Aether Embed │  │  React Router    │  │
│  │  (Search +   │  │   (iframe)   │  │   (Navigation)   │  │
│  │   Metadata)  │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 External APIs

#### TMDB API (Data Source)
- **Base URL**: `https://api.themoviedb.org/3`
- **Authentication**: Bearer token (`Authorization: Bearer <TOKEN>`) or API key via query param (`api_key=<KEY>`).
- **Image Base URL**: `https://image.tmdb.org/t/p/`
- **Key Endpoints**:
  - `GET /search/multi?query={query}&page={page}` — Search movies + TV.
  - `GET /movie/{movie_id}` — Movie details.
  - `GET /tv/{series_id}` — TV series details.
  - `GET /tv/{series_id}/season/{season_number}` — Season + episode list.
  - `GET /trending/movie/week` — Trending movies (homepage).
  - `GET /trending/tv/week` — Trending TV (homepage).
- **Image Sizes**:
  - Poster: `w342`, `w500` (default), `w780`
  - Backdrop: `w780`, `w1280` (default), `original`
  - Still: `w300`

#### Aether Embed API (Video Player)
- **Base URL**: `https://embed.aether.mom/embed/`
- **Movie Pattern**: `tmdb-movie-{tmdb_id}`
- **TV Pattern**: `tmdb-tv-{tmdb_id}/{season}/{episode}`
- **Optional Query Parameters**:
  - `theme` — Color theme for player UI.
  - `lang` — Interface language.
  - `subtitles` — Default subtitle language.
  - `downloads` — Show/hide download toggle (`true`/`false`).
  - `watchparty` — Show/hide watch party toggle (`true`/`false`).
- **Embedding**: Rendered in a full-width `<iframe>` with `allowfullscreen`.

### 3.2 State Management
- **Global State**: React Context for:
  - Search query & results cache (last 10 searches).
  - Current watch context (what is playing, season/episode).
- **Local State**: Component-level state for UI toggles, dropdowns, loading states.
- **Data Caching**: Simple in-memory cache with a 5-minute TTL for TMDB responses.

---

## 4. Pages & UI Specification

### 4.1 Layout Shell (Global)
- **Sticky Header**: Logo left, search bar center, nav links right (Home, Movies, TV Shows).
- **Search Bar**: Expandable input in header on desktop; full-width on mobile. Debounced (300ms). Shows a dropdown of results on typing.
- **Footer**: Minimal copyright + TMDB attribution.
- **Background**: `bg-neutral-950` (very dark gray, not pure black).
- **Text**: `text-neutral-100` primary, `text-neutral-400` secondary.
- **Accent**: `text-indigo-500` / `bg-indigo-600` for CTAs.

### 4.2 Home Page (`/`)
- **Hero Section**: Full-width backdrop carousel of trending movies/TV (auto-rotate 8s). Overlaid with title, short tagline, and a **"Watch Now"** button.
- **Trending Movies Row**: Horizontal scrolling poster grid. Title + rating. Click → Movie Detail.
- **Trending TV Row**: Same as above for TV series. Click → TV Detail.
- **Skeleton Loading**: Shimmer placeholders while TMDB data loads.

### 4.3 Search Results Page (`/search?q={query}`)
- **Header**: Shows "Results for '{query}'" with result count.
- **Filter Tabs**: All | Movies | TV Shows. Default: All.
- **Grid**: Responsive grid — 2 cols mobile, 4 cols tablet, 6 cols desktop.
- **Card Design**:
  - Poster image (aspect-ratio 2/3).
  - Title below poster.
  - Year + rating pill.
  - Hover: slight scale-up, shadow, play icon overlay.
- **Empty State**: Friendly illustration + "No results found. Try a different title."
- **Pagination**: "Load More" button (infinite scroll optional stretch).

### 4.4 Movie Detail Page (`/movie/{tmdb_id}`)
- **Backdrop**: Full-width blurred backdrop with gradient fade to background.
- **Poster**: Large poster left (desktop) / top (mobile).
- **Info Block**:
  - Title (H1).
  - Tagline (italic, muted).
  - Metadata row: Year | Runtime | Rating | Genres.
  - Synopsis / overview.
  - Cast list: horizontal scroll of actor headshots + names.
- **Primary CTA**: Large **"▶ Watch Now"** button → navigates to `/watch/movie/{tmdb_id}`.
- **Similar Movies**: Bottom row of recommendations from TMDB.

### 4.5 TV Series Detail Page (`/tv/{tmdb_id}`)
- **Top Section**: Same layout as Movie Detail (backdrop, poster, info, synopsis, cast).
- **Season Selector**: Dropdown or horizontal tabs (Season 1, Season 2, ...).
- **Episode List**: Vertical list per selected season.
  - Episode thumbnail (TMDB `still_path` if available; fallback to poster).
  - Episode number + title.
  - Runtime + air date.
  - Short overview (truncated).
  - **"▶ Watch"** button per episode → navigates to `/watch/tv/{tmdb_id}/{season}/{episode}`.
- **Default Selection**: Auto-select Season 1 on page load.

### 4.6 Watch Page (`/watch/movie/{tmdb_id}` or `/watch/tv/{tmdb_id}/{season}/{episode}`)
- **Video Player**: Full-width iframe embedding Aether player.
  - Desktop: 16:9 aspect ratio, max-width 1200px, centered.
  - Mobile: Full viewport width, adaptive height.
- **Player Controls**: Native to Aether iframe (no custom controls needed).
- **Info Bar Below Player**:
  - Title + (for TV) "S{season} E{episode}: Episode Title".
  - "← Back" button to return to detail page.
  - (For TV) Previous / Next episode buttons.
- **Background**: Pure black (`#000`) to reduce light bleed around the player.

---

## 5. Component Inventory (shadcn/ui + Custom)

### From shadcn/ui (pre-installed)
| Component | Usage |
|---|---|
| `button` | CTAs, navigation, pagination |
| `input` | Search bar |
| `skeleton` | Loading states |
| `card` | Content cards (optional) |
| `scroll-area` | Horizontal scroll rows |
| `select` | Season selector on TV detail page |
| `tabs` | Search filter tabs |
| `badge` | Rating, genre pills |

### Custom Components (to build)
| Component | Props | Description |
|---|---|---|
| `VideoPlayer` | `src: string` | Responsive iframe wrapper for Aether embed |
| `MediaCard` | `media: Movie \| TV` | Poster card with hover effects |
| `HeroCarousel` | `items: TrendingMedia[]` | Auto-rotating hero with backdrop |
| `SearchBar` | `onSearch: (q) => void` | Debounced search input with dropdown |
| `SeasonSelector` | `seasons: Season[], onSelect` | Dropdown/tabs for seasons |
| `EpisodeList` | `episodes: Episode[], seriesId` | Vertical episode list |
| `CastRow` | `cast: CastMember[]` | Horizontal scroll of actors |
| `MediaGrid` | `items: Media[]` | Responsive poster grid |
| `RatingBadge` | `rating: number` | Star + score pill |
| `ErrorState` | `message: string` | Error fallback with retry |
| `EmptyState` | `message: string` | Empty results display |

---

## 6. API Integration Spec

### 6.1 TMDB — Search
```
GET https://api.themoviedb.org/3/search/multi?query={query}&page=1&include_adult=false
Headers: Authorization: Bearer {TMDB_TOKEN}
         Accept: application/json
```
Response shape: `{ page: number, results: MultiSearchResult[], total_pages, total_results }`

Filter results to `media_type === 'movie'` or `media_type === 'tv'` only.

### 6.2 TMDB — Movie Details
```
GET https://api.themoviedb.org/3/movie/{movie_id}?append_to_response=credits,similar
Headers: Authorization: Bearer {TMDB_TOKEN}
```

### 6.3 TMDB — TV Details
```
GET https://api.themoviedb.org/3/tv/{series_id}?append_to_response=credits,similar
Headers: Authorization: Bearer {TMDB_TOKEN}
```

### 6.4 TMDB — Season Details (for episodes)
```
GET https://api.themoviedb.org/3/tv/{series_id}/season/{season_number}
Headers: Authorization: Bearer {TMDB_TOKEN}
```

### 6.5 TMDB — Trending
```
GET https://api.themoviedb.org/3/trending/movie/week
GET https://api.themoviedb.org/3/trending/tv/week
```

### 6.6 Aether Embed — Movie
```
https://embed.aether.mom/embed/tmdb-movie-{tmdb_id}?theme=dark&downloads=false&watchparty=false
```
Rendered as:
```html
<iframe
  src="{url}"
  width="100%"
  height="100%"
  frameborder="0"
  allowfullscreen
  allow="fullscreen; autoplay"
></iframe>
```

### 6.7 Aether Embed — TV Episode
```
https://embed.aether.mom/embed/tmdb-tv-{tmdb_id}/{season}/{episode}?theme=dark&downloads=false&watchparty=false
```
Same iframe rendering as above.

---

## 7. TypeScript Types

```typescript
// types/tmdb.ts

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  runtime?: number;
  vote_average: number;
  genres?: { id: number; name: string }[];
  credits?: { cast: CastMember[] };
  similar?: { results: Movie[] };
}

export interface TVSeries {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  number_of_seasons: number;
  vote_average: number;
  genres?: { id: number; name: string }[];
  seasons: Season[];
  credits?: { cast: CastMember[] };
  similar?: { results: TVSeries[] };
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

export interface Episode {
  id: number;
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

export interface SearchResult {
  id: number;
  media_type: MediaType;
  title?: string;        // movie
  name?: string;         // tv
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}
```

---

## 8. Routing Table

| Route | Page | Params |
|---|---|---|
| `/` | Home | — |
| `/search` | Search Results | `?q={query}` |
| `/movie/:id` | Movie Detail | `id` = TMDB movie ID |
| `/tv/:id` | TV Detail | `id` = TMDB series ID |
| `/watch/movie/:id` | Watch Movie | `id` = TMDB movie ID |
| `/watch/tv/:id/:season/:episode` | Watch TV Episode | `id` = TMDB series ID |

**404 Fallback**: Redirect to `/` or show a "Page Not Found" with a link home.

---

## 9. Environment Variables

Create a `.env` file (never commit to git; add to `.gitignore`):

```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_ACCESS_TOKEN=your_tmdb_read_access_token_here
```

The app reads these via `import.meta.env.VITE_TMDB_*`.

**How to get a TMDB key**:
1. Sign up at https://www.themoviedb.org/signup
2. Go to Settings → API → Request an API key
3. Copy the **API Key (v3 auth)** and **API Read Access Token (v4)**

---

## 10. Design Tokens (Tailwind)

```css
/* These map to tailwind classes used throughout */
--background: 0 0% 3.9%;        /* neutral-950 */
--foreground: 0 0% 98%;         /* neutral-50 */
--muted: 0 0% 14.9%;            /* neutral-800 */
--muted-foreground: 0 0% 63.9%; /* neutral-400 */
--accent: 239 84% 67%;          /* indigo-500 */
--accent-foreground: 0 0% 100%;
--card: 0 0% 7%;                /* slightly lighter than bg */
--border: 0 0% 20%;
--radius: 0.75rem;
```

### Typography Scale
| Element | Class |
|---|---|
| Page Title | `text-4xl font-bold tracking-tight` |
| Section Title | `text-2xl font-semibold` |
| Card Title | `text-sm font-medium leading-tight` |
| Body | `text-sm text-neutral-400 leading-relaxed` |
| Caption | `text-xs text-neutral-500` |

---

## 11. Performance & UX Requirements

- **Image Optimization**: Use `loading="lazy"` for below-fold images. Use appropriate TMDB image sizes.
- **Debounced Search**: 300ms debounce on search input to avoid excessive API calls.
- **Error Handling**: Graceful fallbacks for failed API calls — show retry buttons and friendly messages.
- **Responsive Breakpoints**:
  - Mobile: `< 640px` (1–2 columns)
  - Tablet: `640px–1024px` (3–4 columns)
  - Desktop: `> 1024px` (5–6 columns)
- **Accessibility**:
  - All images have `alt` text.
  - Buttons have clear focus states.
  - Color contrast meets WCAG AA.
  - Keyboard navigable episode lists.

---

## 12. Assets Needed

| Asset | Source | Notes |
|---|---|---|
| Posters | TMDB `image.tmdb.org` | Lazy loaded |
| Backdrops | TMDB `image.tmdb.org` | Preload hero only |
| Actor headshots | TMDB `image.tmdb.org` | Lazy loaded |
| Logo | Custom SVG or text logo | "Streamiq" wordmark in indigo-500 |
| Favicon | Simple "S" icon | Place in `/public` |

No custom illustrations needed beyond Lucide icons.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| TMDB API rate limit | High | Implement request caching; warn user if limit hit |
| Aether embed stops working | High | Display "Source unavailable" message; allow user to try again |
| TMDB image CDN slow | Medium | Use smaller poster sizes; lazy load; placeholder skeletons |
| CORS on TMDB | Low | TMDB supports CORS for API; use proper headers |
| No results for niche queries | Low | Show helpful empty state with suggestions |

---

## 14. Open Questions

1. Should we support multiple languages for the UI? (Default: English; stretch: i18n)
2. Should we add a "Recently Viewed" list using `localStorage`? (Stretch)
3. Should the hero carousel auto-play with muted video previews? (Stretch — GIFs only, no video)

(End of file - total 440 lines)
