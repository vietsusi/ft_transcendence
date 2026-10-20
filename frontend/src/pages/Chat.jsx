import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { api } from '../context/AuthContext'
import { Conversation, ConversationContent, ConversationScrollButton } from '../components/ai-elements/conversation'
import { Message, MessageContent } from '../components/ai-elements/message'
import MovieCard from '../components/MovieCard'

export default function Chat() {
  const [input, setInput] = useState(''), [config, setConfig] = useState(null)
  const [params] = useSearchParams()
  const [progress, setProgress] = useState(''), [stopped, setStopped] = useState(false)
  const transport = useMemo(() => new DefaultChatTransport({
    api: `${api.defaults.baseURL}/chat`,
    fetch: async (url, options) => {
      const response = await fetch(url, options)
      if (!response.ok) {
        const messages = { 429: 'CHAT_RATE_LIMIT: Please wait before retrying.', 401: 'Please sign in again.', 400: 'Invalid or overlong conversation. Start a new chat.', 503: 'The model is not configured or is unavailable.' }
        throw new Error(messages[response.status] || 'The server could not process this question.')
      }
      return response
    },
    headers: () => ({ Authorization: `Bearer ${localStorage.getItem('token') || ''}` }),
  }), [])
  const { messages, sendMessage, status, error, stop, setMessages, clearError } = useChat({ transport, onData: part => { if (part.type === 'data-progress') setProgress(part.data.stage) } })
  const busy = status === 'submitted' || status === 'streaming'
  useEffect(() => { api.get('/chat/status').then(r => setConfig(r.data)).catch(() => setConfig({ configured: false })) }, [])
  useEffect(() => {
    const movieId = params.get('movie')
    if (movieId) api.get(`/movies/${movieId}`).then(r => setInput(`Recommend movies similar to "${r.data.title}"`)).catch(() => {})
  }, [params])
  const submit = e => {
    e.preventDefault()
    if (!input.trim() || busy || config?.configured === false || messages.length >= 24) return
    setStopped(false); setProgress('Checking the catalog'); clearError(); sendMessage({ text: input.trim() }); setInput('')
  }
  return <section className="max-w-4xl mx-auto">
    <div className="flex justify-between gap-4 items-center"><div><h1 className="text-3xl font-bold">Catalog assistant</h1><p className="text-slate-600 mt-2">Discover films from our database. Every result opens a real catalog page.</p></div><button disabled={busy} onClick={() => { setMessages([]); clearError(); setStopped(false) }} className="border px-3 py-2 rounded-lg disabled:opacity-40">New chat</button></div>
    <p className="text-sm my-4 text-slate-600">{config?.mode === 'demo' ? 'Demo mode · keyword rules, no language model. Use a genre or exact English title.' : 'AI mode · generated answers, checked against the catalog paragraph by paragraph.'} Conversations stay in this page until refresh. Maximum 12 exchanges.</p>
    {config && !config.configured && <p role="alert" className="bg-amber-50 p-3 rounded">Model not configured. Set CHAT_BASE_URL, CHAT_API_KEY, CHAT_MODEL and recreate backend.</p>}
    <div className="border rounded-2xl bg-white flex flex-col h-[65vh] min-h-[360px]">
      <Conversation><ConversationContent>
        {!messages.length && <div className="py-12 text-center"><h2 className="font-semibold text-xl">What would you like to watch?</h2><div className="flex flex-wrap justify-center gap-3 mt-5">{['推荐科幻电影', 'Recommend comedy movies', 'How does this work?'].map(text => <button key={text} onClick={() => setInput(text)} className="border rounded-full py-2 px-4 text-sm">{text}</button>)}</div></div>}
        {messages.map(message => <Message from={message.role} key={message.id}>
          <MessageContent className={message.role === 'user' ? 'bg-blue-50 p-3 rounded-xl' : 'p-3'}>
            {message.parts.map((part, i) => part.type === 'text' ? <div key={i} className="whitespace-pre-wrap break-words text-slate-900">{part.text}</div> : part.type === 'data-catalog' ? <div key={i} className="grid sm:grid-cols-2 gap-3 my-3">{part.data.movies.map(movie => <MovieCard movie={movie} key={movie.id} />)}</div> : null)}
          </MessageContent>
        </Message>)}
        {busy && <p role="status" className="text-sm text-slate-500">{progress || 'Checking the catalog'}…</p>}
      </ConversationContent><ConversationScrollButton /></Conversation>
      {stopped && <p role="status" className="mx-4 p-3 text-sm text-slate-600">Stopped. Any text above is a partial answer.</p>}
      {error && <p role="alert" className="mx-4 p-3 text-sm bg-red-50 text-red-800">Request failed. {error.message} Any text above is a partial answer. You can send your question again.</p>}
      <form onSubmit={submit} className="border-t p-4 flex gap-3">
        <textarea aria-label="Message" value={input} onChange={e => setInput(e.target.value)} maxLength={4000} rows={2} placeholder="Ask about a title, genre, year, or similar films…" className="resize-none border rounded-lg p-3 flex-1 min-w-0" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(e) } }} />
        {busy ? <button type="button" onClick={() => { stop(); setStopped(true) }} className="border px-4 rounded-lg">Stop</button> : <button disabled={!input.trim() || config?.configured === false || messages.length >= 24} className="bg-blue-600 text-white rounded-lg px-5 disabled:opacity-40">Send</button>}
      </form>
    </div>
  </section>
}
