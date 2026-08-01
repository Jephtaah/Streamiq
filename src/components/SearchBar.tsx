import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'

export default function SearchBar() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    const query = debouncedValue.trim()
    if (query.length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }, [debouncedValue, navigate])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    if (query.length > 0) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
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
        onChange={(event) => setValue(event.target.value)}
        aria-label="Search movies and TV shows"
        placeholder="Search movies, TV…"
        className="w-full rounded-full border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
      />
    </form>
  )
}
