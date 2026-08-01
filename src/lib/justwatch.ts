import type {
  Episode,
  Movie,
  PaginatedResponse,
  SearchResult,
  Season,
  SeasonDetails,
  TVSeries,
} from '../types/media'

const API_ENDPOINT = 'https://apis.justwatch.com/graphql'
const IMAGE_BASE = 'https://images.justwatch.com'
const CACHE_TTL_MS = 5 * 60 * 1000
const COUNTRY = 'US'
const LANGUAGE = 'en'
const DEFAULT_PAGE_SIZE = 20

const POSTER_PROFILES: Record<string, string> = {
  w92: 's166',
  w154: 's166',
  w185: 's166',
  w300: 's166',
  w342: 's166',
  w500: 's592',
  w780: 's592',
}
const BACKDROP_PROFILES: Record<string, string> = {
  w300: 's1440',
  w500: 's1440',
  w780: 's1440',
  w1280: 's1440',
}
const DEFAULT_POSTER_PROFILE = 's592'
const DEFAULT_BACKDROP_PROFILE = 's1440'
const DEFAULT_STILL_PROFILE = 's166'

const GENRE_NAMES: Record<string, string> = {
  act: 'Action',
  adv: 'Adventure',
  ani: 'Animation',
  bio: 'Biography',
  cmy: 'Comedy',
  crm: 'Crime',
  doc: 'Documentary',
  drm: 'Drama',
  fam: 'Family',
  fnt: 'Fantasy',
  hst: 'History',
  hrr: 'Horror',
  msy: 'Mystery',
  mus: 'Music',
  rom: 'Romance',
  scf: 'Sci-Fi',
  spr: 'Sport',
  thr: 'Thriller',
  war: 'War',
  wst: 'Western',
}

interface CacheEntry<T> {
  data: T
  ts: number
}

const cache = new Map<string, CacheEntry<unknown>>()

interface JWScoring {
  imdbScore: number | null
}

interface JWExternalIds {
  imdbId: string | null
  streamId: string | null
}

interface JWBackdrop {
  backdropUrl: string | null
}

interface JWContent {
  title: string | null
  originalReleaseYear: number | null
  originalReleaseDate: string | null
  runtime: number | null
  shortDescription: string | null
  fullPath: string | null
  posterUrl: string | null
  backdrops: JWBackdrop[] | null
  genres: { shortName: string }[] | null
  externalIds: JWExternalIds | null
  scoring: JWScoring | null
  seasonNumber: number | null
  episodeNumber: number | null
}

type JWObjectType = 'MOVIE' | 'SHOW' | 'SHOW_SEASON' | 'EPISODE'

interface JWNode {
  id: string
  objectType: JWObjectType
  content: JWContent
  seasons?: JWNode[]
  episodes?: JWNode[]
}

interface JWResponse<T> {
  data?: T
  errors?: { message: string }[]
}

const LIST_FIELDS = `
  id
  objectType
  content(country: $country, language: $language) {
    title
    originalReleaseYear
    originalReleaseDate
    runtime
    shortDescription
    ... on MovieOrShowContent {
      fullPath
      posterUrl
      backdrops {
        backdropUrl
      }
      genres {
        shortName
      }
      externalIds {
        imdbId
        streamId: tmdbId
      }
      scoring {
        imdbScore
      }
    }
  }
`

const POPULAR_QUERY = `
query Popular($country: Country!, $language: Language!, $filter: TitleFilter!, $first: Int!, $sortBy: PopularTitlesSorting!) {
  popularTitles(country: $country, filter: $filter, first: $first, sortBy: $sortBy, sortRandomSeed: 0) {
    edges {
      node {
        ${LIST_FIELDS}
      }
    }
  }
}
`

const DETAILS_QUERY = `
query Details($nodeId: ID!, $country: Country!, $language: Language!) {
  node(id: $nodeId) {
    ... on MovieOrShowOrSeasonOrEpisode {
      ${LIST_FIELDS}
      ... on Show {
        totalSeasonCount
        seasons(sortDirection: ASC) {
          id
          objectType
          content(country: $country, language: $language) {
            title
            ... on SeasonContent {
              seasonNumber
            }
          }
          ... on Season {
            episodes(sortDirection: ASC) {
              id
              objectType
              content(country: $country, language: $language) {
                title
                runtime
                originalReleaseDate
                shortDescription
                ... on EpisodeContent {
                  seasonNumber
                  episodeNumber
                }
              }
            }
          }
        }
      }
    }
  }
}
`

