import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getMovieDetails } from '../lib/tmdb'

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (!id) return
    getMovieDetails(Number(id))
      .then((movie) => console.log('Movie:', movie))
      .catch((error: unknown) => console.error('Failed to load movie:', error))
  }, [id])

  return (
    <div>
      <h1>Movie Details</h1>
      <p>Movie ID: {id}</p>
    </div>
  )
}
