import { cn } from '../lib/utils'

interface SkeletonCardProps {
  className?: string
}

export default function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="aspect-[2/3] rounded-lg bg-neutral-800" />
      <div className="mt-2 space-y-2">
        <div className="h-3 w-3/4 rounded bg-neutral-800" />
        <div className="h-3 w-1/3 rounded bg-neutral-800" />
      </div>
    </div>
  )
}
