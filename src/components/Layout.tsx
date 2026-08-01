import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__logo">
          Streamiq
        </Link>
        <nav className="layout__nav">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/movie/550">Movie</Link>
          <Link to="/tv/1399">TV</Link>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
      <footer className="layout__footer">Powered by TMDB</footer>
    </div>
  )
}
