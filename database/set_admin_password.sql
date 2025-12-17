-- Run this SQL in phpMyAdmin AFTER importing schema.sql
-- This sets the admin password to: admin123
-- Hash: $2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa

UPDATE users SET password_hash = '$2y$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa' WHERE email = 'sunjida@hause.ink';

-- Verify the update worked:
-- SELECT email, password_hash FROM users WHERE email = 'sunjida@hause.ink';
