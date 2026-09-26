import { useEffect, useState } from 'react'
import { api } from '../context/AuthContext'
import MovieCard from '../components/MovieCard'
export default function Movies() {
  const [search, setSearch] = useState(''), [query, setQuery] = useState(''), [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([]), [page, setPage] = useState(1)
  const [result, setResult] = useState({ items: [], pagination: { totalPages: 0, total: 0 } })
  const [loading, setLoading] = useState(true), [error, setError] = useState('')
  useEffect(() => { api.get('/genres').then(r => setGenres(r.data)).catch(() => {}) }, [])
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    api.get('/movies', { params: { search: query || undefined, genre: genre || undefined, page, limit: 12, sortBy: 'title', sortOrder: 'asc' }, signal: controller.signal })
      .then(r => setResult(r.data)).catch(() => { if (!controller.signal.aborted) setError('Unable to load catalog. Please try again.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [query, genre, page])
  return <section className="max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-slate-900">Explore the catalog</h1>
    <p className="text-slate-600 my-3">Real database entries. Imported demo scores are labeled; chat links to these same films.</p>
    <form className="flex flex-wrap gap-3 my-6" onSubmit={e => { e.preventDefault(); setQuery(search); setPage(1) }}>
      <input aria-label="Search movies" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or description" className="border rounded-lg p-3 flex-1 min-w-48" />
      <select aria-label="Genre" value={genre} onChange={e => { setGenre(e.target.value); setPage(1) }} className="border rounded-lg p-3"><option value="">All genres</option>{genres.map(g => <option key={g.id}>{g.name}</option>)}</select>
      <button className="bg-blue-600 text-white rounded-lg px-6">Search</button>
    </form>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p role="status">Loading catalog…</p> : <><p className="text-sm text-slate-500 mb-4">{result.pagination.total} matching titles</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{result.items.map(m => <MovieCard key={m.id} movie={m} />)}</div>{!result.items.length && <p>No titles match. Try another search.</p>}</>}
    <div className="flex justify-center items-center gap-5 my-8"><button disabled={page <= 1 || loading} onClick={() => setPage(p => p - 1)} className="border rounded px-4 py-2 disabled:opacity-40">Previous</button><span>Page {page} / {Math.max(1,result.pagination.totalPages)}</span><button disabled={page >= result.pagination.totalPages || loading} onClick={() => setPage(p => p + 1)} className="border rounded px-4 py-2 disabled:opacity-40">Next</button></div>
  </section>
}
