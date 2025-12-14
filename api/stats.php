<?php
require_once 'config.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'all':
        getStats();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

function getStats() {
    global $pdo;
    
    // Check if user is admin
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        return;
    }
    
    try {
        // Total properties
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM properties");
        $totalProperties = $stmt->fetch()['count'];
        
        // Pending properties
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM properties WHERE status = 'pending'");
        $pendingProperties = $stmt->fetch()['count'];
        
        // Total bookings
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM bookings");
        $totalBookings = $stmt->fetch()['count'];
        
        // Total leads
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM leads");
        $totalLeads = $stmt->fetch()['count'];
        
        // New leads (last 7 days)
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM leads WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $newLeads = $stmt->fetch()['count'];
        
        // Approved properties
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM properties WHERE status = 'approved'");
        $approvedProperties = $stmt->fetch()['count'];
        
        echo json_encode([
            'totalProperties' => (int)$totalProperties,
            'pendingProperties' => (int)$pendingProperties,
            'approvedProperties' => (int)$approvedProperties,
            'totalBookings' => (int)$totalBookings,
            'totalLeads' => (int)$totalLeads,
            'newLeads' => (int)$newLeads
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch statistics']);
    }
}
?>
