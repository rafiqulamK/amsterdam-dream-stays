<?php
/**
 * Admin Password Setup Script
 * Run this ONCE after deployment to set the admin password
 * Then DELETE this file for security
 * 
 * Admin Email: sunjida@hause.ink
 * Admin Password: Sunji@#$%
 */

// Database configuration - matches your cPanel setup
$host = 'localhost';
$dbname = 'hause_inksun';
$username = 'hause_sunjida';
$password = 'Pjokjict4@#$%';

// Admin credentials
$adminEmail = 'sunjida@hause.ink';
$adminPassword = 'Sunji@#$%';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Generate bcrypt hash
    $passwordHash = password_hash($adminPassword, PASSWORD_DEFAULT);
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Update existing user
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
        $stmt->execute([$passwordHash, $adminEmail]);
        echo "<h2 style='color: green;'>✓ Admin password updated successfully!</h2>";
    } else {
        // Create new admin user
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, 'Super Admin')");
        $stmt->execute([$adminEmail, $passwordHash]);
        $userId = $pdo->lastInsertId();
        
        // Add admin roles
        $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'admin')");
        $stmt->execute([$userId]);
        $stmt = $pdo->prepare("INSERT INTO user_roles (user_id, role) VALUES (?, 'superadmin')");
        $stmt->execute([$userId]);
        
        echo "<h2 style='color: green;'>✓ Admin user created successfully!</h2>";
    }
    
    echo "<p><strong>Email:</strong> $adminEmail</p>";
    echo "<p><strong>Password:</strong> $adminPassword</p>";
    echo "<p style='color: red; font-weight: bold;'>⚠️ DELETE THIS FILE IMMEDIATELY after verifying login works!</p>";
    echo "<p>Go to: <a href='/admin'>/admin</a> to test login</p>";
    
} catch (PDOException $e) {
    echo "<h2 style='color: red;'>Error: " . htmlspecialchars($e->getMessage()) . "</h2>";
}
?>
