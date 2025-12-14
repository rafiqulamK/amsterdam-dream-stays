<?php
require_once 'config.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        listMedia();
        break;
    case 'delete':
        deleteMedia();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function listMedia() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM media_library ORDER BY created_at DESC");
        $media = $stmt->fetchAll();
        
        echo json_encode($media);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch media']);
    }
}

function deleteMedia() {
    global $pdo;
    
    // Check if user is admin
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Media ID required']);
        return;
    }
    
    try {
        // Get the file info first
        $stmt = $pdo->prepare("SELECT * FROM media_library WHERE id = ?");
        $stmt->execute([$id]);
        $media = $stmt->fetch();
        
        if (!$media) {
            http_response_code(404);
            echo json_encode(['error' => 'Media not found']);
            return;
        }
        
        // Try to delete the actual file
        $filePath = '../' . $media['file_url'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Delete from database
        $stmt = $pdo->prepare("DELETE FROM media_library WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Media deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete media']);
    }
}
?>
