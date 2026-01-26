<?php
/**
 * Image Upload Handler - ALLAHU-STORE
 * Recibe imágenes WebP y las almacena en el servidor
 * 
 * CONFIGURACIÓN: Cambiar UPLOAD_DIR según tu hosting
 */

// Configuración
define('UPLOAD_DIR', '../uploads/');    // Carpeta de destino
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB máximo
define('ALLOWED_TYPES', ['image/webp', 'image/jpeg', 'image/png']);
define('BASE_URL', '/uploads/');         // URL base para acceder a las imágenes

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

// Crear directorio si no existe
if (!file_exists(UPLOAD_DIR)) {
    if (!mkdir(UPLOAD_DIR, 0755, true)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo crear directorio de uploads']);
        exit();
    }
}

// Verificar que se recibió archivo
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorCode = isset($_FILES['image']) ? $_FILES['image']['error'] : 'No file';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => "Error al recibir archivo: $errorCode"]);
    exit();
}

$file = $_FILES['image'];

// Validar tamaño
if ($file['size'] > MAX_FILE_SIZE) {
    http_response_code(413);
    echo json_encode(['success' => false, 'error' => 'Archivo demasiado grande (máx 5MB)']);
    exit();
}

// Validar tipo MIME
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, ALLOWED_TYPES)) {
    http_response_code(415);
    echo json_encode(['success' => false, 'error' => 'Tipo de archivo no permitido']);
    exit();
}

// Generar nombre único para el archivo
$extension = $mimeType === 'image/webp' ? 'webp' : 
             ($mimeType === 'image/jpeg' ? 'jpg' : 'png');
$fileName = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
$filePath = UPLOAD_DIR . $fileName;

// Mover archivo
if (!move_uploaded_file($file['tmp_name'], $filePath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al guardar archivo']);
    exit();
}

// Resultado
$result = [
    'success' => true,
    'imageUrl' => BASE_URL . $fileName,
    'fileName' => $fileName,
    'size' => $file['size'],
    'mimeType' => $mimeType
];

// Procesar thumbnail si se envió
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $thumbFile = $_FILES['thumbnail'];
    $thumbName = 'thumb_' . time() . '_' . bin2hex(random_bytes(4)) . '.webp';
    $thumbPath = UPLOAD_DIR . $thumbName;
    
    if (move_uploaded_file($thumbFile['tmp_name'], $thumbPath)) {
        $result['thumbnailUrl'] = BASE_URL . $thumbName;
    }
}

http_response_code(200);
echo json_encode($result);
