# UG Collection — notas del proyecto

Tienda/catálogo online de relojes **Pagani Design** para **UG Collection** (Paraguay).
Sitio estático (HTML/CSS/JS vanilla) + panel de administración (PHP + MySQL) para que el dueño gestione productos.

- WhatsApp: +595 983 836 674 · Instagram: [@ug_collection27](https://www.instagram.com/ug_collection27/)
- Idiomas: ES (por defecto) / PT / EN
- Compra: sólo catálogo → botón **Consultar por WhatsApp** con modelo, versión y precio en el mensaje. Favoritos se pueden consultar todos juntos.

## Estructura

```
index.html  catalogo.html  producto.html?id=…&v=…  contacto.html  404.html
assets/css/styles.css          estilos (tokens de marca, animaciones)
assets/js/core.js              i18n, datos, header/footer, favoritos, vista rápida, carruseles
assets/js/{home,catalog,product}.js
assets/i18n/{es,pt,en}.json    textos de la interfaz + diccionario de colores (terms)
assets/img/products/           fotos optimizadas (WebP) del catálogo inicial
data/catalog.json              catálogo inicial (18 modelos, 117 versiones)
admin/                         panel (index.html + admin.js + admin.css)
server/                        API PHP (api.php, lib.php, install.php, schema.sql, config.sample.php)
uploads/                       fotos subidas desde el panel + uploads/catalog.json (generado, fuera de Git)
_build/build.mjs               regenera data/catalog.json + fotos desde _extract/ (material de Canva)
_build/serve.mjs               servidor local: node _build/serve.mjs 5510
```

## Cómo funcionan los datos

- **GitHub Pages / local:** el sitio lee `data/catalog.json`. El panel funciona en **modo demo**: los cambios se guardan sólo en ese navegador y el sitio muestra una «Vista previa del panel» en ese mismo navegador.
- **Hostinger (producción):** el panel guarda en MySQL y en cada cambio regenera `uploads/catalog.json`, que es lo que lee el sitio. `uploads/` no está en Git, así que un deploy nunca pisa los cambios del dueño.

## Deploy en Hostinger (pendiente: dominio)

1. hPanel → crear base MySQL + usuario.
2. Subir el sitio (Git de Hostinger o File Manager) a `public_html/`.
3. Copiar `server/config.sample.php` → `server/config.php` y completar la base y `install_key`.
4. Abrir `/server/install.php?key=…`: crea las tablas, importa el catálogo y genera el hash de la contraseña → pegarlo en `admin_pass_hash`.
5. **Borrar `server/install.php`**.
6. Entrar a `/admin/` con usuario `admin` y la contraseña.
7. Verificar que `uploads/` sea escribible (755) y que PHP sea 7.4 o superior (recomendado 8.x).

⚠️ El backend PHP está **escrito sin probar** (no hay PHP en la PC de desarrollo). Probarlo en staging antes de entregarlo: login, crear/editar/borrar producto, subir foto, reordenar, ajustes.

## [PENDIENTE] — datos a pedir al cliente

- Horario de atención y ubicación/dirección (hoy figuran como [PENDIENTE] en Contacto).
- Dominio (para SEO: canonical, sitemap.xml, og:url, Open Graph con URL absoluta).
- Calibre exacto de la **Línea Entrada** (los catálogos sólo dicen «Automático»).
- Confirmar los nombres de color de cada versión: los puse mirando las fotos y se pueden corregir desde el panel.
- Todas las fotos se procesan en `_build/build.mjs` (`isolateWatch`): queda sólo el reloj (sin cajitas, logos, líneas ni etiquetas) y se recorta centrado. Nombres de color de PD-1825 (nácar, malaquita, ojo de tigre) a confirmar.
- Fotos en baja resolución (venían chicas desde Canva, el sitio las muestra más chicas): PD-1645 Negro bicolor y Verde · PD-1661 Negro · PD-YS027 Negro bicolor · PD-1662 bisel marrón, gris y verde · PD-1689 Blanco/cuero marrón.
- Versiones de PD-1701 que **no se cargaron** porque las fotos traían textos encima: Blanco · Nylon y Crema · Acero (800.000 Gs.). Pedir fotos limpias.
- En Canva, la página 9 del catálogo «Entrada» dice «MODELO PD-1728», pero las fotos son del PD-YS025 (corazón abierto). Se cargaron como PD-YS025.
- PD-1753: con Seiko NH35 cuesta 1.300.000 sin precio anterior; con Miyota cuesta 1.050.000 (antes 1.200.000). Confirmar.
- Textos de descripción: los redacté a partir de las especificaciones; el dueño puede ajustarlos.

## Decisiones

- Paleta del logo: dorado `#B08D57`, marfil `#F6F3EE`, tinta `#141519`, pizarra `#2E3A4D`. Tipografías: Marcellus + Manrope.
- Sin frameworks ni librerías de terceros (slider, carruseles, zoom y filtros hechos a mano).
- Las fotos que sube el dueño se recortan (bordes transparentes) y se comprimen a WebP en el navegador antes de subir.
