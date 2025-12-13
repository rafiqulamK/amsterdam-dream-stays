<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'get') {
            getSetting();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'POST':
        if ($action === 'update') {
            updateSetting();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function getSetting() {
    global $pdo;

    $key = $_GET['key'] ?? '';
    if (empty($key)) {
        sendJsonResponse(['error' => 'Setting key required'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $setting = $stmt->fetch();

        if (!$setting) {
            sendJsonResponse(['error' => 'Setting not found'], 404);
        }

        // Parse JSON value
        $value = json_decode($setting['setting_value'], true);
        sendJsonResponse(['value' => $value]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch setting'], 500);
    }
}

function updateSetting() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    validateRequired($data, ['key', 'value']);

    $key = $data['key'];
    $value = json_encode($data['value']);

    try {
        // Check if setting exists
        $stmt = $pdo->prepare("SELECT id FROM site_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $existing = $stmt->fetch();

        if ($existing) {
            $stmt = $pdo->prepare("
                UPDATE site_settings SET
                    setting_value = ?,
                    updated_by = ?,
                    updated_at = NOW()
                WHERE setting_key = ?
            ");
            $stmt->execute([$value, $_SESSION['user_id'], $key]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO site_settings (setting_key, setting_value, updated_by)
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$key, $value, $_SESSION['user_id']]);
        }

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to update setting'], 500);
    }
}
?>