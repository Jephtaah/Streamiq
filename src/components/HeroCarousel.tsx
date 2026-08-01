import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { getBackdropUrl } from '../lib/justwatch'
import { getMediaType, getTitle } from '../lib/media'
import type { TrendingMedia } from '../types/media'
import { cn } from '../lib/utils'

interface HeroCarouselProps {
  items: TrendingMedia[]
}

const SLIDE_INTERVAL_MS = 8000

function getWatchHref(item: TrendingMedia): string {
  const type = getMediaType(item)
  return type === 'movie'
    ? `/watch/movie/${item.id}`
    : `/watch/tv/${item.id}/1/1`
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || items.length <= 1) return
    const interval = setInterval(() => {
      setCurrentIndex((index) => (index + 1) % items.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [paused, items.length])

  if (items.length === 0) return null

  function goTo(index: number) {
    setCurrentIndex((index + items.length) % items.length)
  }

  return (
    <section
      className="relative overflow-hidden bg-neutral-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Trending highlights"
    >
      <div className="aspect-video w-full md:aspect-[21/9]">
        {items.map((item, index) => {
          const active = index === currentIndex
          const backdropUrl = getBackdropUrl(item.backdrop_path)
          const title = getTitle(item) ?? 'Untitled'
          return (
            <div
              key={item.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-700',
                active ? 'opacity-100' : 'pointer-events-none opacity-0',
              )}
              aria-hidden={!active}
            >
              {backdropUrl ? (
                <img
                  src={backdropUrl}
                  alt={active ? title : ''}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900">
                  <span className="text-2xl font-bold text-neutral-600">
                    {title}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-16 pt-24 md:px-10 md:pb-20">
                <h2 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-4xl">
                  {title}
                </h2>
                {item.overview && (
                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-neutral-200 md:text-base">
                    {item.overview}
                  </p>
                )}
                <Link
                  to={getWatchHref(item)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                >
                  <Play size={18} fill="currentColor" aria-hidden="true" />
                  Watch Now
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-colors hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Next slide"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
                  index === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
                )}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
