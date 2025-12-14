<?php
require_once 'config.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'list':
        listPages();
        break;
    case 'single':
        getPage();
        break;
    case 'create':
        createPage();
        break;
    case 'update':
        updatePage();
        break;
    case 'delete':
        deletePage();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function listPages() {
    global $pdo;
    
    try {
        $isAdmin = isAdmin();
        
        if ($isAdmin) {
            $stmt = $pdo->query("SELECT * FROM pages ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->query("SELECT * FROM pages WHERE is_published = 1 ORDER BY created_at DESC");
        }
        
        $pages = $stmt->fetchAll();
        echo json_encode($pages);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch pages']);
    }
}

function getPage() {
    global $pdo;
    
    $slug = $_GET['slug'] ?? '';
    
    if (empty($slug)) {
        http_response_code(400);
        echo json_encode(['error' => 'Page slug required']);
        return;
    }
    
    try {
        $isAdmin = isAdmin();
        
        if ($isAdmin) {
            $stmt = $pdo->prepare("SELECT * FROM pages WHERE slug = ?");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM pages WHERE slug = ? AND is_published = 1");
        }
        
        $stmt->execute([$slug]);
        $page = $stmt->fetch();
        
        if (!$page) {
            http_response_code(404);
            echo json_encode(['error' => 'Page not found']);
            return;
        }
        
        echo json_encode($page);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch page']);
    }
}

function createPage() {
    global $pdo;
    
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['title']) || empty($data['slug'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title and slug are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO pages (title, slug, content, meta_title, meta_description, featured_image, is_published)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['content'] ?? '',
            $data['meta_title'] ?? $data['title'],
            $data['meta_description'] ?? '',
            $data['featured_image'] ?? '',
            $data['is_published'] ?? false
        ]);
        
        $id = $pdo->lastInsertId();
        
        echo json_encode(['success' => true, 'id' => $id, 'message' => 'Page created successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create page: ' . $e->getMessage()]);
    }
}

function updatePage() {
    global $pdo;
    
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Page ID required']);
        return;
    }
    
    try {
        $fields = [];
        $values = [];
        
        $allowedFields = ['title', 'slug', 'content', 'meta_title', 'meta_description', 'featured_image', 'is_published'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }
        
        $values[] = $data['id'];
        
        $sql = "UPDATE pages SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        echo json_encode(['success' => true, 'message' => 'Page updated successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update page']);
    }
}

function deletePage() {
    global $pdo;
    
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Page ID required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM pages WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Page deleted successfully']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete page']);
    }
}
?>
