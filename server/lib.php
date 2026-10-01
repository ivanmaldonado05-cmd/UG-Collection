<?php
/**
 * UG Collection — funciones compartidas del backend (PHP 7.4+).
 */
declare(strict_types=1);

if (!is_file(__DIR__ . '/config.php')) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Falta server/config.php (copiá config.sample.php).']);
    exit;
}

const UG_ROOT = __DIR__ . '/..';
// El catálogo publicado vive en uploads/ (fuera de Git) para que un deploy nunca pise los cambios del dueño.
const UG_CATALOG_FILE = UG_ROOT . '/uploads/catalog.json';
// Catálogo inicial del repositorio (se importa una vez con install.php)
const UG_SEED_FILE = UG_ROOT . '/data/catalog.json';
const UG_UPLOAD_DIR = UG_ROOT . '/uploads/products';
const UG_UPLOAD_URL = 'uploads/products';

function ug_config(): array
{
    static $cfg = null;
    if ($cfg === null) $cfg = require __DIR__ . '/config.php';
    return $cfg;
}

function ug_db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = ug_config()['db'];
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $c['host'], $c['name'], $c['charset'] ?? 'utf8mb4');
        $pdo = new PDO($dsn, $c['user'], $c['pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

/* ---------- Sesión y seguridad ---------- */
function ug_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('ugadmin');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Strict',
    ]);
    session_start();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
}

function ug_is_auth(): bool
{
    ug_session();
    if (empty($_SESSION['auth'])) return false;
    // expira tras 8 h de inactividad
    if (time() - ($_SESSION['seen'] ?? 0) > 8 * 3600) { $_SESSION = []; return false; }
    $_SESSION['seen'] = time();
    return true;
}

function ug_require_auth(): void
{
    if (!ug_is_auth()) ug_json(['ok' => false, 'error' => 'No autorizado'], 401);
}

function ug_require_csrf(): void
{
    $sent = $_SERVER['HTTP_X_CSRF'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) ug_json(['ok' => false, 'error' => 'Token inválido, recargá la página.'], 419);
}

function ug_client_ip(): string
{
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'), 0, 45);
}

function ug_too_many_attempts(): bool
{
    $db = ug_db();
    $db->prepare('DELETE FROM ug_login_attempts WHERE at < (NOW() - INTERVAL 1 DAY)')->execute();
    $q = $db->prepare('SELECT COUNT(*) FROM ug_login_attempts WHERE ip = ? AND at > (NOW() - INTERVAL 15 MINUTE)');
    $q->execute([ug_client_ip()]);
    return (int)$q->fetchColumn() >= 8;
}

function ug_log_attempt(): void
{
    ug_db()->prepare('INSERT INTO ug_login_attempts (ip) VALUES (?)')->execute([ug_client_ip()]);
}

