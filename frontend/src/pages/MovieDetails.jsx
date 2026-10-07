import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../context/AuthContext'
export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null), [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    setMovie(null); setError('')
    api.get(`/movies/${id}`, { signal: controller.signal }).then(r => setMovie(r.data)).catch(e => { if (!controller.signal.aborted) setError(e.response?.status === 404 ? 'This movie is not in our catalog.' : 'Unable to load movie details.') })
    return () => controller.abort()
  }, [id])
  if (error) return <div role="alert">{error} <Link to="/movies" className="text-blue-700">Back to catalog</Link></div>
  if (!movie) return <p role="status">Loading movie…</p>
  return <article className="max-w-3xl mx-auto bg-white border rounded-2xl p-8">
    <Link to="/movies" className="text-blue-700">← Catalog</Link>
    <p className="text-slate-500 mt-8">{movie.type === 'TV_SERIES' ? 'TV series' : 'Movie'} · {movie.releaseYear}</p>
    <h1 className="text-4xl font-bold mt-2">{movie.title}</h1>
    <div className="flex flex-wrap gap-2 my-5">{movie.genres.map(g => <span key={g.id} className="rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-sm">{g.name}</span>)}</div>
    <p className="leading-7 text-slate-700">{movie.description}</p>
    <p className="my-6">{movie.averageRating.toFixed(1)}/10 <span className="text-slate-500 text-sm">Rating</span></p>
    {movie.sourceUrl && <a className="text-blue-700 text-sm" href={movie.sourceUrl} target="_blank" rel="noreferrer">Metadata source: Wikidata (CC0) ↗</a>}
    <p className="text-sm text-slate-500 mt-4">Only stored metadata is shown. Full plot, cast and streaming availability may be unavailable.</p>
    <Link to={`/chat?movie=${movie.id}`} className="inline-block bg-blue-600 text-white rounded-lg px-5 py-3 mt-6">Find similar titles in chat</Link>
  </article>
}
