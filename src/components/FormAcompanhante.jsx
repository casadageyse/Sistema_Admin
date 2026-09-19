import { useState } from 'react'
import { supabase } from '../supabase'

const REGIOES = [
  { id: 'penha-centro',       label: 'Penha Centro'       },
  { id: 'penha-armacao',      label: 'Penha Armação'      },
  { id: 'barra-velha-centro', label: 'Barra Velha Centro' },
  { id: 'navegantes', label: 'Navegantes' },

]

export default function FormAcompanhante({ acompanhante, onVoltar }) {
  const editando = !!acompanhante

  const [nome,      setNome]      = useState(acompanhante?.nome      ?? '')
  const [regiao,    setRegiao]    = useState(acompanhante?.regiao    ?? 'penha-centro')
  const [whatsapp,  setWhatsapp]  = useState(acompanhante?.whatsapp  ?? '')
  const [ativa,     setAtiva]     = useState(acompanhante?.ativa     ?? true)
  const [foto,      setFoto]      = useState(null)
  const [preview,   setPreview]   = useState(acompanhante?.foto_url  ?? null)
  const [loading,   setLoading]   = useState(false)
  const [erro,      setErro]      = useState('')

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    let foto_url = acompanhante?.foto_url ?? null

    try {
      if (foto) {
        const ext  = foto.name.split('.').pop()
        const path = `${regiao}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('fotos').upload(path, foto, { upsert: true })
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(path)
        foto_url = urlData.publicUrl

        // Remove foto antiga se existia e é diferente
        if (editando && acompanhante.foto_url && acompanhante.foto_url !== foto_url) {
          const old = acompanhante.foto_url.split('/storage/v1/object/public/fotos/')[1]
          if (old) await supabase.storage.from('fotos').remove([old])
        }
      }

      const payload = { nome, regiao, whatsapp, ativa, foto_url }

      if (editando) {
        const { error } = await supabase.from('acompanhantes').update(payload).eq('id', acompanhante.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('acompanhantes').insert(payload)
        if (error) throw error
      }

      onVoltar()
    } catch (err) {
      setErro(err.message ?? 'Erro ao salvar.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onVoltar}
                className="text-gray-500 hover:text-white transition-colors text-sm">
          ← Voltar
        </button>
        <h2 className="text-white font-black text-xl">
          {editando ? 'Editar Acompanhante' : 'Nova Acompanhante'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-5">

        {/* Foto */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Foto</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-32 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0">
              {preview
                ? <img src={preview} alt="" className="w-full h-full object-cover object-top" />
                : <div className="w-full h-full flex items-center justify-center text-gray-700 text-3xl">👤</div>
              }
            </div>
            <div>
              <label className="cursor-pointer bg-white/[0.06] hover:bg-white/10 border border-white/[0.1]
                                text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors inline-block">
                {preview ? 'Trocar foto' : 'Escolher foto'}
                <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </label>
              <p className="text-gray-600 text-xs mt-2">JPG, JPEG ou PNG</p>
            </div>
          </div>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome</label>
          <input type="text" required value={nome} onChange={e => setNome(e.target.value)}
                 className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3
                            text-white text-sm placeholder-gray-600 outline-none focus:border-pink-500 transition-colors"
                 placeholder="Nome da acompanhante" />
        </div>

        {/* Região */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Região</label>
          <select value={regiao} onChange={e => setRegiao(e.target.value)}
                  className="w-full bg-[#0d0d2b] border border-white/[0.1] rounded-xl px-4 py-3
                             text-white text-sm outline-none focus:border-pink-500 transition-colors">
            {REGIOES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            WhatsApp <span className="text-gray-600 normal-case font-normal">(somente números, com DDD)</span>
          </label>
          <input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g,''))}
                 className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3
                            text-white text-sm placeholder-gray-600 outline-none focus:border-pink-500 transition-colors font-mono"
                 placeholder="5547999999999" />
          <p className="text-gray-600 text-xs mt-1">Ex: 5547999999999 (55 + DDD + número)</p>
        </div>

        {/* Ativa */}
        <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
          <div>
            <p className="text-white text-sm font-bold">Perfil ativo</p>
            <p className="text-gray-500 text-xs">Aparece no site para visitantes</p>
          </div>
          <button type="button" onClick={() => setAtiva(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${ativa ? 'bg-pink-600' : 'bg-white/10'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${ativa ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {editando && acompanhante.criado_em && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-500 flex-shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            <div>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider font-bold">Cadastrada em</p>
              <p className="text-gray-300 text-xs font-mono">
                {new Date(acompanhante.criado_em).toLocaleString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
              </p>
            </div>
          </div>
        )}

        {erro && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{erro}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onVoltar}
                  className="flex-1 bg-white/[0.05] hover:bg-white/10 text-gray-300 font-bold text-sm
                             py-3 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-black
                             text-sm tracking-wide py-3 rounded-xl transition-colors">
            {loading ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
