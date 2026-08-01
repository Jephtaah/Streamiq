import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import MovieDetailPage from './pages/MovieDetailPage'
import TVDetailPage from './pages/TVDetailPage'
import WatchPage from './pages/WatchPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="tv/:id" element={<TVDetailPage />} />
          <Route path="watch/movie/:id" element={<WatchPage />} />
          <Route path="watch/tv/:id/:season/:episode" element={<WatchPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
