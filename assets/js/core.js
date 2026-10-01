/* =========================================================
   UG Collection — núcleo compartido por todas las páginas
   i18n · datos · header/footer · favoritos · vista rápida · carruseles · animaciones
   ========================================================= */
(() => {
  'use strict';

  const CONFIG = Object.assign({
    data: 'data/catalog.json',          // catálogo inicial (repositorio)
    liveData: 'uploads/catalog.json',   // catálogo publicado por el panel (servidor)
    i18n: 'assets/i18n/',
    langs: ['es', 'pt', 'en'],
    defaultLang: 'es',
  }, window.UG_CONFIG || {});

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* modo privado */ } },
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Íconos ---------- */
  const ICONS = {
    'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    'arrow-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
    'arrow-up-right': '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    menu: '<path d="M3 8h18"/><path d="M9 16h12"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    sliders: '<path d="M4 6h9"/><path d="M19 6h1"/><path d="M4 12h3"/><path d="M13 12h7"/><path d="M4 18h11"/><circle cx="16" cy="6" r="2.5"/><circle cx="10" cy="12" r="2.5"/><circle cx="18" cy="18" r="2.5"/>',
    grid2: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    grid3: '<rect x="2.5" y="3" width="5" height="18" rx="1.2"/><rect x="9.5" y="3" width="5" height="18" rx="1.2"/><rect x="16.5" y="3" width="5" height="18" rx="1.2"/>',
    grid4: '<rect x="2" y="3" width="3.6" height="18" rx="1"/><rect x="7.5" y="3" width="3.6" height="18" rx="1"/><rect x="13" y="3" width="3.6" height="18" rx="1"/><rect x="18.4" y="3" width="3.6" height="18" rx="1"/>',
    zoom: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M11 8v6"/><path d="M8 11h6"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3"/><path d="M12 18.5v3"/><path d="m5.3 5.3 2.1 2.1"/><path d="m16.6 16.6 2.1 2.1"/><path d="M2.5 12h3"/><path d="M18.5 12h3"/><path d="m5.3 18.7 2.1-2.1"/><path d="m16.6 7.4 2.1-2.1"/>',
    watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9.5V12l1.5 1.5"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>',
    strap: '<rect x="6" y="7" width="12" height="10" rx="3"/><path d="M8.5 7 9.5 2h5l1 5"/><path d="m8.5 17 1 5h5l1-5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 16v5"/><path d="M16.5 18.5h5"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
    instagram: '<rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r=".9" fill="currentColor" stroke="none"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  };
  const WA_PATH = '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.27 11.27 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.62l6.02-1.58a11.3 11.3 0 0 0 5.42 1.38h.01c6.26 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.03"/>';
  const icon = (name, cls = '') => name === 'whatsapp'
    ? `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${WA_PATH}</svg>`
    : `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- i18n ---------- */
  let lang = store.get('ug_lang', null);
  if (!CONFIG.langs.includes(lang)) lang = CONFIG.defaultLang;
  const dicts = {};
  async function loadDict(l) {
    if (!dicts[l]) dicts[l] = fetch(CONFIG.i18n + l + '.json').then((r) => r.json());
    return dicts[l];
  }
  let D = {};
  const t = (key, vars) => {
    let v = key.split('.').reduce((o, k) => (o == null ? o : o[k]), D);
    if (v == null) return key;
    if (vars && typeof v === 'string') v = v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
    return v;
  };
  // Texto de producto: {es, pt, en} con respaldo en español
  const tx = (obj) => (obj && typeof obj === 'object') ? (obj[lang] || obj.es || '') : (obj || '');
  // Traduce nombres de versiones ("Negro · Oro rosa · Caucho") con el diccionario de términos
  let termRe = null;
  function tterm(s) {
    const terms = D.terms || {};
    const keys = Object.keys(terms);
    if (!s || lang === 'es' || !keys.length) return s || '';
    if (!termRe) termRe = new RegExp('(?<![\\p{L}])(' + keys.sort((a, b) => b.length - a.length).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')(?![\\p{L}])', 'gu');
    return s.replace(termRe, (m) => terms[m] ?? m);
  }
  function applyI18n(root = document) {
    $$('[data-i18n]', root).forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-html]', root).forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$('[data-i18n-attr]', root).forEach((el) => {
      el.dataset.i18nAttr.split(';').forEach((pair) => { const [a, k] = pair.split(':'); if (a && k) el.setAttribute(a.trim(), t(k.trim())); });
    });
    document.documentElement.lang = lang;
  }

  /* ---------- Datos ---------- */
  let catalogPromise = null;
  // En el hosting con panel se usa el catálogo que publica el servidor; en GitHub Pages / local, el del repo
  const isStatic = /github\.io$|^localhost$|^127\.|^\[::1\]$/.test(location.hostname) || location.protocol === 'file:';
  async function fetchCatalog() {
    if (!isStatic) {
      try { const r = await fetch(CONFIG.liveData, { cache: 'no-cache' }); if (r.ok) return await r.json(); } catch { /* sin panel todavía */ }
    }
    return fetch(CONFIG.data, { cache: 'no-cache' }).then((r) => r.json());
  }
  function loadCatalog() {
    if (!catalogPromise) {
      // Vista previa de la demo del panel (sólo cuando no hay servidor PHP): usa lo guardado en este navegador
      let demo = null;
      try { if (localStorage.getItem('ug_admin_demo_preview') === '1') demo = JSON.parse(localStorage.getItem('ug_admin_demo')); } catch { /* */ }
      if (demo) addEventListener('DOMContentLoaded', previewBadge);
      catalogPromise = (demo ? Promise.resolve(demo) : fetchCatalog()).then((data) => {
        data.products = data.products.filter((p) => p.active !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        data.products.forEach((p) => { p.variants = (p.variants || []).filter((v) => v.available !== false); });
        data.byId = Object.fromEntries(data.products.map((p) => [p.id, p]));
        data.collById = Object.fromEntries(data.collections.map((c) => [c.id, c]));
        return data;
      });
    }
    return catalogPromise;
  }

  function previewBadge() {
    const b = document.createElement('div');
    b.className = 'preview-badge';
    b.innerHTML = '<span>Vista previa del panel (demo)</span><button type="button">Salir</button>';
    b.querySelector('button').onclick = () => { try { localStorage.removeItem('ug_admin_demo_preview'); } catch { /* */ } location.reload(); };
    document.body.append(b);
  }

  /* ---------- Formatos ---------- */
  const money = (n) => (DATA?.settings?.currency || 'Gs.') + ' ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const discount = (v) => (v.compare_at && v.compare_at > v.price) ? Math.round((1 - v.price / v.compare_at) * 100) : 0;
  const bestDiscount = (p) => Math.max(0, ...p.variants.map(discount));
  const productName = (p) => p.code + (p.nick ? ' ' + tterm(p.nick) : '');
  const productUrl = (p, v) => `producto.html?id=${encodeURIComponent(p.id)}${v ? '&v=' + encodeURIComponent(v.id) : ''}`;
  const imgTag = (im, alt, extra = '') => im ? `<img src="${esc(im.src)}" width="${im.w || ''}" height="${im.h || ''}" alt="${esc(alt)}" loading="lazy" decoding="async" ${extra}>` : '';

  // Colores para las muestras (esfera / metal)
  const COLORS = {
    'azul petróleo': '#1f5566', 'gris humo': '#5c5955', 'azul degradé': '#2a4fa8', 'blanco y azul': '#f5f4f0',
    negro: '#17181b', azul: '#23408e', celeste: '#a9d8ea', verde: '#1e6b47', gris: '#7a7e85', plata: '#d4d6d9', blanco: '#f5f4f0',
    champagne: '#e3cf9e', bronce: '#a5694a', 'salmón': '#eba78b', chocolate: '#5a3828', turquesa: '#36c2cc', 'nácar': '#efe8e2',
    rojo: '#b0262c', 'marrón': '#6b4430',
  };
  const METALS = { 'oro rosa': '#d4a08a', dorado: '#d6b46c', bicolor: '#d6b46c', 'pvd negro': '#26272b', acero: '#c9ccd1' };
  function swatchColors(name) {
    const n = (name || '').toLowerCase();
    const segs = n.split('·').map((s) => s.trim());
    const findIn = (s, map) => Object.keys(map).sort((a, b) => b.length - a.length).find((k) => s.includes(k));
    let c1, c2;
    if (segs[0].startsWith('bisel')) {
      const cs = segs[0].replace('bisel', '').split(' y ').map((s) => findIn(s, COLORS)).filter(Boolean);
      c1 = COLORS[cs[0]]; c2 = COLORS[cs[1]] || c1;
    } else {
      const k = findIn(segs[0], COLORS); c1 = k ? COLORS[k] : '#ccc';
      const bisel = segs.find((s) => s.startsWith('bisel'));
      const metal = segs.slice(1).map((s) => findIn(s, METALS)).find(Boolean);
      c2 = bisel ? COLORS[findIn(bisel.replace('bisel', ''), COLORS)] : (metal ? METALS[metal] : METALS.acero);
    }
    return [c1 || '#ccc', c2 || c1 || '#ccc'];
  }
  const swatchStyle = (v) => { const [a, b] = swatchColors(v.name); return `--c:${a};--c2:${b}`; };

  /* ---------- Favoritos ---------- */
  const favs = new Set(store.get('ug_favs', []));
  const favListeners = new Set();
  function toggleFav(id, silent) {
    const had = favs.has(id);
    had ? favs.delete(id) : favs.add(id);
    store.set('ug_favs', [...favs]);
    favListeners.forEach((fn) => fn());
    syncFavButtons();
    if (!silent) toast(had ? t('fav.removed') : t('fav.added'), had ? 'x' : 'heart');
    const c = $('.fav-count');
    if (c && !had) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    return !had;
  }
  function syncFavButtons() {
    $$('[data-fav]').forEach((b) => {
      const on = favs.has(b.dataset.fav);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? t('common.removeFav') : t('common.addFav'));
    });
    const c = $('.fav-count');
    if (c) { c.textContent = favs.size; c.classList.toggle('has', favs.size > 0); }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (b) { e.preventDefault(); e.stopPropagation(); toggleFav(b.dataset.fav); }
  });

  /* ---------- Recientes ---------- */
  const recent = {
    add(id) { const r = store.get('ug_recent', []).filter((x) => x !== id); r.unshift(id); store.set('ug_recent', r.slice(0, 12)); },
    list() { return store.get('ug_recent', []); },
  };

  /* ---------- WhatsApp ---------- */
  const waLink = (msg) => `https://wa.me/${DATA?.settings?.whatsapp || '595983836674'}${msg ? '?text=' + encodeURIComponent(msg) : ''}`;
  const waProduct = (p, v) => waLink(t('product.waMsg', { model: `${p.brand} ${productName(p)}`, version: tterm(v.name), price: money(v.price) }) + '\n' + new URL(productUrl(p, v), location.href).href);

  /* ---------- Toasts ---------- */
  function toast(msg, ic = 'check') {
    let wrap = $('.toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toasts'; wrap.setAttribute('aria-live', 'polite'); document.body.append(wrap); }
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = icon(ic) + `<span>${esc(msg)}</span>`;
    wrap.append(el);
    setTimeout(() => { el.classList.add('is-out'); el.addEventListener('animationend', () => el.remove(), { once: true }); }, 2600);
  }

  /* ---------- Tarjeta de producto ---------- */
  function cardHTML(p, i = 0) {
    const v0 = p.variants[0] || {};
    const alt = p.variants.find((v) => v.image?.src !== p.hero?.src && !v.image?.lowres);
    const coll = DATA.collById[p.collection];
    const off = bestDiscount(p);
    const from = p.variants.some((v) => v.price !== v0.price);
    const minV = p.variants.reduce((a, v) => (v.price < a.price ? v : a), v0);
    const shown = p.variants.slice(0, 5);
    return `
    <article class="card" style="--i:${i}" data-id="${esc(p.id)}">
      <div class="card__media">
        <div class="card__badges">${off ? `<span class="badge badge--sale">-${off}%</span>` : ''}${p.variants.length > 1 ? `<span class="badge badge--soft">${p.variants.length} ${esc(t('common.versions'))}</span>` : ''}</div>
        <div class="card__fav"><button class="heart" data-fav="${esc(p.id)}" aria-pressed="false" aria-label="${esc(t('common.addFav'))}">${icon('heart')}</button></div>
        <div class="card__img card__img--main${alt ? ' has-alt' : ''}">${imgTag(p.hero, productName(p))}</div>
        ${alt ? `<div class="card__img card__img--alt">${imgTag(alt.image, productName(p) + ' ' + alt.name)}</div>` : ''}
        <button class="card__quick" data-quick="${esc(p.id)}">${icon('eye')}<span>${esc(t('common.quickView'))}</span></button>
      </div>
      <div class="card__body">
        <div class="card__meta">${esc(tx(coll?.name))} · ${esc(tterm(p.movement.replace(/ \([^)]*\)/g, '')))}</div>
        <h3 class="card__title"><a href="${productUrl(p)}">${esc(p.code)}${p.nick ? `<small>${esc(tterm(p.nick))}</small>` : ''}</a></h3>
        <div class="card__row">
          <div class="price">${from ? `<span class="price__from">${esc(t('common.from'))}</span>` : ''}<span class="price__now">${money(minV.price)}</span>${minV.compare_at ? `<span class="price__was">${money(minV.compare_at)}</span>` : ''}</div>
          ${p.variants.length > 1 ? `<div class="swatches">${shown.map((v) => `<button class="sw" style="${swatchStyle(v)}" data-sw="${esc(v.id)}" aria-pressed="false" aria-label="${esc(tterm(v.name))}" title="${esc(tterm(v.name))}"></button>`).join('')}${p.variants.length > 5 ? `<span class="sw-more">+${p.variants.length - 5}</span>` : ''}</div>` : ''}
        </div>
      </div>
    </article>`;
  }
  // Muestras de color dentro de la tarjeta: cambian foto y precio sin salir del listado
  document.addEventListener('click', (e) => {
    const sw = e.target.closest('.card .sw');
    if (!sw) return;
    e.preventDefault();
    const card = sw.closest('.card');
    const p = DATA.byId[card.dataset.id];
    const v = p.variants.find((x) => x.id === sw.dataset.sw);
    $$('.sw', card).forEach((s) => s.setAttribute('aria-pressed', s === sw));
    const main = $('.card__img--main', card);
    main.classList.remove('has-alt');
    $('.card__img--alt', card)?.remove();
    main.style.opacity = 0;
    setTimeout(() => { main.innerHTML = imgTag(v.image, productName(p) + ' ' + v.name); main.style.opacity = ''; }, 180);
    $('.price', card).innerHTML = `<span class="price__now">${money(v.price)}</span>${v.compare_at ? `<span class="price__was">${money(v.compare_at)}</span>` : ''}`;
    $('.card__title a', card).href = productUrl(p, v);
  });
  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-quick]');
    if (q) { e.preventDefault(); quickView(q.dataset.quick); }
  });

  /* ---------- Vista rápida ---------- */
  let modal, lastFocus;
  function quickView(id, vid) {
    const p = DATA.byId[id]; if (!p) return;
    let v = p.variants.find((x) => x.id === vid) || p.variants[0];
    lastFocus = document.activeElement;
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
      document.body.append(modal);
      modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
    }
    const coll = DATA.collById[p.collection];
    const render = () => {
      modal.innerHTML = `
        <div class="modal__scrim" data-close></div>
        <div class="modal__box" aria-labelledby="qv-title">
          <button class="icon-btn modal__close" data-close aria-label="${esc(t('nav.close'))}">${icon('x')}</button>
          <div class="qv__media">${imgTag(v.image, productName(p))}</div>
          <div class="qv__body">
            <span class="eyebrow">${esc(tx(coll?.name))}</span>
            <h2 id="qv-title">${esc(p.code)} ${p.nick ? `<span class="buy__nick">${esc(tterm(p.nick))}</span>` : ''}</h2>
            <div class="buy__price"><span class="price__now">${money(v.price)}</span>${v.compare_at ? `<span class="price__was">${money(v.compare_at)}</span><span class="badge badge--sale">-${discount(v)}%</span>` : ''}</div>
            <p class="buy__desc">${esc(tx(p.desc))}</p>
            <div class="vpick">
              <div class="vpick__label"><b>${esc(t('product.selectVersion'))}</b><span class="vname">${esc(tterm(v.name))}</span></div>
              <div class="vpick__opts" role="radiogroup">${p.variants.map((x) => `<button class="vopt" role="radio" aria-checked="${x === v}" data-v="${esc(x.id)}" aria-label="${esc(tterm(x.name))}" title="${esc(tterm(x.name))}">${imgTag(x.image, '')}<span class="sw" style="${swatchStyle(x)}"></span></button>`).join('')}</div>
            </div>
            <a class="btn btn--wa btn--block" href="${waProduct(p, v)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(t('common.consult'))}</span></a>
            <a class="link-arrow" href="${productUrl(p, v)}"><span>${esc(t('common.details'))}</span>${icon('arrow-right')}</a>
          </div>
        </div>`;
      $$('.vopt', modal).forEach((b) => b.addEventListener('click', () => {
        v = p.variants.find((x) => x.id === b.dataset.v);
        const img = $('.qv__media img', modal);
        img.classList.add('is-swapping');
        setTimeout(() => {
          const sc = $('.vpick__opts', modal).scrollLeft;
          render(); $('.vpick__opts', modal).scrollLeft = sc;
          $(`.vopt[data-v="${CSS.escape(v.id)}"]`, modal)?.focus();
        }, 160);
      }));
    };
    render();
    requestAnimationFrame(() => { modal.classList.add('is-open'); lockScroll(true); $('.modal__close', modal).focus(); });
  }
  function closeModal() {
    if (!modal?.classList.contains('is-open')) return;
    modal.classList.remove('is-open'); lockScroll(false);
    lastFocus?.focus?.();
  }

  /* ---------- Bloqueo de scroll + Escape ---------- */
  let locks = 0;
  function lockScroll(on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    document.documentElement.style.overflow = locks ? 'hidden' : '';
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeModal(); closeFavs(); closeMenu();
    $('.lang.is-open')?.classList.remove('is-open');
    document.dispatchEvent(new CustomEvent('ug:escape'));
  });

  /* ---------- Header / menú / footer ---------- */
  const page = document.body.dataset.page || '';
  const LANG_LABEL = { es: 'Español', pt: 'Português', en: 'English' };
  function buildChrome() {
    const navLinks = [
      ['index.html', 'nav.home', 'home'], ['catalogo.html', 'nav.catalog', 'catalog'], ['index.html#colecciones', 'nav.collections', 'collections'], ['contacto.html', 'nav.contact', 'contact'],
    ];
    const header = document.createElement('header');
    header.className = 'header' + (document.body.dataset.header === 'dark' ? ' is-dark' : '');
    header.innerHTML = `
      <div class="container header__inner">
        <a class="brand" href="index.html" aria-label="UG Collection">
          <img src="assets/img/monogram.png" alt="" width="42" height="42">
          <span class="brand__name">UG Collection<small>Pagani Design</small></span>
        </a>
        <nav class="nav" aria-label="Principal">
          ${navLinks.map(([h, k, id]) => `<a class="nav__link" href="${h}" ${id === page ? 'aria-current="page"' : ''} data-i18n="${k}"></a>`).join('')}
        </nav>
        <div class="header__actions">
          <div class="lang">
            <button class="lang__btn" aria-haspopup="true" aria-expanded="false" aria-label="Idioma / Language">${icon('globe')}<span class="lang__cur">${lang.toUpperCase()}</span>${icon('chevron-down')}</button>
            <div class="lang__menu" role="menu">${CONFIG.langs.map((l) => `<button role="menuitemradio" aria-checked="${l === lang}" data-lang="${l}">${LANG_LABEL[l]}<small>${l.toUpperCase()}</small></button>`).join('')}</div>
          </div>
          <a class="icon-btn" href="catalogo.html#buscar" data-i18n-attr="aria-label:catalog.search">${icon('search')}</a>
          <button class="icon-btn fav-btn" data-open-favs data-i18n-attr="aria-label:nav.favorites">${icon('heart')}<span class="fav-count">0</span></button>
          <button class="icon-btn menu-toggle" data-open-menu data-i18n-attr="aria-label:nav.menu">${icon('menu')}</button>
        </div>
      </div>`;
    const skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = '#main'; skip.dataset.i18n = 'nav.skip';
    document.body.prepend(skip, header);

    const mnav = document.createElement('div');
    mnav.className = 'mnav'; mnav.setAttribute('aria-hidden', 'true');
    mnav.innerHTML = `
      <button class="icon-btn mnav__close" data-close-menu data-i18n-attr="aria-label:nav.close">${icon('x')}</button>
      <nav class="mnav__links">${navLinks.map(([h, k], i) => `<a href="${h}"><small>0${i + 1}</small><span data-i18n="${k}"></span></a>`).join('')}</nav>
      <div class="mnav__foot">
        <div class="mnav__langs" role="radiogroup">${CONFIG.langs.map((l) => `<button role="radio" aria-checked="${l === lang}" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>
        <a href="${waLink()}" target="_blank" rel="noopener">+595 983 836 674</a>
        <a href="${DATA?.settings?.instagram || '#'}" target="_blank" rel="noopener">@ug_collection27</a>
      </div>`;
    document.body.append(mnav);

    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer__big">
          <a href="catalogo.html" class="link-arrow-big"><span class="gold-text" data-i18n="common.viewAll"></span></a>
          <a class="round-btn" href="catalogo.html" style="width:72px;height:72px;color:#f3efe8" aria-hidden="true" tabindex="-1">${icon('arrow-up-right')}</a>
        </div>
        <div class="footer__grid">
          <div class="footer__brand"><img src="assets/img/logo.webp" alt="UG Collection" width="150" height="108" loading="lazy"><p data-i18n="footer.tagline"></p></div>
          <div><h4 data-i18n="footer.explore"></h4><ul>
            <li><a href="index.html" data-i18n="nav.home"></a></li><li><a href="catalogo.html" data-i18n="nav.catalog"></a></li>
            <li><a href="index.html#colecciones" data-i18n="nav.collections"></a></li><li><a href="contacto.html" data-i18n="nav.contact"></a></li></ul></div>
          <div><h4 data-i18n="nav.collections"></h4><ul class="footer__colls"></ul></div>
          <div><h4 data-i18n="footer.contact"></h4><ul>
            <li><a href="${waLink()}" target="_blank" rel="noopener">${icon('whatsapp')}+595 983 836 674</a></li>
            <li><a href="${DATA?.settings?.instagram || '#'}" target="_blank" rel="noopener">${icon('instagram')}@ug_collection27</a></li></ul></div>
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} UG Collection. <span data-i18n="footer.rights"></span></span>
          <div class="footer__langs" role="radiogroup">${CONFIG.langs.map((l) => `<button role="radio" aria-checked="${l === lang}" data-lang="${l}">${l.toUpperCase()}</button>`).join('')}</div>
        </div>
      </div>`;
    document.body.append(footer);
    if (DATA) $('.footer__colls').innerHTML = DATA.collections.map((c) => `<li><a href="catalogo.html?c=${c.id}">${esc(tx(c.name))}</a></li>`).join('');

    // Flotantes
    const wa = document.createElement('a');
    wa.className = 'wa-float'; wa.href = waLink(); wa.target = '_blank'; wa.rel = 'noopener'; wa.setAttribute('aria-label', 'WhatsApp');
    wa.innerHTML = icon('whatsapp') + '<span class="wa-float__tip">WhatsApp</span>';
    const top = document.createElement('button');
    top.className = 'to-top'; top.dataset.i18nAttr = 'aria-label:common.backTop';
    top.innerHTML = `<svg class="ring" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20"/></svg>${icon('arrow-up', 'arr')}`;
    top.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
    document.body.append(wa, top);

    // Drawer de favoritos
    const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.dataset.closeFavs = '';
    const drawer = document.createElement('aside');
    drawer.className = 'drawer'; drawer.setAttribute('aria-labelledby', 'fav-title'); drawer.setAttribute('role', 'dialog');
    drawer.innerHTML = `
      <div class="drawer__head"><h2 id="fav-title" data-i18n="fav.title"></h2><button class="icon-btn" data-close-favs data-i18n-attr="aria-label:nav.close">${icon('x')}</button></div>
      <div class="drawer__body"></div>
      <div class="drawer__foot"></div>`;
    document.body.append(scrim, drawer);
    favListeners.add(renderFavs);

    // Eventos
    const langEl = $('.lang', header);
    $('.lang__btn', header).addEventListener('click', (e) => {
      e.stopPropagation();
      const open = langEl.classList.toggle('is-open');
      e.currentTarget.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.lang')) langEl.classList.remove('is-open'); });
    document.addEventListener('click', (e) => {
      const lb = e.target.closest('[data-lang]');
      if (lb) { setLang(lb.dataset.lang); langEl.classList.remove('is-open'); closeMenu(); }
      if (e.target.closest('[data-open-favs]')) openFavs();
      if (e.target.closest('[data-close-favs]')) closeFavs();
      if (e.target.closest('[data-open-menu]')) openMenu();
      if (e.target.closest('[data-close-menu]') || e.target.closest('.mnav__links a')) closeMenu();
    });

    // Scroll: header compacto / oculto, botón arriba
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      const y = scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      header.classList.toggle('is-hidden', y > 400 && y > lastY + 4 && !$('.mnav.is-open'));
      if (y < lastY - 4) header.classList.remove('is-hidden');
      lastY = y;
      const max = document.documentElement.scrollHeight - innerHeight;
      top.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
      top.classList.toggle('is-visible', y > innerHeight * .8);
      document.documentElement.style.setProperty('--header-offset', header.classList.contains('is-hidden') ? '0px' : getComputedStyle(header).height);
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }
  function openMenu() { const m = $('.mnav'); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(true); setTimeout(() => $('.mnav__close').focus(), 50); }
  function closeMenu() { const m = $('.mnav'); if (!m?.classList.contains('is-open')) return; m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); lockScroll(false); }
  function openFavs() { renderFavs(); $('.drawer').classList.add('is-open'); $('.scrim').classList.add('is-open'); lockScroll(true); setTimeout(() => $('.drawer [data-close-favs]').focus(), 60); }
  function closeFavs() { const d = $('.drawer'); if (!d?.classList.contains('is-open')) return; d.classList.remove('is-open'); $('.scrim').classList.remove('is-open'); lockScroll(false); }
  function renderFavs() {
    const body = $('.drawer__body'), foot = $('.drawer__foot');
    if (!body || !DATA) return;
    const items = [...favs].map((id) => DATA.byId[id]).filter(Boolean);
    if (!items.length) {
      body.innerHTML = `<div class="empty">${icon('heart')}<p>${esc(t('fav.empty'))}</p><a class="btn btn--ghost btn--sm" href="catalogo.html">${esc(t('common.viewAll'))}</a></div>`;
      foot.innerHTML = ''; return;
    }
    body.innerHTML = items.map((p, i) => `
      <div class="fav-item" style="animation-delay:${i * 50}ms">
        <a class="fav-item__img" href="${productUrl(p)}">${imgTag(p.hero, productName(p))}</a>
        <div><h3><a href="${productUrl(p)}">${esc(productName(p))}</a></h3><p>${esc(t('common.from'))} ${money(p.price_from)}</p></div>
        <button class="icon-btn" data-fav="${esc(p.id)}" aria-pressed="true">${icon('x')}</button>
      </div>`).join('');
    const msg = t('fav.waMsg') + '\n' + items.map((p) => `• ${p.brand} ${productName(p)} — ${t('common.from').toLowerCase()} ${money(p.price_from)}`).join('\n');
    foot.innerHTML = `<a class="btn btn--wa btn--block" href="${waLink(msg)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(t('fav.consultAll'))}</span></a>`;
  }

  async function setLang(l) {
    if (!CONFIG.langs.includes(l) || l === lang) return;
    lang = l; store.set('ug_lang', l); termRe = null;
    D = await loadDict(l);
    applyI18n();
    $$('[data-lang]').forEach((b) => b.setAttribute('aria-checked', b.dataset.lang === l));
    const cur = $('.lang__cur'); if (cur) cur.textContent = l.toUpperCase();
    if (DATA) $('.footer__colls').innerHTML = DATA.collections.map((c) => `<li><a href="catalogo.html?c=${c.id}">${esc(tx(c.name))}</a></li>`).join('');
    syncFavButtons();
    document.dispatchEvent(new CustomEvent('ug:lang', { detail: l }));
  }

  /* ---------- Revelado al hacer scroll + contadores ---------- */
  let io;
  function observe(root = document) {
    if (!io) {
      io = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (en.target.dataset.count != null) countUp(en.target);
        io.unobserve(en.target);
      }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    }
    $$('.reveal:not(.is-in), .split-line:not(.is-in), [data-count]:not(.is-in), [data-reveal-group]:not(.is-in)', root).forEach((el) => {
      if (reduceMotion) { el.classList.add('is-in'); if (el.dataset.count != null) el.textContent = el.dataset.count; return; }
      io.observe(el);
    });
  }
  function countUp(el) {
    const end = +el.dataset.count, dur = 1400, t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Carrusel ---------- */
  function carousel(root) {
    const track = $('.carousel__track', root);
    const prev = root.querySelector('[data-prev]') || root.closest('section')?.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]') || root.closest('section')?.querySelector('[data-next]');
    const bar = $('.carousel__bar i', root);
    const step = () => { const c = track.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 20) : track.clientWidth; };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
      if (bar) {
        const ratio = track.clientWidth / track.scrollWidth;
        bar.style.width = (ratio * 100) + '%';
        bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 - ratio) / ratio) * 100 : 0}%)`;
        bar.parentElement.style.visibility = ratio >= .999 ? 'hidden' : '';
      }
    };
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update);
    new MutationObserver(update).observe(track, { childList: true });
    update();
    // arrastre con mouse
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', () => {
      if (!down) return; down = false;
      if (moved) {
        track.classList.remove('is-dragging');
        const s = step(); track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: 'smooth' });
        const block = (e) => { e.preventDefault(); e.stopPropagation(); };
        track.addEventListener('click', block, { capture: true, once: true });
        setTimeout(() => track.removeEventListener('click', block, { capture: true }), 50);
      }
    });
    return { update };
  }

  /* ---------- Transición entre páginas ---------- */
  function pageTransitions() {
    const fade = document.createElement('div'); fade.className = 'page-fade'; document.body.append(fade);
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return;
      if (reduceMotion) return;
      e.preventDefault();
      fade.classList.add('is-on');
      setTimeout(() => { location.href = url.href; }, 300);
    });
    addEventListener('pageshow', () => fade.classList.remove('is-on'));
  }

  /* ---------- Loader (sólo primera visita de la sesión) ---------- */
  function loaderDone() {
    const l = $('.loader'); if (!l) return;
    let seen = false; try { seen = sessionStorage.getItem('ug_intro'); sessionStorage.setItem('ug_intro', 1); } catch { /* */ }
    if (seen || reduceMotion) { l.remove(); return; }
    setTimeout(() => { l.classList.add('is-done'); setTimeout(() => l.remove(), 1200); }, 1300);
  }

  /* ---------- Arranque ---------- */
  let DATA = null;
  const ready = (async () => {
    const [dict, data] = await Promise.all([loadDict(lang), loadCatalog().catch((e) => { console.error('Catálogo no disponible', e); return null; })]);
    D = dict; DATA = data;
    buildChrome();
    applyI18n();
    syncFavButtons();
    pageTransitions();
    loaderDone();
    observe();
    return DATA;
  })();

  window.UG = {
    ready, $, $$, t, tx, tterm, esc, icon, money, discount, bestDiscount, productName, productUrl, imgTag, cardHTML, swatchStyle,
    waLink, waProduct, toast, quickView, observe, carousel, applyI18n, syncFavButtons, recent, store, reduceMotion, lockScroll,
    get lang() { return lang; }, get data() { return DATA; }, favs, toggleFav,
  };
})();
