document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-lang-btn]');
  const saved = localStorage.getItem('echeneid-lang') || root.getAttribute('data-lang') || 'es';

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    buttons.forEach((btn) => btn.classList.toggle('active', btn.dataset.langBtn === lang));
    localStorage.setItem('echeneid-lang', lang);
  }

  buttons.forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.langBtn)));
  setLang(saved);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
});
