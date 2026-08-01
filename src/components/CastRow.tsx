import { getPosterUrl } from '../lib/tmdb'
import type { CastMember } from '../types/tmdb'

interface CastRowProps {
  cast: CastMember[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export default function CastRow({ cast }: CastRowProps) {
  if (cast.length === 0) return null

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-4">
        {cast.map((member) => {
          const headshot = getPosterUrl(member.profile_path, 'w185')
          return (
            <div
              key={member.id}
              className="flex w-28 shrink-0 flex-col items-center text-center"
            >
              {headshot ? (
                <img
                  src={headshot}
                  alt={member.name}
                  loading="lazy"
                  className="h-28 w-28 rounded-full bg-neutral-800 object-cover"
                />
              ) : (
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-neutral-400"
                  aria-hidden="true"
                >
                  {getInitials(member.name)}
                </div>
              )}
              <p className="mt-2 w-full truncate text-sm text-neutral-100">
                {member.name}
              </p>
              <p className="w-full truncate text-xs text-neutral-500">
                {member.character}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
