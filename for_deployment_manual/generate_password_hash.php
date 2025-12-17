<?php
// Run this file on your server to generate the correct password hash
// Upload to cPanel, visit it in browser, copy the hash, then delete the file

$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Password: $password\n";
echo "Hash: $hash\n";
echo "\n";
echo "Use this SQL to update the admin password:\n";
echo "UPDATE users SET password_hash = '$hash' WHERE email = 'sunjida@hause.ink';\n";
?>
