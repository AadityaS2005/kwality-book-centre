// ================================================================
// Kwality Book Centre — main.js v3.1 (Complete End-to-End)
// Features: Wishlist, Dark Mode, Quick View Modal, Search Overlay,
// Binding Calculator with WhatsApp Order, Testimonials Slider,
// Scroll Reveal, Counters, Typing Animation, Toast, Cookie Consent
// ================================================================

'use strict';

// ── Wishlist Manager ──────────────────────────────────────────
const Wishlist = {
  KEY: 'kbc_wishlist',
  items: [],
  init() {
    try { this.items = JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { this.items = []; }
    this.updateBadge();
  },
  toggle(id) {
    const idx = this.items.indexOf(id);
    if (idx === -1) { this.items.push(id); Toast.show('Added to wishlist! 💜', 'success'); }
    else { this.items.splice(idx, 1); Toast.show('Removed from wishlist', 'info'); }
    localStorage.setItem(this.KEY, JSON.stringify(this.items));
    this.updateBadge();
    document.querySelectorAll(`.btn-wish[data-id="${id}"]`).forEach(btn => {
      const isSaved = this.items.includes(id);
      btn.classList.toggle('wishlisted', isSaved);
      btn.innerHTML = isSaved ? '💜 Saved' : '🤍 Save';
    });
    // Update wishlist banner if present
    const banner = document.getElementById('wishlistBanner');
    const wlText = document.getElementById('wishlistCountText');
    if (banner) {
      banner.style.display = this.items.length > 0 ? 'flex' : 'none';
      if (wlText) wlText.textContent = `${this.items.length} book${this.items.length>1?'s':''} saved`;
    }
  },
  has(id) { return this.items.includes(id); },
  updateBadge() {
    const badges = document.querySelectorAll('.wishlist-count');
    badges.forEach(b => {
      b.textContent = this.items.length;
      b.style.display = this.items.length > 0 ? 'flex' : 'none';
    });
  }
};

// ── Toast Notifications ───────────────────────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(msg, type = 'info', duration = 3000) {
    if (!this.container) this.init();
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span> ${msg}`;
    this.container.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, duration);
  }
};

// ── Dark Mode ─────────────────────────────────────────────────
const DarkMode = {
  init() {
    const stored = localStorage.getItem('kbc_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    this.apply(theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  },
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kbc_theme', theme);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });
  },
  toggle() {
    const cur = document.documentElement.getAttribute('data-theme');
    this.apply(cur === 'dark' ? 'light' : 'dark');
  }
};

// ── Book Quick View Modal ─────────────────────────────────────
const BookModal = {
  overlay: null,
  init() {
    this.overlay = document.getElementById('bookModalOverlay');
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.id = 'bookModalOverlay';
      this.overlay.className = 'modal-overlay';
      this.overlay.setAttribute('role', 'dialog');
      this.overlay.setAttribute('aria-modal', 'true');
      this.overlay.innerHTML = `
        <div class="modal-card">
          <button class="modal-close" id="modalClose" aria-label="Close modal">✕</button>
          <div class="modal-left" id="modalCoverContainer"></div>
          <div class="modal-right" id="modalDetailsContainer"></div>
        </div>`;
      document.body.appendChild(this.overlay);

      this.overlay.addEventListener('click', e => {
        if (e.target === this.overlay) this.close();
      });
      document.getElementById('modalClose')?.addEventListener('click', () => this.close());
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.overlay.classList.contains('open')) this.close();
      });
    }
  },
  open(bookId) {
    if (!this.overlay) this.init();
    const book = BOOKS.find(b => b.id === bookId);
    if (!book) return;

    const disc = book.mrp > book.price ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : 0;
    const gradStyle = `background:linear-gradient(135deg,${book.gradient.join(',')})`;
    const waMsg = encodeURIComponent(`Hi! I want to buy/enquire about:\n"${book.title}" by ${book.author}\nEdition: ${book.edition}\nPrice: ₹${book.price}\nAt Kwality Book Centre, Lodhi Colony.`);
    const isWished = Wishlist.has(book.id);

    const coverContainer = document.getElementById('modalCoverContainer');
    const detailsContainer = document.getElementById('modalDetailsContainer');

    if (coverContainer) {
      coverContainer.innerHTML = `
        <div class="book-cover-3d" style="${gradStyle}; width: 140px; height: 205px;">
          <div class="book-spine-3d" style="width: 18px;"></div>
          <div class="book-face" style="padding: 1rem .85rem;">
            <span class="bf-pub" style="font-size: .65rem;">${book.publisher}</span>
            <span class="bf-title" style="font-size: .82rem;">${book.title}</span>
            <div>
              <div class="bf-author" style="font-size: .72rem;">${book.author}</div>
              <div class="bf-price" style="font-size: .8rem;">₹${book.price}</div>
            </div>
          </div>
        </div>
        <div style="margin-top: 1.5rem; text-align: center;">
          <span class="badge ${book.inStock ? 'badge-new' : 'badge-stock-out'}">
            ${book.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </span>
        </div>`;
    }

    if (detailsContainer) {
      detailsContainer.innerHTML = `
        <div class="modal-cat">${book.category.toUpperCase()} • ${book.edition}</div>
        <h2 class="modal-title">${book.title}</h2>
        <div class="modal-author">by <strong>${book.author}</strong> | Published by ${book.publisher}</div>
        <div class="modal-meta">
          <span>⭐ <strong>${book.rating}</strong>/5 (${book.reviews.toLocaleString()} reviews)</span>
          <span>🏬 Store Pickup at Lodhi Colony</span>
        </div>
        <p class="modal-desc">${book.description}</p>
        <div class="modal-price-row">
          <span class="modal-price">₹${book.price.toLocaleString('en-IN')}</span>
          ${book.mrp > book.price ? `<span class="modal-mrp">₹${book.mrp.toLocaleString('en-IN')}</span>` : ''}
          ${disc ? `<span class="modal-disc">${disc}% OFF</span>` : ''}
        </div>
        <div class="modal-actions">
          <button class="btn btn-gold btn-sm" onclick="window.open('https://wa.me/919582262883?text=${waMsg}','_blank')">
            💬 Order via WhatsApp
          </button>
          <button class="btn btn-royal btn-sm" onclick="Wishlist.toggle(${book.id}); BookModal.updateWishBtn(${book.id})">
            <span id="modalWishText">${isWished ? '💜 In Wishlist' : '🤍 Save to Wishlist'}</span>
          </button>
          <a class="btn btn-outline-dark btn-sm" href="tel:+919582262883">
            📞 Call Store
          </a>
        </div>`;
    }

    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  updateWishBtn(bookId) {
    const textEl = document.getElementById('modalWishText');
    if (textEl) textEl.textContent = Wishlist.has(bookId) ? '💜 In Wishlist' : '🤍 Save to Wishlist';
  },
  close() {
    if (this.overlay) {
      this.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
};

// ── Scroll Progress Bar ───────────────────────────────────────
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const update = () => {
    const s = document.documentElement;
    const pct = (s.scrollTop / (s.scrollHeight - s.clientHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
}

// ── Back to Top ───────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Navbar Functionality ──────────────────────────────────────
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('primaryNav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      const bars = hamburger.querySelectorAll('span');
      if (open) {
        bars[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
      }
    });
    navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }));
  }

  // Active link detection
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(l => {
    const href = l.getAttribute('href');
    l.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });
}

// ── Reveal on Scroll ──────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-scale');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('visible')); return;
  }
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(e => obs.observe(e));
}

// ── Counter Animation ─────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  const start = performance.now();
  const isFloat = String(target).includes('.');
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const val = easeOut(p) * target;
    el.textContent = isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = isFloat ? target : target.toLocaleString('en-IN');
  })(start);
}

function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(e => { e.textContent = e.dataset.count; }); return; }
  const obs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target, parseFloat(e.target.dataset.count)); obs.unobserve(e.target); }
  }), { threshold: 0.4 });
  els.forEach(e => obs.observe(e));
}

// ── Typing Animation ──────────────────────────────────────────
function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;
  const words = ['UPSC Aspirants', 'SSC Students', 'School Children', 'College Students', 'Book Lovers'];
  let wi = 0, ci = 0, deleting = false, paused = false;
  function tick() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    let delay = deleting ? 60 : 100;
    if (!deleting && ci === word.length + 1) { paused = true; delay = 2000; }
    else if (deleting && ci < 0) { deleting = false; ci = 0; wi = (wi + 1) % words.length; delay = 300; }
    if (paused) { paused = false; deleting = true; }
    setTimeout(tick, delay);
  }
  tick();
}

// ── Book Card Renderer ────────────────────────────────────────
function renderBookCard(book) {
  const disc = book.mrp > book.price ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : 0;
  const badgeMap = { hot: 'badge-hot', new: 'badge-new', info: 'badge-info', amber: 'badge-amber' };
  const waMsg = encodeURIComponent(`Hi! I'd like to enquire about:\n"${book.title}" by ${book.author}\n(${book.edition})\nPlease confirm price and availability at Kwality Book Centre.`);
  const gradStyle = `background:linear-gradient(135deg,${book.gradient.join(',')})`;
  const isWished = Wishlist.has(book.id);

  return `
  <div class="book-card reveal-scale" data-id="${book.id}" data-category="${book.category}" data-title="${book.title.toLowerCase()}" data-author="${book.author.toLowerCase()}">
    <div class="book-cover-wrap" onclick="BookModal.open(${book.id})" style="cursor: pointer;" title="Click for Details">
      <div class="book-cover-3d" style="${gradStyle}">
        <div class="book-spine-3d"></div>
        <div class="book-face">
          <span class="bf-pub">${book.publisher.slice(0,12)}</span>
          <span class="bf-title">${book.title.length > 40 ? book.title.slice(0,38)+'…' : book.title}</span>
          <div>
            <div class="bf-author">${book.author}</div>
            <div class="bf-price">₹${book.price.toLocaleString('en-IN')}</div>
          </div>
        </div>
        ${!book.inStock ? `<div class="book-out-overlay"><span class="book-out-text">Out of Stock</span></div>` : ''}
      </div>
      ${book.badge ? `<div class="book-badge"><span class="badge ${badgeMap[book.badgeType]||'badge-info'}">${book.badge}</span></div>` : ''}
    </div>
    <div class="book-info">
      <div class="book-title" onclick="BookModal.open(${book.id})" style="cursor: pointer;" title="Click for details">${book.title}</div>
      <div class="book-author">${book.author}</div>
      <div class="book-edition">${book.edition}</div>
      <div class="book-price-row">
        <span class="book-price">₹${book.price.toLocaleString('en-IN')}</span>
        ${book.mrp > book.price ? `<span class="book-mrp">₹${book.mrp.toLocaleString('en-IN')}</span>` : ''}
        ${disc ? `<span class="book-disc">${disc}% off</span>` : ''}
      </div>
    </div>
    <div class="book-actions">
      <button class="book-action-btn btn-wa" onclick="window.open('https://wa.me/919582262883?text=${waMsg}','_blank')" ${!book.inStock?'disabled':''}>
        💬 Order
      </button>
      <button class="book-action-btn btn-wish ${isWished?'wishlisted':''}" data-id="${book.id}" onclick="Wishlist.toggle(${book.id})">
        ${isWished?'💜 Saved':'🤍 Save'}
      </button>
    </div>
  </div>`;
}

// ── Category Filter ───────────────────────────────────────────
function initCategoryFilter() {
  const catBtns   = document.querySelectorAll('.cat-btn');
  const booksGrid = document.getElementById('booksGrid');
  const countEl   = document.getElementById('resultsCount');
  const emptyEl   = document.getElementById('emptyState');
  if (!booksGrid || typeof BOOKS === 'undefined') return;

  function render(cat) {
    const filtered = cat === 'all' ? BOOKS : BOOKS.filter(b => b.category === cat);
    if (filtered.length) {
      booksGrid.innerHTML = filtered.map(renderBookCard).join('');
      booksGrid.style.display = 'grid';
      if (emptyEl) emptyEl.style.display = 'none';
    } else {
      booksGrid.innerHTML = '';
      booksGrid.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
    }

    if (countEl) {
      const catLabel = cat === 'all' ? 'all categories' : cat.toUpperCase();
      countEl.textContent = `Showing ${filtered.length} of ${BOOKS.length} books (${catLabel})`;
    }
    initReveal();
  }

  catBtns.forEach(btn => btn.addEventListener('click', () => {
    catBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.cat);
  }));

  // Default active or URL param
  const activeCat = document.querySelector('.cat-btn.active');
  render(activeCat ? activeCat.dataset.cat : 'all');
}

