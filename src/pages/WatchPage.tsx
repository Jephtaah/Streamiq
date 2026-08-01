import { useParams } from 'react-router-dom'
import ErrorState from '../components/ErrorState'
import { useMovie, useTV } from '../hooks/useMedia'

type WatchRouteParams = {
  id?: string
  season?: string
  episode?: string
}

function buildAetherUrl(
  type: 'movie' | 'tv',
  streamId: number,
  season?: string,
  episode?: string,
): string {
  const base =
    type === 'movie'
      ? `https://embed.aether.mom/embed/tmdb-movie-${streamId}`
      : `https://embed.aether.mom/embed/tmdb-tv-${streamId}/${season}/${episode}`
  return `${base}?theme=dark&downloads=false&watchparty=false`
}

export default function WatchPage() {
  const params = useParams<WatchRouteParams>()
  const isTV = params.season !== undefined || params.episode !== undefined
  const movieState = useMovie(isTV ? null : params.id)
  const seriesState = useTV(isTV ? params.id : null)

  const loading = isTV ? seriesState.loading : movieState.loading
  const error = isTV ? seriesState.error : movieState.error
  const refetch = isTV ? seriesState.refetch : movieState.refetch
  const streamId = isTV
    ? seriesState.data?.stream_id
    : movieState.data?.stream_id
  const title = isTV ? seriesState.data?.name : movieState.data?.title

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center text-neutral-400 md:px-6">
        Loading stream...
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />
  }

  if (!streamId) {
    return (
      <ErrorState
        message="Unable to resolve this title for streaming."
        onRetry={refetch}
      />
    )
  }

  const type = isTV ? 'tv' : 'movie'
  const url = buildAetherUrl(type, streamId, params.season, params.episode)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <h1 className="mb-4 text-xl font-bold text-neutral-100">{title}</h1>
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={url}
          title={title ?? 'Watch'}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
          referrerPolicy="origin"
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
