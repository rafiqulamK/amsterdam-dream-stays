<?php
require_once 'config.php';

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
        $status = $_GET['status'] ?? 'approved';
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);

        $stmt = $pdo->prepare("
            SELECT p.*, u.full_name as owner_name
            FROM properties p
            LEFT JOIN users u ON p.owner_id = u.id
            WHERE p.status = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$status, $limit, $offset]);
        $properties = $stmt->fetchAll();

        // Get total count
        $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM properties WHERE status = ?");
        $stmt->execute([$status]);
        $total = $stmt->fetch()['total'];

        sendJsonResponse([
            'properties' => $properties,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
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

        sendJsonResponse(['property' => $property]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch property'], 500);
    }
}

function createProperty() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    validateRequired($data, ['title', 'description', 'price', 'location', 'bedrooms', 'bathrooms', 'area']);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO properties (
                title, description, price, location, city, bedrooms, bathrooms, area,
                property_type, available_from, amenities, images, videos, owner_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['price'],
            $data['location'],
            $data['city'] ?? '',
            $data['bedrooms'],
            $data['bathrooms'],
            $data['area'],
            $data['property_type'] ?? 'apartment',
            $data['available_from'] ?? date('Y-m-d'),
            json_encode($data['amenities'] ?? []),
            json_encode($data['images'] ?? []),
            json_encode($data['videos'] ?? []),
            $_SESSION['user_id'],
            $data['status'] ?? 'pending'
        ]);

        $propertyId = $pdo->lastInsertId();
        sendJsonResponse(['success' => true, 'property_id' => $propertyId]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to create property'], 500);
    }
}

function updateProperty() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
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

        $isOwner = $property['owner_id'] == $_SESSION['user_id'];
        $isAdmin = in_array($_SESSION['user_role'] ?? 'user', ['admin', 'superadmin']);

        if (!$isOwner && !$isAdmin) {
            sendJsonResponse(['error' => 'Permission denied'], 403);
        }

        $stmt = $pdo->prepare("
            UPDATE properties SET
                title = ?, description = ?, price = ?, location = ?, city = ?,
                bedrooms = ?, bathrooms = ?, area = ?, property_type = ?,
                available_from = ?, amenities = ?, images = ?, videos = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $data['title'] ?? $property['title'],
            $data['description'] ?? $property['description'],
            $data['price'] ?? $property['price'],
            $data['location'] ?? $property['location'],
            $data['city'] ?? $property['city'],
            $data['bedrooms'] ?? $property['bedrooms'],
            $data['bathrooms'] ?? $property['bathrooms'],
            $data['area'] ?? $property['area'],
            $data['property_type'] ?? $property['property_type'],
            $data['available_from'] ?? $property['available_from'],
            json_encode($data['amenities'] ?? json_decode($property['amenities'], true)),
            json_encode($data['images'] ?? json_decode($property['images'], true)),
            json_encode($data['videos'] ?? json_decode($property['videos'], true)),
            $id
        ]);

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to update property'], 500);
    }
}

function deleteProperty() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $id = $_GET['id'] ?? '';
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

        $isOwner = $property['owner_id'] == $_SESSION['user_id'];
        $isAdmin = in_array($_SESSION['user_role'] ?? 'user', ['admin', 'superadmin']);

        if (!$isOwner && !$isAdmin) {
            sendJsonResponse(['error' => 'Permission denied'], 403);
        }

        $stmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
        $stmt->execute([$id]);

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to delete property'], 500);
    }
}
?>