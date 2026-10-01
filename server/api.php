<?php
/**
 * UG Collection — API del panel de administración.
 * Todas las respuestas son JSON. Las escrituras requieren sesión + token CSRF (header X-CSRF).
 * Cada cambio regenera uploads/catalog.json, que es lo que lee el sitio público.
 */
declare(strict_types=1);
require __DIR__ . '/lib.php';

ug_session();
$action = (string)($_GET['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

try {
    /* ---------- Públicas ---------- */
    if ($action === 'session') {
        ug_json(['ok' => true, 'auth' => ug_is_auth(), 'csrf' => $_SESSION['csrf'], 'user' => $_SESSION['user'] ?? null]);
    }

    if ($action === 'login' && $method === 'POST') {
        ug_require_csrf();
        if (ug_too_many_attempts()) ug_json(['ok' => false, 'error' => 'Demasiados intentos. Esperá 15 minutos.'], 429);
        $b = ug_body();
        $cfg = ug_config();
        $user = ug_str($b['user'] ?? '', 60);
        $pass = (string)($b['pass'] ?? '');
        $ok = $cfg['admin_pass_hash'] !== '' && hash_equals((string)$cfg['admin_user'], $user) && password_verify($pass, (string)$cfg['admin_pass_hash']);
        if (!$ok) {
            ug_log_attempt();
            usleep(700000);
            ug_json(['ok' => false, 'error' => 'Usuario o contraseña incorrectos.'], 401);
        }
        session_regenerate_id(true);
        $_SESSION['auth'] = true;
        $_SESSION['user'] = $user;
        $_SESSION['seen'] = time();
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        ug_json(['ok' => true, 'csrf' => $_SESSION['csrf'], 'user' => $user]);
    }

    /* ---------- Requieren sesión ---------- */
    ug_require_auth();

    if ($action === 'catalog') {
        ug_json(['ok' => true, 'data' => ug_load_all()]);
    }

    if ($method !== 'POST') ug_json(['ok' => false, 'error' => 'Método no permitido'], 405);
    ug_require_csrf();
    $db = ug_db();

    switch ($action) {
        case 'logout':
            $_SESSION = [];
            session_destroy();
            ug_json(['ok' => true]);

        case 'product.save': {
            $b = ug_body();
            $collIds = $db->query('SELECT id FROM ug_collections')->fetchAll(PDO::FETCH_COLUMN);
            $p = ug_clean_product(is_array($b['product'] ?? null) ? $b['product'] : [], $collIds);
            $original = ug_str($b['original_id'] ?? '', 64);
            $db->beginTransaction();
            if ($original !== '' && $original !== $p['id']) {
                // cambio de código → nuevo id; se borra el anterior
                $exists = $db->prepare('SELECT COUNT(*) FROM ug_products WHERE id = ?');
                $exists->execute([$p['id']]);
                if ((int)$exists->fetchColumn() > 0) throw new InvalidArgumentException('Ya existe otro producto con ese código.');
                $sort = $db->prepare('SELECT sort FROM ug_products WHERE id = ?');
                $sort->execute([$original]);
                $s = $sort->fetchColumn();
                $db->prepare('DELETE FROM ug_products WHERE id = ?')->execute([$original]);
                $db->prepare('INSERT INTO ug_products (id, sort, data) VALUES (?, ?, ?)')->execute([$p['id'], $s === false ? 0 : (int)$s, json_encode($p, JSON_UNESCAPED_UNICODE)]);
            } elseif ($original === '') {
                $exists = $db->prepare('SELECT COUNT(*) FROM ug_products WHERE id = ?');
                $exists->execute([$p['id']]);
                if ((int)$exists->fetchColumn() > 0) throw new InvalidArgumentException('Ya existe un producto con ese código.');
                $max = (int)$db->query('SELECT COALESCE(MAX(sort), -1) FROM ug_products')->fetchColumn();
                $db->prepare('INSERT INTO ug_products (id, sort, data) VALUES (?, ?, ?)')->execute([$p['id'], $max + 1, json_encode($p, JSON_UNESCAPED_UNICODE)]);
            } else {
                $db->prepare('UPDATE ug_products SET data = ? WHERE id = ?')->execute([json_encode($p, JSON_UNESCAPED_UNICODE), $p['id']]);
            }
            $db->commit();
            ug_json(['ok' => true, 'product' => $p, 'data' => ug_export()]);
        }

        case 'product.delete': {
            $id = ug_str(ug_body()['id'] ?? '', 64);
            $db->prepare('DELETE FROM ug_products WHERE id = ?')->execute([$id]);
            ug_json(['ok' => true, 'data' => ug_export()]);
        }

        case 'product.patch': {
            // cambios rápidos desde la lista: visible / destacado
            $b = ug_body();
            $id = ug_str($b['id'] ?? '', 64);
            $field = (string)($b['field'] ?? '');
            if (!in_array($field, ['active', 'featured'], true)) throw new InvalidArgumentException('Campo inválido');
            $q = $db->prepare('SELECT data FROM ug_products WHERE id = ?');
            $q->execute([$id]);
            $data = $q->fetchColumn();
            if ($data === false) throw new InvalidArgumentException('Producto no encontrado');
            $p = json_decode($data, true);
            $p[$field] = (bool)($b['value'] ?? false);
            $db->prepare('UPDATE ug_products SET data = ? WHERE id = ?')->execute([json_encode($p, JSON_UNESCAPED_UNICODE), $id]);
            ug_json(['ok' => true, 'data' => ug_export()]);
        }

        case 'product.reorder':
        case 'collection.reorder': {
            $ids = ug_body()['ids'] ?? [];
            if (!is_array($ids)) throw new InvalidArgumentException('Lista inválida');
            $table = $action === 'product.reorder' ? 'ug_products' : 'ug_collections';
            $st = $db->prepare("UPDATE $table SET sort = ? WHERE id = ?");
            $db->beginTransaction();
            foreach (array_values($ids) as $i => $id) $st->execute([$i, ug_str($id, 64)]);
            $db->commit();
            ug_json(['ok' => true, 'data' => ug_export()]);
        }

        case 'collection.save': {
            $b = ug_body();
            $c = ug_clean_collection(is_array($b['collection'] ?? null) ? $b['collection'] : []);
            $original = ug_str($b['original_id'] ?? '', 64);
            if ($original === '') {
                $exists = $db->prepare('SELECT COUNT(*) FROM ug_collections WHERE id = ?');
                $exists->execute([$c['id']]);
                if ((int)$exists->fetchColumn() > 0) throw new InvalidArgumentException('Ya existe una colección con ese nombre.');
                $max = (int)$db->query('SELECT COALESCE(MAX(sort), -1) FROM ug_collections')->fetchColumn();
                $db->prepare('INSERT INTO ug_collections (id, sort, data) VALUES (?, ?, ?)')->execute([$c['id'], $max + 1, json_encode($c, JSON_UNESCAPED_UNICODE)]);
            } else {
                $c['id'] = $original; // el id de una colección existente no cambia (lo usan los productos)
                $db->prepare('UPDATE ug_collections SET data = ? WHERE id = ?')->execute([json_encode($c, JSON_UNESCAPED_UNICODE), $original]);
            }
            ug_json(['ok' => true, 'data' => ug_export()]);
        }

        case 'collection.delete': {
            $id = ug_str(ug_body()['id'] ?? '', 64);
            foreach ($db->query('SELECT data FROM ug_products')->fetchAll(PDO::FETCH_COLUMN) as $d) {
                if ((json_decode($d, true)['collection'] ?? '') === $id) throw new InvalidArgumentException('La colección tiene productos. Movelos a otra colección antes de borrarla.');
            }
            $db->prepare('DELETE FROM ug_collections WHERE id = ?')->execute([$id]);
            ug_json(['ok' => true, 'data' => ug_export()]);
        }

        case 'settings.save': {
            $s = ug_clean_settings(is_array(ug_body()['settings'] ?? null) ? ug_body()['settings'] : []);
            $db->prepare('INSERT INTO ug_settings (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)')->execute([json_encode($s, JSON_UNESCAPED_UNICODE)]);
            ug_json(['ok' => true, 'data' => ug_export()]);
        }

        case 'upload': {
            if (empty($_FILES['file']) || !is_uploaded_file($_FILES['file']['tmp_name'])) throw new InvalidArgumentException('No llegó ninguna foto.');
            $f = $_FILES['file'];
            $max = (int)(ug_config()['max_upload_mb'] ?? 8) * 1024 * 1024;
            if ($f['error'] !== UPLOAD_ERR_OK) throw new InvalidArgumentException('Error al subir la foto (código ' . (int)$f['error'] . ').');
            if ($f['size'] > $max) throw new InvalidArgumentException('La foto pesa demasiado.');
            $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
            $ext = ['image/webp' => 'webp', 'image/png' => 'png', 'image/jpeg' => 'jpg'][$mime] ?? null;
            if (!$ext) throw new InvalidArgumentException('Formato no permitido (usá JPG, PNG o WebP).');
            $info = @getimagesize($f['tmp_name']);
            if (!$info) throw new InvalidArgumentException('El archivo no es una imagen válida.');
            if (!is_dir(UG_UPLOAD_DIR) && !mkdir(UG_UPLOAD_DIR, 0755, true)) throw new RuntimeException('No se pudo crear uploads/products.');
            $base = ug_slug(pathinfo((string)$f['name'], PATHINFO_FILENAME));
            $name = substr($base, 0, 40) . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
            if (!move_uploaded_file($f['tmp_name'], UG_UPLOAD_DIR . '/' . $name)) throw new RuntimeException('No se pudo guardar la foto.');
            @chmod(UG_UPLOAD_DIR . '/' . $name, 0644);
            ug_json(['ok' => true, 'image' => ['src' => UG_UPLOAD_URL . '/' . $name, 'w' => (int)$info[0], 'h' => (int)$info[1]]]);
        }

        default:
            ug_json(['ok' => false, 'error' => 'Acción desconocida'], 404);
    }
} catch (InvalidArgumentException $e) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    ug_json(['ok' => false, 'error' => $e->getMessage()], 422);
} catch (Throwable $e) {
    if (isset($db) && $db instanceof PDO && $db->inTransaction()) $db->rollBack();
    error_log('[ug-admin] ' . $e->getMessage());
    ug_json(['ok' => false, 'error' => 'Error del servidor. ' . ($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : '')], 500);
}
