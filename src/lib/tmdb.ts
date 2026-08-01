import type {
  Movie,
  SearchResult,
  SeasonDetails,
  TMDBResponse,
  TVSeries,
} from '../types/tmdb'

const API_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/'
const CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry<T> {
  data: T
  ts: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getToken(): string {
  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN
  if (!token) {
    throw new Error(
      'VITE_TMDB_ACCESS_TOKEN is not set. Add it to your .env file.',
    )
  }
  return token as string
}

async function fetchTMDB<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`
  const cached = cache.get(url) as CacheEntry<T> | undefined
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}): ${path}`)
  }

  const data = (await response.json()) as T
  cache.set(url, { data, ts: Date.now() })
  return data
}

export function searchMulti(
  query: string,
  page = 1,
): Promise<TMDBResponse<SearchResult>> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    include_adult: 'false',
  })
  return fetchTMDB<TMDBResponse<SearchResult>>(`/search/multi?${params}`)
}

export function getMovieDetails(id: number): Promise<Movie> {
  return fetchTMDB<Movie>(
    `/movie/${id}?append_to_response=credits,similar`,
  )
}

export function getTVDetails(id: number): Promise<TVSeries> {
  return fetchTMDB<TVSeries>(`/tv/${id}?append_to_response=credits,similar`)
}

export function getSeasonDetails(
  seriesId: number,
  seasonNum: number,
): Promise<SeasonDetails> {
  return fetchTMDB<SeasonDetails>(`/tv/${seriesId}/season/${seasonNum}`)
}

export function getTrendingMovies(): Promise<TMDBResponse<Movie>> {
  return fetchTMDB<TMDBResponse<Movie>>('/trending/movie/week')
}

export function getTrendingTV(): Promise<TMDBResponse<TVSeries>> {
  return fetchTMDB<TMDBResponse<TVSeries>>('/trending/tv/week')
}

export function getPosterUrl(path: string | null, size = 'w500'): string | null {
  if (!path) return null
  return `${IMAGE_BASE}${size}${path}`
}

export function getBackdropUrl(
  path: string | null,
  size = 'w1280',
): string | null {
  if (!path) return null
  return `${IMAGE_BASE}${size}${path}`
}

export function getStillUrl(path: string | null, size = 'w300'): string | null {
  if (!path) return null
  return `${IMAGE_BASE}${size}${path}`
}
