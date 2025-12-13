<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_SESSION['user_id'])) {
    sendJsonResponse(['error' => 'Authentication required'], 401);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'image':
        uploadImage();
        break;
    case 'video':
        uploadVideo();
        break;
    default:
        sendJsonResponse(['error' => 'Invalid action'], 400);
}

function uploadImage() {
    $uploadDir = '../uploads/images/';
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    uploadFile($uploadDir, $allowedTypes, $maxSize, 'image');
}

function uploadVideo() {
    $uploadDir = '../uploads/videos/';
    $allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    $maxSize = 50 * 1024 * 1024; // 50MB

    uploadFile($uploadDir, $allowedTypes, $maxSize, 'video');
}

function uploadFile($uploadDir, $allowedTypes, $maxSize, $type) {
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    if (!isset($_FILES['file'])) {
        sendJsonResponse(['error' => 'No file uploaded'], 400);
    }

    $file = $_FILES['file'];

    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        sendJsonResponse(['error' => 'Upload failed'], 400);
    }

    // Check file size
    if ($file['size'] > $maxSize) {
        sendJsonResponse(['error' => 'File too large'], 400);
    }

    // Check file type
    if (!in_array($file['type'], $allowedTypes)) {
        sendJsonResponse(['error' => 'Invalid file type'], 400);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        // Save to database
        global $pdo;
        try {
            $stmt = $pdo->prepare("
                INSERT INTO media_library (file_name, file_url, file_type, file_size, uploaded_by)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $filename,
                '/uploads/' . ($type === 'image' ? 'images/' : 'videos/') . $filename,
                $file['type'],
                $file['size'],
                $_SESSION['user_id']
            ]);

            $mediaId = $pdo->lastInsertId();

            sendJsonResponse([
                'success' => true,
                'file_url' => '/uploads/' . ($type === 'image' ? 'images/' : 'videos/') . $filename,
                'media_id' => $mediaId
            ]);
        } catch (Exception $e) {
            // Delete file if database insert fails
            unlink($filepath);
            sendJsonResponse(['error' => 'Database error'], 500);
        }
    } else {
        sendJsonResponse(['error' => 'Failed to save file'], 500);
    }
}
?>