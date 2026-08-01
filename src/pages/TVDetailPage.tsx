import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getTVDetails } from '../lib/tmdb'

export default function TVDetailPage() {
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    if (!id) return
    getTVDetails(Number(id))
      .then((series) => console.log('TV Series:', series))
      .catch((error: unknown) => console.error('Failed to load TV series:', error))
  }, [id])

  return (
    <div>
      <h1>TV Series Details</h1>
      <p>TV Series ID: {id}</p>
    </div>
  )
}
