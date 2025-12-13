<?php
// Start secure session
session_start();
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');

// CORS configuration - restrict to allowed origins
$allowed_origins = [
    'https://hause.ink',
    'https://www.hause.ink',
    'https://hause.link',
    'https://www.hause.link',
    'http://localhost:5173',
    'http://localhost:8080'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database configuration - require environment variables
$db_host = getenv('DB_HOST');
$db_name = getenv('DB_NAME');
$db_user = getenv('DB_USER');
$db_pass = getenv('DB_PASS');

if (!$db_host || !$db_name || !$db_user || !$db_pass) {
    http_response_code(500);
    echo json_encode(['error' => 'Database configuration missing']);
    exit;
}

define('DB_HOST', $db_host);
define('DB_NAME', $db_name);
define('DB_USER', $db_user);
define('DB_PASS', $db_pass);

// Create database connection
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Helper function to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Helper function to validate required fields
function validateRequired($data, $requiredFields) {
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            sendJsonResponse(['error' => "Missing required field: $field"], 400);
        }
    }
}

// Input sanitization helper
function sanitizeInput($input, $maxLength = 255) {
    if (!is_string($input)) return '';
    return htmlspecialchars(substr(trim($input), 0, $maxLength), ENT_QUOTES, 'UTF-8');
}

// Email validation helper
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// UUID validation helper
function validateUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
}

// Get current user role from database (not session)
function getCurrentUserRole() {
    global $pdo;
    if (!isset($_SESSION['user_id'])) return null;
    try {
        $stmt = $pdo->prepare('SELECT role FROM user_roles WHERE user_id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        return $stmt->fetchColumn();
    } catch (Exception $e) {
        return null;
    }
}

// Check if user has specific role
function hasRole($role) {
    return getCurrentUserRole() === $role;
}

// Require authentication
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }
}

// Require admin role
function requireAdmin() {
    requireAuth();
    if (!hasRole('admin')) {
        sendJsonResponse(['error' => 'Admin access required'], 403);
    }
}
?>
