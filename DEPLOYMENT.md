# Hause.ink - Complete cPanel Deployment Guide

> **Version:** 2.0  
> **Last Updated:** December 2024  
> **Target Domain:** hause.ink

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5-Minute Setup)](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Database Setup](#database-setup)
5. [Admin Account Configuration](#admin-account-configuration)
6. [File Permissions](#file-permissions)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)
9. [Security Checklist](#security-checklist)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] cPanel access to your hosting account
- [ ] MySQL database access (phpMyAdmin)
- [ ] FTP/File Manager access
- [ ] SSL certificate installed (recommended)
- [ ] PHP 7.4+ with PDO extension enabled

---

## Quick Start

**For experienced users - complete setup in 5 steps:**

1. **Upload:** Extract deployment files to `public_html/`
2. **Database:** Create MySQL database and import `database/schema.sql`
3. **Configure:** Edit `api/config.php` with database credentials
4. **Password:** Run `set_admin_password.php` once, then DELETE it
5. **Login:** Access `/admin` with credentials below

### Default Admin Credentials
```
Email:    sunjida@hause.ink
Password: Sunji@#$%
```

⚠️ **CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN**

---

## Detailed Installation

### Step 1: Prepare Deployment Package

Build the deployment package locally:

```bash
# Clone/download the project
cd your-project-directory

# Install dependencies and build
npm install
npm run build

# The dist/ folder contains the built frontend
```

### Step 2: Upload Files to cPanel

**Method A: File Manager (Recommended)**

1. Login to cPanel
2. Open **File Manager**
3. Navigate to `public_html/`
4. Upload the following:
   - All files from `dist/` folder
   - `api/` folder (entire directory)
   - `database/` folder (entire directory)
   - `for_deployment_manual/set_admin_password.php`

**Method B: FTP Upload**

```
Host: ftp.hause.ink (or your domain)
Username: Your cPanel username
Password: Your cPanel password
Port: 21
Remote directory: /public_html
```

### Step 3: Directory Structure

After upload, your `public_html/` should look like:

```
public_html/
├── api/
│   ├── config.php
│   ├── auth.php
│   ├── bookings.php
│   ├── leads.php
│   ├── media.php
│   ├── pages.php
│   ├── properties.php
│   ├── settings.php
│   ├── stats.php
│   └── upload.php
├── database/
│   └── schema.sql
├── uploads/
│   ├── images/
│   ├── media/
│   └── properties/
├── assets/
│   └── (built JS/CSS files)
├── index.html
├── .htaccess
└── set_admin_password.php (temporary)
```

---

## Database Setup

### Step 1: Create Database

1. In cPanel, open **MySQL Databases**
2. Create new database: `hause_production` (or your preferred name)
3. Create database user with a strong password
4. Add user to database with **ALL PRIVILEGES**

### Step 2: Import Schema

1. Open **phpMyAdmin** in cPanel
2. Select your database
3. Click **Import** tab
4. Choose `database/schema.sql`
5. Click **Go**

### Step 3: Configure Connection

Edit `api/config.php`:

```php
<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Site Configuration
define('SITE_URL', 'https://hause.ink');
define('ADMIN_EMAIL', 'sunjida@hause.ink');

// Security
define('JWT_SECRET', 'generate-a-random-64-character-string-here');

// Upload settings
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB
```

---

## Admin Account Configuration

### Method 1: Run Setup Script (Recommended)

1. Upload `for_deployment_manual/set_admin_password.php` to `public_html/`
2. Visit: `https://hause.ink/set_admin_password.php`
3. You should see: "Admin password set successfully!"
4. **IMMEDIATELY DELETE** the file via File Manager

### Method 2: Manual Database Entry

Run this SQL in phpMyAdmin:

```sql
-- Update admin password (hash for: Sunji@#$%)
UPDATE users 
SET password_hash = '$2y$10$your_bcrypt_hash_here'
WHERE email = 'sunjida@hause.ink';
```

Generate hash using PHP:
```php
echo password_hash('Sunji@#$%', PASSWORD_BCRYPT);
```

---

## File Permissions

Set correct permissions via cPanel File Manager or SSH:

```bash
# Directories
chmod 755 public_html/
chmod 755 public_html/api/
chmod 755 public_html/uploads/
chmod 755 public_html/uploads/images/
chmod 755 public_html/uploads/media/
chmod 755 public_html/uploads/properties/

# Files
chmod 644 public_html/api/config.php
chmod 644 public_html/.htaccess
chmod 644 public_html/index.html
```

---

## Testing & Verification

### Checklist

- [ ] **Homepage loads:** `https://hause.ink`
- [ ] **Admin login works:** `https://hause.ink/admin`
- [ ] **API responds:** `https://hause.ink/api/properties.php`
- [ ] **Image uploads work** in admin panel
- [ ] **Property creation** functions correctly
- [ ] **Lead form** submissions are saved
- [ ] **SSL certificate** is active (HTTPS)

### Test Credentials

```
Admin Login:
  URL:      https://hause.ink/admin
  Email:    sunjida@hause.ink
  Password: Sunji@#$%
```

---

## Troubleshooting

### Common Issues

#### 1. 404 Errors on Routes
**Solution:** Ensure `.htaccess` is uploaded and `mod_rewrite` is enabled.

```apache
# Required .htaccess content
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle API requests
  RewriteRule ^api/(.*)$ api/$1 [L]
  
  # Handle uploads
  RewriteRule ^uploads/(.*)$ uploads/$1 [L]
  
  # SPA routing - redirect all other requests to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### 2. Database Connection Failed
**Check:**
- Database credentials in `api/config.php`
- Database user has proper privileges
- MySQL service is running

#### 3. Login Not Working
**Check:**
- Admin user exists in database
- Password hash is correct (bcrypt format)
- Session/cookie settings in PHP

#### 4. Images Not Uploading
**Check:**
- `uploads/` directory exists and is writable (755)
- PHP `upload_max_filesize` is sufficient
- PHP `post_max_size` is sufficient

#### 5. Blank Page / 500 Error
**Check:**
- PHP error logs in cPanel
- `.htaccess` syntax errors
- PHP version compatibility (7.4+)

### Enable PHP Error Logging

Add to `api/config.php`:
```php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');
```

---

## Security Checklist

### Critical Security Steps

- [ ] **Delete `set_admin_password.php`** immediately after use
- [ ] **Change default admin password** on first login
- [ ] **Use HTTPS** (SSL certificate)
- [ ] **Keep `api/config.php`** outside web root or protect with `.htaccess`
- [ ] **Regular backups** of database and uploads
- [ ] **Update PHP** to latest stable version

### Protect Config File

Add to `api/.htaccess`:
```apache
<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>
```

### Security Headers

Your main `.htaccess` should include:
```apache
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

---

## Support

For technical support or questions:
- **Email:** sunjida@hause.ink
- **Domain:** https://hause.ink

---

**© 2024 Hause.ink - Property Rental Platform**
