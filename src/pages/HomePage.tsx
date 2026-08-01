import { useTrendingMovies, useTrendingTV } from '../hooks/useMedia'
import type { Movie, TrendingMedia, TVSeries } from '../types/media'
import ErrorState from '../components/ErrorState'
import HeroCarousel from '../components/HeroCarousel'
import MediaCard from '../components/MediaCard'
import SkeletonCard from '../components/SkeletonCard'

const HERO_MOVIE_COUNT = 3
const HERO_TV_COUNT = 2
const CARD_WIDTH_CLASS = 'w-40 shrink-0 snap-center sm:w-48'
const SKELETON_COUNT = 8

function buildHeroItems(
  movies: Movie[],
  tvShows: TVSeries[],
): TrendingMedia[] {
  const items: TrendingMedia[] = []
  const rounds = Math.max(HERO_MOVIE_COUNT, HERO_TV_COUNT)
  for (let i = 0; i < rounds; i++) {
    if (i < HERO_MOVIE_COUNT && movies[i]) items.push(movies[i])
    if (i < HERO_TV_COUNT && tvShows[i]) items.push(tvShows[i])
  }
  return items.slice(0, HERO_MOVIE_COUNT + HERO_TV_COUNT)
}

function HeroSkeleton() {
  return (
    <div className="aspect-video w-full animate-pulse bg-neutral-900 md:aspect-[21/9]" />
  )
}

interface TrendingSectionProps {
  title: string
  loading: boolean
  error: string | null
  onRetry: () => void
  children: React.ReactNode
}

function TrendingSection({
  title,
  loading,
  error,
  onRetry,
  children,
}: TrendingSectionProps) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-xl font-bold text-neutral-100">{title}</h2>
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} className={CARD_WIDTH_CLASS} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        children
      )}
    </section>
  )
}

export default function HomePage() {
  const trendingMovies = useTrendingMovies()
  const trendingTV = useTrendingTV()

  const heroItems = buildHeroItems(
    trendingMovies.data?.results ?? [],
    trendingTV.data?.results ?? [],
  )

  return (
    <div>
      <div className="flex flex-col bg-neutral-950">
        {trendingMovies.loading || trendingTV.loading ? (
          <HeroSkeleton />
        ) : heroItems.length > 0 ? (
          <HeroCarousel items={heroItems} />
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-10 md:px-6">
        <TrendingSection
          title="Trending Movies"
          loading={trendingMovies.loading}
          error={trendingMovies.error}
          onRetry={trendingMovies.refetch}
        >
          <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
            {trendingMovies.data?.results.map((movie) => (
              <div key={movie.id} className={CARD_WIDTH_CLASS}>
                <MediaCard item={movie} />
              </div>
            ))}
          </div>
        </TrendingSection>

        <TrendingSection
          title="Trending TV"
          loading={trendingTV.loading}
          error={trendingTV.error}
          onRetry={trendingTV.refetch}
        >
          <div className="flex gap-4 overflow-x-auto pb-2 [scroll-snap-type:x_mandatory]">
            {trendingTV.data?.results.map((series) => (
              <div key={series.id} className={CARD_WIDTH_CLASS}>
                <MediaCard item={series} />
              </div>
            ))}
          </div>
        </TrendingSection>
      </div>
    </div>
  )
}
