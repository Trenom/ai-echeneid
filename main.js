/**
 * GRUPO ECHENEID - MAIN JAVASCRIPT
 * Premium landing page interactions
 */

// Add 'js' class to documentElement immediately (no flash of unstyled content)
document.documentElement.classList.add('js');

// Configuration
const CONFIG = {
  langStorageKey: 'echeneid-lang',
  defaultLang: 'es',
  revealThreshold: 0.1,
  marqueeItems: [
    'OpenAI', 'Anthropic', 'Claude', 'n8n', 'Docker',
    'PostgreSQL', 'MCP Protocol', 'Python', 'Nmap',
    'Metasploit', 'ISO 27001', 'NIST', 'Kali Linux',
    'Terraform', 'Kubernetes', 'Nginx', 'TypeScript'
  ]
};

/**
 * Utility: Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Language Toggle - Read from localStorage and set data-lang attribute
 */
function initLanguageToggle() {
  const stored = localStorage.getItem(CONFIG.langStorageKey) || CONFIG.defaultLang;
  document.documentElement.setAttribute('data-lang', stored);
  updateLanguageButtons(stored);

  // Add click handlers to all language buttons
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.dataset.langBtn;
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem(CONFIG.langStorageKey, lang);
      updateLanguageButtons(lang);
    });
  });
}

/**
 * Update active state on language buttons
 */
function updateLanguageButtons(lang) {
  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.langBtn === lang);
  });
}

/**
 * IntersectionObserver for reveal animations
 */
function initRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  const observerOptions = {
    threshold: CONFIG.revealThreshold,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * Populate marquee with tech stack items
 */
function initMarquee() {
  const marqueeContent = document.getElementById('marquee-content');
  if (!marqueeContent) return;

  // Create two sets of items for seamless loop
  const items = [...CONFIG.marqueeItems, ...CONFIG.marqueeItems];

  marqueeContent.innerHTML = items
    .map(item => `<span class="marquee-item">${item}</span>`)
    .join('');
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && document.querySelector(href)) {
        e.preventDefault();
        const target = document.querySelector(href);
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Navbar scroll effect - add 'scrolled' class when scrolling down
 */
function initNavbarScrollEffect() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = throttle(() => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);
}

/**
 * Mobile menu toggle (for future mobile menu implementation)
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  if (!menuToggle) return;

  menuToggle.addEventListener('click', function () {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
      navMenu.classList.toggle('active');
    }
  });

  // Close menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu) {
        navMenu.classList.remove('active');
      }
    });
  });
}

/**
 * Initialize all features
 */
function init() {
  initLanguageToggle();
  initRevealAnimations();
  initMarquee();
  initSmoothScroll();
  initNavbarScrollEffect();
  initMobileMenu();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * Re-observe reveal elements on dynamic content changes
 * (useful if content is added dynamically)
 */
function reinitializeReveals() {
  initRevealAnimations();
}

// Export for external use
if (typeof window !== 'undefined') {
  window.EcheneidGroup = {
    reinitializeReveals,
    setLanguage: (lang) => {
      document.documentElement.setAttribute('data-lang', lang);
      localStorage.setItem(CONFIG.langStorageKey, lang);
      updateLanguageButtons(lang);
    },
    getCurrentLanguage: () => document.documentElement.getAttribute('data-lang')
  };
}
