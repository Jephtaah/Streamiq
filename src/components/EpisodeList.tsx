import { useRef, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getPosterUrl, getStillUrl } from '../lib/justwatch'
import type { Episode } from '../types/media'

interface EpisodeListProps {
  episodes: Episode[]
  seriesId: string
  seasonNumber: number
  fallbackPoster: string | null
}

export default function EpisodeList({
  episodes,
  seriesId,
  seasonNumber,
  fallbackPoster,
}: EpisodeListProps) {
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  if (episodes.length === 0) return null

  function handleListKeyDown(
    event: KeyboardEvent<HTMLElement>,
    index: number,
  ) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      linkRefs.current[(index + 1) % episodes.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      linkRefs.current[(index - 1 + episodes.length) % episodes.length]?.focus()
    }
  }

  return (
    <ul className="space-y-2">
      {episodes.map((episode, index) => {
        const thumbnail = getStillUrl(episode.still_path) ?? getPosterUrl(fallbackPoster)
        return (
          <li key={episode.id}>
            <Link
              ref={(el) => {
                linkRefs.current[index] = el
              }}
              to={`/watch/tv/${seriesId}/${seasonNumber}/${episode.episode_number}`}
              aria-label={`Watch ${episode.name}`}
              onKeyDown={(event) => handleListKeyDown(event, index)}
              className="group flex gap-4 rounded-lg p-3 transition-colors hover:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="w-32 shrink-0 overflow-hidden rounded-md bg-neutral-900">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt=""
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center text-neutral-600">
                    {episode.episode_number}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-neutral-500">
                    {episode.episode_number}.
                  </span>
                  <h3 className="truncate text-sm font-medium text-neutral-100">
                    {episode.name}
                  </h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                  {episode.runtime ? <span>{episode.runtime} min</span> : null}
                  {episode.air_date ? <span>{episode.air_date}</span> : null}
                </div>
                {episode.overview ? (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
                    {episode.overview}
                  </p>
                ) : null}
              </div>
              <span className="hidden shrink-0 items-center gap-1 self-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-indigo-700 sm:inline-flex">
                <Play size={14} fill="currentColor" aria-hidden="true" />
                Watch
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
