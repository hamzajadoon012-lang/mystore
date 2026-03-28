/* ══════════════════════════════════════════
   TRENDSPK.STORE v2 — script.js
   Features: loader · navbar · hamburger ·
   search+filter · product modal ·
   scroll-reveal · scroll-to-top ·
   sticky mobile CTA · image lazy-load
══════════════════════════════════════════ */

'use strict';

/* ── utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════
   1. LOADER
══════════════════════════════════════════ */

/* ══════════════════════════════════════════
   2. NAVBAR — scroll class + active links
══════════════════════════════════════════ */
(function Navbar() {
  const nav = $('#navbar');
  const links = $$('.nl');
  const sections = $$('section[id], div[id]');
  if (!nav) return;

  // Scroll class
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link via IntersectionObserver
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active',
            l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { threshold: .35, rootMargin: '-60px 0px 0px 0px' });

  sections.forEach(s => io.observe(s));
})();

/* ══════════════════════════════════════════
   3. HAMBURGER MENU
══════════════════════════════════════════ */
(function Hamburger() {
  const btn  = $('#hamburger');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  const close = () => {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', () => {
    const opened = btn.classList.toggle('open');
    menu.classList.toggle('open', opened);
    btn.setAttribute('aria-expanded', String(opened));
    menu.setAttribute('aria-hidden', String(!opened));
  });

  $$('.mm-link', menu).forEach(l => l.addEventListener('click', close));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) close();
  });
})();

/* ══════════════════════════════════════════
   4. SEARCH TOGGLE
══════════════════════════════════════════ */
(function SearchToggle() {
  const toggleBtn = $('#searchToggle');
  const wrap      = $('#searchBarWrap');
  const input     = $('#searchInput');
  if (!toggleBtn || !wrap) return;

  toggleBtn.addEventListener('click', () => {
    const opened = wrap.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', String(opened));
    wrap.setAttribute('aria-hidden', String(!opened));
    if (opened) setTimeout(() => input && input.focus(), 80);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wrap.classList.contains('open')) {
      wrap.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ══════════════════════════════════════════
   5. SEARCH & FILTER SYSTEM
══════════════════════════════════════════ */
(function SearchFilter() {
  const searchInput = $('#searchInput');
  const clearBtn    = $('#searchClear');
  const clearBtn2   = $('#clearSearch');
  const filterBtns  = $$('.fb-btn');
  const catCards    = $$('.cat-card');
  const noResults   = $('#noResults');
  const allCards    = $$('.pcard');

  let currentFilter = 'all';
  let currentSearch = '';

  function applyFilters() {
    const search = currentSearch.toLowerCase().trim();
    let visible = 0;

    allCards.forEach(card => {
      const cat   = (card.dataset.category || '').toLowerCase();
      const title = (card.dataset.title || '').toLowerCase();
      const desc  = (card.dataset.desc  || '').toLowerCase();

      const matchFilter = currentFilter === 'all' || cat === currentFilter;
      const matchSearch = !search ||
        title.includes(search) || cat.includes(search) || desc.includes(search);

      const show = matchFilter && matchSearch;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Hide/show product section headings if all their cards are hidden
    $$('.products-section').forEach(sec => {
      const cards = $$('.pcard', sec);
      const anyVisible = cards.some(c => c.style.display !== 'none');
      sec.style.display = anyVisible ? '' : 'none';
    });

    // No results state
    if (noResults) {
      noResults.classList.toggle('show', visible === 0);
      noResults.setAttribute('aria-hidden', String(visible !== 0));
    }
  }

  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;

      // Also scroll to products
      const target = $('#trending') || $('#viral');
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      applyFilters();
    });
  });

  // Category cards filter (the visual cards)
  catCards.forEach(card => {
    const handler = (e) => {
      e.preventDefault();
      const f = card.dataset.filter;
      filterBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.filter === f);
      });
      currentFilter = f;
      applyFilters();

      const target = $('#trending');
      if (target) {
        const top = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    card.addEventListener('click', handler);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(e); }
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      applyFilters();
    });
  }

  // Clear search
  const doClear = () => {
    if (searchInput) searchInput.value = '';
    currentSearch = '';
    currentFilter = 'all';
    filterBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
    applyFilters();
  };

  if (clearBtn)  clearBtn.addEventListener('click',  doClear);
  if (clearBtn2) clearBtn2.addEventListener('click', doClear);
})();

