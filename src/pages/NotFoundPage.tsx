import { Link } from 'react-router-dom'
import { Clapperboard } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center md:px-6">
      <Clapperboard size={48} className="text-neutral-600" aria-hidden="true" />
      <h1 className="text-3xl font-bold text-neutral-100">Page not found</h1>
      <p className="max-w-md text-sm text-neutral-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      >
        Back to Home
      </Link>
    </div>
  )
}
