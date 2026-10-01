/* =========================================================
   UG Collection — panel de administración
   Modo servidor: habla con ../server/api.php (PHP + MySQL en Hostinger).
   Modo demo: si no hay PHP (GitHub Pages / local), guarda en este navegador.
   ========================================================= */
(() => {
  'use strict';
  const API_URL = '../server/api.php';
  const DEMO_KEY = 'ug_admin_demo';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const money = (n) => 'Gs. ' + String(Math.round(+n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const digits = (s) => +(String(s ?? '').replace(/\D+/g, '')) || 0;
  const fmtNum = (n) => (n ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
  const slug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
  const imgSrc = (src) => (!src ? '' : /^(data:|blob:|https?:)/.test(src) ? src : '../' + src);

  /* ---------- Íconos ---------- */
  const P = {
    watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9.5V12l1.5 1.5"/><path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05"/><path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05"/>',
    grid2: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>',
    cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M2.5 12h3M18.5 12h3M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a2 2 0 0 1 2-2h11"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    up: '<path d="m18 15-6-6-6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'eye-off': '<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.3"/><path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    alert: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  };
  const icon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
  const paintIcons = (root = document) => $$('[data-ico]', root).forEach((el) => { if (!el.firstChild) el.innerHTML = icon(el.dataset.ico); });

  /* ---------- Toasts y diálogos ---------- */
  function toast(msg, type = 'ok') {
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' is-error' : '');
    el.innerHTML = icon(type === 'error' ? 'alert' : 'check') + `<span>${esc(msg)}</span>`;
    $('[data-toasts]').append(el);
    setTimeout(() => { el.classList.add('is-out'); el.addEventListener('animationend', () => el.remove(), { once: true }); }, type === 'error' ? 5000 : 2600);
  }
  const dlg = $('[data-dialog]');
  function dialog({ title, text = '', body = '', ok = 'Aceptar', cancel = 'Cancelar', danger = false, onOk }) {
    return new Promise((resolve) => {
      const box = $('[data-dlg-box]');
      box.innerHTML = `<h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}${body}
        <div class="dlg__actions">${cancel ? `<button class="btn btn--ghost" data-dlg-cancel>${esc(cancel)}</button>` : ''}<button class="btn ${danger ? 'btn--danger' : ''}" data-dlg-ok>${esc(ok)}</button></div>`;
      paintIcons(box);
      const close = (v) => { dlg.classList.remove('is-open'); document.removeEventListener('keydown', onKey); resolve(v); };
      const onKey = (e) => { if (e.key === 'Escape') close(false); };
      document.addEventListener('keydown', onKey);
      $$('[data-dlg-cancel]', dlg).forEach((b) => { b.onclick = () => close(false); });
      $('[data-dlg-ok]', box).onclick = async () => {
        if (onOk) { const btn = $('[data-dlg-ok]', box); btn.disabled = true; const r = await onOk(box).catch((e) => { toast(e.message, 'error'); return false; }); btn.disabled = false; if (r === false) return; }
        close(true);
      };
      dlg.classList.add('is-open');
      setTimeout(() => ($('input,select,textarea', box) || $('[data-dlg-ok]', box)).focus(), 60);
    });
  }

  /* ---------- Backend: servidor ---------- */
  let csrf = '';
  async function call(action, body, method = 'POST') {
    const res = await fetch(`${API_URL}?action=${encodeURIComponent(action)}`, {
      method, credentials: 'same-origin',
      headers: method === 'POST' ? { 'Content-Type': 'application/json', 'X-CSRF': csrf } : {},
      body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
    });
    let json; try { json = await res.json(); } catch { throw new Error('El servidor no respondió correctamente.'); }
    if (res.status === 401 && action !== 'login') { showLogin(); throw new Error('La sesión expiró. Ingresá de nuevo.'); }
    if (!json.ok) { const err = new Error(json.error || 'Error'); err.server = true; throw err; }
    if (json.csrf) csrf = json.csrf;
    return json;
  }
  const ServerAPI = {
    mode: 'server',
    async session() { const r = await call('session', null, 'GET'); return r; },
    login: (user, pass) => call('login', { user, pass }),
    logout: () => call('logout'),
    async catalog() { return (await call('catalog', null, 'GET')).data; },
    async saveProduct(product, original_id) { return (await call('product.save', { product, original_id })).data; },
    async deleteProduct(id) { return (await call('product.delete', { id })).data; },
    async patchProduct(id, field, value) { return (await call('product.patch', { id, field, value })).data; },
    async reorder(kind, ids) { return (await call(kind + '.reorder', { ids })).data; },
    async saveCollection(collection, original_id) { return (await call('collection.save', { collection, original_id })).data; },
    async deleteCollection(id) { return (await call('collection.delete', { id })).data; },
    async saveSettings(settings) { return (await call('settings.save', { settings })).data; },
    upload(blob, name, onProgress) {
      return new Promise((resolve, reject) => {
        const fd = new FormData(); fd.append('file', blob, name);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}?action=upload`);
        xhr.setRequestHeader('X-CSRF', csrf);
        xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
        xhr.onload = () => { try { const j = JSON.parse(xhr.responseText); j.ok ? resolve(j.image) : reject(new Error(j.error)); } catch { reject(new Error('Error al subir la foto.')); } };
        xhr.onerror = () => reject(new Error('Sin conexión.'));
        xhr.send(fd);
      });
    },
  };

  /* ---------- Backend: demo (localStorage) ---------- */
  const demoStore = {
    get() { try { return JSON.parse(localStorage.getItem(DEMO_KEY)); } catch { return null; } },
    set(d, preview = true) {
      d.updated = new Date().toISOString();
      d.products.forEach((p, i) => { p.order = i; p.price_from = Math.min(...p.variants.map((v) => v.price)); });
      try { localStorage.setItem(DEMO_KEY, JSON.stringify(d)); if (preview) localStorage.setItem(DEMO_KEY + '_preview', '1'); }
      catch { throw new Error('El navegador se quedó sin espacio para la demo (fotos muy pesadas). Usá «Restablecer demo».'); }
      return clone(d);
    },
  };
  function validateProduct(p, data) {
    if (!p.code?.trim()) throw new Error('El código del modelo es obligatorio.');
    if (!data.collections.some((c) => c.id === p.collection)) throw new Error('Elegí una colección válida.');
    if (!p.variants.length) throw new Error('Agregá al menos una versión con precio.');
    p.variants.forEach((v, i) => { if (!(v.price > 0)) throw new Error(`La versión ${i + 1} necesita un precio.`); if (!(v.compare_at > v.price)) v.compare_at = null; });
    if (!p.hero?.src) p.hero = p.variants.find((v) => v.image?.src)?.image || null;
    if (!p.hero) throw new Error('Subí al menos una foto.');
  }
  const DemoAPI = {
    mode: 'demo',
    async session() { return { auth: sessionStorage.getItem('ug_demo_auth') === '1' }; },
    async login() { sessionStorage.setItem('ug_demo_auth', '1'); return { ok: true }; },
    async logout() { sessionStorage.removeItem('ug_demo_auth'); },
    async catalog() {
      let d = demoStore.get();
      if (!d) { d = await fetch('../data/catalog.json', { cache: 'no-cache' }).then((r) => r.json()); demoStore.set(d, false); }
      return clone(d);
    },
    async saveProduct(p, original) {
      const d = demoStore.get();
      p = clone(p); p.id = slug(p.id || p.code);
      validateProduct(p, d);
      const clash = d.products.find((x) => x.id === p.id && x.id !== original);
      if (clash) throw new Error('Ya existe un producto con ese código.');
      const i = d.products.findIndex((x) => x.id === (original || p.id));
      if (i >= 0 && original) d.products[i] = p; else d.products.push(p);
      return demoStore.set(d);
    },
    async deleteProduct(id) { const d = demoStore.get(); d.products = d.products.filter((p) => p.id !== id); return demoStore.set(d); },
    async patchProduct(id, field, value) { const d = demoStore.get(); const p = d.products.find((x) => x.id === id); if (p) p[field] = value; return demoStore.set(d); },
    async reorder(kind, ids) {
      const d = demoStore.get(); const key = kind === 'product' ? 'products' : 'collections';
      d[key].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      return demoStore.set(d);
    },
    async saveCollection(c, original) {
      const d = demoStore.get();
      if (!c.name?.es) throw new Error('La colección necesita un nombre.');
      if (original) { c.id = original; d.collections[d.collections.findIndex((x) => x.id === original)] = c; }
      else { c.id = slug(c.name.es); if (d.collections.some((x) => x.id === c.id)) throw new Error('Ya existe una colección con ese nombre.'); d.collections.push(c); }
      return demoStore.set(d);
    },
    async deleteCollection(id) {
      const d = demoStore.get();
      if (d.products.some((p) => p.collection === id)) throw new Error('La colección tiene productos. Movelos a otra colección antes de borrarla.');
      d.collections = d.collections.filter((c) => c.id !== id); return demoStore.set(d);
    },
    async saveSettings(s) {
      const d = demoStore.get();
      s.whatsapp = String(s.whatsapp || '').replace(/\D+/g, '');
      if (s.whatsapp.length < 8) throw new Error('Número de WhatsApp inválido (con código de país, ej. 595983836674).');
      d.settings = { ...d.settings, ...s }; return demoStore.set(d);
    },
    async upload(blob) {
      // en la demo las fotos quedan dentro del navegador como data-URL
      const src = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
      const im = await loadImg(src);
      return { src, w: im.naturalWidth, h: im.naturalHeight };
    },
  };

  let api = ServerAPI;
  let DATA = null;

  /* ---------- Procesamiento de fotos (en el navegador, antes de subir) ---------- */
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('No se pudo leer la imagen.')); i.src = src; });
  async function processImage(file) {
    if (!/^image\//.test(file.type)) throw new Error('Elegí un archivo de imagen (JPG, PNG o WebP).');
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImg(url);
      // 1) recorta bordes transparentes (fotos PNG sin fondo)
      const s0 = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
      const w0 = Math.round(img.naturalWidth * s0), h0 = Math.round(img.naturalHeight * s0);
      const c0 = document.createElement('canvas'); c0.width = w0; c0.height = h0;
      const x0 = c0.getContext('2d', { willReadFrequently: true }); x0.drawImage(img, 0, 0, w0, h0);
      let box = { x: 0, y: 0, w: w0, h: h0 };
      const px = x0.getImageData(0, 0, w0, h0).data;
      if (px[3] < 250 || px[(w0 * h0 - 1) * 4 + 3] < 250) {
        let minX = w0, minY = h0, maxX = -1, maxY = -1;
        for (let y = 0; y < h0; y++) for (let x = 0; x < w0; x++) if (px[(y * w0 + x) * 4 + 3] > 12) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
        if (maxX > minX && maxY > minY) box = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
      }
      // 2) redimensiona (máx. 1200 px) y comprime a WebP
      const s1 = Math.min(1, 1200 / Math.max(box.w, box.h));
      const w1 = Math.round(box.w * s1), h1 = Math.round(box.h * s1);
      const c1 = document.createElement('canvas'); c1.width = w1; c1.height = h1;
      const x1 = c1.getContext('2d'); x1.imageSmoothingQuality = 'high';
      x1.drawImage(c0, box.x, box.y, box.w, box.h, 0, 0, w1, h1);
      let blob = await new Promise((r) => c1.toBlob(r, 'image/webp', 0.86));
      if (!blob || blob.type !== 'image/webp') blob = await new Promise((r) => c1.toBlob(r, 'image/png'));
      return { blob, w: w1, h: h1, ext: blob.type === 'image/webp' ? 'webp' : 'png' };
    } finally { URL.revokeObjectURL(url); }
  }
  // Abre el selector de archivos y devuelve la imagen subida
  const fileInput = $('[data-file]');
  function pickAndUpload(dropEl, nameHint) {
    return new Promise((resolve) => {
      fileInput.value = '';
      fileInput.onchange = async () => { const f = fileInput.files[0]; resolve(f ? await uploadFile(f, dropEl, nameHint) : null); };
      fileInput.click();
    });
  }
  async function uploadFile(file, dropEl, nameHint) {
    const bar = dropEl && (dropEl.querySelector('.drop__bar') || dropEl.appendChild(Object.assign(document.createElement('i'), { className: 'drop__bar' })));
    dropEl?.classList.add('is-busy');
    try {
      const p = await processImage(file);
      if (bar) bar.style.width = '30%';
      const image = await api.upload(p.blob, `${slug(nameHint || 'foto')}.${p.ext}`, (k) => { if (bar) bar.style.width = (30 + k * 70) + '%'; });
      if (p.h < 330) image.lowres = true;
      return image;
    } catch (e) { toast(e.message, 'error'); return null; }
    finally { dropEl?.classList.remove('is-busy'); if (bar) bar.style.width = '0'; }
  }
  function enableDrop(el, onFile) {
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('is-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('is-over'));
    el.addEventListener('drop', (e) => { e.preventDefault(); el.classList.remove('is-over'); const f = e.dataTransfer.files[0]; if (f) onFile(f); });
  }

  /* ---------- Ordenar arrastrando ---------- */
  function sortable(list, onEnd) {
    let item = null, startY = 0, order0 = '';
    const ids = () => $$(':scope > [data-id]', list).map((x) => x.dataset.id);
    list.addEventListener('pointerdown', (e) => {
      const h = e.target.closest('[data-grip]'); if (!h || !list.contains(h)) return;
      e.preventDefault();
      item = h.closest('[data-id]'); startY = e.clientY; order0 = ids().join();
      item.classList.add('is-dragging'); h.setPointerCapture(e.pointerId);
    });
    list.addEventListener('pointermove', (e) => {
      if (!item) return;
      const gap = 10;
      let dy = e.clientY - startY;
      item.style.transform = `translateY(${dy}px)`;
      const r = item.getBoundingClientRect(), mid = r.top + r.height / 2;
      const next = item.nextElementSibling, prev = item.previousElementSibling;
      if (next && mid > next.getBoundingClientRect().top + next.offsetHeight / 2) { list.insertBefore(next, item); startY += next.offsetHeight + gap; }
      else if (prev && mid < prev.getBoundingClientRect().top + prev.offsetHeight / 2) { list.insertBefore(item, prev); startY -= prev.offsetHeight + gap; }
      item.style.transform = `translateY(${e.clientY - startY}px)`;
      if (e.clientY < 90) scrollBy(0, -12); else if (e.clientY > innerHeight - 90) scrollBy(0, 12);
    });
    const end = () => {
      if (!item) return;
      item.style.transform = ''; item.classList.remove('is-dragging'); item = null;
      if (ids().join() !== order0) onEnd(ids());
    };
    list.addEventListener('pointerup', end);
    list.addEventListener('pointercancel', end);
    list.addEventListener('keydown', (e) => {
      const h = e.target.closest('[data-grip]'); if (!h || !['ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const it = h.closest('[data-id]');
      if (e.key === 'ArrowUp' && it.previousElementSibling) list.insertBefore(it, it.previousElementSibling);
      else if (e.key === 'ArrowDown' && it.nextElementSibling) list.insertBefore(it.nextElementSibling, it);
      else return;
      h.focus(); onEnd(ids());
    });
  }

  /* ---------- Arranque / login ---------- */
  const views = { login: $('[data-view="login"]'), app: $('[data-view="app"]') };
  function showLogin() { views.app.hidden = true; views.login.hidden = false; $('[data-editor]').hidden = true; setTimeout(() => $('#lg-pass').focus(), 50); }
  async function showApp() {
    views.login.hidden = true; views.app.hidden = false;
    const badge = $('[data-mode-badge]');
    badge.className = 'mode-badge' + (api.mode === 'demo' ? ' is-demo' : '');
    badge.innerHTML = `<i></i>${api.mode === 'demo' ? 'Demo' : 'Conectado'}`;
    badge.title = api.mode === 'demo' ? 'Sin servidor: los cambios se guardan sólo en este navegador' : 'Los cambios se publican al guardar';
    $('[data-demo-reset]').hidden = api.mode !== 'demo';
    DATA = await api.catalog();
    renderAll();
  }
  async function boot() {
    paintIcons();
    $('[data-toggle-pass]').innerHTML = icon('eye');
    $('[data-logout]').innerHTML = icon('logout');
    $('[data-ed-close]').innerHTML = icon('back');
    $('[data-prod-q-clear]').innerHTML = icon('x');
    try {
      const s = await ServerAPI.session();
      csrf = s.csrf; api = ServerAPI;
      s.auth ? await showApp() : showLogin();
    } catch (e) {
      if (e.server) { api = ServerAPI; showLogin(); $('[data-login-err]').textContent = e.message; $('[data-boot]').remove(); return; }
      api = DemoAPI;
      $('[data-demo-note]').hidden = false;
      (await DemoAPI.session()).auth ? await showApp() : showLogin();
    }
    const b = $('[data-boot]'); b.classList.add('is-out'); setTimeout(() => b.remove(), 500);
  }
  $('[data-toggle-pass]').addEventListener('click', (e) => {
    const i = $('#lg-pass'); const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    e.currentTarget.innerHTML = icon(show ? 'eye-off' : 'eye');
    e.currentTarget.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
  $('[data-login]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('[data-login-err]'), btn = $('[data-login-btn]');
    const user = $('#lg-user').value.trim(), pass = $('#lg-pass').value;
    if (!pass && api.mode !== 'demo') { err.textContent = 'Escribí tu contraseña.'; $('#lg-pass').focus(); return; }
    btn.disabled = true; btn.textContent = 'Ingresando…'; err.textContent = '';
    try { await api.login(user, pass); $('#lg-pass').value = ''; await showApp(); }
    catch (ex) { err.textContent = ex.message; $('#lg-pass').select(); }
    finally { btn.disabled = false; btn.textContent = 'Ingresar'; }
  });
  $('[data-logout]').addEventListener('click', async () => { try { await api.logout(); } catch { /* */ } showLogin(); });

  /* ---------- Pestañas ---------- */
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-tab]').forEach((x) => x.setAttribute('aria-selected', x === b));
    $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== b.dataset.tab; });
    scrollTo({ top: 0 });
  }));

  function renderAll() { renderProducts(); renderCollections(); renderSettings(); }
  const collName = (id) => DATA.collections.find((c) => c.id === id)?.name?.es || '—';
  const fromPrice = (p) => Math.min(...p.variants.map((v) => +v.price || 0));
  async function run(promise, okMsg) {
    try { DATA = await promise; renderAll(); if (okMsg) toast(okMsg); return true; }
    catch (e) { toast(e.message, 'error'); return false; }
  }

  /* ---------- Productos ---------- */
  const plist = $('[data-plist]');
  function renderProducts() {
    const q = $('[data-prod-q]').value.trim().toLowerCase(), c = $('[data-prod-coll]').value;
    const sel = $('[data-prod-coll]');
    sel.innerHTML = `<option value="">Todas las colecciones</option>` + DATA.collections.map((x) => `<option value="${esc(x.id)}">${esc(x.name.es)}</option>`).join('');
    sel.value = c;
    const filtering = !!(q || c);
    const list = DATA.products.filter((p) => (!c || p.collection === c) && (!q || [p.code, p.nick, p.movement, ...p.variants.map((v) => v.name)].join(' ').toLowerCase().includes(q)));
    $('[data-prod-summary]').textContent = `${DATA.products.length} productos · ${DATA.products.reduce((a, p) => a + p.variants.length, 0)} versiones · ${DATA.products.filter((p) => p.active === false).length} ocultos`;
    $('[data-reorder-hint]').hidden = filtering;
    plist.innerHTML = list.length ? list.map((p, i) => `
      <li class="prow${p.active === false ? ' is-hidden-p' : ''}" data-id="${esc(p.id)}" style="--i:${Math.min(i, 20)}">
        ${filtering ? '<span></span>' : `<button class="prow__grip" data-grip aria-label="Mover ${esc(p.code)} (flechas arriba/abajo)">${icon('grip')}</button>`}
        <span class="prow__img">${p.hero ? `<img src="${esc(imgSrc(p.hero.src))}" alt="" loading="lazy">` : icon('image')}</span>
        <div class="prow__main">
          <b>${esc(p.code)}${p.nick ? `<small>${esc(p.nick)}</small>` : ''}${p.featured ? '<span class="tag tag--gold">Destacado</span>' : ''}${p.active === false ? '<span class="tag">Oculto</span>' : ''}</b>
          <span>${esc(collName(p.collection))} · ${p.variants.length} ${p.variants.length === 1 ? 'versión' : 'versiones'} · desde ${money(fromPrice(p))}</span>
        </div>
        <div class="prow__toggles">
          <label class="switch" title="Visible en el sitio"><span>Visible</span><input type="checkbox" data-patch="active" ${p.active !== false ? 'checked' : ''}><span class="switch__ui"></span></label>
          <label class="switch" title="Destacado"><span>Destacado</span><input type="checkbox" data-patch="featured" ${p.featured ? 'checked' : ''}><span class="switch__ui"></span></label>
        </div>
        <div class="prow__actions">
          <button class="icon-btn" data-act="edit" aria-label="Editar ${esc(p.code)}" title="Editar">${icon('edit')}</button>
          <button class="icon-btn" data-act="dup" aria-label="Duplicar ${esc(p.code)}" title="Duplicar">${icon('copy')}</button>
          <button class="icon-btn danger" data-act="del" aria-label="Eliminar ${esc(p.code)}" title="Eliminar">${icon('trash')}</button>
        </div>
      </li>`).join('') : `<li class="empty-list">No hay productos que coincidan.</li>`;
  }
  $('[data-prod-q]').addEventListener('input', renderProducts);
  $('[data-prod-q-clear]').addEventListener('click', () => { $('[data-prod-q]').value = ''; renderProducts(); });
  $('[data-prod-q]').addEventListener('input', (e) => e.target.parentElement.classList.toggle('has-value', !!e.target.value));
  $('[data-prod-coll]').addEventListener('change', renderProducts);
  plist.addEventListener('change', async (e) => {
    const i = e.target.closest('[data-patch]'); if (!i) return;
    const id = i.closest('[data-id]').dataset.id;
    await run(api.patchProduct(id, i.dataset.patch, i.checked), i.dataset.patch === 'active' ? (i.checked ? 'Ahora es visible' : 'Producto oculto') : 'Guardado');
  });
  plist.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const p = DATA.products.find((x) => x.id === b.closest('[data-id]').dataset.id);
    if (b.dataset.act === 'edit') openEditor(p);
    if (b.dataset.act === 'dup') {
      const copy = clone(p); copy.id = ''; copy.code = p.code + '-COPIA'; copy.active = false; copy.featured = false;
      copy.variants.forEach((v) => { v.id = ''; });
      openEditor(copy, true);
    }
    if (b.dataset.act === 'del') {
      await dialog({ title: `¿Eliminar ${p.code}?`, text: 'Se borra del sitio con todas sus versiones. Si sólo querés esconderlo, usá el interruptor «Visible».', ok: 'Eliminar', danger: true,
        onOk: () => run(api.deleteProduct(p.id), 'Producto eliminado') });
    }
  });
  sortable(plist, (ids) => run(api.reorder('product', ids), 'Orden actualizado'));
  $('[data-new-product]').addEventListener('click', () => openEditor({
    id: '', code: '', nick: '', brand: 'Pagani Design', collection: DATA.collections[0]?.id || '', type: 'automatico', movement: '', case_mm: '40', water_m: 100,
    crystal: 'Zafiro AR', straps: ['acero'], features: {}, desc: {}, hero: null, featured: false, active: true,
    variants: [{ id: '', name: '', image: null, price: 0, compare_at: null, available: true }],
  }, true));

  /* ---------- Editor de producto ---------- */
  const ed = $('[data-editor]'), form = $('[data-ed-form]');
  let draft = null, originalId = '', dirty = false, edLang = 'es';
  const STRAPS = [['acero', 'Acero'], ['caucho', 'Caucho'], ['nylon', 'Nylon'], ['cuero', 'Cuero']];
  const setDirty = (v = true) => { dirty = v; $('[data-ed-save]').classList.toggle('is-dirty', v); };

  function openEditor(p, isNew = false) {
    draft = clone(p); originalId = isNew ? '' : p.id; edLang = 'es';
    $('[data-ed-title]').textContent = isNew ? (p.code ? `Duplicar · ${p.code}` : 'Nuevo producto') : `Editar · ${p.code}`;
    $('#ed-coll').innerHTML = DATA.collections.map((c) => `<option value="${esc(c.id)}">${esc(c.name.es)}</option>`).join('');
    ['code', 'nick', 'brand', 'collection', 'type', 'movement', 'case_mm', 'water_m', 'crystal'].forEach((k) => { form.elements[k].value = draft[k] ?? ''; });
    form.elements.active.checked = draft.active !== false;
    form.elements.featured.checked = !!draft.featured;
    $('[data-ed-straps]').innerHTML = STRAPS.map(([k, l]) => `<button type="button" class="chip" aria-pressed="${draft.straps.includes(k)}" data-strap="${k}">${l}</button>`).join('');
    $$('.field', form).forEach((f) => { f.classList.remove('has-error'); const er = $('.field__err', f); if (er) er.textContent = ''; });
    renderTexts(); renderHero(); renderVariants(); renderPreview();
    setDirty(false);
    ed.hidden = false; ed.classList.remove('is-closing');
    document.documentElement.style.overflow = 'hidden';
    $('.editor__body').scrollTop = 0;
    setTimeout(() => form.elements.code.focus(), 80);
  }
  async function closeEditor(force) {
    if (!force && dirty && !(await dialog({ title: '¿Salir sin guardar?', text: 'Hay cambios que todavía no guardaste.', ok: 'Salir sin guardar', danger: true }))) return;
    ed.classList.add('is-closing');
    setTimeout(() => { ed.hidden = true; document.documentElement.style.overflow = ''; }, 240);
  }
  $('[data-ed-close]').addEventListener('click', () => closeEditor());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !ed.hidden && !dlg.classList.contains('is-open')) closeEditor(); });
  addEventListener('beforeunload', (e) => { if (!ed.hidden && dirty) { e.preventDefault(); e.returnValue = ''; } });

  form.addEventListener('input', (e) => {
    const t = e.target;
    if (['code', 'nick', 'brand', 'movement', 'case_mm', 'crystal'].includes(t.name)) draft[t.name] = t.value;
    if (t.name === 'water_m') { t.value = t.value.replace(/\D+/g, ''); draft.water_m = +t.value || 0; }
    if (t.dataset.text) { draft[t.dataset.text] = draft[t.dataset.text] || {}; draft[t.dataset.text][edLang] = t.value; markLangs(); }
    setDirty(); renderPreview();
  });
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (['collection', 'type'].includes(t.name)) draft[t.name] = t.value;
    if (t.name === 'active') draft.active = t.checked;
    if (t.name === 'featured') draft.featured = t.checked;
    setDirty(); renderPreview();
  });
  $('[data-ed-straps]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-strap]'); if (!b) return;
    const k = b.dataset.strap, on = !draft.straps.includes(k);
    draft.straps = on ? [...draft.straps, k] : draft.straps.filter((x) => x !== k);
    b.setAttribute('aria-pressed', on); setDirty();
  });

  // Textos por idioma
  function renderTexts() {
    $$('[data-l]').forEach((b) => b.setAttribute('aria-selected', b.dataset.l === edLang));
    $('[data-ed-texts]').innerHTML = `
      <div class="field"><label for="ed-feat">Características (una línea)</label><input id="ed-feat" data-text="features" value="${esc(draft.features?.[edLang] || '')}" placeholder="${esc(edLang === 'es' ? 'Bisel giratorio · Correa Oyster, Jubilee o caucho' : draft.features?.es || '')}"></div>
      <div class="field"><label for="ed-desc">Descripción</label><textarea id="ed-desc" data-text="desc" rows="4" placeholder="${esc(edLang === 'es' ? 'Contá en 2 o 3 frases qué tiene de especial este reloj.' : draft.desc?.es || '')}">${esc(draft.desc?.[edLang] || '')}</textarea></div>`;
    markLangs();
  }
  function markLangs() { $$('[data-l]').forEach((b) => b.classList.toggle('has-text', !!(draft.desc?.[b.dataset.l] || draft.features?.[b.dataset.l]))); }
  $('[data-ed-langs]').addEventListener('click', (e) => { const b = e.target.closest('[data-l]'); if (!b) return; edLang = b.dataset.l; renderTexts(); });

  // Foto principal
  function dropHTML(image, label) {
    return image?.src
      ? `<img src="${esc(imgSrc(image.src))}" alt="">${image.lowres ? '<span class="drop__warn">Baja resolución</span>' : ''}<button type="button" class="drop__clear" data-clear aria-label="Quitar foto">${icon('x')}</button>`
      : `<span class="drop__empty">${icon('image')}<span>${esc(label)}</span></span>`;
  }
  function renderHero() {
    const el = $('[data-ed-hero]');
    el.innerHTML = dropHTML(draft.hero, 'Tocá o arrastrá una foto');
    el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', 'Cambiar foto principal');
  }
  const heroDrop = $('[data-ed-hero]');
  const setHero = (img) => { if (img) { draft.hero = img; setDirty(); renderHero(); renderPreview(); } };
  heroDrop.addEventListener('click', async (e) => {
    if (e.target.closest('[data-clear]')) { draft.hero = null; setDirty(); renderHero(); renderPreview(); return; }
    setHero(await pickAndUpload(heroDrop, draft.code));
  });
  heroDrop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); heroDrop.click(); } });
  enableDrop(heroDrop, async (f) => setHero(await uploadFile(f, heroDrop, draft.code)));

  // Versiones
  const vlist = $('[data-ed-variants]');
  function renderVariants() {
    $('[data-ed-vcount]').textContent = `${draft.variants.length} ${draft.variants.length === 1 ? 'versión' : 'versiones'}`;
    vlist.innerHTML = draft.variants.map((v, i) => `
      <li class="vrow" data-vi="${i}">
        <span class="vrow__n">${i + 1}</span>
        <div class="drop" data-vdrop role="button" tabindex="0" aria-label="Foto de la versión ${i + 1}">${dropHTML(v.image, 'Foto')}</div>
        <div class="vrow__fields">
          <div class="field wide"><label>Nombre (color · correa)</label><input data-vf="name" value="${esc(v.name)}" placeholder="Ej: Negro · Oro rosa · Caucho"></div>
          <div class="field money"><label>Precio *</label><input data-vf="price" inputmode="numeric" value="${fmtNum(v.price)}" placeholder="950.000"></div>
          <div class="field money"><label>Precio anterior</label><input data-vf="compare_at" inputmode="numeric" value="${fmtNum(v.compare_at)}" placeholder="opcional"></div>
        </div>
        <div class="vrow__foot">
          <label class="switch"><span>Disponible</span><input type="checkbox" data-vf="available" ${v.available !== false ? 'checked' : ''}><span class="switch__ui"></span></label>
          <div class="vrow__btns">
            <button type="button" class="icon-btn" data-vact="up" aria-label="Subir" ${i === 0 ? 'disabled' : ''}>${icon('up')}</button>
            <button type="button" class="icon-btn" data-vact="down" aria-label="Bajar" ${i === draft.variants.length - 1 ? 'disabled' : ''}>${icon('down')}</button>
            <button type="button" class="icon-btn" data-vact="dup" aria-label="Duplicar versión">${icon('copy')}</button>
            <button type="button" class="icon-btn danger" data-vact="del" aria-label="Eliminar versión" ${draft.variants.length === 1 ? 'disabled' : ''}>${icon('trash')}</button>
          </div>
        </div>
      </li>`).join('');
    $$('[data-vdrop]', vlist).forEach((d) => enableDrop(d, async (f) => {
      const i = +d.closest('[data-vi]').dataset.vi;
      const img = await uploadFile(f, d, draft.code + '-' + (draft.variants[i].name || i + 1));
      if (img) { draft.variants[i].image = img; setDirty(); renderVariants(); renderPreview(); }
    }));
  }
  vlist.addEventListener('input', (e) => {
    const f = e.target.dataset.vf; if (!f || f === 'available') return;
    const v = draft.variants[+e.target.closest('[data-vi]').dataset.vi];
    if (f === 'name') v.name = e.target.value;
    else {
      const n = digits(e.target.value); v[f] = n || (f === 'compare_at' ? null : 0);
      const pos = e.target.value.length - e.target.selectionStart;
      e.target.value = fmtNum(n);
      const p = Math.max(0, e.target.value.length - pos); e.target.setSelectionRange(p, p);
    }
    setDirty(); renderPreview();
  });
  vlist.addEventListener('change', (e) => {
    if (e.target.dataset.vf !== 'available') return;
    draft.variants[+e.target.closest('[data-vi]').dataset.vi].available = e.target.checked; setDirty();
  });
  vlist.addEventListener('click', async (e) => {
    const row = e.target.closest('[data-vi]'); if (!row) return;
    const i = +row.dataset.vi, v = draft.variants[i];
    const drop = e.target.closest('[data-vdrop]');
    if (drop) {
      if (e.target.closest('[data-clear]')) { v.image = null; setDirty(); renderVariants(); renderPreview(); return; }
      const img = await pickAndUpload(drop, draft.code + '-' + (v.name || i + 1));
      if (img) { v.image = img; setDirty(); renderVariants(); renderPreview(); }
      return;
    }
    const act = e.target.closest('[data-vact]')?.dataset.vact; if (!act) return;
    if (act === 'up' && i > 0) [draft.variants[i - 1], draft.variants[i]] = [draft.variants[i], draft.variants[i - 1]];
    if (act === 'down' && i < draft.variants.length - 1) [draft.variants[i + 1], draft.variants[i]] = [draft.variants[i], draft.variants[i + 1]];
    if (act === 'dup') draft.variants.splice(i + 1, 0, { ...clone(v), id: '' });
    if (act === 'del') {
      if (!(await dialog({ title: '¿Eliminar esta versión?', text: v.name || `Versión ${i + 1}`, ok: 'Eliminar', danger: true }))) return;
      draft.variants.splice(i, 1);
    }
    setDirty(); renderVariants(); renderPreview();
  });
  vlist.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-vdrop]')) { e.preventDefault(); e.target.click(); } });
  $('[data-ed-add-variant]').addEventListener('click', () => {
    const last = draft.variants[draft.variants.length - 1];
    draft.variants.push({ id: '', name: '', image: null, price: last?.price || 0, compare_at: last?.compare_at || null, available: true });
    setDirty(); renderVariants(); renderPreview();
    const rows = $$('.vrow', vlist); rows[rows.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => $('[data-vf="name"]', rows[rows.length - 1]).focus(), 300);
  });

  function renderPreview() {
    const img = draft.hero || draft.variants.find((v) => v.image)?.image;
    const prices = draft.variants.map((v) => v.price).filter(Boolean);
    const min = prices.length ? Math.min(...prices) : 0;
    const mv = draft.variants.find((v) => v.price === min);
    $('[data-ed-preview]').innerHTML = `
      <div class="card" style="pointer-events:none">
        <div class="card__media" style="box-shadow:inset 0 0 0 1px var(--line)">${img ? `<div class="card__img"><img src="${esc(imgSrc(img.src))}" alt=""></div>` : ''}</div>
        <div class="card__body">
          <div class="card__meta">${esc(collName(draft.collection))} · ${esc(draft.movement || '')}</div>
          <h3 class="card__title">${esc(draft.code || 'PD-0000')}${draft.nick ? `<small>${esc(draft.nick)}</small>` : ''}</h3>
          <div class="price">${new Set(prices).size > 1 ? '<span class="price__from">Desde</span>' : ''}<span class="price__now">${money(min)}</span>${mv?.compare_at ? `<span class="price__was">${money(mv.compare_at)}</span>` : ''}</div>
        </div>
      </div>`;
  }

  async function saveEditor() {
    // validación con mensajes junto al campo
    const errs = [];
    const fieldErr = (name, msg) => { const f = form.elements[name].closest('.field'); f.classList.toggle('has-error', !!msg); $('.field__err', f).textContent = msg || ''; if (msg) errs.push(form.elements[name]); };
    fieldErr('code', draft.code.trim() ? '' : 'Escribí el código del modelo.');
    fieldErr('collection', draft.collection ? '' : 'Elegí una colección.');
    const badV = draft.variants.findIndex((v) => !(v.price > 0));
    if (errs.length) { errs[0].focus(); errs[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    if (badV >= 0) { const inp = $(`[data-vi="${badV}"] [data-vf="price"]`); inp.focus(); inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); toast(`La versión ${badV + 1} necesita un precio.`, 'error'); return; }
    if (!draft.hero && !draft.variants.some((v) => v.image)) { toast('Subí al menos una foto.', 'error'); return; }
    draft.variants.forEach((v) => { if (v.compare_at && v.compare_at <= v.price) v.compare_at = null; });
    if (!originalId) draft.id = '';
    const btn = $('[data-ed-save]'); btn.disabled = true; btn.textContent = 'Guardando…';
    const ok = await run(api.saveProduct(draft, originalId), originalId ? 'Cambios guardados' : 'Producto creado');
    btn.disabled = false; btn.textContent = 'Guardar';
    if (ok) { setDirty(false); closeEditor(true); }
  }
  $('[data-ed-save]').addEventListener('click', saveEditor);
  form.addEventListener('submit', (e) => { e.preventDefault(); saveEditor(); });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's' && !ed.hidden) { e.preventDefault(); saveEditor(); } });

  /* ---------- Colecciones ---------- */
  const clist = $('[data-clist]');
  function renderCollections() {
    clist.innerHTML = DATA.collections.map((c) => {
      const n = DATA.products.filter((p) => p.collection === c.id).length;
      const cover = DATA.products.find((p) => p.id === c.cover) || DATA.products.find((p) => p.collection === c.id);
      return `
      <li class="prow" data-id="${esc(c.id)}">
        <button class="prow__grip" data-grip aria-label="Mover ${esc(c.name.es)}">${icon('grip')}</button>
        <span class="prow__img">${cover?.hero ? `<img src="${esc(imgSrc(cover.hero.src))}" alt="">` : icon('image')}</span>
        <div class="prow__main"><b>${esc(c.name.es)}</b><span>${esc(c.tagline?.es || '')} · ${n} ${n === 1 ? 'producto' : 'productos'}</span></div>
        <span></span>
        <div class="prow__actions">
          <button class="icon-btn" data-cact="edit" aria-label="Editar" title="Editar">${icon('edit')}</button>
          <button class="icon-btn danger" data-cact="del" aria-label="Eliminar" title="Eliminar">${icon('trash')}</button>
        </div>
      </li>`;
    }).join('') || '<li class="empty-list">Todavía no hay colecciones.</li>';
  }
  sortable(clist, (ids) => run(api.reorder('collection', ids), 'Orden actualizado'));
  function collForm(c) {
    const opts = DATA.products.filter((p) => !c.id || p.collection === c.id);
    return `<div class="form-grid">
      <fieldset class="field i18n-field"><legend>Nombre *</legend>
        ${['es', 'pt', 'en'].map((l) => `<div class="i18n-row"><span>${l.toUpperCase()}</span><input name="name_${l}" value="${esc(c.name?.[l] || '')}" ${l === 'es' ? 'required' : 'placeholder="opcional"'}></div>`).join('')}</fieldset>
      <fieldset class="field i18n-field"><legend>Frase corta</legend>
        ${['es', 'pt', 'en'].map((l) => `<div class="i18n-row"><span>${l.toUpperCase()}</span><input name="tag_${l}" value="${esc(c.tagline?.[l] || '')}" ${l !== 'es' ? 'placeholder="opcional"' : ''}></div>`).join('')}</fieldset>
      <div class="field"><label>Reloj de portada</label><div class="select"><select name="cover"><option value="">Automático (el primero)</option>${opts.map((p) => `<option value="${esc(p.id)}" ${p.id === c.cover ? 'selected' : ''}>${esc(p.code)} ${esc(p.nick || '')}</option>`).join('')}</select><span data-ico="chevron-down"></span></div></div>
    </div>`;
  }
  function readColl(box) {
    const v = (n) => $(`[name="${n}"]`, box).value.trim();
    const pick = (pre) => Object.fromEntries(['es', 'pt', 'en'].map((l) => [l, v(pre + l)]).filter(([, x]) => x));
    return { name: pick('name_'), tagline: pick('tag_'), cover: v('cover') };
  }
  $('[data-new-coll]').addEventListener('click', () => dialog({
    title: 'Nueva colección', body: collForm({}), ok: 'Crear',
    onOk: async (box) => { const c = readColl(box); if (!c.name.es) throw new Error('Escribí el nombre en español.'); return run(api.saveCollection(c, ''), 'Colección creada'); },
  }));
  clist.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cact]'); if (!b) return;
    const c = DATA.collections.find((x) => x.id === b.closest('[data-id]').dataset.id);
    if (b.dataset.cact === 'edit') dialog({
      title: 'Editar colección', body: collForm(c), ok: 'Guardar',
      onOk: async (box) => { const n = readColl(box); if (!n.name.es) throw new Error('Escribí el nombre en español.'); return run(api.saveCollection({ ...n, id: c.id }, c.id), 'Colección guardada'); },
    });
    if (b.dataset.cact === 'del') dialog({ title: `¿Eliminar «${c.name.es}»?`, text: 'Sólo se puede eliminar si no tiene productos.', ok: 'Eliminar', danger: true, onOk: () => run(api.deleteCollection(c.id), 'Colección eliminada') });
  });

  /* ---------- Ajustes ---------- */
  const sForm = $('[data-settings]');
  let heroSel = [];
  function renderSettings() {
    const s = DATA.settings || {};
    sForm.elements.whatsapp.value = s.whatsapp || '';
    sForm.elements.instagram.value = s.instagram || '';
    ['es', 'pt', 'en'].forEach((l) => { sForm.elements['promo_' + l].value = s.promo?.[l] || ''; });
    heroSel = (s.hero || []).filter((id) => DATA.products.some((p) => p.id === id));
    renderHeroPick();
  }
  function renderHeroPick() {
    const ordered = [...heroSel.map((id) => DATA.products.find((p) => p.id === id)), ...DATA.products.filter((p) => !heroSel.includes(p.id))];
    $('[data-hero-pick]').innerHTML = ordered.map((p) => {
      const k = heroSel.indexOf(p.id), on = k >= 0;
      return `<li class="${on ? 'is-on' : ''}" data-hid="${esc(p.id)}">
        <label class="check"><input type="checkbox" ${on ? 'checked' : ''} ${!on && heroSel.length >= 6 ? 'disabled' : ''}><span class="check__box">${icon('check')}</span><span class="num">${on ? k + 1 : ''}</span></label>
        ${p.hero ? `<img src="${esc(imgSrc(p.hero.src))}" alt="">` : '<span></span>'}
        <span>${esc(p.code)} ${esc(p.nick || '')}</span>
        <span class="ord">${on ? `<button type="button" class="icon-btn" data-hmove="-1" aria-label="Subir" ${k === 0 ? 'disabled' : ''}>${icon('up')}</button><button type="button" class="icon-btn" data-hmove="1" aria-label="Bajar" ${k === heroSel.length - 1 ? 'disabled' : ''}>${icon('down')}</button>` : ''}</span>
      </li>`;
    }).join('');
  }
  $('[data-hero-pick]').addEventListener('change', (e) => {
    const id = e.target.closest('[data-hid]').dataset.hid;
    heroSel = e.target.checked ? [...heroSel, id] : heroSel.filter((x) => x !== id);
    renderHeroPick();
  });
  $('[data-hero-pick]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-hmove]'); if (!b) return;
    const id = b.closest('[data-hid]').dataset.hid, i = heroSel.indexOf(id), j = i + +b.dataset.hmove;
    [heroSel[i], heroSel[j]] = [heroSel[j], heroSel[i]]; renderHeroPick();
  });
  sForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = sForm.elements;
    const waField = f.whatsapp.closest('.field');
    const wa = f.whatsapp.value.replace(/\D+/g, '');
    waField.classList.toggle('has-error', wa.length < 8);
    $('.field__err', waField).textContent = wa.length < 8 ? 'Número con código de país, ej. 595983836674' : '';
    if (wa.length < 8) { f.whatsapp.focus(); return; }
    const promo = Object.fromEntries(['es', 'pt', 'en'].map((l) => [l, f['promo_' + l].value.trim()]).filter(([, x]) => x));
    await run(api.saveSettings({ ...DATA.settings, whatsapp: wa, instagram: f.instagram.value.trim(), promo, hero: heroSel }), 'Ajustes guardados');
  });
  $('[data-export]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(DATA, null, 1)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `ug-catalog-${new Date().toISOString().slice(0, 10)}.json` });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('[data-demo-reset]').addEventListener('click', () => dialog({
    title: '¿Restablecer la demo?', text: 'Se descartan los cambios hechos en este navegador y se vuelve al catálogo original.', ok: 'Restablecer', danger: true,
    onOk: async () => { localStorage.removeItem(DEMO_KEY); localStorage.removeItem(DEMO_KEY + '_preview'); DATA = await DemoAPI.catalog(); renderAll(); toast('Demo restablecida'); },
  }));

  boot();
})();
