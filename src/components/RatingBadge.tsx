import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface RatingBadgeProps {
  rating: number
  className?: string
}

function ratingColor(rating: number): string {
  if (rating >= 7) return 'border-green-800 bg-green-900/60 text-green-300'
  if (rating >= 5) return 'border-yellow-800 bg-yellow-900/60 text-yellow-300'
  return 'border-red-800 bg-red-900/60 text-red-300'
}

export default function RatingBadge({ rating, className }: RatingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        ratingColor(rating),
        className,
      )}
    >
      <Star size={12} fill="currentColor" aria-hidden="true" />
      {rating.toFixed(1)}
    </span>
  )
}
