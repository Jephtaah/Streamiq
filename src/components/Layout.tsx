import { Link, Outlet } from 'react-router-dom'
import SearchBar from './SearchBar'

export default function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-6">
          <Link to="/" className="text-xl font-bold text-indigo-500">
            Streamiq
          </Link>
          <div className="flex w-full items-center md:ml-auto md:max-w-xl md:justify-end">
            <SearchBar />
          </div>

        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500 md:px-6">
        Powered by JustWatch
      </footer>
    </div>
  )
}
