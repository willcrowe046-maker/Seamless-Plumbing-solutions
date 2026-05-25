/* Seamless Plumbing Solutions — main.js */

// ── NAVBAR SCROLL ──
const navbar = document.querySelector('.navbar');
const onScroll = () => navbar?.classList.toggle('scrolled', window.scrollY > 60);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── MOBILE NAV ──
const navToggle  = document.querySelector('.nav-toggle');
const navLinks   = document.querySelector('.nav-links');
const navOverlay = document.querySelector('.nav-overlay');

function toggleNav(open) {
  navLinks?.classList.toggle('open', open);
  navOverlay?.classList.toggle('active', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
navToggle?.addEventListener('click', () => toggleNav(!navLinks?.classList.contains('open')));
navOverlay?.addEventListener('click', () => toggleNav(false));
navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleNav(false)));

// ── STAT COUNTER ──
function animateCounter(el) {
  const target   = parseFloat(el.dataset.target);
  const isFloat  = String(target).includes('.');
  const prefix   = el.dataset.prefix  || '';
  const suffix   = el.dataset.suffix  || '';
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val   = isFloat ? (eased * target).toFixed(1) : Math.floor(eased * target);
    el.textContent = prefix + val + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── INTERSECTION OBSERVER ──
const io = new IntersectionObserver(entries => {
  entries.forEach(({ isIntersecting, target: el }) => {
    if (!isIntersecting) return;
    if (el.classList.contains('stat-number')) { animateCounter(el); io.unobserve(el); }
    if (el.classList.contains('animate-in'))  el.classList.add('visible');
  });
}, { threshold: 0.25 });

document.querySelectorAll('.stat-number, .animate-in').forEach(el => io.observe(el));

// ── TESTIMONIAL CAROUSEL ──
(function() {
  const track  = document.querySelector('.testimonials-inner');
  const cards  = document.querySelectorAll('.testimonial-card');
  const prev   = document.querySelector('.t-btn.prev');
  const next   = document.querySelector('.t-btn.next');
  const dots   = document.querySelectorAll('.t-dot');
  if (!track || !cards.length) return;

  let current  = 0;
  const perPage = () => window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;

  function goTo(idx) {
    const pp      = perPage();
    const pages   = Math.ceil(cards.length / pp);
    current       = ((idx % pages) + pages) % pages;
    const cardW   = cards[0].getBoundingClientRect().width + 24;
    track.style.transform = `translateX(-${current * cardW * pp}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prev?.addEventListener('click', () => goTo(current - 1));
  next?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  dots[0]?.classList.add('active');
  let auto = setInterval(() => goTo(current + 1), 5500);
  track.addEventListener('mouseenter', () => clearInterval(auto));
  track.addEventListener('mouseleave', () => { auto = setInterval(() => goTo(current + 1), 5500); });
  window.addEventListener('resize', () => goTo(0));
})();

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item   = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── MULTI-STEP FORM ──
(function() {
  const steps   = document.querySelectorAll('.form-step');
  const sdots   = document.querySelectorAll('.step-dot');
  const slines  = document.querySelectorAll('.step-line');
  const svcOpts = document.querySelectorAll('.svc-opt');
  if (!steps.length) return;

  let current = 0;

  function showStep(n) {
    current = Math.max(0, Math.min(n, steps.length - 1));
    steps.forEach((s, i)  => s.classList.toggle('active', i === current));
    sdots.forEach((d, i)  => {
      d.classList.toggle('active', i === current);
      d.classList.toggle('done', i < current);
      d.querySelector('span:not(.step-label)')?.remove();
      if (i < current) {
        const check = document.createElement('span');
        check.textContent = '✓';
        check.style.cssText = 'font-size:.75rem;font-weight:700';
        d.prepend(check);
      }
    });
    slines.forEach((l, i) => l.classList.toggle('done', i < current));
    window.scrollTo({ top: document.querySelector('.booking-wrapper')?.offsetTop - 120, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', () => showStep(current + 1)));
  document.querySelectorAll('[data-prev]').forEach(b => b.addEventListener('click', () => showStep(current - 1)));

  svcOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      svcOpts.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      setTimeout(() => showStep(current + 1), 380);
    });
  });

  document.getElementById('booking-form')?.addEventListener('submit', e => {
    e.preventDefault();
    showStep(steps.length - 1);
  });

  showStep(0);
})();

// ── PRICE ESTIMATOR ──
(function() {
  const sel    = document.getElementById('estimator-service');
  const result = document.querySelector('.estimator-result');
  if (!sel || !result) return;

  const prices = {
    blocked:   { min: 150,  max: 350  },
    hotwater:  { min: 800,  max: 2200 },
    emergency: { min: 200,  max: 500  },
    leak:      { min: 180,  max: 450  },
    gas:       { min: 250,  max: 600  },
    relining:  { min: 1500, max: 4000 },
    gutters:   { min: 200,  max: 600  },
    strata:    { min: 300,  max: 2000 },
  };

  sel.addEventListener('change', function() {
    const p = prices[this.value];
    if (!p) { result.classList.remove('show'); return; }
    result.querySelector('.estimate-range').textContent = `$${p.min.toLocaleString()} – $${p.max.toLocaleString()}`;
    result.classList.add('show');
  });
})();

// ── SCROLL SPY (active nav) ──
(function() {
  const sections   = document.querySelectorAll('section[id]');
  const anchors    = document.querySelectorAll('.nav-links a');
  if (!sections.length) return;
  window.addEventListener('scroll', () => {
    let active = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) active = s.id; });
    anchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${active}`));
  }, { passive: true });
})();
