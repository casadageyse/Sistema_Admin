import { useState } from 'react'
import { supabase } from '../supabase'
import ListaAcompanhantes from '../components/ListaAcompanhantes'
import FormAcompanhante from '../components/FormAcompanhante'

export default function Dashboard() {
  const [view, setView]       = useState('lista') // 'lista' | 'novo' | 'editar'
  const [editando, setEditando] = useState(null)
  const [refresh, setRefresh] = useState(0)

  function handleNovo() { setEditando(null); setView('novo') }
  function handleEditar(a) { setEditando(a); setView('editar') }
  function handleVoltar() { setView('lista'); setEditando(null); setRefresh(r => r + 1) }

  return (
    <div className="min-h-screen bg-[#06061a]">
      {/* Header */}
      <header className="bg-[#0d0d2b] border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="w-8 h-8 object-contain"
               onError={e => e.target.style.display='none'} />
          <div>
            <span className="text-white font-black text-sm">Casa da Geyse</span>
            <span className="text-gray-500 text-xs block">Painel Admin</span>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()}
                className="text-xs text-gray-500 hover:text-white transition-colors border border-white/[0.08]
                           hover:border-white/20 px-3 py-1.5 rounded-lg">
          Sair
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {view === 'lista' && (
          <ListaAcompanhantes
            refresh={refresh}
            onNovo={handleNovo}
            onEditar={handleEditar}
          />
        )}
        {(view === 'novo' || view === 'editar') && (
          <FormAcompanhante
            acompanhante={editando}
            onVoltar={handleVoltar}
          />
        )}
      </main>
    </div>
  )
}
