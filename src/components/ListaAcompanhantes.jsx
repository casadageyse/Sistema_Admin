import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const REGIOES = {
  'penha-centro':       'Penha Centro',
  'penha-armacao':      'Penha Armação',
  'barra-velha-centro': 'Barra Velha Centro',
}

export default function ListaAcompanhantes({ refresh, onNovo, onEditar }) {
  const [lista, setLista]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [erroLoad, setErroLoad]   = useState('')
  const [filtro, setFiltro]       = useState('todas')
  const [deletando, setDeletando] = useState(null)

  useEffect(() => {
    load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') load()
    })
    return () => subscription.unsubscribe()
  }, [refresh])

  async function load() {
    setLoading(true)
    setErroLoad('')

    // aguarda sessão estar pronta antes de consultar
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('acompanhantes')
      .select('*')
    if (error) {
      console.error('Erro ao carregar:', error)
      setErroLoad(error.message)
      setLoading(false)
      return
    }
    const sorted = (data ?? []).sort((a, b) => {
      if (!a.criado_em) return 1
      if (!b.criado_em) return -1
      return new Date(b.criado_em) - new Date(a.criado_em)
    })
    setLista(sorted)
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
      {erroLoad && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
          Erro ao carregar: {erroLoad}
        </div>
      )}

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
                <div className="mt-2 flex items-center gap-1.5">
                  <svg viewBox="0 0 32 32" fill="currentColor" className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0">
                    <path fillRule="evenodd" clipRule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.57.687 4.978 1.886 7.047L2 30l7.18-1.867A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Zm0 25.6a11.52 11.52 0 0 1-5.882-1.608l-.421-.252-4.366 1.135 1.164-4.245-.275-.435A11.47 11.47 0 0 1 4.4 16C4.4 9.594 9.594 4.4 16 4.4S27.6 9.594 27.6 16 22.406 27.6 16 27.6Z"/>
                    <path d="M22.29 19.12c-.33-.165-1.96-.965-2.263-1.075-.302-.11-.522-.165-.741.165-.22.33-.852 1.075-1.044 1.295-.192.22-.385.247-.715.082-1.985-.992-3.286-1.77-4.591-4.016-.347-.6.347-.557.99-1.853.11-.22.055-.412-.027-.55-.083-.138-.742-1.786-1.016-2.446-.274-.66-.55-.57-.741-.58l-.632-.012c-.22 0-.578.083-.88.412-.303.33-1.155 1.128-1.155 2.75 0 1.622 1.182 3.19 1.347 3.41.165.22 2.33 3.558 5.647 4.992 2.097.906 2.916.982 3.966.826.638-.096 1.958-.8 2.234-1.572.275-.77.275-1.43.192-1.568-.08-.137-.3-.22-.632-.385Z"/>
                  </svg>
                  <span className="text-[#25D366] text-xs font-bold">{a.contatos ?? 0} contato{(a.contatos ?? 0) !== 1 ? 's' : ''} via WhatsApp</span>
                </div>
                {a.criado_em && (
                  <p className="text-gray-600 text-[11px] mt-1.5 flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current flex-shrink-0">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                    </svg>
                    {new Date(a.criado_em).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
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
