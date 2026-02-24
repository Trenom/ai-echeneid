document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Language Toggle ---
  const savedLang = localStorage.getItem('lang') || 'es';
  setLang(savedLang);

  window.setLang = (lang) => {
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.toLowerCase() === lang);
    });
    localStorage.setItem('lang', lang);
  };

  // --- 2. Nav Scroll Effect ---
  const nav = document.querySelector('.glass-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // --- 3. Intersection Observer (Reveals & Timeline Active State) ---
  const revealElements = document.querySelectorAll('.reveal');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const timelineProgress = document.querySelector('.timeline-progress');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add active class to animate in
        const delay = entry.target.getAttribute('data-delay');
        if (delay) {
          setTimeout(() => {
            entry.target.classList.add('active');
          }, parseInt(delay));
        } else {
          entry.target.classList.add('active');
        }
        
        // Specific logic for timeline
        if (entry.target.classList.contains('timeline-item')) {
          entry.target.classList.add('active');
          updateTimelineProgress();
        }
        
        // Optional: stop observing once revealed
        // obs.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
  timelineItems.forEach(el => observer.observe(el));

  function updateTimelineProgress() {
    const activeItems = document.querySelectorAll('.timeline-item.active');
    const total = timelineItems.length;
    if (activeItems.length > 0) {
      // Calculate height based on active index vs total. Add bit of offset so it reaches the dot.
      const percentage = (activeItems.length / total) * 100;
      timelineProgress.style.height = `calc(${percentage}% - 2rem)`;
    }
  }

  // --- 4. Infinite Marquee Population ---
  const stackItems = [
    'n8n', 'OpenAI GPT-4o', 'Claude 3.5', 'Docker', 'PostgreSQL', 
    'Supabase', 'Express.js', 'Python', 'Webhooks', 'REST APIs', 
    'Evolution API', 'WhatsApp', 'Telegram', 'Vercel', 'Nginx'
  ];

  const marquee = document.getElementById('marquee');
  
  // Create function to generate tags inside marquee
  function populateMarquee() {
    const content = stackItems.map(item => `<div class="tech-tag">${item}</div>`).join('');
    // Duplicate content to allow seamless scrolling
    marquee.innerHTML = content + content;
  }
  
  populateMarquee();

  // --- 5. Interactive Canvas Background (Constellation Effect) ---
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H;
  let particles = [];
  
  // Mouse interaction
  let mouse = { x: null, y: null, radius: 150 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.baseRadius = Math.random() * 1.5 + 0.5;
      this.radius = this.baseRadius;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.5 ? '59, 130, 246' : '139, 92, 246'; // Primary or Secondary rgb
    }

    update() {
      // Move
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x < 0 || this.x > W) this.vx = -this.vx;
      if (this.y < 0 || this.y > H) this.vy = -this.vy;

      // Mouse interaction
      if (mouse.x != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          // Push away slightly or increase size
           this.radius = this.baseRadius + 1;
        } else {
           this.radius = this.baseRadius;
        }
      }

      this.draw();
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    resize();
    particles = [];
    const numParticles = Math.min(window.innerWidth / 15, 100); // Scale based on screen width
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);
    
    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - distance/1200})`; // Fade out with distance
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => p.update());
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', () => {
    initParticles();
  });

  initParticles();
  animateParticles();
});
