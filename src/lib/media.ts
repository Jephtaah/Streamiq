import type { MediaType, Movie, SearchResult, TVSeries } from '../types/media'

export type MediaCardItem = SearchResult | Movie | TVSeries

export function getMediaType(item: MediaCardItem): MediaType {
  if ('media_type' in item) return item.media_type
  return 'title' in item ? 'movie' : 'tv'
}

export function getTitle(item: MediaCardItem): string | undefined {
  if ('title' in item) return item.title
  return item.name
}

export function getYear(item: MediaCardItem): string | undefined {
  if ('release_date' in item && item.release_date) {
    return item.release_date.slice(0, 4)
  }
  if ('first_air_date' in item && item.first_air_date) {
    return item.first_air_date.slice(0, 4)
  }
  return undefined
}