/* ══════════════════════════════════════════
   6. SMOOTH SCROLL (for anchor links)
══════════════════════════════════════════ */
(function SmoothScroll() {
  const navH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
  ) || 68;

  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.pageYOffset - navH - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════
   7. PRODUCT MODAL
══════════════════════════════════════════ */
(function Modal() {
  const overlay   = $('#modalOverlay');
  const modal     = $('#modal');
  const closeBtn  = $('#modalClose');
  const modalImg  = $('#modalImg');
  const modalBadge= $('#modalBadge');
  const modalCat  = $('#modalCat');
  const modalTitle= $('#modalTitle');
  const modalStars= $('#modalStars');
  const modalPricing = $('#modalPricing');
  const modalDesc = $('#modalDesc');
  const modalBullets = $('#modalBullets');
  const modalLove = $('#modalLove');
  const modalCTA  = $('#modalCTA');

  if (!overlay) return;

  const badgeClassMap = {
    HOT: 'hot', BESTSELLER: 'bestseller',
    LIMITED: 'limited', VIRAL: 'viral'
  };

  function starsHTML(n) {
    const full = Math.floor(n), max = 5;
    let s = '';
    for (let i = 0; i < max; i++) s += i < full ? '★' : '☆';
    return s;
  }

  function openModal(card) {
    const d = card.dataset;

    // Populate
    modalImg.src = d.img || '';
    modalImg.alt = d.title || '';
    modalImg.style.opacity = '0';
    modalImg.onload = () => { modalImg.style.opacity = '1'; modalImg.style.transition = 'opacity .4s'; };

    const badgeText = d.badge || '';
    if (modalBadge) {
      modalBadge.textContent = badgeText;
      modalBadge.className = 'pcard-badge ' + (badgeClassMap[badgeText] || 'hot');
    }

    if (modalCat)   modalCat.textContent   = card.querySelector('.pcard-cat')?.textContent || '';
    if (modalTitle) modalTitle.textContent = d.title || '';
    if (modalDesc)  modalDesc.textContent  = d.desc || '';
    if (modalLove) {
      const loveEl = $('#modalLove');
      if (loveEl) loveEl.textContent = d.love || '';
    }

    if (modalStars) {
      const reviews = d.reviews || '';
      const rating  = parseInt(d.rating) || 5;
      modalStars.innerHTML = `<span style="color:#ffb300">${starsHTML(rating)}</span> <span style="color:var(--text-3);font-size:.78rem">(${reviews} reviews)</span>`;
    }

    if (modalPricing) {
      const price = d.price || '';
      const old   = d.old   || '';
      const origNum = parseInt(old.replace(/[^0-9]/g,''));
      const newNum  = parseInt(price.replace(/[^0-9]/g,''));
      const disc = origNum && newNum ? Math.round((1 - newNum/origNum)*100) : 0;
      modalPricing.innerHTML = `
        <span class="p-price">${price}</span>
        ${old ? `<span class="p-old">${old}</span>` : ''}
        ${disc ? `<span class="p-disc">-${disc}%</span>` : ''}
      `;
    }

    if (modalBullets) {
      try {
        const bullets = JSON.parse(d.bullets || '[]');
        modalBullets.innerHTML = bullets
          .map(b => `<li>${b}</li>`).join('');
      } catch (err) {
        modalBullets.innerHTML = '';
      }
    }

    // Show overlay
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus trap (close button)
    setTimeout(() => closeBtn && closeBtn.focus(), 80);
  }

  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Attach to quick-view buttons and card images
  document.addEventListener('click', e => {
    const quickBtn = e.target.closest('.pcard-quick');
    if (quickBtn) {
      const card = quickBtn.closest('.pcard');
      if (card) openModal(card);
      return;
    }
    const imgClick = e.target.closest('.pcard-img-wrap');
    if (imgClick) {
      const card = imgClick.closest('.pcard');
      if (card) openModal(card);
      return;
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();

/* ══════════════════════════════════════════
   8. SCROLL REVEAL
══════════════════════════════════════════ */
(function ScrollReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      // Stagger siblings
      const parent = entry.target.parentElement;
      const revSiblings = $$('.reveal', parent);
      const idx = revSiblings.indexOf(entry.target);
      const delay = Math.min(idx * 80, 320);

      setTimeout(() => entry.target.classList.add('in'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ══════════════════════════════════════════
   9. SCROLL TO TOP
══════════════════════════════════════════ */
(function ScrollUp() {
  const btn = $('#scrollUp');
  if (!btn) return;

  const update = () => btn.classList.toggle('show', window.scrollY > 450);
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();

/* ══════════════════════════════════════════
   10. STICKY MOBILE CTA
══════════════════════════════════════════ */
(function StickyMobile() {
  const el = $('#stickyMobile');
  if (!el) return;

  const update = () => el.classList.toggle('show', window.scrollY > 350);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ══════════════════════════════════════════
   11. LAZY IMAGE LOADING
══════════════════════════════════════════ */
(function LazyImages() {
  $$('.pcard-img').forEach(img => {
    const load = () => {
      img.classList.add('loaded');
    };
    if (img.complete && img.naturalWidth) {
      load();
    } else {
      img.addEventListener('load', load);
    }

    // Graceful error fallback
    img.addEventListener('error', () => {
      const wrap = img.closest('.pcard-img-wrap');
      if (wrap) {
        wrap.style.background = 'linear-gradient(135deg,#f0f0f0,#e0e0e0)';
        img.style.display = 'none';
      }
    });
  });
})();

/* ══════════════════════════════════════════
   12. CTA BUTTON RIPPLE
══════════════════════════════════════════ */
(function Ripple() {
  $$('.pcard-cta, .modal-cta').forEach(btn => {
    btn.addEventListener('click', function() {
      this.style.transform = 'scale(0.97)';
      setTimeout(() => { this.style.transform = ''; }, 160);
    });
  });
})();

/* ══════════════════════════════════════════
   13. CONSOLE BRAND
══════════════════════════════════════════ */
console.log(
  '%c trendspk 🇵🇰 %c v2.0 — Built for conversions ',
  'background:#ff6a00;color:#fff;padding:5px 10px;border-radius:4px 0 0 4px;font-family:Poppins,sans-serif;font-weight:800;font-size:13px',
  'background:#111;color:#fff;padding:5px 10px;border-radius:0 4px 4px 0;font-family:Poppins,sans-serif;font-size:13px'
);

