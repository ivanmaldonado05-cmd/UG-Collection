/* UG Collection — página de inicio */
(async () => {
  'use strict';
  const { $, $$, t, tx, tterm, esc, icon, money, productName, productUrl, imgTag, cardHTML, observe, carousel, reduceMotion } = UG;
  const DATA = await UG.ready;
  if (!DATA) return;
  const P = DATA.products;

  /* ---------- Hero ---------- */
  const heroIds = (DATA.settings.hero || []).filter((id) => DATA.byId[id]);
  const slides = (heroIds.length ? heroIds : P.filter((p) => p.featured).map((p) => p.id)).slice(0, 6).map((id) => DATA.byId[id]);
  const hero = $('.hero');
  const slidesEl = $('[data-hero-slides]');
  const dotsEl = $('[data-hero-dots]');
  const DUR = 6000;
  let cur = 0, timer = null, paused = false;

  slidesEl.innerHTML = slides.map((p, i) => `
    <a class="hero__slide${i === 0 ? ' is-active' : ''}" href="${productUrl(p)}" aria-label="${esc(productName(p))}" tabindex="${i === 0 ? 0 : -1}">
      <div class="hero__float" data-tilt>${imgTag(p.hero, p.brand + ' ' + productName(p), i === 0 ? 'fetchpriority="high" loading="eager"' : '')}</div>
    </a>`).join('');
  dotsEl.innerHTML = slides.map((p, i) => `<button class="dot${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" aria-label="${esc(productName(p))}" style="--dur:${DUR}ms"><i></i></button>`).join('');
  $('[data-hero-total]').textContent = String(slides.length).padStart(2, '0');

  // Marcas del bisel alrededor del reloj
  const ticks = $('[data-ticks]');
  ticks.innerHTML = Array.from({ length: 120 }, (_, i) => {
    const a = (i / 120) * Math.PI * 2, long = i % 10 === 0, r1 = 99, r2 = long ? 93 : 96.5;
    return `<line x1="${100 + r1 * Math.cos(a)}" y1="${100 + r1 * Math.sin(a)}" x2="${100 + r2 * Math.cos(a)}" y2="${100 + r2 * Math.sin(a)}" stroke="rgba(214,185,127,${long ? .7 : .3})" stroke-width="${long ? .6 : .3}"/>`;
  }).join('');

  // Título con líneas animadas
  function renderTitle() {
    const lines = t('hero.title').split('<br>');
    $('[data-hero-title]').innerHTML = lines.map((l, i) => `<span class="split-line" style="--i:${i}"><span>${i === lines.length - 1 ? `<em class="gold-text">${esc(l)}</em>` : esc(l)}</span></span>`).join('');
    observe(hero);
  }
  function infoFor(p) {
    const v = p.variants.reduce((a, x) => (x.price < a.price ? x : a), p.variants[0]);
    return {
      meta: tx(DATA.collById[p.collection]?.name) + ' · ' + tterm(p.movement),
      name: `${p.brand} ${productName(p)}`,
      price: `${t('common.from')} ${money(v.price)}${v.compare_at ? ` <s>${money(v.compare_at)}</s>` : ''}`,
    };
  }
  function setInfo(p, animate) {
    const info = infoFor(p);
    $('[data-hero-info]').href = productUrl(p);
    $$('[data-hi]').forEach((el) => {
      const wrap = el.parentElement, k = el.dataset.hi;
      if (!animate || reduceMotion) { el.innerHTML = k === 'price' ? info[k] : esc(info[k]); return; }
      wrap.classList.add('is-out');
      setTimeout(() => {
        el.innerHTML = k === 'price' ? info[k] : esc(info[k]);
        wrap.classList.remove('is-out'); wrap.classList.add('is-in');
        void wrap.offsetWidth; wrap.classList.remove('is-in');
      }, 380);
    });
  }
  function drawRing() {
    const ring = $('.hero__ring');
    ring.classList.remove('is-drawing'); void ring.offsetWidth; ring.classList.add('is-drawing');
  }
  function go(i, user) {
    if (i === cur) return;
    const n = slides.length;
    i = (i + n) % n;
    const sEls = $$('.hero__slide', slidesEl), dEls = $$('.dot', dotsEl);
    sEls[cur].classList.remove('is-active'); sEls[cur].classList.add('is-leaving'); sEls[cur].tabIndex = -1;
    const old = sEls[cur];
    setTimeout(() => old.classList.remove('is-leaving'), 700);
    sEls[i].classList.add('is-active'); sEls[i].tabIndex = 0;
    dEls.forEach((d, k) => { d.classList.toggle('is-active', k === i); d.classList.toggle('is-done', k < i); d.setAttribute('aria-selected', k === i); });
    // reinicia la barra de progreso
    const bar = dEls[i].querySelector('i'); bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
    cur = i;
    $('[data-hero-cur]').textContent = String(i + 1).padStart(2, '0');
    setInfo(slides[i], true);
    drawRing();
    if (user) restart();
  }
  function restart() { clearInterval(timer); if (!reduceMotion) timer = setInterval(() => { if (!paused) go(cur + 1); }, DUR); }
  dotsEl.addEventListener('click', (e) => { const d = e.target.closest('.dot'); if (d) go($$('.dot', dotsEl).indexOf(d), true); });
  $('[data-hero-prev]').addEventListener('click', () => go(cur - 1, true));
  $('[data-hero-next]').addEventListener('click', () => go(cur + 1, true));
  hero.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(cur + 1, true); if (e.key === 'ArrowLeft') go(cur - 1, true); });
  const pause = (on) => { paused = on; hero.classList.toggle('is-paused', on); };
  $('.hero__stage').addEventListener('mouseenter', () => pause(true));
  $('.hero__stage').addEventListener('mouseleave', () => pause(false));
  document.addEventListener('visibilitychange', () => pause(document.hidden));
  // swipe
  let sx = null;
  hero.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1), true);
  });
  // inclinación con el mouse
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    const stage = $('.hero__stage');
    let raf = null;
    hero.addEventListener('mousemove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width, y = (e.clientY - (r.top + r.height / 2)) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        slidesEl.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translate(${x * 14}px, ${y * 10}px)`;
        $('.hero__glow').style.transform = `translate(${x * 40}px, calc(-50% + ${y * 30}px))`;
      });
    });
    hero.addEventListener('mouseleave', () => { slidesEl.style.transform = ''; $('.hero__glow').style.transform = ''; });
    slidesEl.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1)';
  }
  renderTitle();
  setInfo(slides[0], false);
  setTimeout(drawRing, 200);
  restart();

  /* ---------- Marquee ---------- */
  function renderMarquee() {
    const items = t('marquee');
    const group = `<div class="marquee__group">${(Array.isArray(items) ? items : []).map((s) => `<span class="marquee__item">${esc(s)}</span>`).join('')}</div>`;
    $('[data-marquee]').innerHTML = group + group;
  }
  renderMarquee();

  /* ---------- Colecciones ---------- */
  function renderCollections() {
    $('[data-collections]').innerHTML = DATA.collections.map((c, i) => {
      const items = P.filter((p) => p.collection === c.id);
      const cover = DATA.byId[c.cover] || items[0];
      return `
      <a class="coll-card reveal" style="--i:${i}" href="catalogo.html?c=${encodeURIComponent(c.id)}">
        <div class="coll-card__top"><span class="coll-card__num">0${i + 1}</span><span class="pill">${items.length} ${esc(t(items.length === 1 ? 'common.model' : 'common.models'))}</span></div>
        <div class="coll-card__img">${cover ? imgTag(cover.hero, tx(c.name)) : ''}</div>
        <div class="coll-card__foot">
          <div><h3>${esc(tx(c.name))}</h3><p>${esc(tx(c.tagline))}</p></div>
          <span class="coll-card__arrow">${icon('arrow-right')}</span>
        </div>
      </a>`;
    }).join('');
    observe($('[data-collections]'));
  }
  renderCollections();

  /* ---------- Destacados ---------- */
  let featFilter = 'all';
  const featTrack = $('[data-featured]');
  function renderFeatTabs() {
    const tabs = [['all', t('common.all')], ...DATA.collections.filter((c) => P.some((p) => p.collection === c.id)).map((c) => [c.id, tx(c.name)])];
    $('[data-feat-tabs]').innerHTML = tabs.map(([id, name]) => `<button class="chip" role="tab" aria-selected="${id === featFilter}" data-tab="${esc(id)}">${esc(name)}</button>`).join('');
  }
  function renderFeatured() {
    let list = featFilter === 'all' ? [...P].sort((a, b) => (b.featured - a.featured) || (UG.bestDiscount(b) - UG.bestDiscount(a))) : P.filter((p) => p.collection === featFilter);
    list = list.slice(0, 10);
    featTrack.style.opacity = 0;
    setTimeout(() => {
      featTrack.innerHTML = list.map((p, i) => cardHTML(p, i)).join('');
      featTrack.scrollLeft = 0;
      UG.syncFavButtons();
      featTrack.style.opacity = '';
    }, featTrack.children.length ? 200 : 0);
  }
  featTrack.style.transition = 'opacity .2s';
  $('[data-feat-tabs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    featFilter = b.dataset.tab;
    $$('[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === b));
    renderFeatured();
  });
  renderFeatTabs();
  renderFeatured();
  carousel($('[data-carousel]'));

  /* ---------- Calibres: esfera con la hora real ---------- */
  const MODES = ['automatico', 'mecacuarzo', 'cuarzo'];
  let mode = 'automatico';
  const dial = $('[data-dial]');
  (function buildDial() {
    const c = 150;
    let s = `<defs>
      <radialGradient id="dg" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#2a2d33"/><stop offset="1" stop-color="#121317"/></radialGradient>
      <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6cc95"/><stop offset=".5" stop-color="#b08d57"/><stop offset="1" stop-color="#8a6a3a"/></linearGradient>
      <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".5"/></filter></defs>
      <circle cx="${c}" cy="${c}" r="146" fill="url(#gg)"/>
      <circle cx="${c}" cy="${c}" r="140" fill="url(#dg)"/>`;
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2, h = i % 5 === 0;
      const r1 = 132, r2 = h ? 116 : 127;
      s += `<line x1="${c + r1 * Math.sin(a)}" y1="${c - r1 * Math.cos(a)}" x2="${c + r2 * Math.sin(a)}" y2="${c - r2 * Math.cos(a)}" stroke="${h ? 'url(#gg)' : 'rgba(255,255,255,.35)'}" stroke-width="${h ? 3.2 : 1}" stroke-linecap="round"/>`;
    }
    s += `<text x="${c}" y="92" text-anchor="middle" fill="#d6b97f" font-family="Marcellus, serif" font-size="17" letter-spacing="3">UG</text>
      <text x="${c}" y="106" text-anchor="middle" fill="rgba(255,255,255,.45)" font-family="Manrope, sans-serif" font-size="6.5" letter-spacing="2.4">COLLECTION</text>
      <text data-dial-type x="${c}" y="214" text-anchor="middle" fill="rgba(255,255,255,.55)" font-family="Manrope, sans-serif" font-size="7.5" letter-spacing="2.6"></text>
      <g data-sub opacity="0">
        <circle cx="${c}" cy="198" r="22" fill="rgba(0,0,0,.25)" stroke="rgba(255,255,255,.18)"/>
        ${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<line x1="${c + 20 * Math.sin(a)}" y1="${198 - 20 * Math.cos(a)}" x2="${c + 17 * Math.sin(a)}" y2="${198 - 17 * Math.cos(a)}" stroke="rgba(255,255,255,.4)"/>`; }).join('')}
        <line data-subhand x1="${c}" y1="198" x2="${c}" y2="181" stroke="#d6b97f" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="${c}" cy="198" r="2" fill="#d6b97f"/>
      </g>
      <g data-h filter="url(#sh)"><path d="M${c - 4} ${c + 14} L${c - 3} ${c - 62} L${c} ${c - 70} L${c + 3} ${c - 62} L${c + 4} ${c + 14} Z" fill="url(#gg)"/></g>
      <g data-m filter="url(#sh)"><path d="M${c - 3} ${c + 18} L${c - 2.2} ${c - 100} L${c} ${c - 108} L${c + 2.2} ${c - 100} L${c + 3} ${c + 18} Z" fill="url(#gg)"/></g>
      <g data-s filter="url(#sh)"><line x1="${c}" y1="${c + 26}" x2="${c}" y2="${c - 122}" stroke="#c8553d" stroke-width="1.4" stroke-linecap="round"/><circle cx="${c}" cy="${c - 96}" r="3" fill="none" stroke="#c8553d" stroke-width="1.2"/></g>
      <circle cx="${c}" cy="${c}" r="5.5" fill="url(#gg)"/><circle cx="${c}" cy="${c}" r="1.8" fill="#121317"/>`;
    dial.innerHTML = s;
  })();
  const hH = $('[data-h]', dial), hM = $('[data-m]', dial), hS = $('[data-s]', dial), sub = $('[data-sub]', dial), subHand = $('[data-subhand]', dial);
  let chronoStart = performance.now();
  function tick() {
    const now = new Date();
    const ms = now.getMilliseconds(), sec = now.getSeconds(), min = now.getMinutes(), hr = now.getHours() % 12;
    hH.setAttribute('transform', `rotate(${(hr + min / 60) * 30} 150 150)`);
    hM.setAttribute('transform', `rotate(${(min + sec / 60) * 6} 150 150)`);
    let sAngle, subAngle = sec * 6;
    if (mode === 'automatico') sAngle = (sec + Math.floor(ms / (1000 / 6)) / 6) * 6;          // 21.600 a/h → 6 pasos/s
    else if (mode === 'cuarzo') sAngle = sec * 6 + (ms < 90 ? -1.2 * (1 - ms / 90) : 0);       // salto por segundo con rebote
    else { const el = (performance.now() - chronoStart) / 1000; sAngle = (Math.floor(el * 4) / 4) * 6; } // crono VK: 4 pasos/s
    hS.setAttribute('transform', `rotate(${sAngle} 150 150)`);
    subHand.setAttribute('transform', `rotate(${subAngle} 150 198)`);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  function renderCalTabs() {
    $('[data-cal-tabs]').innerHTML = MODES.map((m, i) => `
      <button class="cal-tab" role="tab" aria-selected="${m === mode}" data-mode="${m}">
        <span class="cal-tab__n">0${i + 1}</span>
        <span class="cal-tab__name">${esc(t(`calibres.${m}.name`))}</span>
        <span class="cal-tab__spec">${esc(t(`calibres.${m}.spec`))}</span>
        <span class="cal-tab__body"><p>${esc(t(`calibres.${m}.text`))}</p></span>
      </button>`).join('');
    $('[data-dial-type]', dial).textContent = t(`calibres.${mode}.name`).toUpperCase();
    $('[data-dial-label]').textContent = t(`calibres.${mode}.spec`);
  }
  $('[data-cal-tabs]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-mode]'); if (!b) return;
    mode = b.dataset.mode; chronoStart = performance.now();
    sub.setAttribute('opacity', mode === 'mecacuarzo' ? 1 : 0);
    sub.style.transition = 'opacity .5s';
    renderCalTabs();
  });
  renderCalTabs();

  /* ---------- Nosotros / stats / por qué ---------- */
  $('[data-stat="models"]').dataset.count = P.length;
  $('[data-stat="versions"]').dataset.count = P.reduce((a, p) => a + p.variants.length, 0);
  const WHY_ICONS = ['gem', 'cog', 'droplet', 'message'];
  function renderWhy() {
    const w = t('why');
    $('[data-why]').innerHTML = (Array.isArray(w) ? w : []).map((x, i) => `
      <div class="why__item reveal" style="--i:${i}"><span class="why__icon">${icon(WHY_ICONS[i])}</span><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('');
    observe($('[data-why]'));
  }
  renderWhy();

  /* ---------- Instagram ---------- */
  const instaPicks = ['pd-1783', 'pd-1644', 'pd-1728', 'pd-1661', 'pd-1737l', 'pd-1707'].map((id) => DATA.byId[id]).filter(Boolean);
  $('[data-insta]').innerHTML = instaPicks.map((p, i) => `
    <a class="insta__tile reveal" style="--i:${i}" href="${esc(DATA.settings.instagram)}" target="_blank" rel="noopener" aria-label="Instagram · ${esc(productName(p))}">
      ${imgTag(p.variants[Math.min(1, p.variants.length - 1)].image, productName(p))}${icon('instagram')}
    </a>`).join('');

  /* ---------- Parallax suave ---------- */
  const par = $$('[data-parallax]');
  if (!reduceMotion && par.length) {
    let ticking = false;
    const run = () => {
      par.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - innerHeight / 2;
        el.style.transform = `translateY(${center * parseFloat(el.dataset.parallax)}px) rotate(${center * parseFloat(el.dataset.parallax) * -0.04}deg)`;
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  observe();

  /* ---------- Cambio de idioma ---------- */
  document.addEventListener('ug:lang', () => {
    renderTitle(); setInfo(slides[cur], false); renderMarquee(); renderCollections(); renderFeatTabs(); renderFeatured(); renderCalTabs(); renderWhy();
  });
})();