/* ---------- Respuestas ---------- */
function ug_json(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ug_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/* ---------- Saneamiento ---------- */
function ug_str($v, int $max = 500): string
{
    $s = trim(is_scalar($v) ? (string)$v : '');
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

function ug_i18n($v, int $max = 2000): array
{
    $out = [];
    foreach (['es', 'pt', 'en'] as $l) {
        $s = ug_str(is_array($v) ? ($v[$l] ?? '') : ($l === 'es' ? $v : ''), $max);
        if ($s !== '') $out[$l] = $s;
    }
    return $out;
}

function ug_slug(string $s): string
{
    $s = strtolower(iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $s) ?: $s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-') ?: 'item';
}

function ug_image($v): ?array
{
    if (!is_array($v) || empty($v['src'])) return null;
    $src = ug_str($v['src'], 300);
    // sólo rutas propias del sitio
    if (!preg_match('#^(assets/img/products|uploads/products)/[A-Za-z0-9._-]+\.(webp|png|jpe?g)$#', $src)) return null;
    $img = ['src' => $src, 'w' => max(0, (int)($v['w'] ?? 0)), 'h' => max(0, (int)($v['h'] ?? 0))];
    if (!empty($v['lowres'])) $img['lowres'] = true;
    return $img;
}

const UG_TYPES = ['automatico', 'mecacuarzo', 'cuarzo'];
const UG_STRAPS = ['acero', 'caucho', 'nylon', 'cuero'];

function ug_clean_product(array $p, array $collectionIds): array
{
    $code = ug_str($p['code'] ?? '', 40);
    if ($code === '') throw new InvalidArgumentException('El código del modelo es obligatorio.');
    $collection = ug_str($p['collection'] ?? '', 64);
    if (!in_array($collection, $collectionIds, true)) throw new InvalidArgumentException('Elegí una colección válida.');
    $type = in_array($p['type'] ?? '', UG_TYPES, true) ? $p['type'] : 'automatico';
    $straps = array_values(array_intersect(UG_STRAPS, is_array($p['straps'] ?? null) ? $p['straps'] : []));

    $variants = [];
    $id = ug_slug(ug_str($p['id'] ?? '', 64) ?: $code);
    foreach (array_values(is_array($p['variants'] ?? null) ? $p['variants'] : []) as $i => $v) {
        if (!is_array($v)) continue;
        $price = (int)round((float)($v['price'] ?? 0));
        if ($price <= 0) throw new InvalidArgumentException('Cada versión necesita un precio mayor a 0.');
        $compare = (int)round((float)($v['compare_at'] ?? 0));
        $variants[] = [
            'id' => ug_slug(ug_str($v['id'] ?? '', 80) ?: ($id . '-' . ($i + 1))),
            'name' => ug_str($v['name'] ?? '', 120) ?: ('Versión ' . ($i + 1)),
            'image' => ug_image($v['image'] ?? null),
            'price' => $price,
            'compare_at' => $compare > $price ? $compare : null,
            'available' => !isset($v['available']) || (bool)$v['available'],
        ];
    }
    if (!$variants) throw new InvalidArgumentException('Agregá al menos una versión con precio.');
    // ids de versión únicos
    $seen = [];
    foreach ($variants as &$v) { while (isset($seen[$v['id']])) $v['id'] .= '-b'; $seen[$v['id']] = true; }
    unset($v);

    $hero = ug_image($p['hero'] ?? null);
    if (!$hero) foreach ($variants as $v) if ($v['image']) { $hero = $v['image']; break; }
    if (!$hero) throw new InvalidArgumentException('Subí al menos una foto.');

    return [
        'id' => $id,
        'code' => $code,
        'nick' => ug_str($p['nick'] ?? '', 60),
        'brand' => ug_str($p['brand'] ?? 'Pagani Design', 60) ?: 'Pagani Design',
        'collection' => $collection,
        'type' => $type,
        'movement' => ug_str($p['movement'] ?? '', 80),
        'case_mm' => ug_str($p['case_mm'] ?? '', 20),
        'water_m' => max(0, (int)($p['water_m'] ?? 0)),
        'crystal' => ug_str($p['crystal'] ?? 'Zafiro AR', 60),
        'straps' => $straps,
        'features' => ug_i18n($p['features'] ?? [], 300),
        'desc' => ug_i18n($p['desc'] ?? [], 2000),
        'hero' => $hero,
        'featured' => !empty($p['featured']),
        'active' => !isset($p['active']) || (bool)$p['active'],
        'variants' => $variants,
    ];
}

function ug_clean_collection(array $c): array
{
    $name = ug_i18n($c['name'] ?? [], 80);
    if (empty($name['es'])) throw new InvalidArgumentException('La colección necesita un nombre.');
    return [
        'id' => ug_slug(ug_str($c['id'] ?? '', 64) ?: $name['es']),
        'name' => $name,
        'tagline' => ug_i18n($c['tagline'] ?? [], 120),
        'cover' => ug_str($c['cover'] ?? '', 64),
    ];
}

function ug_clean_settings(array $s): array
{
    $wa = preg_replace('/\D+/', '', (string)($s['whatsapp'] ?? '')) ?? '';
    if (strlen($wa) < 8) throw new InvalidArgumentException('Número de WhatsApp inválido (con código de país, ej. 595983836674).');
    $ig = ug_str($s['instagram'] ?? '', 200);
    if ($ig !== '' && !preg_match('#^https://(www\.)?instagram\.com/#', $ig)) throw new InvalidArgumentException('El enlace de Instagram debe empezar con https://www.instagram.com/');
    $hero = array_values(array_filter(array_map(function ($x) { return ug_slug(ug_str($x, 64)); }, is_array($s['hero'] ?? null) ? $s['hero'] : [])));
    return [
        'brand' => 'UG Collection',
        'whatsapp' => $wa,
        'instagram' => $ig,
        'currency' => 'Gs.',
        'promo' => ug_i18n($s['promo'] ?? [], 80),
        'hero' => array_slice($hero, 0, 6),
    ];
}

/* ---------- Lectura / exportación ---------- */
function ug_load_all(): array
{
    $db = ug_db();
    $settings = $db->query('SELECT data FROM ug_settings WHERE id = 1')->fetchColumn();
    $collections = array_map(function ($r) { return json_decode($r['data'], true); }, $db->query('SELECT data FROM ug_collections ORDER BY sort, id')->fetchAll());
    $products = [];
    foreach ($db->query('SELECT sort, data FROM ug_products ORDER BY sort, id')->fetchAll() as $r) {
        $p = json_decode($r['data'], true);
        $p['order'] = (int)$r['sort'];
        $prices = array_map(function ($v) { return $v['price']; }, $p['variants'] ?? []);
        $p['price_from'] = $prices ? min($prices) : 0;
        $products[] = $p;
    }
    return [
        'updated' => gmdate('c'),
        'settings' => $settings ? json_decode($settings, true) : [],
        'collections' => $collections,
        'products' => $products,
    ];
}

/** Regenera uploads/catalog.json (lo que lee el sitio público). Escritura atómica. */
function ug_export(): array
{
    $all = ug_load_all();
    $public = $all;
    // los productos ocultos no se publican
    $public['products'] = array_values(array_filter($all['products'], function ($p) { return ($p['active'] ?? true) !== false; }));
    $json = json_encode($public, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $tmp = UG_CATALOG_FILE . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, UG_CATALOG_FILE)) {
        throw new RuntimeException('No se pudo escribir uploads/catalog.json (revisá permisos de la carpeta uploads/).');
    }
    return $all;
}
