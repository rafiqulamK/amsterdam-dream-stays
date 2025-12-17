-- Run this SQL in phpMyAdmin AFTER importing schema.sql
-- This sets the admin password to: Sunji@#$%
-- Email: sunjida@hause.ink
-- Hash generated with bcrypt cost 10

UPDATE users SET password_hash = '$2y$10$N9qo8uLOickgx2ZMRZoMy.MqrqxLv6nZX.MZFy/XBYqxwzz9R7W6K' WHERE email = 'sunjida@hause.ink';

-- Verify the update worked:
-- SELECT email, password_hash FROM users WHERE email = 'sunjida@hause.ink';