// ── Search Overlay ────────────────────────────────────────────
function initSearch() {
  const overlay    = document.getElementById('searchOverlay');
  const input      = document.getElementById('searchInput');
  const resultsEl  = document.getElementById('searchResults');
  const openBtns   = document.querySelectorAll('.open-search');
  const closeBtn   = document.getElementById('searchClose');
  if (!overlay || typeof BOOKS === 'undefined') return;

  function open()  { overlay.classList.add('open'); input.focus(); document.body.style.overflow = 'hidden'; }
  function close() { overlay.classList.remove('open'); input.value = ''; resultsEl.innerHTML = '<p class="search-hint">Start typing to search books…</p>'; document.body.style.overflow = ''; }

  openBtns.forEach(b => b.addEventListener('click', open));
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) { resultsEl.innerHTML = '<p class="search-hint">Start typing to search books…</p>'; return; }
    const found = BOOKS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.publisher.toLowerCase().includes(q) ||
      b.category.includes(q) ||
      (b.edition && b.edition.toLowerCase().includes(q))
    );
    if (!found.length) {
      resultsEl.innerHTML = `<p class="search-no-results">No books found for "<strong style="color:#fff">${q}</strong>". Try another keyword or WhatsApp us.</p>`;
      return;
    }
    resultsEl.innerHTML = found.map(b => {
      const gradStyle = `background:linear-gradient(135deg,${b.gradient.join(',')})`;
      return `
      <div class="search-book-card" onclick="BookModal.open(${b.id}); document.getElementById('searchOverlay').classList.remove('open');">
        <div class="search-book-cover" style="${gradStyle}">${b.title.slice(0,15)}</div>
        <div class="search-book-info">
          <div class="book-title">${b.title}</div>
          <div class="book-author">by ${b.author}</div>
          <div class="book-price">₹${b.price.toLocaleString('en-IN')} ${b.inStock?'✅ In Stock':'❌ Out of Stock'}</div>
        </div>
      </div>`;
    }).join('');
  }

  input.addEventListener('input', e => search(e.target.value));
}

