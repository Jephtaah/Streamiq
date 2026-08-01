import { useCallback, useEffect, useState } from 'react'
import {
  getMovieDetails,
  getSeasonDetails,
  getSimilarMovies,
  getSimilarShows,
  getTrendingMovies,
  getTrendingTV,
  getTVDetails,
  searchMulti,
} from '../lib/justwatch'
import type {
  Movie,
  PaginatedResponse,
  SearchResult,
  SeasonDetails,
  TVSeries,
} from '../types/media'

export interface RequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useMediaRequest<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  skip = false,
): RequestState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (skip) {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Something went wrong.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip, attempt])

  const refetch = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  return { data, loading, error, refetch }
}

export function useSearch(
  query: string,
): RequestState<PaginatedResponse<SearchResult>> {
  return useMediaRequest(() => searchMulti(query), [query], query.length === 0)
}

export function useMovie(id: string | null | undefined): RequestState<Movie> {
  return useMediaRequest(() => getMovieDetails(id as string), [id], !id)
}

export function useTV(id: string | null | undefined): RequestState<TVSeries> {
  return useMediaRequest(() => getTVDetails(id as string), [id], !id)
}

export function useSeason(
  seriesId: string | null | undefined,
  seasonNum: number | null | undefined,
): RequestState<SeasonDetails> {
  return useMediaRequest(
    () => getSeasonDetails(seriesId as string, seasonNum as number),
    [seriesId, seasonNum],
    !seriesId || !seasonNum,
  )
}

export function useTrendingMovies(): RequestState<PaginatedResponse<Movie>> {
  return useMediaRequest(() => getTrendingMovies(), [])
}

export function useTrendingTV(): RequestState<PaginatedResponse<TVSeries>> {
  return useMediaRequest(() => getTrendingTV(), [])
}

export function useSimilarMovies(
  genres: { code?: string }[] | undefined,
): RequestState<PaginatedResponse<Movie>> {
  const code = genres?.[0]?.code
  return useMediaRequest(() => getSimilarMovies(genres), [code], !code)
}

export function useSimilarShows(
  genres: { code?: string }[] | undefined,
): RequestState<PaginatedResponse<TVSeries>> {
  const code = genres?.[0]?.code
  return useMediaRequest(() => getSimilarShows(genres), [code], !code)
}
