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
            case 'reset_password':
                resetPassword();
                break;
            case 'update_password':
                updatePassword();
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

    $email = sanitizeInput($data['email']);
    $password = $data['password'];

    if (!validateEmail($email)) {
        sendJsonResponse(['error' => 'Invalid email format'], 400);
    }

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

    $email = sanitizeInput($data['email']);
    $password = $data['password'];
    $fullName = sanitizeInput($data['full_name']);

    if (!validateEmail($email)) {
        sendJsonResponse(['error' => 'Invalid email format'], 400);
    }

    if (strlen($password) < 8) {
        sendJsonResponse(['error' => 'Password must be at least 8 characters'], 400);
    }

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

function resetPassword() {
    global $pdo;

    $data = getJsonInput();
    validateRequired($data, ['email']);

    $email = sanitizeInput($data['email']);

    if (!validateEmail($email)) {
        sendJsonResponse(['error' => 'Invalid email format'], 400);
    }

    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id, email, full_name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            // Don't reveal if user exists or not for security
            sendJsonResponse(['success' => true, 'message' => 'If an account exists with this email, you will receive reset instructions.']);
        }

        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Store reset token (you may need to create a password_resets table)
        // For now, we'll use session-based reset for simplicity
        $_SESSION['reset_token'] = $token;
        $_SESSION['reset_email'] = $email;
        $_SESSION['reset_expiry'] = $expiry;

        // In production, send email with reset link
        // For now, return success (admin can manually reset passwords)
        sendJsonResponse([
            'success' => true, 
            'message' => 'Password reset instructions sent. Please contact admin at sunjida@hause.ink if you need immediate assistance.'
        ]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Password reset failed'], 500);
    }
}

function updatePassword() {
    global $pdo;

    // Must be authenticated
    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    validateRequired($data, ['password']);

    $newPassword = $data['password'];
    $currentPassword = $data['current_password'] ?? null;

    if (strlen($newPassword) < 8) {
        sendJsonResponse(['error' => 'Password must be at least 8 characters'], 400);
    }

    try {
        $userId = $_SESSION['user_id'];

        // If current password provided, verify it
        if ($currentPassword) {
            $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
                sendJsonResponse(['error' => 'Current password is incorrect'], 401);
            }
        }

        // Update password
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$passwordHash, $userId]);

        sendJsonResponse(['success' => true, 'message' => 'Password updated successfully']);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Password update failed'], 500);
    }
}
?>
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