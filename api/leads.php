<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            getLeads();
        } elseif ($action === 'single') {
            getLead();
        } else {
            getLeads();
        }
        break;
    case 'POST':
        if ($action === 'create') {
            createLead();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'PUT':
        if ($action === 'update') {
            updateLead();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'DELETE':
        if ($action === 'delete') {
            deleteLead();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function getLeads() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    try {
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        if (!$isAdmin) {
            sendJsonResponse(['error' => 'Admin access required'], 403);
        }

        $stmt = $pdo->prepare("
            SELECT l.*, p.title as property_title
            FROM leads l
            LEFT JOIN properties p ON l.property_id = p.id
            ORDER BY l.created_at DESC
        ");
        $stmt->execute();

        $leads = $stmt->fetchAll();
        sendJsonResponse(['leads' => $leads]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch leads'], 500);
    }
}

function getLead() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Lead ID required'], 400);
    }

    try {
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        if (!$isAdmin) {
            sendJsonResponse(['error' => 'Admin access required'], 403);
        }

        $stmt = $pdo->prepare("
            SELECT l.*, p.title as property_title
            FROM leads l
            LEFT JOIN properties p ON l.property_id = p.id
            WHERE l.id = ?
        ");
        $stmt->execute([$id]);

        $lead = $stmt->fetch();

        if (!$lead) {
            sendJsonResponse(['error' => 'Lead not found'], 404);
        }

        sendJsonResponse(['lead' => $lead]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch lead'], 500);
    }
}

function createLead() {
    global $pdo;

    $data = getJsonInput();
    validateRequired($data, ['name', 'email', 'message']);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO leads (
                name, email, phone, message, property_id, desired_location,
                desired_move_date, price_range, bedroom_preference, people_count,
                property_type_preference, employment_status, has_pets, has_criminal_history,
                first_name, last_name, source, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'] ?? null,
            $data['message'],
            $data['property_id'] ?? null,
            $data['desired_location'] ?? null,
            $data['desired_move_date'] ?? null,
            $data['price_range'] ?? null,
            $data['bedroom_preference'] ?? null,
            $data['people_count'] ?? null,
            $data['property_type_preference'] ?? null,
            $data['employment_status'] ?? null,
            $data['has_pets'] ?? null,
            $data['has_criminal_history'] ?? null,
            $data['first_name'] ?? null,
            $data['last_name'] ?? null,
            $data['source'] ?? 'website',
            $data['status'] ?? 'new'
        ]);

        $leadId = $pdo->lastInsertId();
        sendJsonResponse(['success' => true, 'lead_id' => $leadId]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to create lead'], 500);
    }
}

function updateLead() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    $id = $data['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Lead ID required'], 400);
    }

    try {
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        if (!$isAdmin) {
            sendJsonResponse(['error' => 'Admin access required'], 403);
        }

        $stmt = $pdo->prepare("
            UPDATE leads SET
                name = ?, email = ?, phone = ?, message = ?, property_id = ?,
                desired_location = ?, desired_move_date = ?, price_range = ?,
                bedroom_preference = ?, people_count = ?, property_type_preference = ?,
                employment_status = ?, has_pets = ?, has_criminal_history = ?,
                first_name = ?, last_name = ?, source = ?, status = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $data['name'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['message'] ?? null,
            $data['property_id'] ?? null,
            $data['desired_location'] ?? null,
            $data['desired_move_date'] ?? null,
            $data['price_range'] ?? null,
            $data['bedroom_preference'] ?? null,
            $data['people_count'] ?? null,
            $data['property_type_preference'] ?? null,
            $data['employment_status'] ?? null,
            $data['has_pets'] ?? null,
            $data['has_criminal_history'] ?? null,
            $data['first_name'] ?? null,
            $data['last_name'] ?? null,
            $data['source'] ?? null,
            $data['status'] ?? null,
            $id
        ]);

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to update lead'], 500);
    }
}

function deleteLead() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Lead ID required'], 400);
    }

    try {
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        if (!$isAdmin) {
            sendJsonResponse(['error' => 'Admin access required'], 403);
        }

        $stmt = $pdo->prepare("DELETE FROM leads WHERE id = ?");
        $stmt->execute([$id]);

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to delete lead'], 500);
    }
}
?>