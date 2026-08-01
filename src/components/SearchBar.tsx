import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'

export default function SearchBar() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q')?.trim() ?? ''
  const [value, setValue] = useState(urlQuery)
  const debouncedValue = useDebounce(value, 300)

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  const lastUserValue = useRef(value)
  const lastNavigated = useRef(urlQuery)
  const hadQuery = useRef(urlQuery.length > 0)

  useEffect(() => {
    if (lastNavigated.current !== urlQuery) {
      lastNavigated.current = urlQuery
      setValue(urlQuery)
    }
  }, [urlQuery])

  useEffect(() => {
    if (debouncedValue !== lastUserValue.current) return
    const query = debouncedValue.trim()
    if (query.length > 0) {
      hadQuery.current = true
      lastNavigated.current = query
      navigateRef.current(`/search?q=${encodeURIComponent(query)}`)
    } else if (hadQuery.current) {
      hadQuery.current = false
      lastNavigated.current = ''
      navigateRef.current('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    if (query.length > 0) {
      navigateRef.current(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative w-full transition-all duration-300 md:w-48 md:focus-within:w-72"
    >
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => {
          lastUserValue.current = event.target.value
          setValue(event.target.value)
        }}
        aria-label="Search movies and TV shows"
        placeholder="Search movies, TV…"
        className="w-full rounded-full border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
      />
    </form>
  )
}
