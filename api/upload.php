<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJsonResponse(['error' => 'Method not allowed'], 405);
}

// Use the requireAuth helper from config.php
requireAuth();

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
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    uploadFile($uploadDir, $allowedTypes, $allowedExtensions, $maxSize, 'image');
}

function uploadVideo() {
    $uploadDir = '../uploads/videos/';
    $allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    $allowedExtensions = ['mp4', 'webm', 'ogg'];
    $maxSize = 50 * 1024 * 1024; // 50MB

    uploadFile($uploadDir, $allowedTypes, $allowedExtensions, $maxSize, 'video');
}

function uploadFile($uploadDir, $allowedTypes, $allowedExtensions, $maxSize, $type) {
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

    // Server-side MIME type detection (don't trust client)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $actualMimeType = $finfo->file($file['tmp_name']);
    
    if (!in_array($actualMimeType, $allowedTypes)) {
        sendJsonResponse(['error' => 'Invalid file type'], 400);
    }

    // Validate file extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions)) {
        sendJsonResponse(['error' => 'Invalid file extension'], 400);
    }

    // For images, verify it's actually an image
    if ($type === 'image') {
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            sendJsonResponse(['error' => 'Invalid image file'], 400);
        }
    }

    // Generate unique filename with sanitized extension
    $filename = bin2hex(random_bytes(16)) . '_' . time() . '.' . $extension;
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
                sanitizeInput($filename, 255),
                '/uploads/' . ($type === 'image' ? 'images/' : 'videos/') . $filename,
                $actualMimeType,
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
