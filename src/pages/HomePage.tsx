import { useEffect } from 'react'
import { getTrendingMovies, getTrendingTV } from '../lib/tmdb'

export default function HomePage() {
  useEffect(() => {
    getTrendingMovies()
      .then((data) => console.log('Trending Movies:', data.results))
      .catch((error: unknown) => console.error('Failed to load trending movies:', error))

    getTrendingTV()
      .then((data) => console.log('Trending TV:', data.results))
      .catch((error: unknown) => console.error('Failed to load trending TV:', error))
  }, [])

  return (
    <div>
      <h1>Streamiq</h1>
      <p>Home page — trending data logged to console.</p>
    </div>
  )
}
