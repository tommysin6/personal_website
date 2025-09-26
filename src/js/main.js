document.addEventListener('DOMContentLoaded', () => {
  // remove no-js marker so CSS can animate only when JS is present
  document.documentElement.classList.remove('no-js');

  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav') || document.querySelector('.nav-bar');
  const links = document.querySelectorAll('.nav-link');
  // removed theme toggle behavior (dark-only)
  const themeBtn = document.getElementById('theme-toggle');
  const brand = document.querySelector('.brand');

  // restore previously missing elements (prevent runtime errors)
  const filters = document.querySelectorAll('.filter');
  const grid = document.getElementById('projects-grid');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  // ensure dark-only theme
  document.documentElement.dataset.theme = 'dark';
  try { localStorage.setItem('site-theme', 'dark'); } catch(e){/* ignore */}

  // Mobile menu toggle + aria state
  menuBtn?.addEventListener('click', (ev) => {
    const isOpen = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    nav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    // add body class so CSS can dim or lock scroll if you want
    document.documentElement.classList.toggle('nav-open', isOpen);
    ev.stopPropagation();
  });

  // Close mobile menu if clicking outside
  document.addEventListener('click', (e) => {
    if (!nav) return;
    if (!nav.contains(e.target) && !menuBtn?.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      menuBtn?.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');
    }
  });

  // prevent brand from causing visible "decoration" and handle smooth scroll / navigation
  brand?.addEventListener('click', (e) => {
    e.preventDefault();
    nav?.classList.remove('open');
    nav?.setAttribute('aria-hidden', 'true');
    menuBtn?.setAttribute('aria-expanded', 'false');
    const target = '#home';
    if (location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      location.href = `index.html${target}`;
    }
    brand.blur();
  });

  // Navigation links: support same-page smooth scroll and cross-page anchors
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      // closing menu for all clicks
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      menuBtn?.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('nav-open');

      if (href.startsWith('#')) {
        e.preventDefault();
        if (location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '') {
          document.querySelector(href)?.scrollIntoView({behavior:'smooth', block:'start'});
        } else {
          location.href = `index.html${href}`;
        }
        return;
      }
      const parts = href.split('#');
      if (parts.length === 2 && parts[1]) {
        if (location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname === '') {
          e.preventDefault();
          document.querySelector(`#${parts[1]}`)?.scrollIntoView({behavior:'smooth', block:'start'});
        }
      }
    });
  });

  // Active nav link while scrolling (only useful on index)
  if (document.querySelector('main')) {
    const sections = Array.from(document.querySelectorAll('main section[id]'));
    const setActiveLink = () => {
      const y = window.scrollY + 96;
      sections.forEach(sec => {
        const top = sec.offsetTop, h = sec.offsetHeight;
        const id = `#${sec.id}`;
        const a = document.querySelector(`.nav-link[href="${id}"], .nav-link[href="index.html${id}"]`);
        if (y >= top && y < top + h) a?.classList.add('active'); else a?.classList.remove('active');
      });
    };
    setActiveLink();
    window.addEventListener('scroll', setActiveLink, {passive:true});
  }

  // Project filtering (graceful if no grid present)
  if (filters && filters.length) {
    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        const cards = grid?.querySelectorAll('.project-card') ?? [];
        cards.forEach(c => {
          c.style.display = (f === 'all' || c.dataset.type === f) ? '' : 'none';
        });
      });
    });
  }

  // Contact form basic validation + fake submit
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (status) status.textContent = '';
      const name = form.name?.value?.trim() ?? '';
      const email = form.email?.value?.trim() ?? '';
      const message = form.message?.value?.trim() ?? '';
      if (!name || !email || !message) {
        if (status) status.textContent = 'Please fill all fields.';
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        if (status) status.textContent = 'Enter a valid email.';
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send';
        }
        form.reset();
        if (status) status.textContent = 'Message sent — I will get back to you soon.';
      }, 900);
    });
  }

  // Reveal on scroll + ensure elements visible after JS loads
  const revealTargets = document.querySelectorAll('.project-card, .about, .hero-card, .hero-text h1, .hero-text p');
  revealTargets.forEach(el=>{
    el.style.transition = 'opacity .6s cubic-bezier(.2,.9,.2,1), transform .6s cubic-bezier(.2,.9,.2,1)';
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
  });
  const reveal = () => {
    revealTargets.forEach(el=>{
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  };
  reveal();
  window.addEventListener('scroll', reveal, {passive:true});

  // add hero-loaded class to trigger CSS reveals
  document.documentElement.classList.add('hero-loaded');
});