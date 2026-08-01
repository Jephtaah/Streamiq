import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Play } from 'lucide-react'
import EpisodeList from '../components/EpisodeList'
import ErrorState from '../components/ErrorState'
import MediaCard from '../components/MediaCard'
import RatingBadge from '../components/RatingBadge'
import { useSeason, useSimilarShows, useTV } from '../hooks/useMedia'
import { getBackdropUrl, getPosterUrl } from '../lib/justwatch'
import { getYear } from '../lib/media'
import { cn } from '../lib/utils'

const CARD_WIDTH_CLASS = 'w-40 shrink-0 snap-center sm:w-48'
const DEFAULT_SEASON = 1

export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: series, loading, error, refetch } = useTV(id)
  const [selectedSeason, setSelectedSeason] = useState(DEFAULT_SEASON)
  const season = useSeason(id, selectedSeason)
  const similar = useSimilarShows(series?.genres)

  if (loading) {
    return (
      <div>
        <div className="aspect-video w-full animate-pulse bg-neutral-900 md:aspect-[21/9]" />
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-6">
          <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-neutral-800" />
          <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-neutral-800" />
        </div>
      </div>
    )
  }

  if (error || !series) {
    return (
      <ErrorState message={error ?? 'TV series not found.'} onRetry={refetch} />
    )
  }

  const backdropUrl = getBackdropUrl(series.backdrop_path)
  const posterUrl = getPosterUrl(series.poster_path)
  const year = getYear(series)
  const similarShows =
    similar.data?.results.filter((item) => item.id !== series.id) ?? []

  return (
    <div>
      <div className="relative max-h-[60vh] overflow-hidden bg-neutral-900">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={series.name}
            className="h-[60vh] w-full object-cover"
          />
        ) : (
          <div className="flex h-[60vh] w-full items-center justify-center text-2xl font-bold text-neutral-600">
            {series.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="-mt-24 flex flex-col items-center gap-6 pb-6 md:-mt-36 md:flex-row md:items-end md:gap-8">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${series.name} poster`}
              loading="lazy"
              className="w-40 shrink-0 rounded-lg shadow-2xl md:w-56"
            />
          ) : null}
          <div className="w-full min-w-0 pb-2">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {series.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-300">
              {year ? <span>{year}</span> : null}
              <span className="text-neutral-600" aria-hidden="true">
                •
              </span>
              <span>
                {series.number_of_seasons}{' '}
                {series.number_of_seasons === 1 ? 'season' : 'seasons'}
              </span>
              {series.vote_average > 0 ? (
                <RatingBadge rating={series.vote_average} />
              ) : null}
            </div>
            {series.genres && series.genres.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {series.genres.map((genre) => (
                  <span
                    key={genre.code}
                    className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-200"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : null}
            <Link
              to={`/watch/tv/${series.id}/1/1`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              Watch Season 1
            </Link>
          </div>
        </div>

        {series.overview ? (
          <section className="pb-6">
            <h2 className="mb-2 text-lg font-bold text-neutral-100">Synopsis</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-300">
              {series.overview}
            </p>
          </section>
        ) : null}

        {series.seasons.length > 0 ? (
          <section className="pb-6">
            <h2 className="mb-4 text-xl font-bold text-neutral-100">Episodes</h2>
            <div
              role="tablist"
              aria-label="Seasons"
              className="mb-4 flex gap-2 overflow-x-auto pb-1"
            >
              {series.seasons.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedSeason === item.season_number}
                  onClick={() => setSelectedSeason(item.season_number)}
                  className={cn(
                    'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    selectedSeason === item.season_number
                      ? 'border-indigo-500 bg-indigo-600 text-white'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white',
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {season.loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse gap-4 rounded-lg bg-neutral-900 p-3"
                  >
                    <div className="aspect-video w-32 rounded bg-neutral-800" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-2/3 rounded bg-neutral-800" />
                      <div className="h-3 w-1/3 rounded bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : season.error ? (
              <ErrorState message={season.error} onRetry={season.refetch} />
            ) : season.data ? (
              <EpisodeList
                episodes={season.data.episodes}
                seriesId={series.id}
                seasonNumber={season.data.season_number}
                fallbackPoster={series.poster_path}
              />
            ) : null}
          </section>
        ) : null}

        {similarShows.length > 0 ? (
          <section className="pb-10">
            <h2 className="mb-4 text-xl font-bold text-neutral-100">
              More Like This
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
              {similarShows.map((item) => (
                <div key={item.id} className={CARD_WIDTH_CLASS}>
                  <MediaCard item={item} />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
