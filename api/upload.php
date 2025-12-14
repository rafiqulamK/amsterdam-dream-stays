<?php
require_once 'config.php';

header('Content-Type: application/json');

// Only allow POST requests for file upload
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $error = $_FILES['file']['error'] ?? 'No file uploaded';
    sendJsonResponse(['error' => 'File upload failed: ' . $error], 400);
}

$file = $_FILES['file'];
$folder = sanitizeInput($_POST['folder'] ?? 'uploads', 50);

// Validate folder name
$allowedFolders = ['uploads', 'media', 'properties', 'branding', 'avatars', 'images', 'videos'];
if (!in_array($folder, $allowedFolders)) {
    $folder = 'uploads';
}

// Allowed file types
$allowedTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/gif' => 'gif',
    'image/webp' => 'webp',
    'video/mp4' => 'mp4',
    'video/webm' => 'webm',
    'application/pdf' => 'pdf'
];

// Validate file type using server-side detection
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($file['tmp_name']);

if (!array_key_exists($mimeType, $allowedTypes)) {
    sendJsonResponse(['error' => 'File type not allowed: ' . $mimeType], 400);
}

// Max file size (10MB for images, 50MB for videos)
$isVideo = strpos($mimeType, 'video/') === 0;
$maxSize = $isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;

if ($file['size'] > $maxSize) {
    sendJsonResponse(['error' => 'File too large. Maximum size is ' . ($isVideo ? '50MB' : '10MB')], 400);
}

// For images, verify it's actually an image
if (strpos($mimeType, 'image/') === 0) {
    $imageInfo = @getimagesize($file['tmp_name']);
    if ($imageInfo === false) {
        sendJsonResponse(['error' => 'Invalid image file'], 400);
    }
}

// Create upload directory if it doesn't exist
$uploadDir = dirname(__DIR__) . '/uploads/' . $folder . '/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = $allowedTypes[$mimeType];
$filename = time() . '-' . bin2hex(random_bytes(8)) . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    sendJsonResponse(['error' => 'Failed to save file'], 500);
}

// Generate public URL
$publicUrl = '/uploads/' . $folder . '/' . $filename;

// Save to media library if it's an image and user is authenticated
if (strpos($mimeType, 'image/') === 0 && isAuthenticated()) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO media_library (file_name, file_url, file_type, file_size, uploaded_by)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $file['name'],
            $publicUrl,
            $mimeType,
            $file['size'],
            getCurrentUserId()
        ]);
    } catch (PDOException $e) {
        // Log error but don't fail the upload
        error_log('Failed to save to media library: ' . $e->getMessage());
    }
}

// Return success response
echo json_encode([
    'success' => true,
    'file_url' => $publicUrl,
    'url' => $publicUrl,
    'file_name' => $file['name'],
    'file_type' => $mimeType,
    'file_size' => $file['size']
]);
?>
