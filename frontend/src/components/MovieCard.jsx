import { Link } from 'react-router-dom'
export default function MovieCard({ movie }) {
  return <Link to={`/movies/${movie.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-500 hover:shadow-md transition">
    <div className="text-xs text-slate-500 mb-2">{movie.type === 'TV_SERIES' ? 'TV series' : 'Movie'} · {movie.releaseYear}</div>
    <h3 className="font-semibold text-lg text-slate-900">{movie.title}</h3>
    <p className="text-sm text-slate-600 mt-2">{movie.genres.map(g => g.name).join(' · ')}</p>
    <p className="text-sm text-slate-600 mt-2 line-clamp-3">{movie.description}</p>
    <p className="text-xs text-slate-500 mt-3">{movie.averageRating.toFixed(1)}/10 · Rating</p>
    <span className="inline-block mt-3 text-sm text-blue-700">View details →</span>
  </Link>
}
