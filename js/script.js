// Mostrar nome do arquivo selecionado
document.getElementById('file-upload').addEventListener('change', function(e) {
  const fileName = e.target.files[0]?.name || 'Nenhum arquivo escolhido';
  document.getElementById('file-chosen').textContent = fileName;
});

// Função para upload de arquivo no Supabase Storage
async function uploadFile(file) {
  try {
    // Verificar se o cliente Supabase está configurado
    if (!window.supabaseClient) {
      throw new Error('Supabase não configurado. Verifique as credenciais em supabase-config.js');
    }

    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    console.log('Iniciando upload para bucket: contas-de-luz');
    console.log('Nome do arquivo:', fileName);
    
    // Upload do arquivo
    const { data, error } = await window.supabaseClient.storage
      .from('contas-de-luz')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }

    // Obter URL público do arquivo
    const { data: { publicUrl } } = window.supabaseClient.storage
      .from('contas-de-luz')
      .getPublicUrl(fileName);

    console.log('Upload realizado com sucesso:', publicUrl);

    return {
      fileName: file.name,
      filePath: fileName,
      publicUrl: publicUrl
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

// Função para salvar dados no Supabase
async function saveFormData(formData) {
  try {
    // Objeto com colunas estendidas (pode falhar se não aplicou migrações)
    const fullRow = {
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      arquivo_nome: formData.arquivo_nome,
      arquivo_url: formData.arquivo_url,
      arquivo_path: formData.arquivo_path,
      utm_source: formData.utm_source || null,
      utm_medium: formData.utm_medium || null,
      utm_campaign: formData.utm_campaign || null,
      utm_term: formData.utm_term || null,
      utm_content: formData.utm_content || null,
      referrer: formData.referrer || null,
    };

    let { data, error } = await window.supabaseClient
      .from('formulario_contatos')
      .insert([ fullRow ]);

    if (error) {
      // fallback se colunas não existirem
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('column') || msg.includes('does not exist')) {
        const baseRow = {
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          arquivo_nome: formData.arquivo_nome,
          arquivo_url: formData.arquivo_url,
        };
        const retry = await window.supabaseClient
          .from('formulario_contatos')
          .insert([ baseRow ]);
        if (retry.error) throw retry.error;
        data = retry.data;
  // Aviso opcional: migração pendente
  showNotification('Aviso: UTM/arquivo_path não salvos. Rode as migrações do README para ativar.', 'error');
      } else {
        throw error;
      }
    }

    return data;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    throw error;
  }
}
// UTM utils
function getUrlParams() {
  const p = new URLSearchParams(window.location.search);
  const obj = {};
  p.forEach((v, k) => (obj[k] = v));
  return obj;
}

function captureAndPersistUtm() {
  const params = getUrlParams();
  const keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  let changed = false;
  keys.forEach((k) => {
    if (params[k]) {
      localStorage.setItem(k, params[k]);
      changed = true;
    }
  });
  if (document.referrer) localStorage.setItem('referrer', document.referrer);
  return changed;
}


// Função para mostrar notificação
function showNotification(message, type = 'success') {
  // Remove notificação existente se houver
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg max-w-sm ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : 'bg-red-500 text-white'
  }`;
  
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="mr-2">${type === 'success' ? '✓' : '✗'}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remover após 5 segundos
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
// expõe globalmente para uso em validation.js
window.showNotification = showNotification;

// Função para alterar estado do botão
function setButtonLoading(loading) {
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    submitText.textContent = 'ENVIANDO...';
  } else {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    submitText.textContent = 'ENVIAR E SIMULAR ECONOMIA';
  }
}

// Validação e envio do formulário
document.getElementById('konvertz-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Honeypot: se preenchido, aborta silenciosamente
  const hp = document.getElementById('empresa-site');
  if (hp && hp.value) {
    return;
  }

  // Tempo mínimo de preenchimento (2s) para evitar bots
  const MIN_MS = 2000;
  if (Date.now() - (window.__formStartAt || 0) < MIN_MS) {
    return;
  }
  
  // Obter dados do formulário
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const fileInput = document.getElementById('file-upload');
  const file = fileInput.files[0];

  // Usar validações centralizadas
  const validation = window.KZValidation?.validateForm({ name, email, phone, file });
  if (!validation?.ok) {
    return;
  }

  // Mostrar loading
  setButtonLoading(true);

  try {
    console.log('Iniciando processo de envio...');
    console.log('Dados validados:', { name, email, phone, fileName: file.name });

    // Upload da fatura (obrigatório)
    console.log('Fazendo upload da fatura...');
  const uploadResult = await uploadFile(file);
    
    console.log('Upload concluído:', uploadResult);

    // Salvar dados no banco
    const formData = {
      nome: name,
      email: email,
      telefone: phone,
      arquivo_nome: uploadResult.fileName,
      arquivo_url: uploadResult.publicUrl,
      arquivo_path: uploadResult.filePath,
      utm_source: localStorage.getItem('utm_source'),
      utm_medium: localStorage.getItem('utm_medium'),
      utm_campaign: localStorage.getItem('utm_campaign'),
      utm_term: localStorage.getItem('utm_term'),
      utm_content: localStorage.getItem('utm_content'),
      referrer: localStorage.getItem('referrer'),
    };

    console.log('Salvando no banco:', formData);
    const savedData = await saveFormData(formData);
    
    console.log('Dados salvos com sucesso:', savedData);

    // Sucesso!
    showNotification('✅ Dados enviados com sucesso! Nossa equipe analisará sua conta de luz e entrará em contato em até 1 dia útil.');
    
    // Limpar formulário
    document.getElementById('konvertz-form').reset();
    document.getElementById('file-chosen').textContent = 'Nenhum arquivo escolhido';

  } catch (error) {
    console.error('Erro detalhado no envio:', error);
    
    let errorMessage = 'Erro ao enviar dados. Tente novamente.';
    
    if (error.message?.includes('row-level security') || error.status === 403) {
      errorMessage = '🔒 Bloqueado por RLS (403). Abra o README e rode as políticas de RLS (seção: 403 RLS).';
    } else if (error.message.includes('Bucket not found')) {
      errorMessage = 'Erro de configuração do storage. Entre em contato com o suporte.';
    } else if (error.message.includes('upload')) {
      errorMessage = 'Erro no upload da conta de luz. Verifique o arquivo e tente novamente.';
    } else if (error.message.includes('supabase')) {
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    showNotification(errorMessage, 'error');
  } finally {
    // Remover loading
    setButtonLoading(false);
  }
});

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  // Captura e persiste UTM
  captureAndPersistUtm();

  // Marca o início da sessão do formulário
  window.__formStartAt = Date.now();

  // Randomiza o name do honeypot para dificultar bots
  const hp = document.getElementById('empresa-site');
  if (hp) {
    hp.name = 'website_' + Math.random().toString(36).slice(2, 8);
  }

  // Verificar se o Supabase está configurado
  if (!window.supabaseClient) {
    console.warn('Supabase não configurado. Verifique as credenciais em supabase-config.js');
    // continua para aplicar máscara mesmo sem supabase
  }

  // Aplica máscara no WhatsApp
  if (window.KZValidation?.attachPhoneMask) {
    window.KZValidation.attachPhoneMask('phone');
  }

  console.log('Integração com Supabase carregada com sucesso!');
});
