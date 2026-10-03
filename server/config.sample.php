<?php
/**
 * UG Collection — configuración del servidor.
 * 1) Copiá este archivo como config.php (config.php NO se sube a GitHub).
 * 2) Completá los datos de la base MySQL creada en hPanel (Hostinger → Bases de datos).
 * 3) Generá el hash de la contraseña del panel con /server/install.php (te lo muestra) o con:
 *      php -r "echo password_hash('TU-CONTRASEÑA', PASSWORD_DEFAULT);"
 */
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'u000000000_ugcollection',
        'user' => 'u000000000_ug',
        'pass' => 'CAMBIAR',
        'charset' => 'utf8mb4',
    ],

    // Usuario del panel (/admin)
    'admin_user' => 'admin',
    'admin_pass_hash' => '', // pegá acá el hash generado

    // Clave para correr install.php (mín. 12 caracteres). Después de instalar dejala vacía ('') para deshabilitarlo.
    'install_key' => 'CAMBIAR-ESTA-CLAVE',

    // Límite de subida de fotos (MB)
    'max_upload_mb' => 8,
];
