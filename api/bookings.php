<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'list') {
            getBookings();
        } elseif ($action === 'single') {
            getBooking();
        } else {
            getBookings();
        }
        break;
    case 'POST':
        if ($action === 'create') {
            createBooking();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'PUT':
        if ($action === 'update') {
            updateBooking();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    case 'DELETE':
        if ($action === 'delete') {
            deleteBooking();
        } else {
            sendJsonResponse(['error' => 'Invalid action'], 400);
        }
        break;
    default:
        sendJsonResponse(['error' => 'Method not allowed'], 405);
}

function getBookings() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        if ($isAdmin) {
            $stmt = $pdo->prepare("
                SELECT b.*, p.title as property_title, u.email as user_email, u.full_name as user_name
                FROM bookings b
                LEFT JOIN properties p ON b.property_id = p.id
                LEFT JOIN users u ON b.user_id = u.id
                ORDER BY b.created_at DESC
            ");
            $stmt->execute();
        } else {
            $stmt = $pdo->prepare("
                SELECT b.*, p.title as property_title
                FROM bookings b
                LEFT JOIN properties p ON b.property_id = p.id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC
            ");
            $stmt->execute([$userId]);
        }

        $bookings = $stmt->fetchAll();
        sendJsonResponse(['bookings' => $bookings]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch bookings'], 500);
    }
}

function getBooking() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Booking ID required'], 400);
    }

    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        if ($isAdmin) {
            $stmt = $pdo->prepare("
                SELECT b.*, p.title as property_title, u.email as user_email, u.full_name as user_name
                FROM bookings b
                LEFT JOIN properties p ON b.property_id = p.id
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.id = ?
            ");
            $stmt->execute([$id]);
        } else {
            $stmt = $pdo->prepare("
                SELECT b.*, p.title as property_title
                FROM bookings b
                LEFT JOIN properties p ON b.property_id = p.id
                WHERE b.id = ? AND b.user_id = ?
            ");
            $stmt->execute([$id, $userId]);
        }

        $booking = $stmt->fetch();

        if (!$booking) {
            sendJsonResponse(['error' => 'Booking not found'], 404);
        }

        sendJsonResponse(['booking' => $booking]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to fetch booking'], 500);
    }
}

function createBooking() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    validateRequired($data, ['property_id', 'start_date', 'end_date', 'guest_name', 'guest_email', 'guest_phone']);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO bookings (
                property_id, user_id, start_date, end_date, guest_name, guest_email,
                guest_phone, total_price, message, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['property_id'],
            $_SESSION['user_id'],
            $data['start_date'],
            $data['end_date'],
            $data['guest_name'],
            $data['guest_email'],
            $data['guest_phone'],
            $data['total_price'] ?? 0,
            $data['message'] ?? '',
            $data['status'] ?? 'pending'
        ]);

        $bookingId = $pdo->lastInsertId();
        sendJsonResponse(['success' => true, 'booking_id' => $bookingId]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to create booking'], 500);
    }
}

function updateBooking() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $data = getJsonInput();
    $id = $data['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Booking ID required'], 400);
    }

    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        // Check ownership
        $stmt = $pdo->prepare("SELECT user_id FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            sendJsonResponse(['error' => 'Booking not found'], 404);
        }

        if ($booking['user_id'] != $userId && !$isAdmin) {
            sendJsonResponse(['error' => 'Permission denied'], 403);
        }

        $stmt = $pdo->prepare("
            UPDATE bookings SET
                start_date = ?, end_date = ?, guest_name = ?, guest_email = ?,
                guest_phone = ?, total_price = ?, message = ?, status = ?,
                updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->execute([
            $data['start_date'] ?? $booking['start_date'],
            $data['end_date'] ?? $booking['end_date'],
            $data['guest_name'] ?? $booking['guest_name'],
            $data['guest_email'] ?? $booking['guest_email'],
            $data['guest_phone'] ?? $booking['guest_phone'],
            $data['total_price'] ?? $booking['total_price'],
            $data['message'] ?? $booking['message'],
            $data['status'] ?? $booking['status'],
            $id
        ]);

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to update booking'], 500);
    }
}

function deleteBooking() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        sendJsonResponse(['error' => 'Authentication required'], 401);
    }

    $id = $_GET['id'] ?? '';
    if (empty($id)) {
        sendJsonResponse(['error' => 'Booking ID required'], 400);
    }

    try {
        $userId = $_SESSION['user_id'];
        $userRole = $_SESSION['user_role'] ?? 'user';
        $isAdmin = in_array($userRole, ['admin', 'superadmin']);

        // Check ownership
        $stmt = $pdo->prepare("SELECT user_id FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            sendJsonResponse(['error' => 'Booking not found'], 404);
        }

        if ($booking['user_id'] != $userId && !$isAdmin) {
            sendJsonResponse(['error' => 'Permission denied'], 403);
        }

        $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->execute([$id]);

        sendJsonResponse(['success' => true]);
    } catch (Exception $e) {
        sendJsonResponse(['error' => 'Failed to delete booking'], 500);
    }
}
?>