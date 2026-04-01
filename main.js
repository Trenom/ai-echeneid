document.documentElement.classList.add('js');
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

  // Scroll reveal (IntersectionObserver)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Tech marquee
  initMarquee();

  // Smooth scroll
  initSmoothScroll();

  // Navbar scroll effect
  initNavbarScroll();
});

// ==========================================================================
// Tech Stack Marquee
// ==========================================================================

const techStack = [
  'OpenAI', 'Anthropic', 'Claude Code', 'n8n', 'Docker',
  'PostgreSQL', 'MCP Protocol', 'Python', 'OpenClaw', 'Government APIs'
];

function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  track.innerHTML = '';
  // Duplicate twice for seamless infinite loop
  [...techStack, ...techStack].forEach(tech => {
    const item = document.createElement('div');
    item.className = 'tech-item';
    item.textContent = tech;
    track.appendChild(item);
  });
}

// ==========================================================================
// Smooth Scroll for Anchor Links
// ==========================================================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });
}

// ==========================================================================
// Navbar Scroll Effect
// ==========================================================================

function initNavbarScroll() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 50) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
  }, 16);

  window.addEventListener('scroll', handleScroll);
}

// ==========================================================================
// Utility: Throttle
// ==========================================================================

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
