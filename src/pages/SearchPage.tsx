import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchMulti } from '../lib/tmdb'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  useEffect(() => {
    if (!query) return
    searchMulti(query)
      .then((data) => console.log(`Search results for "${query}":`, data.results))
      .catch((error: unknown) => console.error('Search failed:', error))
  }, [query])

  return (
    <div>
      <h1>Search</h1>
      <p>Query: {query || '(none)'}</p>
    </div>
  )
}
