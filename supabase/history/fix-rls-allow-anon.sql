-- Corrigir RLS 403 para inserções anônimas no formulário

-- Tabela: formulario_contatos
DROP POLICY IF EXISTS "Permitir inserção com validações" ON formulario_contatos;
DROP POLICY IF EXISTS "Permitir inserção pública" ON formulario_contatos;
DROP POLICY IF EXISTS insert_anon_formulario_contatos ON formulario_contatos;
DROP POLICY IF EXISTS select_authenticated_formulario_contatos ON formulario_contatos;

ALTER TABLE formulario_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY insert_anon_formulario_contatos ON formulario_contatos
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY select_authenticated_formulario_contatos ON formulario_contatos
FOR SELECT TO authenticated USING (true);

-- Storage policies (garantir que o upload funcione para anon)
-- Obs: ajuste conforme necessidade de segurança do seu projeto
DROP POLICY IF EXISTS "Upload contas de luz" ON storage.objects;
DROP POLICY IF EXISTS "Leitura contas de luz" ON storage.objects;
DROP POLICY IF EXISTS "Delete próprios arquivos" ON storage.objects;

CREATE POLICY "Upload contas de luz" ON storage.objects
FOR INSERT TO anon WITH CHECK (bucket_id = 'contas-de-luz');

CREATE POLICY "Leitura contas de luz" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'contas-de-luz');
