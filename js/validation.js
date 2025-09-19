// validation.js - centraliza validações do formulário

// Toast helper (reutiliza showNotification se existir)
function notify(message, type = 'error') {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
  } else {
    alert(message);
  }
}

function validateName(name) {
  if (!name || name.trim().length < 2) {
    notify('Nome completo é obrigatório (mínimo 2 caracteres).');
    return { ok: false, field: 'name' };
  }
  return { ok: true };
}

// Mask helpers
function formatPhone(value) {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    // (xx) xxxx-xxxx
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+$/, '$1');
  }
  // (xx) xxxxx-xxxx
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+$/, '$1');
}

function attachPhoneMask(inputOrId) {
  const el = typeof inputOrId === 'string' ? document.getElementById(inputOrId) : inputOrId;
  if (!el) return;
  el.addEventListener('input', () => {
    const caret = el.selectionStart;
    const before = el.value;
    el.value = formatPhone(el.value);
    // tentativa simples de manter caret
    const diff = el.value.length - before.length;
    el.setSelectionRange(Math.max(0, (caret || 0) + diff), Math.max(0, (caret || 0) + diff));
  });
  el.addEventListener('blur', () => {
    const res = validatePhone(el.value);
    if (!res.ok) {
      // notify já é chamado em validatePhone
    }
  });
}

function validateEmail(email) {
  if (!email) {
    notify('E-mail é obrigatório.');
    return { ok: false, field: 'email' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    notify('Por favor, insira um e-mail válido.');
    return { ok: false, field: 'email' };
  }
  return { ok: true };
}

function validatePhone(phone) {
  if (!phone) {
    notify('WhatsApp é obrigatório.');
    return { ok: false, field: 'phone' };
  }
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    notify('Por favor, insira um número de WhatsApp válido.');
    return { ok: false, field: 'phone' };
  }
  return { ok: true };
}

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
function validateFile(file) {
  if (!file) {
    notify('⚠️ CONTA DE LUZ É OBRIGATÓRIA! Precisamos da sua fatura para calcular a economia.');
    return { ok: false, field: 'file-upload' };
  }
  if (!allowedTypes.includes(file.type)) {
    notify('Tipo de arquivo inválido. Use apenas PDF, JPG ou PNG para sua conta de luz.');
    return { ok: false, field: 'file-upload' };
  }
  if (file.size > 10 * 1024 * 1024) {
    notify('Arquivo muito grande. O tamanho máximo é 10MB.');
    return { ok: false, field: 'file-upload' };
  }
  if (file.type.startsWith('image/')) {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedImageTypes.includes(file.type)) {
      notify('Formato de imagem inválido. Use JPG ou PNG.');
      return { ok: false, field: 'file-upload' };
    }
  }
  return { ok: true };
}

function validateForm({ name, email, phone, file }) {
  const checks = [
    () => validateName(name),
    () => validateEmail(email),
    () => validatePhone(phone),
    () => validateFile(file),
  ];

  for (const check of checks) {
    const res = check();
    if (!res.ok) {
      const el = document.getElementById(res.field);
      if (el) el.focus();
      return res;
    }
  }
  return { ok: true };
}

// Expor globalmente para uso em script inline (sem bundler)
window.KZValidation = {
  validateName,
  validateEmail,
  validatePhone,
  validateFile,
  validateForm,
  formatPhone,
  attachPhoneMask,
};