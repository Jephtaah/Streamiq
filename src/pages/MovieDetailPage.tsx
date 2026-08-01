import { Link, useParams } from 'react-router-dom'
import { Play } from 'lucide-react'
import ErrorState from '../components/ErrorState'
import MediaCard from '../components/MediaCard'
import RatingBadge from '../components/RatingBadge'
import { useMovie, useSimilarMovies } from '../hooks/useMedia'
import { getBackdropUrl, getPosterUrl } from '../lib/justwatch'
import { getYear } from '../lib/media'

const CARD_WIDTH_CLASS = 'w-40 shrink-0 snap-center sm:w-48'

function formatRuntime(minutes?: number): string | null {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: movie, loading, error, refetch } = useMovie(id)
  const similar = useSimilarMovies(movie?.genres)

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

  if (error || !movie) {
    return <ErrorState message={error ?? 'Movie not found.'} onRetry={refetch} />
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path)
  const posterUrl = getPosterUrl(movie.poster_path)
  const year = getYear(movie)
  const runtime = formatRuntime(movie.runtime)
  const similarMovies =
    similar.data?.results.filter((item) => item.id !== movie.id) ?? []

  return (
    <div>
      <div className="relative max-h-[60vh] overflow-hidden bg-neutral-900">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="h-[60vh] w-full object-cover"
          />
        ) : (
          <div className="flex h-[60vh] w-full items-center justify-center text-2xl font-bold text-neutral-600">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="-mt-24 flex flex-col items-center gap-6 pb-6 md:-mt-36 md:flex-row md:items-end md:gap-8">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              className="w-40 shrink-0 rounded-lg shadow-2xl md:w-56"
            />
          ) : null}
          <div className="w-full min-w-0 pb-2">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {movie.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-300">
              {year ? <span>{year}</span> : null}
              {runtime ? (
                <>
                  <span className="text-neutral-600" aria-hidden="true">
                    •
                  </span>
                  <span>{runtime}</span>
                </>
              ) : null}
              {movie.vote_average > 0 ? (
                <RatingBadge rating={movie.vote_average} />
              ) : null}
            </div>
            {movie.genres && movie.genres.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
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
              to={`/watch/movie/${movie.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              <Play size={18} fill="currentColor" aria-hidden="true" />
              Watch Now
            </Link>
          </div>
        </div>

        {movie.overview ? (
          <section className="pb-6">
            <h2 className="mb-2 text-lg font-bold text-neutral-100">Synopsis</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-300">
              {movie.overview}
            </p>
          </section>
        ) : null}

        {similarMovies.length > 0 ? (
          <section className="pb-10">
            <h2 className="mb-4 text-xl font-bold text-neutral-100">
              More Like This
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
              {similarMovies.map((item) => (
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
