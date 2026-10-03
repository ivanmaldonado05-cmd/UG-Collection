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
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
    tag: '<path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    minus: '<path d="M5 12h14"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
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
    async setStock(id, vid, stock) { return (await call('variant.stock', { id, vid, stock })).data; },
    async bulkSave(products) { return (await call('product.bulk', { products })).data; },
    async saveAccount(acc) { const r = await call('account.save', acc); return r.user; },
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
    p.variants.forEach((v) => { v.stock = Math.max(0, Math.floor(+v.stock || 0)); });
    if (!p.hero?.src) p.hero = p.variants.find((v) => v.image?.src)?.image || null;
    if (!p.hero) throw new Error('Subí al menos una foto.');
  }
  const DemoAPI = {
    mode: 'demo',
    async session() { return { auth: sessionStorage.getItem('ug_demo_auth') === '1', user: sessionStorage.getItem('ug_demo_user') || 'admin' }; },
    async login(user) { sessionStorage.setItem('ug_demo_auth', '1'); sessionStorage.setItem('ug_demo_user', user || 'admin'); return { ok: true, user }; },
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
    async setStock(id, vid, stock) {
      const d = demoStore.get(); const v = d.products.find((p) => p.id === id)?.variants.find((x) => x.id === vid);
      if (v) v.stock = Math.max(0, Math.floor(+stock || 0));
      return demoStore.set(d);
    },
    async bulkSave(list) {
      const d = demoStore.get();
      list.forEach((p) => { validateProduct(p, d); const i = d.products.findIndex((x) => x.id === p.id); if (i >= 0) d.products[i] = clone(p); });
      return demoStore.set(d);
    },
    async saveAccount(acc) {
      if (!acc.current) throw new Error('Escribí la contraseña actual.');
      sessionStorage.setItem('ug_demo_user', acc.user || 'admin');
      return acc.user || 'admin';
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
  let currentUser = 'admin';
  const stockOf = (v) => Math.max(0, +v.stock || 0);
  const pStock = (p) => p.variants.reduce((a, v) => a + stockOf(v), 0);

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
      const imgData = x0.getImageData(0, 0, w0, h0);
      const box = isolateWatch(imgData.data, w0, h0);
      x0.putImageData(imgData, 0, 0);
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
  // Deja sólo el reloj: el objeto más grande de la foto. Borra cajitas, logos, líneas y accesorios sueltos
  // y devuelve el recorte centrado. (Misma lógica que _build/build.mjs)
  function isolateWatch(px, W, H) {
    const N = W * H, at = (x, y) => (y * W + x) * 4;
    const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
    const transparent = corners.some((i) => px[i + 3] < 20);
    const med = (c) => corners.map((i) => px[i + c]).sort((a, b) => a - b)[2];
    const bg = [med(0), med(1), med(2)].map((v) => Math.max(v, 225));
    const fg = new Uint8Array(N);
    for (let i = 0; i < N; i++) {
      const o = i * 4;
      fg[i] = transparent ? (px[o + 3] > 24 ? 1 : 0) : (Math.abs(px[o] - bg[0]) < 12 && Math.abs(px[o + 1] - bg[1]) < 12 && Math.abs(px[o + 2] - bg[2]) < 12 ? 0 : 1);
    }
    const RAD = 3, tmp = new Uint8Array(N), dil = new Uint8Array(N);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -RAD; k <= RAD && !v; k++) { const xx = x + k; if (xx >= 0 && xx < W && fg[y * W + xx]) v = 1; } tmp[y * W + x] = v; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = 0; for (let k = -RAD; k <= RAD && !v; k++) { const yy = y + k; if (yy >= 0 && yy < H && tmp[yy * W + x]) v = 1; } dil[y * W + x] = v; }
    const label = new Int32Array(N), stack = new Int32Array(N);
    let best = 0, bestArea = 0, cur = 0;
    for (let i = 0; i < N; i++) {
      if (!dil[i] || label[i]) continue;
      cur++; let sp = 0, area = 0; stack[sp++] = i; label[i] = cur;
      while (sp) {
        const p = stack[--sp]; if (fg[p]) area++;
        const x = p % W, y = (p - x) / W;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const q = ny * W + nx; if (dil[q] && !label[q]) { label[q] = cur; stack[sp++] = q; }
        }
      }
      if (area > bestArea) { bestArea = area; best = cur; }
    }
    if (!best) return { x: 0, y: 0, w: W, h: H };
    let x0 = W, y0 = H, x1 = -1, y1 = -1;
    for (let i = 0; i < N; i++) {
      const o = i * 4;
      if (fg[i] && label[i] === best) { const x = i % W, y = (i - x) / W; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      else if (transparent) px[o + 3] = 0;
      else { px[o] = px[o + 1] = px[o + 2] = 255; px[o + 3] = 255; }
    }
    const m = Math.round(Math.max(x1 - x0, y1 - y0) * 0.015);
    const l = Math.max(0, x0 - m), t = Math.max(0, y0 - m);
    return { x: l, y: t, w: Math.min(W, x1 + m + 1) - l, h: Math.min(H, y1 + m + 1) - t };
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
      csrf = s.csrf; api = ServerAPI; currentUser = s.user || 'admin';
      s.auth ? await showApp() : showLogin();
    } catch (e) {
      if (e.server) { api = ServerAPI; showLogin(); $('[data-login-err]').textContent = e.message; $('[data-boot]').remove(); return; }
      api = DemoAPI;
      $('[data-demo-note]').hidden = false;
      const ds = await DemoAPI.session(); currentUser = ds.user;
      ds.auth ? await showApp() : showLogin();
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
    try { const r = await api.login(user, pass); currentUser = r.user || user; $('#lg-pass').value = ''; await showApp(); }
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

  function renderAll() { renderProducts(); renderStock(); renderPromos(); renderCollections(); renderSettings(); }
  const collName = (id) => DATA.collections.find((c) => c.id === id)?.name?.es || '—';
  const fromPrice = (p) => Math.min(...p.variants.map((v) => +v.price || 0));
  async function run(promise, okMsg) {
    try { DATA = await promise; renderAll(); if (okMsg) toast(okMsg); return true; }
    catch (e) { toast(e.message, 'error'); return false; }
  }

  /* ---------- Productos ---------- */
  const plist = $('[data-plist]');
  function renderProducts() {
    const q = $('[data-prod-q]').value.trim().toLowerCase(), c = $('[data-prod-coll]').value, sf = $('[data-prod-stock]').value;
    const sel = $('[data-prod-coll]');
    sel.innerHTML = `<option value="">Todas las colecciones</option>` + DATA.collections.map((x) => `<option value="${esc(x.id)}">${esc(x.name.es)}</option>`).join('');
    sel.value = c;
    const filtering = !!(q || c || sf);
    const list = DATA.products.filter((p) => (!c || p.collection === c) && (!sf || (sf === 'in') === (pStock(p) > 0)) && (!q || [p.code, p.nick, p.movement, ...p.variants.map((v) => v.name)].join(' ').toLowerCase().includes(q)));
    $('[data-prod-summary]').textContent = `${DATA.products.length} productos · ${DATA.products.reduce((a, p) => a + p.variants.length, 0)} versiones · ${DATA.products.filter((p) => pStock(p) > 0).length} con stock · ${DATA.products.filter((p) => p.active === false).length} ocultos`;
    $('[data-reorder-hint]').hidden = filtering;
    plist.innerHTML = list.length ? list.map((p, i) => `
      <li class="prow${p.active === false ? ' is-hidden-p' : ''}" data-id="${esc(p.id)}" style="--i:${Math.min(i, 20)}">
        ${filtering ? '<span></span>' : `<button class="prow__grip" data-grip aria-label="Mover ${esc(p.code)} (flechas arriba/abajo)">${icon('grip')}</button>`}
        <span class="prow__img">${p.hero ? `<img src="${esc(imgSrc(p.hero.src))}" alt="" loading="lazy">` : icon('image')}</span>
        <div class="prow__main">
          <b>${esc(p.code)}${p.nick ? `<small>${esc(p.nick)}</small>` : ''}${pStock(p) ? `<span class="tag tag--stock">${pStock(p)} en stock</span>` : ''}${p.featured ? '<span class="tag tag--gold">Destacado</span>' : ''}${p.badge?.es ? `<span class="tag">${esc(p.badge.es)}</span>` : ''}${p.active === false ? '<span class="tag">Oculto</span>' : ''}</b>
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
  $('[data-prod-stock]').addEventListener('change', renderProducts);
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
      copy.variants.forEach((v) => { v.id = ''; v.stock = 0; });
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
    crystal: 'Zafiro AR', straps: ['acero'], features: {}, desc: {}, badge: {}, hero: null, featured: false, active: true,
    variants: [{ id: '', name: '', image: null, price: 0, compare_at: null, available: true, stock: 0 }],
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
    draft.badge = draft.badge || {};
    ['es', 'pt', 'en'].forEach((l) => { form.elements['badge_' + l].value = draft.badge[l] || ''; });
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
    if (t.name?.startsWith('badge_')) { const l = t.name.slice(6); if (t.value.trim()) draft.badge[l] = t.value; else delete draft.badge[l]; }
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
      <li class="vrow${stockOf(v) ? ' has-stock' : ''}" data-vi="${i}">
        <span class="vrow__n">${i + 1}</span>
        <div class="drop" data-vdrop role="button" tabindex="0" aria-label="Foto de la versión ${i + 1}">${dropHTML(v.image, 'Foto')}</div>
        <div class="vrow__fields">
          <div class="field wide"><label>Nombre (color · correa)</label><input data-vf="name" value="${esc(v.name)}" placeholder="Ej: Negro · Oro rosa · Caucho"></div>
          <div class="field money"><label>Precio *</label><input data-vf="price" inputmode="numeric" value="${fmtNum(v.price)}" placeholder="950.000"></div>
          <div class="field money"><label>Precio anterior</label><input data-vf="compare_at" inputmode="numeric" value="${fmtNum(v.compare_at)}" placeholder="opcional"></div>
        </div>
        <div class="vrow__stock">
          <span class="vrow__stock-label">${icon('box')}Stock <small>${stockOf(v) ? 'En stock · entrega inmediata' : 'Sin stock'}</small></span>
          <div class="stepper" role="group" aria-label="Unidades en stock">
            <button type="button" class="icon-btn" data-vstep="-1" aria-label="Restar una unidad" ${stockOf(v) ? '' : 'disabled'}>${icon('minus')}</button>
            <input data-vf="stock" inputmode="numeric" value="${stockOf(v)}" aria-label="Unidades">
            <button type="button" class="icon-btn" data-vstep="1" aria-label="Sumar una unidad">${icon('plus')}</button>
          </div>
        </div>
        <div class="vrow__foot">
          <label class="switch"><span>Mostrar en el sitio</span><input type="checkbox" data-vf="available" ${v.available !== false ? 'checked' : ''}><span class="switch__ui"></span></label>
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
    else if (f === 'stock') { e.target.value = e.target.value.replace(/\D+/g, '').slice(0, 4); v.stock = +e.target.value || 0; refreshStockLabel(e.target.closest('[data-vi]'), v); }
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
    const stepBtn = e.target.closest('[data-vstep]');
    if (stepBtn) {
      v.stock = Math.max(0, stockOf(v) + +stepBtn.dataset.vstep);
      $('[data-vf="stock"]', row).value = v.stock; refreshStockLabel(row, v); setDirty(); return;
    }
    const act = e.target.closest('[data-vact]')?.dataset.vact; if (!act) return;
    if (act === 'up' && i > 0) [draft.variants[i - 1], draft.variants[i]] = [draft.variants[i], draft.variants[i - 1]];
    if (act === 'down' && i < draft.variants.length - 1) [draft.variants[i + 1], draft.variants[i]] = [draft.variants[i], draft.variants[i + 1]];
    if (act === 'dup') draft.variants.splice(i + 1, 0, { ...clone(v), id: '', stock: 0 });
    if (act === 'del') {
      if (!(await dialog({ title: '¿Eliminar esta versión?', text: v.name || `Versión ${i + 1}`, ok: 'Eliminar', danger: true }))) return;
      draft.variants.splice(i, 1);
    }
    setDirty(); renderVariants(); renderPreview();
  });
  function refreshStockLabel(row, v) {
    $('.vrow__stock-label small', row).textContent = stockOf(v) ? 'En stock · entrega inmediata' : 'Sin stock';
    $('[data-vstep="-1"]', row).disabled = !stockOf(v);
    row.classList.toggle('has-stock', stockOf(v) > 0);
  }
  vlist.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-vdrop]')) { e.preventDefault(); e.target.click(); } });
  $('[data-ed-add-variant]').addEventListener('click', () => {
    const last = draft.variants[draft.variants.length - 1];
    draft.variants.push({ id: '', name: '', image: null, price: last?.price || 0, compare_at: last?.compare_at || null, available: true, stock: 0 });
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
        <div class="card__media" style="box-shadow:inset 0 0 0 1px var(--line)">
          <div class="card__badges">${(() => { const off = Math.max(0, ...draft.variants.map((v) => (v.compare_at > v.price ? Math.round((1 - v.price / v.compare_at) * 100) : 0))); return off ? `<span class="badge badge--sale">-${off}%</span>` : ''; })()}${draft.variants.some((v) => stockOf(v)) ? '<span class="badge badge--stock"><i></i>En stock</span>' : ''}${draft.badge?.es ? `<span class="badge">${esc(draft.badge.es)}</span>` : ''}</div>
          ${img ? `<div class="card__img"><img src="${esc(imgSrc(img.src))}" alt=""></div>` : ''}</div>
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
    $('#ac-user').value = currentUser;
    $('[data-account-note]').textContent = api.mode === 'demo'
      ? 'En la demo el acceso no se guarda: la contraseña real se configura en el hosting.'
      : 'Cambiá el usuario o la contraseña con la que se ingresa al panel.';
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
    await run(api.saveSettings({ ...DATA.settings, whatsapp: wa, instagram: f.instagram.value.trim(), hero: heroSel }), 'Ajustes guardados');
  });
  const aForm = $('[data-account]');
  aForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = aForm.elements;
    const setErr = (el, msg) => { const fl = el.closest('.field'); fl.classList.toggle('has-error', !!msg); $('.field__err', fl).textContent = msg || ''; };
    [f.user, f.current, f.pass, f.pass2].forEach((el) => setErr(el, ''));
    const user = f.user.value.trim();
    if (!/^[A-Za-z0-9._@-]{3,40}$/.test(user)) { setErr(f.user, 'Entre 3 y 40 caracteres, sin espacios.'); f.user.focus(); return; }
    if (!f.current.value) { setErr(f.current, 'Escribí la contraseña actual.'); f.current.focus(); return; }
    if (f.pass.value && f.pass.value.length < 10) { setErr(f.pass, 'Mínimo 10 caracteres.'); f.pass.focus(); return; }
    if (f.pass.value !== f.pass2.value) { setErr(f.pass2, 'Las contraseñas no coinciden.'); f.pass2.focus(); return; }
    try {
      currentUser = await api.saveAccount({ user, current: f.current.value, pass: f.pass.value });
      f.current.value = f.pass.value = f.pass2.value = '';
      toast(api.mode === 'demo' ? 'En la demo no se guarda el acceso' : 'Acceso actualizado');
    } catch (ex) { setErr(f.current, ex.message); toast(ex.message, 'error'); }
  });

  /* ---------- Stock ---------- */
  let stockView = 'all';
  const stockList = $('[data-stock-list]');
  function renderStockStats() {
    const inS = DATA.products.flatMap((p) => p.variants.map((v) => ({ p, v }))).filter((x) => stockOf(x.v) > 0);
    $('[data-stock-stats]').innerHTML = `
      <div class="stat-card stat-card--stock"><b>${inS.length}</b><span>versiones en stock</span></div>
      <div class="stat-card"><b>${new Set(inS.map((x) => x.p.id)).size}</b><span>modelos con stock</span></div>
      <div class="stat-card"><b>${inS.reduce((a, x) => a + stockOf(x.v), 0)}</b><span>unidades en total</span></div>`;
    $$('[data-pid]', stockList).forEach((g) => {
      const p = DATA.products.find((x) => x.id === g.dataset.pid);
      if (p) $('.sgroup__state', g).innerHTML = pStock(p) ? `<em class="ok">${pStock(p)} en stock</em>` : 'sin stock';
    });
  }
  function renderStock() {
    const q = $('[data-stock-q]').value.trim().toLowerCase();
    const groups = DATA.products.map((p) => {
      const vs = p.variants.filter((v) => (stockView === 'all' || (stockView === 'in') === (stockOf(v) > 0))
        && (!q || `${p.code} ${p.nick} ${v.name}`.toLowerCase().includes(q)));
      return { p, vs };
    }).filter((g) => g.vs.length);
    stockList.innerHTML = groups.length ? groups.map(({ p, vs }) => `
      <section class="sgroup" data-pid="${esc(p.id)}">
        <header class="sgroup__head">
          <span class="prow__img">${p.hero ? `<img src="${esc(imgSrc(p.hero.src))}" alt="" loading="lazy">` : ''}</span>
          <div><b>${esc(p.code)}${p.nick ? ` <small>${esc(p.nick)}</small>` : ''}</b><span>${esc(collName(p.collection))} · <span class="sgroup__state">${pStock(p) ? `<em class="ok">${pStock(p)} en stock</em>` : 'sin stock'}</span></span></div>
          <button class="icon-btn" data-sedit aria-label="Editar ${esc(p.code)}" title="Editar producto">${icon('edit')}</button>
        </header>
        <ul class="srows">${vs.map((v) => `
          <li class="srow${stockOf(v) ? ' has-stock' : ''}" data-vid="${esc(v.id)}">
            <span class="srow__img">${v.image ? `<img src="${esc(imgSrc(v.image.src))}" alt="" loading="lazy">` : ''}</span>
            <div class="srow__main"><b>${esc(v.name || 'Versión')}</b><span>${money(v.price)}${v.compare_at ? ` <s>${money(v.compare_at)}</s>` : ''}</span></div>
            <div class="stepper" role="group" aria-label="Unidades de ${esc(v.name)}">
              <button type="button" class="icon-btn" data-step="-1" aria-label="Restar" ${stockOf(v) ? '' : 'disabled'}>${icon('minus')}</button>
              <input data-qty inputmode="numeric" value="${stockOf(v)}" aria-label="Unidades">
              <button type="button" class="icon-btn" data-step="1" aria-label="Sumar">${icon('plus')}</button>
            </div>
            <label class="switch" title="En stock"><input type="checkbox" data-instock ${stockOf(v) ? 'checked' : ''}><span class="switch__ui"></span><span class="sr-only">En stock</span></label>
          </li>`).join('')}</ul>
      </section>`).join('') : `<div class="empty-list">${stockView === 'in' ? 'Todavía no hay relojes en stock. Marcalos desde «Todos».' : 'No hay versiones que coincidan.'}</div>`;
    renderStockStats();
  }
  const saveQty = (() => {
    const timers = {};
    return (pid, vid, qty, row) => {
      const v = DATA.products.find((p) => p.id === pid).variants.find((x) => x.id === vid);
      v.stock = qty;
      row.classList.toggle('has-stock', qty > 0);
      $('[data-qty]', row).value = qty; $('[data-instock]', row).checked = qty > 0; $('[data-step="-1"]', row).disabled = !qty;
      clearTimeout(timers[vid]);
      timers[vid] = setTimeout(async () => {
        try { DATA = await api.setStock(pid, vid, qty); renderProducts(); renderStockStats(); toast(qty ? `${v.name}: ${qty} en stock` : `${v.name}: sin stock`); }
        catch (e) { toast(e.message, 'error'); }
      }, 450);
    };
  })();
  stockList.addEventListener('click', (e) => {
    const row = e.target.closest('[data-vid]'), pid = e.target.closest('[data-pid]')?.dataset.pid;
    if (e.target.closest('[data-sedit]')) { openEditor(DATA.products.find((p) => p.id === pid)); return; }
    const st = e.target.closest('[data-step]'); if (!st || !row) return;
    saveQty(pid, row.dataset.vid, Math.max(0, (+$('[data-qty]', row).value || 0) + +st.dataset.step), row);
  });
  stockList.addEventListener('change', (e) => {
    const row = e.target.closest('[data-vid]'); if (!row) return;
    const pid = e.target.closest('[data-pid]').dataset.pid;
    if (e.target.matches('[data-instock]')) saveQty(pid, row.dataset.vid, e.target.checked ? Math.max(1, +$('[data-qty]', row).value || 0) : 0, row);
    if (e.target.matches('[data-qty]')) saveQty(pid, row.dataset.vid, Math.max(0, Math.min(9999, +e.target.value.replace(/\D+/g, '') || 0)), row);
  });
  $('[data-stock-q]').addEventListener('input', (e) => { e.target.parentElement.classList.toggle('has-value', !!e.target.value); renderStock(); });
  $('[data-stock-q-clear]').innerHTML = icon('x');
  $('[data-stock-q-clear]').addEventListener('click', () => { $('[data-stock-q]').value = ''; $('[data-stock-q]').parentElement.classList.remove('has-value'); renderStock(); });
  $('[data-stock-view]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-sv]'); if (!b) return;
    stockView = b.dataset.sv;
    $$('[data-sv]').forEach((x) => x.setAttribute('aria-checked', x === b));
    renderStock();
  });

  /* ---------- Promos: descuento masivo + barra de anuncio ---------- */
  const bulk = $('[data-bulk]');
  let bulkScope = 'all', bulkPick = new Set();
  function bulkTargets() {
    const c = $('[data-bulk-coll]').value;
    return DATA.products.filter((p) => bulkScope === 'all' || (bulkScope === 'coll' && p.collection === c)
      || (bulkScope === 'stock' && pStock(p) > 0) || (bulkScope === 'pick' && bulkPick.has(p.id)));
  }
  const listPrice = (v) => (v.compare_at > v.price ? v.compare_at : v.price);
  const roundTo = (n, r) => Math.max(r, Math.round(n / r) * r);
  function renderBulkPreview() {
    const pct = Math.min(90, +$('[data-bulk-pct]').value || 0), r = +$('[data-bulk-round]').value;
    const t = bulkTargets(), nv = t.reduce((a, p) => a + p.variants.length, 0);
    const ex = t[0]?.variants[0];
    $('[data-bulk-preview]').innerHTML = !t.length ? '<span class="muted">No hay relojes en esta selección.</span>'
      : `<b>${t.length} ${t.length === 1 ? 'modelo' : 'modelos'} · ${nv} versiones</b>${pct && ex ? `<span>Ej.: ${esc(t[0].code)} ${money(listPrice(ex))} → <strong>${money(roundTo(listPrice(ex) * (1 - pct / 100), r))}</strong> (−${pct}%)</span>` : '<span class="muted">Escribí el porcentaje para ver el resultado.</span>'}`;
  }
  function renderPromos() {
    $('[data-bulk-coll]').innerHTML = DATA.collections.map((c) => `<option value="${esc(c.id)}">${esc(c.name.es)}</option>`).join('');
    $('[data-bulk-pick]').innerHTML = DATA.products.map((p) => `
      <li><label class="check"><input type="checkbox" value="${esc(p.id)}" ${bulkPick.has(p.id) ? 'checked' : ''}><span class="check__box">${icon('check')}</span>
        ${p.hero ? `<img src="${esc(imgSrc(p.hero.src))}" alt="" loading="lazy">` : ''}<span>${esc(p.code)} ${esc(p.nick || '')}</span></label></li>`).join('');
    renderBulkPreview();
    const s = DATA.settings || {}, f = $('[data-promos]').elements, a = s.announce || {};
    f.announce_on.checked = !!a.active;
    ['es', 'pt', 'en'].forEach((l) => { f['announce_' + l].value = a.text?.[l] || ''; f['promo_' + l].value = s.promo?.[l] || ''; });
    f.announce_link.value = a.link || '';
    renderAnnouncePreview();
  }
  $('[data-bulk-scope]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-scope]'); if (!b) return;
    bulkScope = b.dataset.scope;
    $$('[data-scope]').forEach((x) => x.setAttribute('aria-checked', x === b));
    $('[data-bulk-coll-wrap]').hidden = bulkScope !== 'coll';
    $('[data-bulk-pick]').hidden = bulkScope !== 'pick';
    renderBulkPreview();
  });
  $('[data-bulk-pick]').addEventListener('change', (e) => { e.target.checked ? bulkPick.add(e.target.value) : bulkPick.delete(e.target.value); renderBulkPreview(); });
  $('[data-bulk-coll]').addEventListener('change', renderBulkPreview);
  $('[data-bulk-round]').addEventListener('change', renderBulkPreview);
  $('[data-bulk-pct]').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D+/g, '').slice(0, 2); renderBulkPreview(); });
  bulk.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pct = +$('[data-bulk-pct]').value || 0, r = +$('[data-bulk-round]').value, t = bulkTargets();
    if (!pct || pct > 90) { toast('Escribí un descuento entre 1 y 90 %.', 'error'); $('[data-bulk-pct]').focus(); return; }
    if (!t.length) { toast('Elegí al menos un reloj.', 'error'); return; }
    const ok = await dialog({ title: `¿Aplicar ${pct}% de descuento?`, text: `Se actualizan ${t.reduce((a, p) => a + p.variants.length, 0)} versiones de ${t.length} modelos. El precio de lista queda tachado.`, ok: 'Aplicar' });
    if (!ok) return;
    const updated = t.map((p) => { const c = clone(p); c.variants.forEach((v) => { const base = listPrice(v); v.compare_at = base; v.price = roundTo(base * (1 - pct / 100), r); if (v.price >= base) v.compare_at = null; }); return c; });
    if (await run(api.bulkSave(updated), `Descuento del ${pct}% aplicado`)) { $('[data-bulk-pct]').value = ''; renderBulkPreview(); }
  });
  $('[data-bulk-remove]').addEventListener('click', async () => {
    const t = bulkTargets().filter((p) => p.variants.some((v) => v.compare_at > v.price));
    if (!t.length) { toast('Esta selección no tiene descuentos.'); return; }
    const ok = await dialog({ title: '¿Quitar los descuentos?', text: `${t.length} modelos vuelven a su precio de lista (el que estaba tachado).`, ok: 'Quitar descuentos', danger: true });
    if (!ok) return;
    const updated = t.map((p) => { const c = clone(p); c.variants.forEach((v) => { if (v.compare_at > v.price) v.price = v.compare_at; v.compare_at = null; }); return c; });
    await run(api.bulkSave(updated), 'Descuentos quitados');
  });
  const pForm = $('[data-promos]');
  function renderAnnouncePreview() {
    const f = pForm.elements, txt = f.announce_es.value.trim();
    $('[data-announce-preview]').innerHTML = f.announce_on.checked && txt
      ? `<span class="muted">Así se ve:</span><div class="announce-demo">${icon('bolt')}${esc(txt)}${f.announce_link.value ? ' →' : ''}</div>` : '';
  }
  pForm.addEventListener('input', renderAnnouncePreview);
  pForm.addEventListener('change', renderAnnouncePreview);
  pForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = pForm.elements;
    const pick = (pre) => Object.fromEntries(['es', 'pt', 'en'].map((l) => [l, f[pre + l].value.trim()]).filter(([, x]) => x));
    const text = pick('announce_');
    if (f.announce_on.checked && !text.es) { toast('Escribí el texto del anuncio en español.', 'error'); f.announce_es.focus(); return; }
    await run(api.saveSettings({ ...DATA.settings, promo: pick('promo_'), announce: { active: f.announce_on.checked, text, link: f.announce_link.value } }), 'Promos guardadas');
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
