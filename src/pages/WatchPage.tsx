import { useParams } from 'react-router-dom'

type WatchRouteParams = {
  id?: string
  season?: string
  episode?: string
}

function buildAetherUrl(
  type: 'movie' | 'tv',
  id: string,
  season?: string,
  episode?: string,
): string {
  const base =
    type === 'movie'
      ? `https://embed.aether.mom/embed/tmdb-movie-${id}`
      : `https://embed.aether.mom/embed/tmdb-tv-${id}/${season}/${episode}`
  return `${base}?theme=dark&downloads=false&watchparty=false`
}

export default function WatchPage() {
  const params = useParams<WatchRouteParams>()

  let type: 'movie' | 'tv'
  if (params.season !== undefined || params.episode !== undefined) {
    type = 'tv'
  } else {
    type = 'movie'
  }

  const url = buildAetherUrl(type, params.id ?? '', params.season, params.episode)
  console.log('Aether embed URL:', url)

  return (
    <div>
      <h1>Watch</h1>
      <p>Embed URL: {url}</p>
    </div>
  )
}
