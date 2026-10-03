/* UG Collection — catálogo con filtros, búsqueda, orden y URL compartible */
(async () => {
  'use strict';
  const { $, $$, t, tx, tterm, esc, icon, money, cardHTML, observe, store, lockScroll, inStock, pInStock } = UG;
  const DATA = await UG.ready;
  if (!DATA) return;
  const P = DATA.products;

  const allPrices = P.flatMap((p) => p.variants.map((v) => v.price));
  const PMIN = Math.floor(Math.min(...allPrices) / 50000) * 50000;
  const PMAX = Math.ceil(Math.max(...allPrices) / 50000) * 50000;
  const uniq = (arr) => [...new Set(arr)];
  const GROUPS = {
    c: { label: 'catalog.collection', values: () => DATA.collections.map((c) => [c.id, tx(c.name)]), test: (p, set) => set.has(p.collection) },
    t: { label: 'catalog.type', values: () => uniq(P.map((p) => p.type)).map((x) => [x, t('types.' + x)]), test: (p, set) => set.has(p.type) },
    s: { label: 'catalog.strap', values: () => uniq(P.flatMap((p) => p.straps)).map((x) => [x, t('straps.' + x)]), test: (p, set) => p.straps.some((x) => set.has(x)) },
    z: { label: 'catalog.case', values: () => uniq(P.map((p) => p.case_mm)).sort((a, b) => parseFloat(a) - parseFloat(b)).map((x) => [x, x + ' mm']), test: (p, set) => set.has(p.case_mm) },
  };

  /* ---------- Estado ---------- */
  const st = { c: new Set(), t: new Set(), s: new Set(), z: new Set(), min: PMIN, max: PMAX, o: false, k: false, q: '', sort: 'featured' };
  function readURL() {
    const u = new URLSearchParams(location.search);
    Object.keys(GROUPS).forEach((k) => { st[k] = new Set((u.get(k) || '').split(',').filter(Boolean)); });
    st.min = +u.get('min') || PMIN; st.max = +u.get('max') || PMAX;
    st.o = u.get('o') === '1'; st.k = u.get('stock') === '1'; st.q = u.get('q') || ''; st.sort = u.get('sort') || 'featured';
  }
  function writeURL() {
    const u = new URLSearchParams();
    Object.keys(GROUPS).forEach((k) => { if (st[k].size) u.set(k, [...st[k]].join(',')); });
    if (st.min > PMIN) u.set('min', st.min);
    if (st.max < PMAX) u.set('max', st.max);
    if (st.o) u.set('o', '1');
    if (st.k) u.set('stock', '1');
    if (st.q) u.set('q', st.q);
    if (st.sort !== 'featured') u.set('sort', st.sort);
    const qs = u.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  /* ---------- Búsqueda ---------- */
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function variantText(v) { return norm(v.name + ' ' + tterm(v.name)); }
  function productText(p) {
    const c = DATA.collById[p.collection];
    return norm([p.code, p.code.replace('-', ''), p.nick, tterm(p.nick), p.brand, p.movement, tx(c?.name), tx(p.features), t('types.' + p.type), ...p.straps.map((s) => t('straps.' + s))].join(' '));
  }
  function matchQuery(p) {
    if (!st.q) return { ok: true };
    const terms = norm(st.q).split(/\s+/).filter(Boolean);
    const base = productText(p);
    // cada término debe aparecer en el producto o en alguna versión; se recuerda la versión que coincide (para mostrar su foto)
    let variant = null;
    for (const term of terms) {
      if (base.includes(term)) continue;
      const v = p.variants.find((x) => variantText(x).includes(term) && (!variant || variant === x));
      if (!v) return { ok: false };
      variant = v;
    }
    return { ok: true, variant };
  }

  /* ---------- Filtrado ---------- */
  function filtered(except) {
    return P.map((p) => {
      for (const k of Object.keys(GROUPS)) if (k !== except && st[k].size && !GROUPS[k].test(p, st[k])) return null;
      const vs = p.variants.filter((v) => v.price >= st.min && v.price <= st.max && (!st.o || (v.compare_at && v.compare_at > v.price)) && (!st.k || inStock(v)));
      if (!vs.length) return null;
      const m = matchQuery(p);
      if (!m.ok) return null;
      return { p, vs, variant: m.variant && vs.includes(m.variant) ? m.variant : null };
    }).filter(Boolean);
  }
  function sorted(list) {
    const min = (x) => Math.min(...x.vs.map((v) => v.price));
    const by = {
      featured: (a, b) => (pInStock(b.p) - pInStock(a.p)) || (b.p.featured - a.p.featured) || (a.p.order - b.p.order),
      'price-asc': (a, b) => min(a) - min(b),
      'price-desc': (a, b) => min(b) - min(a),
      name: (a, b) => a.p.code.localeCompare(b.p.code, 'es', { numeric: true }),
    };
    return list.sort(by[st.sort] || by.featured);
  }

  /* ---------- Render ---------- */
  const results = $('[data-results]');
  function render() {
    const list = sorted(filtered());
    const n = list.length;
    $('[data-count-label]').innerHTML = `<b>${n}</b> ${esc(t(n === 1 ? 'catalog.result' : 'catalog.results'))}`;
    $('[data-apply-count]').textContent = `(${n})`;
    if (!n) {
      results.innerHTML = st.k && !P.some(pInStock)
        ? `<div class="empty cat-empty">${icon('watch')}<p>${esc(t('stock.empty'))}</p><a class="btn btn--wa btn--sm" href="${UG.waLink()}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(t('common.consult'))}</span></a></div>`
        : `<div class="empty cat-empty">${icon('search')}<p>${esc(t('catalog.empty'))}</p><button class="btn btn--ghost btn--sm" data-clear-all>${esc(t('catalog.emptyCta'))}</button></div>`;
    } else {
      results.innerHTML = list.map(({ p, vs, variant }, i) => {
        // la tarjeta muestra la versión que coincide con la búsqueda/filtro
        const lead = variant || (vs.length < p.variants.length ? vs[0] : null);
        const view = lead ? { ...p, hero: lead.image, variants: [lead, ...vs.filter((v) => v !== lead)] } : { ...p, variants: vs };
        return cardHTML(view, Math.min(i, 12));
      }).join('');
    }
    UG.syncFavButtons();
    renderActive();
    renderFilterCounts();
    writeURL();
  }

  function renderCollChips() {
    const chips = [['', t('common.all')], ...DATA.collections.map((c) => [c.id, tx(c.name)])];
    const nStock = P.filter(pInStock).length;
    $('[data-coll-chips]').innerHTML = `<button class="chip chip--stock" aria-pressed="${st.k}" data-stock-chip><i></i>${esc(t('stock.filter'))}<small>${esc(t('stock.filterHint'))}${nStock ? ` · ${nStock}` : ''}</small></button><span class="chips__sep" aria-hidden="true"></span>` + chips.map(([id, name]) => {
      const on = id ? (st.c.size === 1 && st.c.has(id)) : !st.c.size;
      return `<button class="chip" aria-pressed="${on}" data-coll="${esc(id)}">${esc(name)}</button>`;
    }).join('');
  }
  $('[data-coll-chips]').addEventListener('click', (e) => {
    if (e.target.closest('[data-stock-chip]')) { st.k = !st.k; syncFilterInputs(); render(); return; }
    const b = e.target.closest('[data-coll]'); if (!b) return;
    st.c = new Set(b.dataset.coll ? [b.dataset.coll] : []);
    syncFilterInputs(); renderCollChips(); render();
  });

  function buildFilters() {
    const collapsed = store.get('ug_fcollapsed', []);
    const group = (k, inner) => `
      <div class="fgroup${collapsed.includes(k) ? ' is-collapsed' : ''}" data-g="${k}">
        <button class="fgroup__head" aria-expanded="${!collapsed.includes(k)}"><span>${esc(t(GROUPS[k]?.label || (k === 'p' ? 'catalog.price' : 'catalog.offers')))}</span>${icon('chevron-down')}</button>
        <div class="fgroup__body"><div class="fgroup__inner">${inner}</div></div>
      </div>`;
    let html = '';
    for (const k of Object.keys(GROUPS)) {
      html += group(k, GROUPS[k].values().map(([val, label]) => `
        <label class="check"><input type="checkbox" data-k="${k}" value="${esc(val)}"${st[k].has(val) ? ' checked' : ''}><span class="check__box">${icon('check')}</span><span>${esc(label)}</span><span class="check__count" data-cnt="${k}:${esc(val)}"></span></label>`).join(''));
    }
    html += group('p', `
      <div class="range" data-range>
        <div class="range__track"></div><div class="range__fill"></div>
        <input type="range" min="${PMIN}" max="${PMAX}" step="50000" value="${st.min}" data-min aria-label="Min">
        <input type="range" min="${PMIN}" max="${PMAX}" step="50000" value="${st.max}" data-max aria-label="Max">
      </div>
      <div class="range__vals"><span data-vmin></span><span data-vmax></span></div>
      <label class="switch" style="margin-top:8px"><span>${esc(t('catalog.offers'))}</span><input type="checkbox" data-offers${st.o ? ' checked' : ''}><span class="switch__ui"></span></label>`);
    html = `<div class="fgroup fgroup--stock"><label class="switch"><span><b>${esc(t('stock.filter'))}</b><small>${esc(t('stock.filterHint'))}</small></span><input type="checkbox" data-stock-sw${st.k ? ' checked' : ''}><span class="switch__ui"></span></label></div>` + html;
    $('[data-fwrap]').innerHTML = html;
    updateRange();
  }
  function updateRange() {
    const r = $('[data-range]'); if (!r) return;
    const pct = (v) => ((v - PMIN) / (PMAX - PMIN)) * 100;
    $('.range__fill', r).style.left = pct(st.min) + '%';
    $('.range__fill', r).style.right = (100 - pct(st.max)) + '%';
    $('[data-vmin]').textContent = money(st.min);
    $('[data-vmax]').textContent = money(st.max);
  }
  function syncFilterInputs() {
    $$('[data-k]').forEach((i) => { i.checked = st[i.dataset.k].has(i.value); });
    const mi = $('[data-min]'), ma = $('[data-max]');
    if (mi) { mi.value = st.min; ma.value = st.max; }
    const of = $('[data-offers]'); if (of) of.checked = st.o;
    const ks = $('[data-stock-sw]'); if (ks) ks.checked = st.k;
    $('#q').value = st.q; $('.search').classList.toggle('has-value', !!st.q);
    $('#sort').value = st.sort;
    updateRange();
  }
  function renderFilterCounts() {
    for (const k of Object.keys(GROUPS)) {
      const base = filtered(k);
      GROUPS[k].values().forEach(([val]) => {
        const el = $(`[data-cnt="${k}:${CSS.escape(val)}"]`);
        if (el) el.textContent = base.filter(({ p }) => GROUPS[k].test(p, new Set([val]))).length;
      });
    }
    const n = Object.keys(GROUPS).reduce((a, k) => a + st[k].size, 0) + (st.min > PMIN || st.max < PMAX ? 1 : 0) + (st.o ? 1 : 0);
    $('[data-filter-count]').textContent = n ? `(${n})` : '';
  }
  function renderActive() {
    const chips = [];
    for (const k of Object.keys(GROUPS)) {
      const labels = Object.fromEntries(GROUPS[k].values());
      st[k].forEach((v) => chips.push([`${k}:${v}`, labels[v] || v]));
    }
    if (st.min > PMIN || st.max < PMAX) chips.push(['p', `${money(st.min)} – ${money(st.max)}`]);
    if (st.o) chips.push(['o', t('catalog.offers')]);
    if (st.k) chips.push(['k', t('stock.ready')]);
    if (st.q) chips.push(['q', `“${st.q}”`]);
    $('[data-active]').innerHTML = chips.length ? chips.map(([id, label]) => `<button class="chip" data-rm="${esc(id)}">${esc(label)}${icon('x', 'x')}</button>`).join('') + `<button class="chip" data-clear-all style="border-color:transparent;text-decoration:underline">${esc(t('catalog.clear'))}</button>` : '';
    renderCollChips();
  }

  /* ---------- Eventos ---------- */
  const fwrap = $('[data-fwrap]');
  fwrap.addEventListener('change', (e) => {
    const i = e.target;
    if (i.dataset.k) { i.checked ? st[i.dataset.k].add(i.value) : st[i.dataset.k].delete(i.value); render(); }
    if (i.hasAttribute('data-offers')) { st.o = i.checked; render(); }
    if (i.hasAttribute('data-stock-sw')) { st.k = i.checked; render(); }
  });
  let rangeT;
  fwrap.addEventListener('input', (e) => {
    const i = e.target;
    if (!i.matches('[data-min],[data-max]')) return;
    const mi = $('[data-min]'), ma = $('[data-max]');
    let a = +mi.value, b = +ma.value;
    if (a > b - 50000) { if (i === mi) a = b - 50000; else b = a + 50000; }
    mi.value = a; ma.value = b; st.min = a; st.max = b;
    updateRange();
    clearTimeout(rangeT); rangeT = setTimeout(render, 120);
  });
  fwrap.addEventListener('click', (e) => {
    const h = e.target.closest('.fgroup__head'); if (!h) return;
    const g = h.parentElement; const c = g.classList.toggle('is-collapsed');
    h.setAttribute('aria-expanded', !c);
    store.set('ug_fcollapsed', $$('.fgroup.is-collapsed').map((x) => x.dataset.g));
  });
  document.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const id = rm.dataset.rm;
      if (id === 'p') { st.min = PMIN; st.max = PMAX; } else if (id === 'o') st.o = false; else if (id === 'k') st.k = false; else if (id === 'q') st.q = '';
      else { const [k, ...v] = id.split(':'); st[k].delete(v.join(':')); }
      syncFilterInputs(); render();
    }
    if (e.target.closest('[data-clear-all]')) {
      Object.keys(GROUPS).forEach((k) => st[k].clear());
      st.min = PMIN; st.max = PMAX; st.o = false; st.k = false; st.q = '';
      syncFilterInputs(); render();
    }
  });
  let qT;
  $('#q').addEventListener('input', (e) => {
    st.q = e.target.value.trim();
    $('.search').classList.toggle('has-value', !!st.q);
    clearTimeout(qT); qT = setTimeout(render, 160);
  });
  $('[data-clear-q]').addEventListener('click', () => { st.q = ''; $('#q').value = ''; $('.search').classList.remove('has-value'); $('#q').focus(); render(); });
  $('#sort').addEventListener('change', (e) => { st.sort = e.target.value; render(); });

  // Columnas (escritorio)
  const setCols = (n) => {
    results.style.setProperty('--cols', n);
    $$('[data-cols]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cols === String(n)));
    store.set('ug_cols', n);
  };
  $$('[data-cols]').forEach((b) => b.addEventListener('click', () => setCols(+b.dataset.cols)));
  setCols(store.get('ug_cols', 4));

  // Panel de filtros en móvil
  const panel = $('[data-filters]'), scrim = $('[data-filters-scrim]');
  const openF = () => { panel.classList.add('is-open'); scrim.classList.add('is-open'); lockScroll(true); };
  const closeF = () => { if (!panel.classList.contains('is-open')) return; panel.classList.remove('is-open'); scrim.classList.remove('is-open'); lockScroll(false); };
  $('[data-open-filters]').addEventListener('click', openF);
  scrim.addEventListener('click', closeF);
  $$('[data-close-filters]').forEach((b) => b.addEventListener('click', closeF));
  document.addEventListener('ug:escape', closeF);

  // Toolbar: se acomoda debajo del header cuando éste se oculta
  const toolbar = $('.toolbar');
  addEventListener('scroll', () => { toolbar.style.top = $('.header')?.classList.contains('is-hidden') ? '0px' : ''; }, { passive: true });

  /* ---------- Arranque ---------- */
  readURL();
  buildFilters();
  syncFilterInputs();
  render();
  observe();
  if (location.hash === '#buscar') setTimeout(() => $('#q').focus({ preventScroll: false }), 400);

  document.addEventListener('ug:lang', () => { buildFilters(); syncFilterInputs(); render(); });
})();
