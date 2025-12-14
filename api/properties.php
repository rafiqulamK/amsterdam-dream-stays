<?php
require_once 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            getProperties();
        } elseif ($action === 'single') {
            getProperty();
        } else {
            getProperties();
        }
        break;
    case 'POST':
        if ($action === 'create') {
            createProperty();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'PUT':
        if ($action === 'update') {
            updateProperty();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'DELETE':
        if ($action === 'delete') {
            deleteProperty();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function getProperties() {
    global $pdo;

    try {
        $status = $_GET['status'] ?? null;
        $limit = min((int)($_GET['limit'] ?? 100), 100);
        $offset = (int)($_GET['offset'] ?? 0);

        $sql = "SELECT p.*, u.full_name as owner_name FROM properties p LEFT JOIN users u ON p.owner_id = u.id";
        $params = [];
        
        // Filter by status for non-admin users
        if (!isAdmin()) {
            $sql .= " WHERE p.status = 'approved'";
        } elseif ($status && $status !== 'all') {
            $sql .= " WHERE p.status = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $properties = $stmt->fetchAll();

        // Parse JSON fields
        foreach ($properties as &$property) {
            $property['images'] = json_decode($property['images'] ?? '[]', true) ?: [];
            $property['videos'] = json_decode($property['videos'] ?? '[]', true) ?: [];
            $property['amenities'] = json_decode($property['amenities'] ?? '[]', true) ?: [];
        }

        echo json_encode($properties);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch properties'], 500);
    }
}

function getProperty() {
    global $pdo;

    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Property ID required'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT p.*, u.full_name as owner_name
            FROM properties p
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $property = $stmt->fetch();

        if (!$property) {
            sendJsonResponse(['error' => 'Property not found'], 404);
        }

        // Check access for non-approved properties
        if ($property['status'] !== 'approved' && !isAdmin() && getCurrentUserId() != $property['owner_id']) {
            sendJsonResponse(['error' => 'Access denied'], 403);
        }

        // Parse JSON fields
        $property['images'] = json_decode($property['images'] ?? '[]', true) ?: [];
        $property['videos'] = json_decode($property['videos'] ?? '[]', true) ?: [];
        $property['amenities'] = json_decode($property['amenities'] ?? '[]', true) ?: [];

        echo json_encode($property);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch property'], 500);
    }
}

function createProperty() {
    global $pdo;

    if (!isAuthenticated()) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    if (!isTenant() && !isAdmin()) {
        sendJsonResponse(['error' => 'Permission denied'], 403);
    }

    $data = getJsonInput();

    if (empty($data['title']) || empty($data['city']) || empty($data['property_type'])) {
        sendJsonResponse(['error' => 'Title, city, and property type are required'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO properties (
                title, description, price, location, city, bedrooms, bathrooms, area,
                property_type, available_from, amenities, images, videos, 
                latitude, longitude, owner_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $status = isAdmin() ? ($data['status'] ?? 'approved') : 'pending';

        $stmt->execute([
            $data['title'],
            $data['description'] ?? '',
            $data['price'] ?? 0,
            $data['location'] ?? '',
            $data['city'],
            $data['bedrooms'] ?? 1,
            $data['bathrooms'] ?? 1,
            $data['area'] ?? 0,
            $data['property_type'],
            $data['available_from'] ?? date('Y-m-d'),
            json_encode($data['amenities'] ?? []),
            json_encode($data['images'] ?? []),
            json_encode($data['videos'] ?? []),
            $data['latitude'] ?? null,
            $data['longitude'] ?? null,
            getCurrentUserId(),
            $status
        ]);

        $propertyId = $pdo->lastInsertId();
        sendJsonResponse(['success' => true, 'id' => $propertyId, 'message' => 'Property created successfully']);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to create property: ' . $e->getMessage()], 500);
    }
}

function updateProperty() {
    global $pdo;

    if (!isAuthenticated()) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    $id = $data['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Property ID required'], 400);
    }

    try {
        // Check ownership or admin permission
        $stmt = $pdo->prepare("SELECT owner_id FROM properties WHERE id = ?");
        $stmt->execute([$id]);
        $property = $stmt->fetch();

        if (!$property) {
            sendJsonResponse(['error' => 'Property not found'], 404);
        }

        $isOwner = $property['owner_id'] == getCurrentUserId();

        if (!$isOwner && !isAdmin()) {
            sendJsonResponse(['error' => 'Permission denied'], 403);
        }

        $fields = [];
        $values = [];
        
        $allowedFields = [
            'title', 'description', 'price', 'location', 'city', 'bedrooms', 
            'bathrooms', 'area', 'property_type', 'available_from', 'status',
            'latitude', 'longitude'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        // Handle JSON fields
        if (isset($data['amenities'])) {
            $fields[] = "amenities = ?";
            $values[] = json_encode($data['amenities']);
        }
        
        if (isset($data['images'])) {
            $fields[] = "images = ?";
            $values[] = json_encode($data['images']);
        }
        
        if (isset($data['videos'])) {
            $fields[] = "videos = ?";
            $values[] = json_encode($data['videos']);
        }

        if (empty($fields)) {
            sendJsonResponse(['error' => 'No fields to update'], 400);
        }

        $fields[] = "updated_at = NOW()";
        $values[] = $id;

        $sql = "UPDATE properties SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);

        sendJsonResponse(['success' => true, 'message' => 'Property updated successfully']);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to update property'], 500);
    }
}

function deleteProperty() {
    global $pdo;

    if (!isAdmin()) {
        sendJsonResponse(['error' => 'Admin access required'], 403);
    }

    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Property ID required'], 400);
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
        $stmt->execute([$id]);

        sendJsonResponse(['success' => true, 'message' => 'Property deleted successfully']);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to delete property'], 500);
    }
}
?>