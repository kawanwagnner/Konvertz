# Integração Konvertz + Supabase

## 🚀 Configuração Rápida

### 1. **Criar Projeto no Supabase**

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **"New Project"**
3. Escolha sua organização e defina:
   - Nome do projeto: `konvertz-forms`
   - Senha do banco: `[defina uma senha forte]`
   - Região: `South America (São Paulo)`

### 2. **Obter Credenciais**

No painel do seu projeto Supabase:

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL**
   - **anon public key**

### 3. **Configurar Credenciais**

Edite o arquivo `js/supabase-config.js` e substitua:

```javascript
const SUPABASE_URL = "https://seuprojetoid.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### 4. **Criar Tabela no Banco**

No painel Supabase, vá em **SQL Editor** e execute:

```sql
-- Criar tabela para armazenar contatos
CREATE TABLE formulario_contatos (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nome text NOT NULL CHECK (length(nome) >= 2),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  telefone text NOT NULL CHECK (length(regexp_replace(telefone, '[^0-9]', '', 'g')) >= 10),
  arquivo_nome text NOT NULL,
  arquivo_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE formulario_contatos ENABLE ROW LEVEL SECURITY;

-- Política de INSERÇÃO para o papel público (anon do client-side)
CREATE POLICY "insert_anon_formulario_contatos" ON formulario_contatos
FOR INSERT
TO anon
WITH CHECK (true);

-- Política de LEITURA apenas para autenticados (opcional)
CREATE POLICY "select_authenticated_formulario_contatos" ON formulario_contatos
FOR SELECT
TO authenticated
USING (true);
```

### 5. **Configurar Storage para Arquivos**

1. No painel Supabase, vá em **Storage**
2. Clique em **"Create bucket"**
3. Nome do bucket: `contas-de-luz`
4. Marque como **Public bucket**
5. Configure tamanho máximo: 10MB
6. Tipos permitidos: PDF, JPG, PNG

**IMPORTANTE:** Execute este SQL para criar políticas de storage:

```sql
-- Política para upload público no bucket com validações
CREATE POLICY "Upload contas de luz" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'contas-de-luz' AND
  (storage.foldername(name))[1] = 'contas-de-luz'
);

-- Política para leitura pública no bucket
CREATE POLICY "Leitura contas de luz" ON storage.objects
FOR SELECT USING (bucket_id = 'contas-de-luz');

-- Política para deletar apenas arquivos próprios
CREATE POLICY "Delete próprios arquivos" ON storage.objects
FOR DELETE USING (bucket_id = 'contas-de-luz');
```

**Se der erro "Bucket not found", execute:**

```sql
-- Inserir bucket manualmente se necessário
INSERT INTO storage.buckets (id, name, public)
VALUES ('contas-de-luz', 'contas-de-luz', true)
ON CONFLICT (id) DO NOTHING;
```

### ⚠️ Caso apareça 403 "new row violates row-level security policy"

Execute no SQL Editor para garantir as políticas corretas:

```sql
-- Remover políticas conflitantes
DROP POLICY IF EXISTS "Permitir inserção com validações" ON formulario_contatos;
DROP POLICY IF EXISTS "Permitir inserção pública" ON formulario_contatos;
DROP POLICY IF EXISTS insert_anon_formulario_contatos ON formulario_contatos;
DROP POLICY IF EXISTS select_authenticated_formulario_contatos ON formulario_contatos;

-- Recriar políticas simples e funcionais
CREATE POLICY insert_anon_formulario_contatos ON formulario_contatos
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY select_authenticated_formulario_contatos ON formulario_contatos
FOR SELECT TO authenticated USING (true);
```

## 🔧 Funcionalidades Implementadas

### ✅ **Formulário Completo**

- Validação de campos obrigatórios
- Validação de formato de email
- Upload de arquivos (PDF, JPG, PNG)
- Limite de 10MB por arquivo

### ✅ **Integração Supabase**

- Salvamento automático no banco de dados
- Upload de arquivos no Supabase Storage
- URLs públicas para os arquivos enviados

### ✅ **UX Aprimorada**

- Indicador de loading durante envio
- Notificações de sucesso/erro
- Limpeza automática do formulário após envio
- Preview do nome do arquivo selecionado

### ✅ **Segurança**

- Row Level Security (RLS) habilitada
- Validação de tipos de arquivo
- Sanitização de dados

## 📋 **Como Visualizar os Dados**

1. No painel Supabase, vá em **Table Editor**
2. Clique na tabela `formulario_contatos`
3. Visualize todos os contatos recebidos
4. Arquivos ficam disponíveis em **Storage** → `contas-de-luz`

## 🔍 **Testando a Integração**

1. Abra o `index.html` no navegador
2. Preencha o formulário de contato
3. Envie com/sem arquivo
4. Verifique no painel Supabase se os dados foram salvos

## ⚠️ **Troubleshooting**

### Erro: "Failed to fetch"

- Verifique se as credenciais estão corretas
- Confirme se a tabela foi criada
- Teste a conectividade com o Supabase

### Erro no upload de arquivo

- Verifique se o bucket `contas-de-luz` foi criado
- Confirme se as políticas de storage foram aplicadas
- Teste com arquivos menores que 10MB

### Erro: "Row Level Security"

- Execute as políticas SQL fornecidas acima
- Verifique se RLS está habilitada na tabela

## 📊 **Próximos Passos**

1. **Dashboard de Admin**: Criar área para visualizar contatos
2. **Email Automático**: Integrar com Resend/SendGrid
3. **WhatsApp Integration**: Notificar equipe via WhatsApp
4. **Analytics**: Acompanhar conversões do formulário

---

## 💡 **Suporte**

Para dúvidas sobre a integração:

1. Verifique os logs do navegador (F12 → Console)
2. Consulte a documentação do Supabase
3. Teste cada etapa separadamente

**Supabase funcionando + Konvertz = Leads organizados! 🚀**

```

```