// ── Testimonials Slider ───────────────────────────────────────
function initTestimonialsSlider() {
  const track    = document.querySelector('.testimonials-track');
  const dotsEl   = document.querySelector('.slider-nav');
  const prevBtn  = document.getElementById('sliderPrev');
  const nextBtn  = document.getElementById('sliderNext');
  if (!track || typeof TESTIMONIALS === 'undefined') return;

  // Render cards
  track.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="t-stars">${'★'.repeat(t.rating)}</div>
      <p class="t-text">${t.text}</p>
      <div class="t-author">
        <div class="t-avatar" style="background:${t.avatarBg}">${t.avatar}</div>
        <div class="t-info">
          <div class="t-name">${t.name}</div>
          <div class="t-role">${t.role} · ${t.area}</div>
        </div>
      </div>
    </div>`).join('');

  if (dotsEl) dotsEl.innerHTML = TESTIMONIALS.map((_, i) => `<button class="slider-dot${i===0?' active':''}" data-i="${i}" aria-label="Go to testimonial ${i+1}"></button>`).join('');

  let cur = 0;
  const total = TESTIMONIALS.length;

  function perView() { return window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3; }

  function goTo(idx) {
    cur = Math.max(0, Math.min(idx, total - perView()));
    const cardWidth = track.firstElementChild?.offsetWidth || 300;
    const gap = 24;
    track.style.transform = `translateX(-${cur * (cardWidth + gap)}px)`;
    document.querySelectorAll('.slider-dot').forEach((d,i) => d.classList.toggle('active', i === cur));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(cur - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(cur + 1));
  dotsEl?.addEventListener('click', e => { const d = e.target.closest('.slider-dot'); if (d) goTo(parseInt(d.dataset.i)); });

  let autoInterval = setInterval(() => goTo((cur + 1) % Math.max(1, total - perView() + 1)), 4500);
  track.addEventListener('mouseenter', () => clearInterval(autoInterval));
  track.addEventListener('mouseleave', () => { autoInterval = setInterval(() => goTo((cur + 1) % Math.max(1, total - perView() + 1)), 4500); });
  window.addEventListener('resize', () => goTo(0));
}

// ── Binding Calculator ────────────────────────────────────────
function initBindingCalculator() {
  const typeSelect = document.getElementById('bindType');
  const pagesEl    = document.getElementById('bindPages');
  const pagesVal   = document.getElementById('pagesVal');
  const copiesEl   = document.getElementById('bindCopies');
  const printEl    = document.getElementById('bindPrint');
  const resultBox  = document.getElementById('calcResult');
  const waBtn      = document.getElementById('calcWhatsApp');
  if (!typeSelect || typeof BINDING_TYPES === 'undefined') return;

  typeSelect.innerHTML = BINDING_TYPES.map(t => `<option value="${t.id}">${t.name} — ${t.description}</option>`).join('');

  function compute() {
    const type   = BINDING_TYPES.find(t => t.id === typeSelect.value) || BINDING_TYPES[0];
    const pages  = parseInt(pagesEl.value) || 50;
    const copies = parseInt(copiesEl.value) || 1;
    const print  = printEl?.checked ? copies * Math.ceil(pages / 2) * 0.5 : 0;
    const base   = type.base;
    const perCopy = base + (pages * type.pricePerPage);
    const total  = (perCopy * copies) + print;
    const gst    = total * 0.05;

    if (resultBox) resultBox.innerHTML = `
      <div class="calc-result-row"><span>Binding Type</span><strong>${type.name}</strong></div>
      <div class="calc-result-row"><span>Pages</span><strong>${pages} pages</strong></div>
      <div class="calc-result-row"><span>Copies</span><strong>${copies}</strong></div>
      ${print > 0 ? `<div class="calc-result-row"><span>Printing (~)</span><strong>₹${print.toFixed(0)}</strong></div>` : ''}
      <div class="calc-result-row"><span>Subtotal</span><strong>₹${total.toFixed(0)}</strong></div>
      <div class="calc-result-row"><span>GST (5%)</span><strong>₹${gst.toFixed(0)}</strong></div>
      <div class="calc-result-row calc-total-row"><span>Estimated Total</span><strong>₹${(total + gst).toFixed(0)}</strong></div>`;

    if (waBtn) {
      const msg = `Hi! I need binding at Kwality Book Centre:\n\n📋 Type: ${type.name}\n📄 Pages: ${pages}\n📦 Copies: ${copies}\n💰 Estimated: ₹${(total + gst).toFixed(0)}\n\nPlease confirm and I'll visit your store at 7 Lodhi Road, Meharchand Market!`;
      waBtn.onclick = () => window.open(`https://wa.me/919582262883?text=${encodeURIComponent(msg)}`, '_blank');
    }
  }

  [typeSelect, copiesEl].forEach(el => el?.addEventListener('change', compute));
  pagesEl?.addEventListener('input', () => { if (pagesVal) pagesVal.textContent = pagesEl.value; compute(); });
  printEl?.addEventListener('change', compute);
  compute();
}

