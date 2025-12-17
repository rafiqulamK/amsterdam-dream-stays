# Hause.ink - Complete Build & Deployment Guide

> **Version:** 2.0  
> **Last Updated:** December 2024  
> **Target Domain:** hause.ink  
> **Stack:** React + Vite (Frontend) | PHP + MySQL (Backend) | cPanel (Hosting)

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Local Development](#local-development)
4. [Build Process](#build-process)
5. [Database Setup](#database-setup)
6. [cPanel Deployment](#cpanel-deployment)
7. [Admin Configuration](#admin-configuration)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Security Best Practices](#security-best-practices)

---

## Prerequisites

### Development Machine
- Node.js 18+ and npm
- Git (optional but recommended)
- Text editor (VS Code recommended)

### Server Requirements
- cPanel hosting with:
  - PHP 7.4+ (8.0+ recommended)
  - MySQL 5.7+ / MariaDB 10.3+
  - mod_rewrite enabled
  - SSL certificate (for HTTPS)

---

## Project Structure

```
hause-project/
├── api/                    # PHP Backend API
│   ├── config.php         # Database configuration
│   ├── auth.php           # Authentication endpoints
│   ├── properties.php     # Properties CRUD
│   ├── bookings.php       # Bookings management
│   ├── leads.php          # Lead management
│   ├── settings.php       # Site settings
│   ├── media.php          # Media library
│   ├── pages.php          # CMS pages
│   ├── stats.php          # Dashboard statistics
│   └── upload.php         # File uploads
├── database/
│   └── schema.sql         # Complete database schema
├── src/                    # React Frontend Source
├── public/                 # Static assets
├── dist/                   # Built frontend (after build)
└── scripts/               # Build scripts
```

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. For PHP Backend Testing
Set up a local PHP server (XAMPP, MAMP, or Docker) and configure `api/config.php` with local database credentials.

---

## Build Process

### Step 1: Build Frontend
```bash
npm run build
```

This creates the `dist/` folder with optimized production files.

### Step 2: Prepare Deployment Package

**Option A: Manual Preparation**

Create a folder with the following structure:
```
deployment/
├── index.html              # From dist/
├── assets/                 # From dist/assets/
├── api/                    # Copy entire api/ folder
├── database/               # Copy entire database/ folder
├── uploads/                # Create empty folders
│   ├── images/
│   ├── media/
│   └── properties/
└── .htaccess               # See below
```

**Option B: Using Build Script**
```bash
chmod +x scripts/create_deployment_zip.sh
./scripts/create_deployment_zip.sh
```

### Step 3: Create .htaccess File

Create `.htaccess` in your deployment root:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Handle API requests - pass directly to PHP
    RewriteCond %{REQUEST_URI} ^/api/
    RewriteRule ^api/(.*)$ api/$1 [L]
    
    # Handle uploads - serve directly
    RewriteCond %{REQUEST_URI} ^/uploads/
    RewriteRule ^uploads/(.*)$ uploads/$1 [L]
    
    # Handle static assets
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    
    # SPA fallback - all other routes go to index.html
    RewriteRule ^ index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# GZIP Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Cache control for assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Prevent directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(sql|log|env)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

---

## Database Setup

### Step 1: Create Database in cPanel

1. Log into cPanel
2. Go to **MySQL Databases**
3. Create database: `hause_inksun` (or your preferred name)
4. Create database user with a strong password
5. Add user to database with **ALL PRIVILEGES**

### Step 2: Import Schema

1. Open **phpMyAdmin** in cPanel
2. Select your database
3. Click **Import** tab
4. Upload `database/schema.sql`
5. Click **Go**

### Step 3: Verify Tables Created

The following tables should exist:
- `users`
- `user_roles`
- `properties`
- `bookings`
- `leads`
- `media_library`
- `site_settings`
- `pages`

---

## cPanel Deployment

### Step 1: Upload Files

**Method A: File Manager**
1. Log into cPanel
2. Open **File Manager**
3. Navigate to `public_html/`
4. Upload and extract your deployment ZIP, OR
5. Upload files individually maintaining structure

**Method B: FTP**
```
Host: ftp.hause.ink (or your FTP host)
Username: Your cPanel username
Password: Your cPanel password
Port: 21
Remote Directory: /public_html
```

### Step 2: Configure Database Connection

Edit `api/config.php`:

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');      // e.g., hause_inksun
define('DB_USER', 'your_database_user');      // e.g., hause_sunjida
define('DB_PASS', 'your_database_password');  // Your secure password
define('DB_CHARSET', 'utf8mb4');

// Site settings
define('SITE_URL', 'https://hause.ink');      // Your domain
define('UPLOADS_DIR', __DIR__ . '/../uploads/');
define('UPLOADS_URL', '/uploads/');
```

### Step 3: Set Permissions

Via cPanel File Manager or SSH:

```bash
# Directories
chmod 755 public_html/
chmod 755 public_html/api/
chmod 755 public_html/uploads/
chmod 755 public_html/uploads/images/
chmod 755 public_html/uploads/media/
chmod 755 public_html/uploads/properties/

# Sensitive files
chmod 644 public_html/api/config.php
chmod 644 public_html/.htaccess
```

### Step 4: Verify Deployment

1. Visit `https://hause.ink` - Homepage should load
2. Visit `https://hause.ink/api/properties.php` - Should return JSON
3. Visit `https://hause.ink/admin` - Should show login page

---

## Admin Configuration

### Default Admin Credentials

```
Email:    sunjida@hause.ink
Password: Sunji@#$%
```

⚠️ **CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN**

### First-Time Setup

1. Login at `/admin` with default credentials
2. Go to **Settings** tab
3. Update:
   - Contact information
   - Branding (logos)
   - SEO settings
   - Social links
4. Go to **Backup** tab and create initial backup
5. Add your first properties

### Admin Panel Features

| Tab | Description |
|-----|-------------|
| **Analytics** | Dashboard stats, charts, lead sources |
| **Properties** | Add, edit, approve/reject properties |
| **Bookings** | Manage booking requests |
| **Leads** | View and manage inquiries |
| **Settings** | Site configuration, branding, SEO |
| **Backup** | Database export/import |

---

## Post-Deployment Checklist

### Critical
- [ ] Database imported successfully
- [ ] `api/config.php` configured with correct credentials
- [ ] Admin login works at `/admin`
- [ ] File permissions set correctly
- [ ] SSL certificate active (HTTPS)
- [ ] `.htaccess` uploaded and working

### Recommended
- [ ] Default admin password changed
- [ ] Contact information updated
- [ ] Logo/branding uploaded
- [ ] SEO settings configured
- [ ] First backup created
- [ ] Test property added
- [ ] Lead form tested

### Security
- [ ] Remove `set_admin_password.php` if uploaded
- [ ] Protect `api/config.php` from direct access
- [ ] PHP error display disabled in production
- [ ] Regular backups scheduled

---

## Troubleshooting

### Common Issues

#### 404 Errors on Routes
**Cause:** `.htaccess` not working or `mod_rewrite` disabled

**Solution:**
1. Verify `.htaccess` is uploaded
2. In cPanel, check Apache mod_rewrite is enabled
3. Try adding `RewriteBase /` if in subdirectory

#### Database Connection Failed
**Cause:** Incorrect credentials in `config.php`

**Solution:**
1. Double-check database name, username, password
2. Ensure user has privileges on database
3. Check if MySQL service is running

#### Blank Page / 500 Error
**Cause:** PHP error or configuration issue

**Solution:**
1. Check cPanel Error Logs
2. Temporarily enable PHP errors:
```php
// Add to config.php temporarily
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

#### Images Not Uploading
**Cause:** Permission issues or PHP limits

**Solution:**
1. Set `uploads/` to 755
2. Check PHP `upload_max_filesize` and `post_max_size`
3. Ensure `uploads/` directory exists

#### API Returns HTML Instead of JSON
**Cause:** PHP error or misconfigured routes

**Solution:**
1. Access PHP file directly to see error
2. Check `config.php` for syntax errors
3. Verify database connection works

---

## Security Best Practices

### Server Configuration
```apache
# Add to api/.htaccess
<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>
```

### PHP Settings
```php
// In config.php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');
```

### Regular Maintenance
- Weekly database backups
- Monthly password rotations
- Keep PHP version updated
- Monitor error logs

---

## Support

- **Admin Email:** sunjida@hause.ink
- **Website:** https://hause.ink

---

## Quick Reference

### Build & Deploy Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Create deployment package (if script exists)
./scripts/create_deployment_zip.sh
```

### File Locations (After Deployment)
```
https://hause.ink/                 # Homepage
https://hause.ink/admin            # Admin Dashboard
https://hause.ink/auth             # Login/Signup
https://hause.ink/property/{id}    # Property Detail
https://hause.ink/api/             # Backend API
```

---

**© 2024 Hause.ink - Property Rental Platform**
