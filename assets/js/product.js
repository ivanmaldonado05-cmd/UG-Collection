/* UG Collection — ficha de producto */
(async () => {
  'use strict';
  const { $, $$, t, tx, tterm, esc, icon, money, discount, productName, productUrl, imgTag, cardHTML, swatchStyle, waProduct, observe, carousel, toast, reduceMotion, inStock } = UG;
  const DATA = await UG.ready;
  const root = $('[data-pdp]');
  const params = new URLSearchParams(location.search);
  const p = DATA?.byId[params.get('id')];

  if (!p) {
    root.innerHTML = `<div class="empty" style="padding:120px 0">${icon('watch')}<h1 class="h-2">${esc(t('product.notFound'))}</h1><a class="btn" href="catalogo.html">${esc(t('common.viewAll'))}</a></div>`;
    return;
  }

  // Galería: la foto principal (si no es la de una versión) + una foto por versión
  const gallery = [];
  if (!p.variants.some((v) => v.image?.src === p.hero?.src)) gallery.push({ image: p.hero, vid: null });
  p.variants.forEach((v) => gallery.push({ image: v.image, vid: v.id }));

  let v = p.variants.find((x) => x.id === params.get('v')) || p.variants.find((x) => x.image?.src === p.hero?.src) || p.variants[0];
  let gi = Math.max(0, params.get('v') ? gallery.findIndex((g) => g.vid === v.id) : 0);

  UG.recent.add(p.id);

  function render() {
    const coll = DATA.collById[p.collection];
    const specs = [
      ['cog', 'product.movement', tterm(p.movement)],
      ['clock', 'product.type', t('types.' + p.type)],
      ['watch', 'product.case', p.case_mm ? p.case_mm + ' mm' : ''],
      ['gem', 'product.crystal', tterm(p.crystal)],
      ['droplet', 'product.water', p.water_m + ' m'],
      ['strap', 'product.strap', p.straps.map((s) => t('straps.' + s)).join(' / ')],
      ['sparkles', 'product.features', tx(p.features), true],
    ];
    root.innerHTML = `
      <nav class="crumbs pdp__crumbs" aria-label="Breadcrumb">
        <a href="index.html">${esc(t('nav.home'))}</a>${icon('chevron-right')}<a href="catalogo.html">${esc(t('product.breadcrumb'))}</a>${icon('chevron-right')}<a href="catalogo.html?c=${esc(p.collection)}">${esc(tx(coll?.name))}</a>${icon('chevron-right')}<span>${esc(p.code)}</span>
      </nav>
      <div class="pdp__grid">
        <div class="gallery">
          <div class="stage" data-stage tabindex="0" aria-roledescription="carousel" aria-label="${esc(productName(p))}">
            <span class="stage__hint">${icon('zoom')}${esc(t('product.zoomHint'))}</span>
            <div class="stage__img" data-stage-img></div>
            <span class="stage__count tabular" data-stage-count></span>
            <div class="stage__nav">
              <button class="round-btn" data-g-prev aria-label="${esc(t('common.prev'))}">${icon('arrow-left')}</button>
              <button class="round-btn" data-g-next aria-label="${esc(t('common.next'))}">${icon('arrow-right')}</button>
            </div>
          </div>
        </div>

        <div class="buy">
          <h1 class="buy__title"><small>${esc(p.brand)} · ${esc(tx(coll?.name))}</small>${esc(p.code)}${p.nick ? ` <span class="buy__nick">${esc(tterm(p.nick))}</span>` : ''}</h1>
          <div>
            <div class="buy__price" data-price></div>
            <div data-promo style="margin-top:8px"></div>
            <div class="avail" data-avail aria-live="polite"></div>
          </div>
          <p class="buy__desc">${esc(tx(p.desc))}</p>

          <div class="vpick">
            <div class="vpick__label"><b>${esc(t('product.selectVersion'))}</b><span data-vname></span></div>
            <div class="vpick__opts" role="radiogroup" aria-label="${esc(t('product.selectVersion'))}">
              ${p.variants.map((x) => `<button class="vopt${inStock(x) ? ' has-stock' : ''}" role="radio" aria-checked="false" data-v="${esc(x.id)}" title="${esc(tterm(x.name))}" aria-label="${esc(tterm(x.name))}">${imgTag(x.image, '')}<span class="sw" style="${swatchStyle(x)}"></span></button>`).join('')}
            </div>
          </div>

          <div class="buy__ctas" data-main-cta>
            <a class="btn btn--wa" data-wa target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(t('common.consult'))}</span></a>
            <button class="heart" data-fav="${esc(p.id)}" aria-pressed="false">${icon('heart')}</button>
            <button class="square" data-share aria-label="${esc(t('common.share'))}">${icon('share')}</button>
          </div>

          <div class="perks"><ul>${(t('product.perks') || []).map((x, i) => `<li>${icon(['user', 'clock', 'ruler'][i] || 'check')}${esc(x)}</li>`).join('')}</ul></div>

          <div>
            <h2 class="h-3" style="margin-bottom:16px">${esc(t('product.specs'))}</h2>
            <dl class="specs">${specs.filter((x) => x[2]).map(([ic, k, val, wide]) => `<div class="spec${wide ? ' spec--wide' : ''}">${icon(ic)}<dt>${esc(t(k))}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
          </div>

          <div>
            <details class="acc" open><summary>${esc(t('product.howTitle'))}${icon('plus')}</summary>
              <div class="acc__body"><ol class="steps">${(t('product.how') || []).map((s) => `<li><span>${esc(s)}</span></li>`).join('')}</ol></div>
            </details>
          </div>
        </div>
      </div>`;
    bind();
    selectVariant(v, false, true);
    showImage(gi, 0);
    UG.syncFavButtons();
  }

  /* ---------- Galería ---------- */
  let animating = false;
  function showImage(i, dir) {
    const n = gallery.length;
    i = (i + n) % n;
    const box = $('[data-stage-img]');
    const g = gallery[i];
    const swap = () => {
      box.classList.toggle('is-lowres', !!g.image?.lowres);
      box.innerHTML = imgTag(g.image, `${p.brand} ${productName(p)}`, 'loading="eager"');
      $('[data-stage-count]').textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    };
    gi = i;
    if (!dir || reduceMotion) { swap(); return; }
    if (animating) { swap(); return; }
    animating = true;
    box.style.setProperty('--dir', dir);
    box.classList.add('is-out');
    setTimeout(() => {
      swap();
      box.classList.remove('is-out'); box.classList.add('is-in');
      void box.offsetWidth; box.classList.remove('is-in');
      animating = false;
    }, 260);
  }
  function step(d) {
    const i = (gi + d + gallery.length) % gallery.length;
    showImage(i, d);
    if (gallery[i].vid) selectVariant(p.variants.find((x) => x.id === gallery[i].vid), true, true);
  }

  /* ---------- Versión ---------- */
  function selectVariant(nv, updateURL = true, fromGallery = false) {
    v = nv;
    $$('.vopt').forEach((b) => b.setAttribute('aria-checked', b.dataset.v === v.id));
    $('[data-vname]').textContent = tterm(v.name);
    const off = discount(v);
    $('[data-price]').innerHTML = `<span class="price__now">${money(v.price)}</span>${v.compare_at ? `<span class="price__was">${money(v.compare_at)}</span>` : ''}${off ? `<span class="badge badge--sale">-${off}%</span>` : ''}`;
    $('[data-promo]').innerHTML = v.compare_at ? `<span class="buy__promo"><i></i>${esc(tx(DATA.settings.promo))}</span>` : '';
    const av = $('[data-avail]');
    av.className = 'avail' + (inStock(v) ? ' is-stock' : '');
    av.innerHTML = inStock(v) ? `${icon('check')}<span><b>${esc(t('stock.badge'))}</b> · ${esc(t('stock.filterHint'))}</span>` : `${icon('clock')}<span>${esc(t('stock.onOrder'))}</span>`;
    $('[data-wa]').href = waProduct(p, v);
    if (!fromGallery) { const i = gallery.findIndex((g) => g.vid === v.id); if (i >= 0 && i !== gi) showImage(i, i > gi ? 1 : -1); }
    if (updateURL) history.replaceState(null, '', productUrl(p, v));
    renderSticky();
  }

  function bind() {
    $$('.vopt').forEach((b) => b.addEventListener('click', () => selectVariant(p.variants.find((x) => x.id === b.dataset.v))));
    $('[data-g-prev]').addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
    $('[data-g-next]').addEventListener('click', (e) => { e.stopPropagation(); step(1); });
    const stage = $('[data-stage]');
    stage.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
    // zoom (sólo con mouse y fotos de buena resolución)
    if (matchMedia('(hover: hover)').matches) {
      stage.addEventListener('mousemove', (e) => {
        if (gallery[gi].image?.lowres || e.target.closest('.stage__nav')) { stage.classList.remove('is-zoom'); return; }
        const r = stage.getBoundingClientRect();
        stage.style.setProperty('--zx', ((e.clientX - r.left) / r.width) * 100 + '%');
        stage.style.setProperty('--zy', ((e.clientY - r.top) / r.height) * 100 + '%');
        $('.stage__img img', stage)?.style.setProperty('transform-origin', `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        stage.classList.add('is-zoom');
      });
      stage.addEventListener('mouseleave', () => stage.classList.remove('is-zoom'));
    }
    // swipe
    let sx = null, sy = null;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    });
    // compartir
    $('[data-share]').addEventListener('click', async () => {
      const url = location.href;
      if (navigator.share) { try { await navigator.share({ title: `${p.brand} ${productName(p)}`, url }); } catch { /* cancelado */ } return; }
      try { await navigator.clipboard.writeText(url); toast(t('common.copied'), 'check'); } catch { prompt('', url); }
    });
  }

  /* ---------- CTA fija ---------- */
  const sticky = $('[data-sticky]');
  function renderSticky() {
    sticky.innerHTML = `${imgTag(v.image, '')}<div class="sticky-cta__info"><b>${esc(productName(p))}</b><span>${money(v.price)}${inStock(v) ? ` · <em class="in-stock">${esc(t('stock.badge'))}</em>` : ''}</span></div><a class="btn btn--wa" href="${waProduct(p, v)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${esc(t('common.consultShort'))}</span></a>`;
  }
  function watchSticky() {
    const target = $('[data-main-cta]');
    new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.classList.toggle('is-visible', show);
      sticky.setAttribute('aria-hidden', !show);
      document.body.classList.toggle('has-sticky-cta', show);
    }).observe(target);
  }

  /* ---------- Relacionados y recientes ---------- */
  function renderRelated() {
    const same = DATA.products.filter((x) => x.id !== p.id && x.collection === p.collection);
    const others = DATA.products.filter((x) => x.id !== p.id && x.collection !== p.collection && x.featured);
    const list = [...same, ...others].slice(0, 10);
    $('[data-related-wrap]').hidden = !list.length;
    $('[data-related]').innerHTML = list.map((x, i) => cardHTML(x, i)).join('');
    const rec = UG.recent.list().filter((id) => id !== p.id).map((id) => DATA.byId[id]).filter(Boolean);
    $('[data-recent-wrap]').hidden = !rec.length;
    $('[data-recent]').innerHTML = rec.map((x, i) => cardHTML(x, i)).join('');
    UG.syncFavButtons();
  }

  /* ---------- SEO ---------- */
  function seo() {
    document.title = `${p.brand} ${productName(p)} — UG Collection`;
    $('meta[name="description"]').setAttribute('content', tx(p.desc));
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: `${p.brand} ${productName(p)}`, brand: { '@type': 'Brand', name: p.brand },
      sku: p.code, image: new URL(p.hero.src, location.href).href, description: tx(p.desc),
      offers: { '@type': 'AggregateOffer', priceCurrency: 'PYG', lowPrice: Math.min(...p.variants.map((x) => x.price)), highPrice: Math.max(...p.variants.map((x) => x.price)), offerCount: p.variants.length, availability: 'https://schema.org/InStock' },
    });
    document.head.append(ld);
  }

  render();
  renderRelated();
  carousel($('[data-carousel-related]'));
  carousel($('[data-carousel-recent]'));
  watchSticky();
  seo();
  observe();

  document.addEventListener('ug:lang', () => { render(); renderRelated(); });
})();
