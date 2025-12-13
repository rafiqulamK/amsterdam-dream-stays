<?php
// Generate bcrypt hash for admin password
$password = 'Sunji@#$%';
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Password: $password\n";
echo "Hash: $hash\n";
?>