import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const REGIOES = {
  'penha-centro':       'Penha Centro',
  'penha-armacao':      'Penha Armação',
  'barra-velha-centro': 'Barra Velha Centro',
}

export default function ListaAcompanhantes({ refresh, onNovo, onEditar }) {
  const [lista, setLista]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro]   = useState('todas')
  const [deletando, setDeletando] = useState(null)

  useEffect(() => {
    load()
  }, [refresh])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('acompanhantes')
      .select('*')
      .order('criado_em', { ascending: false })
    setLista(data ?? [])
    setLoading(false)
  }

  async function toggleAtiva(a) {
    await supabase.from('acompanhantes').update({ ativa: !a.ativa }).eq('id', a.id)
    load()
  }

  async function confirmarDelete(a) {
    if (deletando?.id === a.id) {
      if (a.foto_url) {
        const path = a.foto_url.split('/storage/v1/object/public/fotos/')[1]
        if (path) await supabase.storage.from('fotos').remove([path])
      }
      await supabase.from('acompanhantes').delete().eq('id', a.id)
      setDeletando(null)
      load()
    } else {
      setDeletando(a)
    }
  }

  const exibidas = filtro === 'todas' ? lista : lista.filter(a => a.regiao === filtro)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-white font-black text-xl">Acompanhantes</h2>
          <p className="text-gray-500 text-sm">{lista.length} cadastradas</p>
        </div>
        <button onClick={onNovo}
                className="bg-pink-600 hover:bg-pink-500 text-white font-black text-xs tracking-widest
                           px-5 py-2.5 rounded-xl transition-colors">
          + NOVA ACOMPANHANTE
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap mb-6">
        {[['todas','Todas'], ...Object.entries(REGIOES)].map(([id, label]) => (
          <button key={id} onClick={() => setFiltro(id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filtro === id
                      ? 'bg-pink-600 text-white'
                      : 'bg-white/[0.05] text-gray-400 hover:bg-white/10 border border-white/[0.07]'
                  }`}>
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && exibidas.length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-sm">Nenhuma acompanhante cadastrada ainda.</p>
        </div>
      )}

      {!loading && exibidas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exibidas.map(a => (
            <div key={a.id}
                 className={`bg-white/[0.03] border rounded-2xl overflow-hidden transition-all ${
                   a.ativa ? 'border-white/[0.08]' : 'border-white/[0.03] opacity-50'
                 }`}>
              <div className="aspect-[3/4] bg-white/[0.02] relative overflow-hidden">
                {a.foto_url
                  ? <img src={a.foto_url} alt={a.nome} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">👤</div>
                }
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full ${
                  a.ativa ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {a.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="p-4">
                <p className="text-white font-black text-base">{a.nome}</p>
                <p className="text-gray-500 text-xs mb-1">{REGIOES[a.regiao]}</p>
                <p className="text-pink-400 text-xs font-mono">{a.whatsapp}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => onEditar(a)}
                          className="flex-1 bg-white/[0.06] hover:bg-white/10 text-white text-xs font-bold
                                     py-2 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button onClick={() => toggleAtiva(a)}
                          className="flex-1 bg-white/[0.06] hover:bg-white/10 text-xs font-bold
                                     py-2 rounded-lg transition-colors text-gray-300">
                    {a.ativa ? 'Desativar' : 'Ativar'}
                  </button>
                  <button onClick={() => confirmarDelete(a)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                            deletando?.id === a.id
                              ? 'bg-red-600 text-white'
                              : 'bg-white/[0.06] hover:bg-red-600/20 text-red-400'
                          }`}>
                    {deletando?.id === a.id ? 'Confirmar' : '🗑'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
