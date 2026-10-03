<?php
/**
 * UG Collection — instalación (correr UNA vez y después BORRAR este archivo).
 *   /server/install.php?key=<install_key de config.php>
 * - Crea las tablas (schema.sql).
 * - Si están vacías, importa el catálogo inicial desde data/catalog.json.
 * - Incluye un generador del hash de contraseña para config.php.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-store');
$cfg = ug_config();
$key = (string)($_GET['key'] ?? '');
// Con install_key vacía (o la de ejemplo) el instalador queda deshabilitado: así sigue bloqueado aunque un deploy lo vuelva a subir
$ik = (string)($cfg['install_key'] ?? '');
if (strlen($ik) < 12 || $ik === 'CAMBIAR-ESTA-CLAVE' || !hash_equals($ik, $key)) {
    http_response_code(403);
    exit('Acceso denegado. Configurá install_key en config.php y pasala como ?key=...');
}

$out = [];
$hash = null;
try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['pass'])) {
        $p = (string)$_POST['pass'];
        if (strlen($p) < 10) $out[] = '⚠️ Usá una contraseña de al menos 10 caracteres.';
        else $hash = password_hash($p, PASSWORD_DEFAULT);
    }

    $db = ug_db();
    foreach (array_filter(array_map('trim', explode(';', preg_replace('/^--.*$/m', '', (string)file_get_contents(__DIR__ . '/schema.sql'))))) as $sql) $db->exec($sql);
    $out[] = '✔ Tablas creadas / verificadas.';

    $count = (int)$db->query('SELECT COUNT(*) FROM ug_products')->fetchColumn();
    if ($count === 0 && is_file(UG_SEED_FILE)) {
        $data = json_decode((string)file_get_contents(UG_SEED_FILE), true);
        $db->beginTransaction();
        $db->prepare('INSERT INTO ug_settings (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)')
           ->execute([json_encode($data['settings'] ?? [], JSON_UNESCAPED_UNICODE)]);
        $ins = $db->prepare('INSERT INTO ug_collections (id, sort, data) VALUES (?, ?, ?)');
        foreach (array_values($data['collections'] ?? []) as $i => $c) $ins->execute([$c['id'], $i, json_encode($c, JSON_UNESCAPED_UNICODE)]);
        $ins = $db->prepare('INSERT INTO ug_products (id, sort, data) VALUES (?, ?, ?)');
        foreach (array_values($data['products'] ?? []) as $i => $p) {
            unset($p['order'], $p['price_from']);
            $ins->execute([$p['id'], $i, json_encode($p, JSON_UNESCAPED_UNICODE)]);
        }
        $db->commit();
        $out[] = '✔ Catálogo importado: ' . count($data['products'] ?? []) . ' productos, ' . count($data['collections'] ?? []) . ' colecciones.';
    } else {
        $out[] = 'ℹ La base ya tenía ' . $count . ' productos: no se importó nada.';
    }
    ug_export();
    $out[] = '✔ uploads/catalog.json generado (es lo que lee el sitio).';
} catch (Throwable $e) {
    $out[] = '✖ Error: ' . htmlspecialchars($e->getMessage());
}
?>
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Instalación — UG Collection</title>
<style>body{font-family:system-ui,sans-serif;background:#f6f3ee;color:#141519;max-width:680px;margin:40px auto;padding:0 16px;line-height:1.6}code,textarea{font-family:ui-monospace,monospace}li{margin:6px 0}form{background:#fff;padding:20px;border-radius:14px;margin-top:24px}input{padding:10px;border:1px solid #ccc;border-radius:8px;width:100%;box-sizing:border-box}button{margin-top:10px;padding:10px 18px;border:0;border-radius:999px;background:#141519;color:#fff;cursor:pointer}textarea{width:100%;box-sizing:border-box;height:70px}.warn{background:#a2402e;color:#fff;padding:12px 16px;border-radius:10px}</style></head>
<body>
<h1>Instalación UG Collection</h1>
<ul><?php foreach ($out as $l) echo '<li>' . $l . '</li>'; ?></ul>
<form method="post">
  <h2>Contraseña del panel</h2>
  <p>Escribí la contraseña que va a usar el dueño. Copiá el hash en <code>admin_pass_hash</code> de <code>server/config.php</code>.</p>
  <input type="password" name="pass" autocomplete="new-password" placeholder="Contraseña (mín. 10 caracteres)">
  <button>Generar hash</button>
  <?php if ($hash): ?><p><b>Hash:</b></p><textarea readonly onclick="this.select()"><?= htmlspecialchars($hash) ?></textarea><?php endif; ?>
</form>
<p class="warn">Cuando termines, <b>borrá server/install.php</b> del hosting.</p>
</body></html>
