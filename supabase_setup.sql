-- =============================================
-- RODAR NO SUPABASE: SQL Editor
-- =============================================

-- 1. Tabela de acompanhantes
CREATE TABLE IF NOT EXISTS acompanhantes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text NOT NULL,
  regiao        text NOT NULL CHECK (regiao IN ('penha-centro','penha-armacao','barra-velha-centro', "navegantes")),
  whatsapp      text NOT NULL,
  foto_url      text,
  ativa         boolean NOT NULL DEFAULT true,
  criado_em     timestamptz NOT NULL DEFAULT now(),regiao text NOT NULL CHECK (regiao IN ('penha-centro','penha-armacao','barra-velha-centro','navegantes')),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

-- 2. Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_atualizado_em
  BEFORE UPDATE ON acompanhantes
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- 3. Habilitar RLS
ALTER TABLE acompanhantes ENABLE ROW LEVEL SECURITY;

-- 4. Política: visitantes do site só veem perfis ativos
CREATE POLICY "leitura_publica_ativas" ON acompanhantes
  FOR SELECT USING (ativa = true);

-- 5. Política: admins autenticados podem fazer tudo
CREATE POLICY "admin_full_access" ON acompanhantes
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE: criar bucket "fotos"
-- Fazer manualmente em: Storage > New bucket
-- Nome: fotos | Public: SIM
-- =============================================

-- 6. Política de storage para upload (admins)
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "upload_autenticado" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'fotos' AND auth.role() = 'authenticated');

CREATE POLICY "leitura_publica_storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotos');

CREATE POLICY "delete_autenticado" ON storage.objects
  FOR DELETE USING (bucket_id = 'fotos' AND auth.role() = 'authenticated');
