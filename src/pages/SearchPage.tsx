import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearch } from '../hooks/useMedia'
import type { MediaType } from '../types/media'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import MediaCard from '../components/MediaCard'
import MediaGrid from '../components/MediaGrid'
import SkeletonCard from '../components/SkeletonCard'
import { cn } from '../lib/utils'

type Filter = 'all' | MediaType

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
]

const SKELETON_COUNT = 12

interface FilterTabsProps {
  value: Filter
  onChange: (filter: Filter) => void
}

function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter results"
      className="mb-6 flex w-fit gap-1 rounded-full border border-neutral-800 bg-neutral-900 p-1"
    >
      {FILTERS.map(({ value: filterValue, label }) => (
        <button
          key={filterValue}
          type="button"
          role="tab"
          aria-selected={value === filterValue}
          onClick={() => onChange(filterValue)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
            value === filterValue
              ? 'bg-indigo-600 text-white'
              : 'text-neutral-400 hover:text-white',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''
  const { data, loading, error, refetch } = useSearch(query)
  const [filter, setFilter] = useState<Filter>('all')

  const results = useMemo(() => {
    if (!data) return []
    if (filter === 'all') return data.results
    return data.results.filter((item) => item.media_type === filter)
  }, [data, filter])

  if (!query) {
    return (
      <EmptyState message="Enter a search term above to find movies and TV shows." />
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-100">Search results</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Results for &quot;{query}&quot; — {data?.total_results ?? 0} found
        </p>
      </header>

      <FilterTabs value={filter} onChange={setFilter} />

      {loading ? (
        <MediaGrid>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </MediaGrid>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : results.length === 0 ? (
        <EmptyState />
      ) : (
        <MediaGrid>
          {results.map((item) => (
            <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
          ))}
        </MediaGrid>
      )}
    </div>
  )
}