async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const key = `${query}|${JSON.stringify(variables)}`
  const cached = cache.get(key) as CacheEntry<T> | undefined
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`JustWatch request failed (${response.status})`)
  }

  const body = (await response.json()) as JWResponse<T>
  if (!body.data) {
    const message = body.errors?.[0]?.message ?? 'Unknown error'
    throw new Error(`JustWatch request failed: ${message}`)
  }

  cache.set(key, { data: body.data, ts: Date.now() })
  return body.data
}

async function fetchTitles(
  filter: Record<string, unknown>,
  sortBy: string,
  first: number,
): Promise<JWNode[]> {
  const data = await graphql<{
    popularTitles: { edges: { node: JWNode }[] }
  }>(POPULAR_QUERY, {
    country: COUNTRY,
    language: LANGUAGE,
    filter,
    first,
    sortBy,
  })
  return data.popularTitles.edges.map((edge) => edge.node)
}

async function getDetails(nodeId: string): Promise<JWNode> {
  const data = await graphql<{ node: JWNode | null }>(DETAILS_QUERY, {
    nodeId,
    country: COUNTRY,
    language: LANGUAGE,
  })
  if (!data.node) {
    throw new Error(`Title not found: ${nodeId}`)
  }
  return data.node
}

function toStreamId(streamId: string | null | undefined): number | null {
  const parsed = Number(streamId)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function toGenres(
  genres: JWContent['genres'],
): { id: number; name: string; code: string }[] | undefined {
  if (!genres) return undefined
  return genres.map((genre, index) => ({
    id: index,
    name: GENRE_NAMES[genre.shortName] ?? genre.shortName,
    code: genre.shortName,
  }))
}

function toMovie(node: JWNode): Movie {
  const content = node.content
  return {
    id: node.id,
    stream_id: toStreamId(content.externalIds?.streamId),
    title: content.title ?? 'Untitled',
    poster_path: content.posterUrl,
    backdrop_path: content.backdrops?.[0]?.backdropUrl ?? null,
    overview: content.shortDescription ?? '',
    release_date: content.originalReleaseDate ?? '',
    runtime: content.runtime ?? undefined,
    vote_average: content.scoring?.imdbScore ?? 0,
    genres: toGenres(content.genres),
  }
}

function toSeason(node: JWNode): Season {
  const seasonNumber = node.content.seasonNumber ?? 0
  return {
    id: node.id,
    season_number: seasonNumber,
    name: node.content.title ?? `Season ${seasonNumber}`,
    episode_count: (node.episodes ?? []).length,
    poster_path: node.content.posterUrl ?? null,
  }
}

function toEpisode(node: JWNode): Episode {
  const content = node.content
  return {
    id: node.id,
    episode_number: content.episodeNumber ?? 0,
    name: content.title ?? 'Untitled',
    overview: content.shortDescription ?? '',
    still_path: null,
    runtime: content.runtime ?? null,
    air_date: content.originalReleaseDate ?? '',
  }
}

function toTVSeries(node: JWNode): TVSeries {
  const content = node.content
  const seasons = (node.seasons ?? []).map(toSeason)
  return {
    id: node.id,
    stream_id: toStreamId(content.externalIds?.streamId),
    name: content.title ?? 'Untitled',
    poster_path: content.posterUrl,
    backdrop_path: content.backdrops?.[0]?.backdropUrl ?? null,
    overview: content.shortDescription ?? '',
    first_air_date: content.originalReleaseDate ?? '',
    number_of_seasons: seasons.length,
    vote_average: content.scoring?.imdbScore ?? 0,
    genres: toGenres(content.genres),
    seasons,
  }
}

function toSearchResult(node: JWNode): SearchResult {
  const content = node.content
  const isTV = node.objectType === 'SHOW'
  return {
    id: node.id,
    media_type: isTV ? 'tv' : 'movie',
    title: content.title ?? undefined,
    name: content.title ?? undefined,
    poster_path: content.posterUrl,
    release_date: isTV ? undefined : (content.originalReleaseDate ?? undefined),
    first_air_date: isTV
      ? (content.originalReleaseDate ?? undefined)
      : undefined,
    vote_average: content.scoring?.imdbScore ?? 0,
    stream_id: toStreamId(content.externalIds?.streamId),
  }
}

function resolveImage(path: string | null, profile: string): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${IMAGE_BASE}${path.replace('{profile}', profile).replace('{format}', 'jpg')}`
}

export function searchMulti(
  query: string,
  page = 1,
): Promise<PaginatedResponse<SearchResult>> {
  const first = Math.min(page * DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)
  return fetchTitles(
    { searchQuery: query, includeTitlesWithoutUrl: true },
    'POPULAR',
    first,
  ).then((nodes) => {
    const results = nodes
      .filter(
        (node) => node.objectType === 'MOVIE' || node.objectType === 'SHOW',
      )
      .map(toSearchResult)
    return {
      page,
      results,
      total_pages: 1,
      total_results: results.length,
    }
  })
}

export async function getMovieDetails(id: string): Promise<Movie> {
  const node = await getDetails(id)
  if (node.objectType !== 'MOVIE') {
    throw new Error(`Expected a movie, got ${node.objectType} for ${id}`)
  }
  return toMovie(node)
}

export async function getTVDetails(id: string): Promise<TVSeries> {
  const node = await getDetails(id)
  if (node.objectType !== 'SHOW') {
    throw new Error(`Expected a TV series, got ${node.objectType} for ${id}`)
  }
  return toTVSeries(node)
}

export async function getSeasonDetails(
  seriesId: string,
  seasonNum: number,
): Promise<SeasonDetails> {
  const node = await getDetails(seriesId)
  if (node.objectType !== 'SHOW') {
    throw new Error(`Expected a TV series, got ${node.objectType} for ${seriesId}`)
  }
  const season = (node.seasons ?? []).find(
    (candidate) => candidate.content.seasonNumber === seasonNum,
  )
  if (!season) {
    throw new Error(`Season ${seasonNum} not found for ${seriesId}`)
  }
  return {
    ...toSeason(season),
    episodes: (season.episodes ?? []).map(toEpisode),
  }
}

export function getTrendingMovies(): Promise<PaginatedResponse<Movie>> {
  return fetchTitles(
    { objectTypes: ['MOVIE'], includeTitlesWithoutUrl: true },
    'TRENDING',
    DEFAULT_PAGE_SIZE,
  ).then((nodes) => ({
    page: 1,
    results: nodes.map(toMovie),
    total_pages: 1,
    total_results: nodes.length,
  }))
}

export function getTrendingTV(): Promise<PaginatedResponse<TVSeries>> {
  return fetchTitles(
    { objectTypes: ['SHOW'], includeTitlesWithoutUrl: true },
    'TRENDING',
    DEFAULT_PAGE_SIZE,
  ).then((nodes) => ({
    page: 1,
    results: nodes.map(toTVSeries),
    total_pages: 1,
    total_results: nodes.length,
  }))
}

export function getSimilarMovies(
  genres: { code?: string }[] | undefined,
): Promise<PaginatedResponse<Movie>> {
  const code = genres?.[0]?.code
  if (!code) return getTrendingMovies()
  return fetchTitles(
    { objectTypes: ['MOVIE'], includeTitlesWithoutUrl: true, genres: [code] },
    'POPULAR',
    DEFAULT_PAGE_SIZE,
  ).then((nodes) => ({
    page: 1,
    results: nodes.map(toMovie),
    total_pages: 1,
    total_results: nodes.length,
  }))
}

export function getSimilarShows(
  genres: { code?: string }[] | undefined,
): Promise<PaginatedResponse<TVSeries>> {
  const code = genres?.[0]?.code
  if (!code) return getTrendingTV()
  return fetchTitles(
    { objectTypes: ['SHOW'], includeTitlesWithoutUrl: true, genres: [code] },
    'POPULAR',
    DEFAULT_PAGE_SIZE,
  ).then((nodes) => ({
    page: 1,
    results: nodes.map(toTVSeries),
    total_pages: 1,
    total_results: nodes.length,
  }))
}

export function getPosterUrl(
  path: string | null,
  size = 'w500',
): string | null {
  return resolveImage(path, POSTER_PROFILES[size] ?? DEFAULT_POSTER_PROFILE)
}

export function getBackdropUrl(
  path: string | null,
  size = 'w1280',
): string | null {
  return resolveImage(path, BACKDROP_PROFILES[size] ?? DEFAULT_BACKDROP_PROFILE)
}

export function getStillUrl(path: string | null, size = 'w300'): string | null {
  return resolveImage(path, POSTER_PROFILES[size] ?? DEFAULT_STILL_PROFILE)
}
