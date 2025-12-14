<?php
// Database configuration for cPanel hosting
// Update these values OR use environment variables

// Try environment variables first, fallback to direct config
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_name = getenv('DB_NAME') ?: 'amsterdam_dream_stays';
$db_user = getenv('DB_USER') ?: 'root';
$db_pass = getenv('DB_PASS') ?: '';

define('DB_HOST', $db_host);
define('DB_NAME', $db_name);
define('DB_USER', $db_user);
define('DB_PASS', $db_pass);
define('DB_CHARSET', 'utf8mb4');

// Site settings
define('SITE_URL', getenv('SITE_URL') ?: 'https://yourdomain.com');
define('UPLOADS_DIR', __DIR__ . '/../uploads/');
define('UPLOADS_URL', '/uploads/');

// Security settings
define('SESSION_LIFETIME', 86400); // 24 hours

// CORS settings
$allowed_origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://hause.ink',
    'https://www.hause.ink',
    'https://hause.link',
    'https://www.hause.link',
    SITE_URL
];

// Start session with secure settings
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Set CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: " . SITE_URL);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// Helper function to get JSON input
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// Helper function to send JSON response
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
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

// Check if current user is authenticated
function isAuthenticated() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

// Get current user ID
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

// Check if current user has admin role
function isAdmin() {
    global $pdo;
    
    if (!isAuthenticated()) {
        return false;
    }
    
    $userId = getCurrentUserId();
    
    try {
        $stmt = $pdo->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role IN ('admin', 'superadmin')");
        $stmt->execute([$userId]);
        return $stmt->fetch() !== false;
    } catch (PDOException $e) {
        return false;
    }
}

// Check if current user has tenant role
function isTenant() {
    global $pdo;
    
    if (!isAuthenticated()) {
        return false;
    }
    
    $userId = getCurrentUserId();
    
    try {
        $stmt = $pdo->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role IN ('tenant', 'admin', 'superadmin')");
        $stmt->execute([$userId]);
        return $stmt->fetch() !== false;
    } catch (PDOException $e) {
        return false;
    }
}

// Get current user role from database
function getCurrentUserRole() {
    global $pdo;
    if (!isset($_SESSION['user_id'])) return null;
    try {
        $stmt = $pdo->prepare('SELECT role FROM user_roles WHERE user_id = ? ORDER BY FIELD(role, "superadmin", "admin", "tenant", "user") LIMIT 1');
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
    if (!isAdmin()) {
        sendJsonResponse(['error' => 'Admin access required'], 403);
    }
}
?>
