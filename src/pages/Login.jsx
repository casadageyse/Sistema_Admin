import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('E-mail ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#06061a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Casa da Geyse" className="w-20 mx-auto mb-4 drop-shadow-lg"
               onError={e => e.target.style.display='none'} />
          <h1 className="text-2xl font-black text-white">Painel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Casa da Geyse</p>
        </div>

        <form onSubmit={handleSubmit}
              className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                   className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3
                              text-white text-sm placeholder-gray-600 outline-none
                              focus:border-pink-500 transition-colors"
                   placeholder="admin@casadageyse.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                   className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3
                              text-white text-sm placeholder-gray-600 outline-none
                              focus:border-pink-500 transition-colors"
                   placeholder="••••••••" />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <button type="submit" disabled={loading}
                  className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50
                             text-white font-black text-sm tracking-widest py-3.5 rounded-xl
                             transition-colors duration-200">
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
