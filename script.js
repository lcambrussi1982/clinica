/* =========================================================
   Utilidades
========================================================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const trapFocus = (container, initial = null) => {
  const focusable = () =>
    $$(
      'a[href], button:not([disabled]), textarea, input, select, details,[tabindex]:not([tabindex="-1"])',
      container
    ).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
  let lastFocused = initial ?? focusable()[0];
  function onKey(e) {
    if (e.key !== 'Tab') return;
    const items = focusable();
    if (items.length === 0) return;
    const idx = items.indexOf(document.activeElement);
    // Shift+Tab
    if (e.shiftKey) {
      if (idx <= 0) {
        items[items.length - 1].focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (idx === items.length - 1) {
        items[0].focus();
        e.preventDefault();
      }
    }
  }
  container.__trapFocusHandler = onKey;
  container.addEventListener('keydown', onKey);
  (lastFocused || focusable()[0])?.focus();
};

const releaseFocus = (container) => {
  if (container.__trapFocusHandler) {
    container.removeEventListener('keydown', container.__trapFocusHandler);
    delete container.__trapFocusHandler;
  }
};

const addNoScroll = () => { document.documentElement.style.overflow = 'hidden'; };
const removeNoScroll = () => { document.documentElement.style.overflow = ''; };

const toast = (() => {
  // Cria um mini-toast leve sem depender de CSS
  let holder = $('#toast-holder');
  if (!holder) {
    holder = document.createElement('div');
    holder.id = 'toast-holder';
    Object.assign(holder.style, {
      position: 'fixed', insetInline: '0', bottom: '16px', display: 'grid',
      placeItems: 'center', pointerEvents: 'none', zIndex: 9999
    });
    document.body.appendChild(holder);
  }
  return (msg, ms = 2600) => {
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      background: 'rgba(15, 138, 166, .95)',
      color: '#fff',
      padding: '10px 14px',
      borderRadius: '12px',
      boxShadow: '0 10px 28px rgba(0,0,0,.18)',
      font: '600 14px/1.2 Inter, system-ui, sans-serif',
      transform: 'translateY(12px)',
      opacity: '0',
      transition: 'opacity .2s ease, transform .2s ease',
      pointerEvents: 'auto'
    });
    holder.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, ms);
  };
})();

/* =========================================================
   Ano do rodapé
========================================================= */
const anoEl = $('#ano');
if (anoEl) anoEl.textContent = new Date().getFullYear();

/* =========================================================
   Modal de Login: acessível e estável
========================================================= */
const btnLogin   = $('#btnLogin');
const loginModal = $('#loginModal');
const closeModal = $('#closeModal');
const loginForm  = $('#loginForm');

let lastTriggerFocus = null;

function openModal() {
  if (!loginModal) return;
  lastTriggerFocus = document.activeElement;
  loginModal.setAttribute('aria-hidden', 'false');
  addNoScroll();
  trapFocus(loginModal, $('#userType'));
}

function closeModalFn() {
  if (!loginModal) return;
  loginModal.setAttribute('aria-hidden', 'true');
  releaseFocus(loginModal);
  removeNoScroll();
  // retorna foco ao botão que abriu
  if (lastTriggerFocus instanceof HTMLElement) lastTriggerFocus.focus();
}

btnLogin?.addEventListener('click', openModal);
closeModal?.addEventListener('click', closeModalFn);

// Fecha ao clicar fora do conteúdo
loginModal?.addEventListener('mousedown', (e) => {
  if (e.target === loginModal) closeModalFn();
});

// Fecha com ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && loginModal?.getAttribute('aria-hidden') === 'false') {
    closeModalFn();
  }
});

/* =========================================================
   Simulação de Login com validação leve
========================================================= */
loginForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const userType = $('#userType')?.value?.trim();
  const username = $('#username')?.value?.trim();
  const password = $('#password')?.value ?? '';

  if (!userType) { toast('Selecione o tipo de usuário.'); $('#userType')?.focus(); return; }
  if (!username) { toast('Informe o usuário.'); $('#username')?.focus(); return; }
  if (password.length < 4) { toast('Senha muito curta.'); $('#password')?.focus(); return; }

  // Persistência simples: lembra último tipo/usuário
  try { localStorage.setItem('orto:lastUser', JSON.stringify({ userType, username })); } catch {}

  toast(`Bem-vindo, ${username}! (${userType})`);
  closeModalFn();
});

// Preenche últimos dados se existirem
try {
  const last = JSON.parse(localStorage.getItem('orto:lastUser') || 'null');
  if (last) {
    $('#userType') && ($('#userType').value = last.userType || '');
    $('#username') && ($('#username').value = last.username || '');
  }
} catch {}

/* =========================================================
   Formulário de contato (se existir) — validação amigável
========================================================= */
const formContato = $('#formContato');
if (formContato) {
  formContato.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = $('#formContato [name="nome"], #formContato input[placeholder^="Seu nome"]') || $('#formContato input[type="text"]');
    const email = $('#formContato [name="email"], #formContato input[type="email"]');
    const tel = $('#formContato [name="telefone"], #formContato input[type="tel"]');
    const msg = $('#formContato [name="mensagem"], #formContato textarea');

    const emailOk = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const telOk = tel && tel.value.replace(/\D/g, '').length >= 10;

    if (!nome?.value.trim()) { toast('Informe seu nome.'); nome?.focus(); return; }
    if (!emailOk) { toast('E-mail inválido.'); email?.focus(); return; }
    if (!telOk) { toast('Telefone inválido.'); tel?.focus(); return; }
    if (!msg?.value.trim()) { toast('Descreva sua mensagem.'); msg?.focus(); return; }

    // Aqui você pode trocar por fetch() para seu backend
    toast('Mensagem enviada! Entraremos em contato.');
    formContato.reset();
  });

  // Máscara leve de telefone (BR)
  const tel = $('#formContato [name="telefone"], #formContato input[type="tel"]');
  tel?.addEventListener('input', (e) => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 11);
    const p1 = d.slice(0, 2);
    const p2 = d.length > 10 ? d.slice(2, 7) : d.slice(2, 6);
    const p3 = d.length > 10 ? d.slice(7) : d.slice(6);
    e.target.value =
      d.length <= 2 ? `(${p1}` :
      d.length <= 6 ? `(${p1}) ${p2}` :
      `(${p1}) ${p2}-${p3}`;
  });
}

/* =========================================================
   Navegação suave + destaque de seção ativa
========================================================= */
// Suave (para navegadores que não suportam nativamente)
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});

// Realça o item do menu da seção atual
const navLinks = $$('.nav a[href^="#"]');
const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);

if (sections.length && 'IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(en => en.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = `#${visible.target.id}`;
    navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
  }, {
    rootMargin: '-40% 0px -55% 0px', // ativa quando a seção está centrada na viewport
    threshold: [0, .25, .5, .75, 1]
  });
  sections.forEach(sec => obs.observe(sec));
}

/* =========================================================
   Melhoria de performance: debounce de resize (se precisar)
========================================================= */
const debounce = (fn, ms = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};
window.addEventListener('resize', debounce(() => {
  // Espaço para futuros cálculos responsivos (se necessário)
}, 150));

/* =========================================================
   Segurança: evita erro se elementos não existirem
========================================================= */
// Já tratamos com optional chaining e guardas acima.
