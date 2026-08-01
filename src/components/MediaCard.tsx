import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { getPosterUrl } from '../lib/justwatch'
import { getMediaType, getTitle, getYear, type MediaCardItem } from '../lib/media'
import { cn } from '../lib/utils'
import RatingBadge from './RatingBadge'

interface MediaCardProps {
  item: MediaCardItem
  className?: string
}

export default function MediaCard({ item, className }: MediaCardProps) {
  const mediaType = getMediaType(item)
  const title = getTitle(item) ?? 'Untitled'
  const year = getYear(item)
  const posterUrl = getPosterUrl(item.poster_path)
  const href = mediaType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`

  return (
    <Link to={href} className={cn('group block', className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-neutral-900 shadow-md transition-shadow duration-300 group-hover:shadow-xl">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            {title}
          </div>
        )}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        >
          <Play size={48} fill="currentColor" className="text-white" />
        </div>
      </div>
      <div className="mt-2 space-y-1">
        <h3 className="truncate text-sm font-medium text-neutral-100">{title}</h3>
        <div className="flex items-center gap-2">
          {year && <span className="text-xs text-neutral-400">{year}</span>}
          <RatingBadge rating={item.vote_average} />
        </div>
      </div>
    </Link>
  )
}
