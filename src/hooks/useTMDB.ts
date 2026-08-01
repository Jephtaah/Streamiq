import { useCallback, useEffect, useState } from 'react'
import {
  getMovieDetails,
  getSeasonDetails,
  getTrendingMovies,
  getTrendingTV,
  getTVDetails,
  searchMulti,
} from '../lib/tmdb'
import type {
  Movie,
  SearchResult,
  SeasonDetails,
  TMDBResponse,
  TVSeries,
} from '../types/tmdb'

export interface TMDBState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

function useTMDB<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[],
  skip = false,
): TMDBState<T> {
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

export function useSearch(query: string): TMDBState<TMDBResponse<SearchResult>> {
  return useTMDB(() => searchMulti(query), [query], query.length === 0)
}

export function useMovie(id: number | null | undefined): TMDBState<Movie> {
  return useTMDB(() => getMovieDetails(id as number), [id], !id)
}

export function useTV(id: number | null | undefined): TMDBState<TVSeries> {
  return useTMDB(() => getTVDetails(id as number), [id], !id)
}

export function useSeason(
  seriesId: number | null | undefined,
  seasonNum: number | null | undefined,
): TMDBState<SeasonDetails> {
  return useTMDB(
    () => getSeasonDetails(seriesId as number, seasonNum as number),
    [seriesId, seasonNum],
    !seriesId || !seasonNum,
  )
}

export function useTrendingMovies(): TMDBState<TMDBResponse<Movie>> {
  return useTMDB(() => getTrendingMovies(), [])
}

export function useTrendingTV(): TMDBState<TMDBResponse<TVSeries>> {
  return useTMDB(() => getTrendingTV(), [])
}