// ── Contact Form ──────────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    setTimeout(() => {
      const svc   = form.querySelector('#service')?.options[form.querySelector('#service')?.selectedIndex]?.text || 'General Enquiry';
      const name  = form.querySelector('#firstName')?.value || '';
      const phone = form.querySelector('#phone')?.value || '';
      const msg   = form.querySelector('#message')?.value || '';
      const waMsg = `Hi! Enquiry from ${name} (${phone}):\nService: ${svc}\n${msg}\n(Sent from Kwality Book Centre Website)`;
      window.open(`https://wa.me/919582262883?text=${encodeURIComponent(waMsg)}`, '_blank');
      const suc = document.querySelector('.form-success-msg');
      if (suc) suc.style.display = 'block';
      form.reset(); btn.disabled = false; btn.textContent = '📨 Send Enquiry via WhatsApp';
      Toast.show('Enquiry opened in WhatsApp! 💬', 'success');
    }, 600);
  });
}

// ── Cookie Consent ────────────────────────────────────────────
function initCookieConsent() {
  if (localStorage.getItem('kbc_cookie') === 'yes') return;
  const el = document.getElementById('cookieBanner');
  if (!el) return;
  el.style.display = 'flex';
  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('kbc_cookie', 'yes'); el.style.display = 'none';
    Toast.show('Preferences saved! 🍪', 'success');
  });
  document.getElementById('cookieDecline')?.addEventListener('click', () => { el.style.display = 'none'; });
}

