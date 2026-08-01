import { Film } from 'lucide-react'

interface EmptyStateProps {
  message?: string
}

export default function EmptyState({
  message = 'No results found. Try a different title.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Film size={40} className="text-neutral-600" aria-hidden="true" />
      <p className="max-w-md text-sm text-neutral-400">{message}</p>
    </div>
  )
}
