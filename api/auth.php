<?php
require_once 'config.php';

// Session is already started in config.php with secure settings

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'POST':
        switch ($action) {
            case 'login':
                login();
                break;
            case 'register':
                register();
                break;
            case 'logout':
                logout();
                break;
            default:
                sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'GET':
        switch ($action) {
            case 'user':
                getUser();
                break;
            default:
                sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function login() {
    global $pdo;

    $data = getJsonInput();
    validateRequired($data, ['email', 'password']);

    $email = $data['email'];
    $password = $data['password'];

    try {
        $stmt = $pdo->prepare("SELECT id, email, password_hash, full_name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['full_name'];

            // Get user role
            $stmt = $pdo->prepare("SELECT role FROM user_roles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$user['id']]);
            $role = $stmt->fetch();

            $_SESSION['user_role'] = $role ? $role['role'] : 'user';

            sendJsonResponse([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'role' => $_SESSION['user_role']
                ]
            ]);
        } else {
            sendJsonResponse(['error' => 'Invalid credentials'], 401);
        }
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Login failed'], 500);
    }
}

function register() {
    global $pdo;

    $data = getJsonInput();
    validateRequired($data, ['email', 'password', 'full_name']);

    $email = $data['email'];
    $password = $data['password'];
    $fullName = $data['full_name'];

    try {
        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            sendJsonResponse(['error' => 'User already exists'], 409);
        }

        // Create user
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)");
        $stmt->execute([$email, $passwordHash, $fullName]);

        $userId = $pdo->lastInsertId();

        // Create default role
        $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'user')");
        $stmt->execute([$userId]);

        sendJsonResponse(['success' => true, 'message' => 'User registered successfully']);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Registration failed'], 500);
    }
}

function logout() {
    session_destroy();
    sendJsonResponse(['success' => true]);
}

function getUser() {
    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['user' => null]);
    }

    sendJsonResponse([
        'user' => [
            'id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'full_name' => $_SESSION['user_name'],
            'role' => $_SESSION['user_role'] ?? 'user'
        ]
    ]);
}
?>