// ── Newsletter Form ───────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value;
    if (!email) { Toast.show('Please enter a valid email', 'error'); return; }
    Toast.show(`Subscribed! We'll keep ${email} updated 📚`, 'success', 4000);
    form.reset();
  });
}

// ── Announce Bar ──────────────────────────────────────────────
function initAnnounceBar() {
  document.querySelectorAll('.ab-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.announce-bar')?.remove());
  });
}

// ── Hero Book Shelf ───────────────────────────────────────────
function initHeroShelf() {
  const shelf = document.getElementById('heroShelf');
  if (!shelf || typeof BOOKS === 'undefined') return;
  const featured = BOOKS.filter((_, i) => i < 7);
  shelf.innerHTML = featured.map(b => {
    return `
    <div class="hero-book" style="background:linear-gradient(160deg,${b.gradient.join(',')});" onclick="BookModal.open(${b.id})" title="${b.title} — ₹${b.price} (Click for details)" role="button" tabindex="0" aria-label="${b.title} by ${b.author}">
      <div class="book-spine"></div>
      <div class="book-body">
        <span class="bk-title">${b.title.slice(0,22)}${b.title.length>22?'…':''}</span>
        <div>
          <div class="bk-author">${b.author.split(' ').slice(-1)[0]}</div>
          <div class="bk-price">₹${b.price}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── Init all ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init();
  Toast.init();
  Wishlist.init();
  BookModal.init();
  initScrollProgress();
  initBackToTop();
  initNavbar();
  initReveal();
  initCounters();
  initTyping();
  initHeroShelf();
  initCategoryFilter();
  initSearch();
  initTestimonialsSlider();
  initBindingCalculator();
  initContactForm();
  initCookieConsent();
  initNewsletter();
  initAnnounceBar();
});
