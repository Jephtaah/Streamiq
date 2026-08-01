export interface Movie {
  id: string;
  stream_id: number | null;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  runtime?: number;
  vote_average: number;
  genres?: { id: number; name: string; code: string }[];
  credits?: { cast: CastMember[] };
  similar?: { results: Movie[] };
}

export interface TVSeries {
  id: string;
  stream_id: number | null;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  number_of_seasons: number;
  vote_average: number;
  genres?: { id: number; name: string; code: string }[];
  seasons: Season[];
  credits?: { cast: CastMember[] };
  similar?: { results: TVSeries[] };
}

export interface Season {
  id: string;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string | null;
}

export interface SeasonDetails extends Season {
  episodes: Episode[];
}

export interface Episode {
  id: string;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
  air_date: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export type MediaType = 'movie' | 'tv';

export type TrendingMedia = Movie | TVSeries;

export interface SearchResult {
  id: string;
  stream_id: number | null;
  media_type: MediaType;
  title?: string; // movie
  name?: string; // tv
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
